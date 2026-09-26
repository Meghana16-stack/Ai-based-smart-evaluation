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
    con.execute("""CREATE TABLE IF NOT EXISTS django_session (
        session_key VARCHAR(40) PRIMARY KEY,
        session_data TEXT NOT NULL,
        expire_date DATETIME NOT NULL
    )""")

    # Auto-seed demo accounts and sample evaluation data on fresh database instances
    cur = con.cursor()
    cur.execute("SELECT count(*) FROM register")
    if cur.fetchone()[0] == 0:
        con.execute("INSERT OR IGNORE INTO register VALUES ('ProfSharma', 'pass123', '9876543210', 'prof@school.edu', 'Campus Block A', 'Faculty')")
        con.execute("INSERT OR IGNORE INTO register VALUES ('faculty', 'pass123', '9876543210', 'faculty@school.edu', 'Campus Block A', 'Faculty')")
        con.execute("INSERT OR IGNORE INTO register VALUES ('Meghana', 'pass123', '9123456780', 'meghana@school.edu', 'Hostel 3', 'Student')")
        con.execute("INSERT OR IGNORE INTO register VALUES ('student', 'pass123', '9123456780', 'student@school.edu', 'Hostel 3', 'Student')")
        con.execute("INSERT OR IGNORE INTO evaluation VALUES ('2026CS101', 'Meghana G', 'Explain cloud computing models.', 'Cloud computing provides IaaS, PaaS, and SaaS models on-demand over the internet.', '10', '9.5')")
        con.execute("INSERT OR IGNORE INTO max_marks VALUES (1, 10, 10)")
        con.commit()
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

def parsePDF(pdf_path, save_path):
    if os.path.exists(save_path):
        with open(save_path, "r", encoding="utf-8", errors="ignore") as file:
            return file.read()

    from django.conf import settings
    base_filename = os.path.basename(save_path)
    bundle_candidate = os.path.join(settings.BASE_DIR, "EvaluateApp", "static", "ParseFiles", base_filename)
    if os.path.exists(bundle_candidate):
        with open(bundle_candidate, "r", encoding="utf-8", errors="ignore") as file:
            return file.read()

    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not configured. Please set GEMINI_API_KEY in your Vercel project environment variables to parse new PDF files with Gemini AI.")

    model = genai.GenerativeModel('gemini-2.5-flash')
    sample_file = genai.upload_file(path=pdf_path, mime_type="application/pdf")
    response = model.generate_content([sample_file, prompt])
    parse_data = response.text.strip()
    start = parse_data.find("{")
    end = parse_data.rfind("}")
    if start != -1 and end != -1 and end > start:
        lines = parse_data[start:end+1].strip()
        try:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, "w", encoding="utf-8") as file:
                file.write(lines)
        except OSError:
            pass
        return lines
    return "{}"


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
    if not isinstance(student, dict):
        return ""
    if key in student:
        value = student[key]
    else:
        alt_key = key.replace("Q", "A") if "Q" in key else key.replace("A", "Q")
        value = student.get(alt_key, "")
        if not value:
            for k, v in student.items():
                if k.strip().lower() in [key.strip().lower(), alt_key.strip().lower()]:
                    value = v
                    break
    if isinstance(value, dict):
        value = value.get('answer', '')
    return str(value) if value is not None else ""

def maxmarks(question_num):
    max_marks = 0
    con = db_connect()
    with con:
        cur = con.cursor()
        cur.execute("SELECT from_question, end_question, marks FROM max_marks")
        rows = cur.fetchall()
        for row in rows:
            try:
                from_q = int(str(row[0]))
                to_q = int(str(row[1]))
                if from_q <= question_num <= to_q:
                    max_marks = int(str(row[2]))
                    break
            except (ValueError, TypeError):
                continue
    if max_marks <= 0:
        max_marks = 10
    return max_marks

def RankCalculate(request):
    if request.method == 'GET':
        index = 1
        output = '<table border="1" cellpadding="8" cellspacing="0" align="center" style="width:100%; border-collapse:collapse; margin-top:15px; font-family:inherit;">'
        output += '<tr style="background:#f0f4f8; text-align:left;"><th>Rank</th><th>Roll No</th><th>Student Name</th><th>Total Marks</th></tr>'
        con = db_connect()
        with con:
            cur = con.cursor()
            cur.execute("SELECT roll_number, student_name, ROUND(SUM(CAST(awarded_marks AS REAL)), 2) AS total_marks FROM evaluation GROUP BY roll_number ORDER BY total_marks DESC")
            rows = cur.fetchall()
            for row in rows:
                output += f'<tr><td align="center"><b>{index}</b></td><td>{row[0]}</td><td>{row[1]}</td><td><b>{row[2]}</b></td></tr>'
                index += 1
        output += "</table><br/>"
        if index == 1:
            output = "<p style='color:#666; font-size:15px; margin:20px 0;'>No evaluations recorded yet.</p>"
        context = {'data': output}
        return render(request, 'FacultyScreen.html', context)

def EvaluatePaper(request):
    if request.method == 'GET':
        return render(request, 'EvaluatePaper.html', {})

