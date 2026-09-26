from django.shortcuts import render
from django.template import RequestContext
from django.contrib import messages
from django.http import HttpResponse
from django.core.files.storage import FileSystemStorage
import os
import sqlite3
import ast
import google.generativeai as genai
import os
import difflib
import re

global username

def db_connect():
    """Connect to the SQLite database configured for this Django project."""
    from django.conf import settings
    con = sqlite3.connect(settings.DATABASES['default']['NAME'])
    con.execute("""CREATE TABLE IF NOT EXISTS register (
        username TEXT PRIMARY KEY, password TEXT, contact_no TEXT,
        email TEXT, address TEXT, usertype TEXT
    )""")
    con.execute("""CREATE TABLE IF NOT EXISTS evaluation (
        roll_number TEXT, student_name TEXT, question TEXT,
        student_answer TEXT, max_marks TEXT, awarded_marks TEXT
    )""")
    con.execute("""CREATE TABLE IF NOT EXISTS max_marks (
        from_question INTEGER, end_question INTEGER, marks INTEGER
    )""")
    return con

semantic_model = None
nlp = None
model_load_attempted = False

gemini_api_key = os.environ.get("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
prompt = """Please analyze this handwritten PDF document. Extract all questions and their corresponding answers.
            Present the output in a clean, python dict format:
            If a question does not have an answer, list it as 'No answer found'. Ensure you handle the handwriting accurately
            and preserve the meaning, even if spelling is slightly off.
         """

def getStartEnd(lines):
    start = 0
    end = 0
    for i in range(len(lines)):
        line = lines[i].strip()
        if line == "{":
            start = i
            break
    j = len(lines)-1
    print("=="+lines[j])
    while j >= 0:
        line = lines[j].strip()
        print(line)
        if line == "}":
            break
        else:
            end += 1
        j -= 1
    return start, end

def parsePDF(pdf_path, save_path):
    if os.path.exists(save_path) == False:
        if not gemini_api_key:
            raise ValueError("Set the GEMINI_API_KEY environment variable to parse a new PDF.")
        model = genai.GenerativeModel('gemini-2.5-flash')
        sample_file = genai.upload_file(path=pdf_path, mime_type="application/pdf")
        response = model.generate_content([sample_file, prompt])
        parse_data = response.text.strip()
        lines = parse_data.split("\n")
        start, end = getStartEnd(lines)
        if start != -1 and end != -1:
            lines = lines[start:-end]
            lines = "\n".join(lines)
            lines = lines.strip()
            with open(save_path, "wb") as file:
                file.write(lines.encode())
            file.close()
        else:
            lines = "data not found"
    else:
        with open(save_path, "rb") as file:
            data = file.read()
        file.close()
        lines = data.decode()
    return lines

def evaluate_answer(teacher_answer, student_answer, max_marks, weight_keyword=0.4, weight_semantic=0.6):
    """
    Evaluates student answer based on keywords and semantic similarity.
    """
    # Load the NLP stack only when an evaluation is requested. This keeps
    # public pages and login screens available if optional model binaries
    # are missing or blocked on the host machine.
    global semantic_model, nlp, model_load_attempted
    if not model_load_attempted:
        model_load_attempted = True
        try:
            import spacy
            from sentence_transformers import SentenceTransformer, util
            semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
            nlp = spacy.load("en_core_web_md")
        except Exception as error:
            # Native NLP binaries can be unavailable on some Windows setups.
            # Keep evaluations usable with the local text-based fallback below.
            print("NLP model unavailable; using text similarity:", error)

    if semantic_model is None or nlp is None:
        stop_words = {
            "a", "an", "the", "is", "are", "was", "were", "of", "to", "and",
            "or", "in", "on", "for", "by", "with", "that", "this", "it", "as",
            "be", "from", "which", "using", "their", "its", "they", "them",
        }
        teacher_tokens = re.findall(r"[a-z0-9]+", teacher_answer.lower())
        student_tokens = re.findall(r"[a-z0-9]+", student_answer.lower())
        teacher_words = {word for word in teacher_tokens if word not in stop_words}
        student_words = {word for word in student_tokens if word not in stop_words}
        overlap = teacher_words & student_words
        keyword_score = len(overlap) / len(teacher_words) if teacher_words else 0
        token_similarity = (
            2 * len(overlap) / (len(teacher_words) + len(student_words))
            if teacher_words or student_words else 0
        )
        sequence_similarity = difflib.SequenceMatcher(
            None, " ".join(teacher_tokens), " ".join(student_tokens)
        ).ratio()
        semantic_score = max(token_similarity, sequence_similarity)
        final_score = (keyword_score * weight_keyword) + (semantic_score * weight_semantic)
        return round(final_score * max_marks, 2)

    from sentence_transformers import util
    # 1. Keyword Evaluation (SpaCy)
    doc1 = nlp(teacher_answer.lower())
    doc2 = nlp(student_answer.lower())
    
    # Extract keywords (nouns, proper nouns, adjectives)
    keywords1 = {token.lemma_ for token in doc1 if token.pos_ in ['NOUN', 'PROPN', 'ADJ'] and not token.is_stop}
    keywords2 = {token.lemma_ for token in doc2 if token.pos_ in ['NOUN', 'PROPN', 'ADJ'] and not token.is_stop}
    
    intersection = keywords1.intersection(keywords2)
    keyword_score = len(intersection) / len(keywords1) if len(keywords1) > 0 else 0

    # 2. Semantic Evaluation (Sentence-Transformers)
    embedding1 = semantic_model.encode(teacher_answer, convert_to_tensor=True)
    embedding2 = semantic_model.encode(student_answer, convert_to_tensor=True)
    semantic_score = util.pytorch_cos_sim(embedding1, embedding2).item()

    # 3. Final Weighted Score
    final_score = (keyword_score * weight_keyword) + (max(0, semantic_score) * weight_semantic)
    final_score = final_score * max_marks
    return round(final_score, 2)

def getAnswer(key, student):
    key = key.replace("Q","A")
    value = student[key]
    if type(value) is dict:
        value = value['answer']
    return value

def maxmarks(question_num):
    max_marks = 0
    con = db_connect()
    with con:
        cur = con.cursor()
        cur.execute("select * FROM max_marks")
        rows = cur.fetchall()
        for row in rows:
            from_question = int(str(row[0]))
            to_question = int(str(row[1]))
            if question_num >= from_question and question_num <= to_question:
                max_marks = int(str(row[2]))
                break        
    return max_marks

def RankCalculate(request):
    if request.method == 'GET':
        index = 1
        output='<table border=1 align=center width=100%><tr><th><font size="3" color="black">Rank</th><th><font size="3" color="black">Roll No</th>'
        output += '<th><font size="3" color="black">Student Name</th><th><font size="3" color="black">Obtained Marks</th></tr>'
        con = db_connect()
        with con:
            cur = con.cursor()
            cur.execute("select roll_number, student_name, sum(awarded_marks) as average_marks from evaluation group by roll_number order by average_marks DESC")
            rows = cur.fetchall()
            for row in rows:
                output += '<td><font size="3" color="black">'+str(index)+'</td><td><font size="3" color="black">'+str(row[0])+'</td>'
                output += '<td><font size="3" color="black">'+str(row[1])+'</td><td><font size="3" color="black">'+str(row[2])+'</td></tr>'
                index+=1
        output += "</table><br/><br/><br/><br/><br/>"    
        context= {'data':output}
        return render(request, 'FacultyScreen.html', context)        

def EvaluatePaper(request):
    if request.method == 'GET':
        return render(request, 'EvaluatePaper.html', {})

def ViewMarks(request):
    if request.method == 'GET':
        return render(request, 'ViewMarks.html', {})

def ViewMarksAction(request):
    if request.method == 'POST':
        global username
        roll_no = request.POST.get('t1', False)
        output='<table border=1 align=center width=100%><tr><th><font size="3" color="black">Question</th><th><font size="3" color="black">Student Answer</th>'
        output += '<th><font size="3" color="black">Maximum Marks</th><th><font size="3" color="black">Obtained Marks</th></tr>'
        con = db_connect()
        with con:
            cur = con.cursor()
            cur.execute("select * from evaluation where roll_number='"+roll_no+"'")
            rows = cur.fetchall()
            for row in rows:
                output += '<td><font size="3" color="black">'+str(row[2])+'</td><td><font size="3" color="black">'+str(row[3])+'</td>'
                output += '<td><font size="3" color="black">'+str(row[4])+'</td><td><font size="3" color="black">'+str(row[5])+'</td></tr>'
        output += "</table><br/><br/><br/>"    
        context= {'data':output}
        return render(request, 'StudentScreen.html', context)   
        

def EvaluatePaperAction(request):
    if request.method == 'POST':
        global username
        student_name = request.POST.get('t1', False)
        roll_no = request.POST.get('t2', False)
        faculty_paper = request.FILES['t3'].read()
        faculty_file = request.FILES['t3'].name
        student_paper = request.FILES['t4'].read()
        student_file = request.FILES['t4'].name
        if os.path.exists("EvaluateApp/static/"+faculty_file):
            os.remove("EvaluateApp/static/"+faculty_file)
        with open("EvaluateApp/static/"+faculty_file, "wb") as file:
            file.write(faculty_paper)
        file.close()

        if os.path.exists("EvaluateApp/static/"+student_file):
            os.remove("EvaluateApp/static/"+student_file)
        with open("EvaluateApp/static/"+student_file, "wb") as file:
            file.write(student_paper)
        file.close()

        lines = parsePDF("EvaluateApp/static/"+faculty_file, "EvaluateApp/static/ParseFiles/"+faculty_file)
        correct = ast.literal_eval(lines)

        lines = parsePDF("EvaluateApp/static/"+student_file, "EvaluateApp/static/ParseFiles/"+student_file)
        student = ast.literal_eval(lines)
        db_connection = db_connect()
        db_cursor = db_connection.cursor()
        student_sql_query = "delete from evaluation where roll_number='"+roll_no+"'"
        db_cursor.execute(student_sql_query)
        db_connection.commit()
        full_marks = 0
        obatined_marks = 0
        index = 1
        output='<table border=1 align=center width=100%><tr><th><font size="3" color="black">Question</th><th><font size="3" color="black">Student Answer</th>'
        output += '<th><font size="3" color="black">Maximum Marks</th><th><font size="3" color="black">Obtained Marks</th></tr>'
        
        for key, value in correct.items():
            if type(value) is dict:
                question = key
                answer = value['answer']
                que = value['question']
            if type(value) is str:
                question = key
                answer = value
            student_answer = getAnswer(question, student)
            total_marks = maxmarks(index)
            full_marks = full_marks + total_marks
            marks = evaluate_answer(answer, student_answer,  total_marks)
            obatined_marks = obatined_marks + marks
            print(question+" "+answer+" == "+student_answer+" "+str(index)+" "+str(marks))
            index += 1
            student_answer = student_answer.replace("'","")
            question = question.replace("'","")
            db_connection = db_connect()
            db_cursor = db_connection.cursor()
            student_sql_query = "INSERT INTO evaluation VALUES('"+roll_no+"','"+student_name+"','"+que+"','"+student_answer+"','"+str(total_marks)+"','"+str(marks)+"')"
            db_cursor.execute(student_sql_query)
            db_connection.commit()
            output += '<td><font size="3" color="black">'+que+'</td><td><font size="3" color="black">'+student_answer+'</td>'
            output += '<td><font size="3" color="black">'+str(total_marks)+'</td><td><font size="3" color="black">'+str(marks)+'</td></tr>'
        output += "</table><br/><center>"    
        output += "<font size=3 color=blue>Evaluation Completed<br/>Total marks = "+str(full_marks)+"<br/>Student Obtained Marks = "+str(obatined_marks)+"</font>"        
        context= {'data':output}
        return render(request, 'FacultyScreen.html', context)       

def DefineMarksAction(request):
    if request.method == 'POST':
        from_question = request.POST.get('t1', False)
        to_question = request.POST.get('t2', False)
        marks = request.POST.get('t3', False)
        output = "Error in adding configuration marks to database"
        db_connection = db_connect()
        db_cursor = db_connection.cursor()
        student_sql_query = "delete from max_marks where from_question='"+from_question+"' and end_question='"+to_question+"'"
        db_cursor.execute(student_sql_query)
        db_connection.commit()
        db_connection = db_connect()
        db_cursor = db_connection.cursor()
        student_sql_query = "INSERT INTO max_marks VALUES('"+from_question+"','"+to_question+"','"+marks+"')"
        db_cursor.execute(student_sql_query)
        db_connection.commit()
        print(db_cursor.rowcount, "Record Inserted")
        output = "Marks configuration process completed"
        context= {'data':"<font size=3 color=blue>"+output+"</font>"}
        return render(request, 'DefineMarks.html', context)         

def DefineMarks(request):
    if request.method == 'GET':
       return render(request, 'DefineMarks.html', {})

def index(request):
    if request.method == 'GET':
       return render(request, 'index.html', {})    

def StudentLogin(request):
    if request.method == 'GET':
       return render(request, 'StudentLogin.html', {})

def FacultyLogin(request):
    if request.method == 'GET':
       return render(request, 'FacultyLogin.html', {})    

def Register(request):
    if request.method == 'GET':
       return render(request, 'Register.html', {})

def RegisterAction(request):
    if request.method == 'POST':
        username = request.POST.get('t1', False)
        password = request.POST.get('t2', False)
        contact = request.POST.get('t3', False)
        email = request.POST.get('t4', False)
        address = request.POST.get('t5', False)
        usertype = request.POST.get('t6', False)
        output = "none"
        con = db_connect()
        with con:
            cur = con.cursor()
            cur.execute("select username FROM register")
            rows = cur.fetchall()
            for row in rows:
                if row[0] == username:
                    output = username+" Username already exists"
                    break                
        if output == "none":
            db_connection = db_connect()
            db_cursor = db_connection.cursor()
            student_sql_query = "INSERT INTO register VALUES('"+username+"','"+password+"','"+contact+"','"+email+"','"+address+"','"+usertype+"')"
            db_cursor.execute(student_sql_query)
            db_connection.commit()
            print(db_cursor.rowcount, "Record Inserted")
            if db_cursor.rowcount == 1:
                output = "Signup process completed. Login to perform evaluation"
        context= {'data': output}
        return render(request, 'Register.html', context) 

def StudentLoginAction(request):
    if request.method == 'POST':
        global username
        username = request.POST.get('t1', False)
        password = request.POST.get('t2', False)
        status = "none"
        con = db_connect()
        with con:
            cur = con.cursor()
            cur.execute("select username,password FROM register where usertype='Student'")
            rows = cur.fetchall()
            for row in rows:
                if row[0] == username and row[1] == password:
                    status = "success"
                    break
        if status == 'success':
            context= {'data':"<font size=3 color=blue>"+'Welcome '+username+"</font>"}
            return render(request, "StudentScreen.html", context)
        else:
            context= {'data':"<font size=3 color=red>Invalid username</font>"}
            return render(request, 'StudentLogin.html', context)

def FacultyLoginAction(request):
    if request.method == 'POST':
        global username
        username = request.POST.get('t1', False)
        password = request.POST.get('t2', False)
        status = "none"
        con = db_connect()
        with con:
            cur = con.cursor()
            cur.execute("select username,password FROM register where usertype='Faculty'")
            rows = cur.fetchall()
            for row in rows:
                if row[0] == username and row[1] == password:
                    status = "success"
                    break
        if status == 'success':
            context= {'data':"<font size=3 color=blue>"+'Welcome '+username+"</font>"}
            return render(request, "FacultyScreen.html", context)
        else:
            context= {'data':"<font size=3 color=red>Invalid username</font>"}
            return render(request, 'FacultyLogin.html', context)