def ViewMarks(request):
    if request.method == 'GET':
        return render(request, 'ViewMarks.html', {})

def ViewMarksAction(request):
    if request.method == 'POST':
        roll_no = (request.POST.get('t1') or '').strip()
        output = '<table border="1" cellpadding="8" cellspacing="0" align="center" style="width:100%; border-collapse:collapse; margin-top:15px; font-family:inherit;">'
        output += '<tr style="background:#f0f4f8; text-align:left;"><th>Question</th><th>Student Answer</th><th>Max Marks</th><th>Awarded Marks</th></tr>'
        con = db_connect()
        rows = []
        with con:
            cur = con.cursor()
            cur.execute("SELECT question, student_answer, max_marks, awarded_marks FROM evaluation WHERE roll_number=?", (roll_no,))
            rows = cur.fetchall()
            total_max = 0.0
            total_awarded = 0.0
            for row in rows:
                output += f'<tr><td>{row[0]}</td><td>{row[1]}</td><td align="center">{row[2]}</td><td align="center"><b>{row[3]}</b></td></tr>'
                try:
                    total_max += float(row[2])
                    total_awarded += float(row[3])
                except (ValueError, TypeError):
                    pass
        output += "</table><br/>"
        if rows:
            output += f"<div style='margin-top:15px; font-size:16px; color:#0d6efd;'><b>Total Marks:</b> {total_awarded:.2f} / {total_max:.2f}</div>"
        else:
            output = f"<p style='color:#dc3545; font-size:15px;'>No evaluated papers found for Roll Number: <b>{roll_no}</b></p>"
        context = {'data': output}
        return render(request, 'StudentScreen.html', context)

def EvaluatePaperAction(request):
    if request.method == 'POST':
        try:
            student_name = (request.POST.get('t1') or '').strip()
            roll_no = (request.POST.get('t2') or '').strip()

            if not student_name or not roll_no:
                return render(request, 'EvaluatePaper.html', {'data': "Student name and roll number are required."})

            if 't3' not in request.FILES or 't4' not in request.FILES:
                return render(request, 'EvaluatePaper.html', {'data': "Please upload both Faculty Paper and Student Paper."})

            from django.conf import settings
            faculty_file = os.path.basename(request.FILES['t3'].name)
            student_file = os.path.basename(request.FILES['t4'].name)

            if os.environ.get('VERCEL'):
                upload_dir = "/tmp/uploads"
                parse_dir = "/tmp/ParseFiles"
            else:
                upload_dir = os.path.join(settings.BASE_DIR, "EvaluateApp", "static")
                parse_dir = os.path.join(settings.BASE_DIR, "EvaluateApp", "static", "ParseFiles")

            os.makedirs(upload_dir, exist_ok=True)
            os.makedirs(parse_dir, exist_ok=True)

            faculty_path = os.path.join(upload_dir, faculty_file)
            student_path = os.path.join(upload_dir, student_file)

            with open(faculty_path, "wb") as f:
                f.write(request.FILES['t3'].read())

            with open(student_path, "wb") as f:
                f.write(request.FILES['t4'].read())

            faculty_parse_path = os.path.join(parse_dir, faculty_file + ".txt")
            student_parse_path = os.path.join(parse_dir, student_file + ".txt")

            faculty_text = parsePDF(faculty_path, faculty_parse_path)
            student_text = parsePDF(student_path, student_parse_path)

            import json
            def safe_parse_dict(text):
                try:
                    return ast.literal_eval(text)
                except Exception:
                    pass
                try:
                    return json.loads(text)
                except Exception:
                    pass
                start = text.find("{")
                end = text.rfind("}")
                if start != -1 and end != -1:
                    sub = text[start:end+1]
                    try:
                        return ast.literal_eval(sub)
                    except Exception:
                        return json.loads(sub)
                raise ValueError("Could not parse extracted questions/answers as dictionary.")

            correct = safe_parse_dict(faculty_text)
            student = safe_parse_dict(student_text)

            con = db_connect()
            with con:
                cur = con.cursor()
                cur.execute("DELETE FROM evaluation WHERE roll_number=?", (roll_no,))

            full_marks = 0
            obtained_marks = 0
            index = 1

            output = '<table border="1" cellpadding="8" cellspacing="0" align="center" style="width:100%; border-collapse:collapse; margin-top:15px; font-family:inherit;">'
            output += '<tr style="background:#f0f4f8; text-align:left;"><th>Question</th><th>Student Answer</th><th>Max Marks</th><th>Awarded Marks</th></tr>'

            for key, value in correct.items():
                if isinstance(value, dict):
                    question_key = key
                    answer = value.get('answer', '')
                    que = value.get('question', key)
                else:
                    question_key = key
                    answer = str(value)
                    que = key

                student_answer = getAnswer(question_key, student)
                total_marks = maxmarks(index)
                full_marks += total_marks
                marks = evaluate_answer(answer, student_answer, total_marks)
                obtained_marks += marks
                index += 1

                with con:
                    cur = con.cursor()
                    cur.execute(
                        "INSERT INTO evaluation VALUES (?, ?, ?, ?, ?, ?)",
                        (roll_no, student_name, que, student_answer, str(total_marks), str(marks))
                    )

                output += f'<tr><td>{que}</td><td>{student_answer}</td><td align="center">{total_marks}</td><td align="center"><b>{marks}</b></td></tr>'

            output += "</table><br/>"
            output += f"<div style='background:#e8f4fd; border:1px solid #b6d4fe; border-radius:8px; padding:15px; margin-top:15px; text-align:center;'>"
            output += f"<h4 style='color:#084298; margin:0 0 8px;'>Evaluation Completed Successfully!</h4>"
            output += f"<p style='margin:0; font-size:16px;'><b>Student:</b> {student_name} ({roll_no}) | <b>Total Marks:</b> {obtained_marks:.2f} / {full_marks}</p>"
            output += f"</div>"

            return render(request, 'FacultyScreen.html', {'data': output})

        except Exception as e:
            error_html = f"<div style='background:#f8d7da; border:1px solid #f5c2c7; border-radius:8px; padding:15px; color:#842029; text-align:center;'><b>Evaluation Error:</b> {str(e)}</div>"
            return render(request, 'EvaluatePaper.html', {'data': error_html})

def DefineMarksAction(request):
    if request.method == 'POST':
        from_question = (request.POST.get('t1') or '').strip()
        to_question = (request.POST.get('t2') or '').strip()
        marks = (request.POST.get('t3') or '').strip()

        try:
            fq = int(from_question)
            tq = int(to_question)
            m = int(marks)
            con = db_connect()
            with con:
                cur = con.cursor()
                cur.execute("DELETE FROM max_marks WHERE from_question=? AND end_question=?", (fq, tq))
                cur.execute("INSERT INTO max_marks VALUES (?, ?, ?)", (fq, tq, m))
            output = f"<span style='color:green;'>Marks configuration saved: Questions {fq} to {tq} = {m} Marks each</span>"
        except Exception as e:
            output = f"<span style='color:red;'>Error saving marks: {e}</span>"

        return render(request, 'DefineMarks.html', {'data': output})

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
        username = (request.POST.get('t1') or '').strip()
        password = (request.POST.get('t2') or '').strip()
        contact = (request.POST.get('t3') or '').strip()
        email = (request.POST.get('t4') or '').strip()
        address = (request.POST.get('t5') or '').strip()
        usertype = (request.POST.get('t6') or '').strip()

        if not username or not password:
            return render(request, 'Register.html', {'data': "<span style='color:red;'>Username and password are required.</span>"})

        con = db_connect()
        with con:
            cur = con.cursor()
            cur.execute("SELECT username FROM register WHERE username=?", (username,))
            if cur.fetchone():
                return render(request, 'Register.html', {'data': f"<span style='color:red;'>Username '{username}' already exists.</span>"})

            cur.execute("INSERT INTO register VALUES (?, ?, ?, ?, ?, ?)", (username, password, contact, email, address, usertype))

        return render(request, 'Register.html', {'data': "<span style='color:green;'>Signup completed successfully! You can now log in.</span>"})

def StudentLoginAction(request):
    if request.method == 'POST':
        uname = (request.POST.get('t1') or '').strip()
        pword = (request.POST.get('t2') or '').strip()
        con = db_connect()
        with con:
            cur = con.cursor()
            cur.execute("SELECT username FROM register WHERE usertype='Student' AND username=? AND password=?", (uname, pword))
            row = cur.fetchone()
        if row:
            request.session['username'] = uname
            request.session['usertype'] = 'Student'
            welcome_msg = f"<div style='text-align:center; padding:20px;'><h3 style='color:#0d6efd;'>Welcome, {uname}!</h3><p style='color:#555;'>Select <b>View Marks</b> above to see your evaluation results.</p></div>"
            return render(request, "StudentScreen.html", {'data': welcome_msg})
        else:
            return render(request, 'StudentLogin.html', {'data': "Invalid username or password"})

def FacultyLoginAction(request):
    if request.method == 'POST':
        uname = (request.POST.get('t1') or '').strip()
        pword = (request.POST.get('t2') or '').strip()
        con = db_connect()
        with con:
            cur = con.cursor()
            cur.execute("SELECT username FROM register WHERE usertype='Faculty' AND username=? AND password=?", (uname, pword))
            row = cur.fetchone()
        if row:
            request.session['username'] = uname
            request.session['usertype'] = 'Faculty'
            welcome_msg = f"<div style='text-align:center; padding:20px;'><h3 style='color:#0d6efd;'>Welcome, Faculty {uname}!</h3><p style='color:#555;'>Use the navigation bar above to Define Marks, Evaluate Papers, or View Rank Calculations.</p></div>"
            return render(request, "FacultyScreen.html", {'data': welcome_msg})
        else:
            return render(request, 'FacultyLogin.html', {'data': "Invalid username or password"})

def FacultyScreen(request):
    return render(request, "FacultyScreen.html", {'data': ''})

def StudentScreen(request):
    return render(request, "StudentScreen.html", {'data': ''})

def student_dashboard(request):
    return render(request, "student_dashboard.html")

def DemoDetails(request):
    return render(request, "DemoDetails.html")


