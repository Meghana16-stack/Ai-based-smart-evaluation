# AI-Based Smart Evaluation System (Evalvate)

A web application designed for automated, intelligent evaluation of student answer sheets using Natural Language Processing (NLP), Sentence Transformers, SpaCy, and Google Gemini AI.

Developed at **BVRIT** by **G. Meghana** for **Krishnaveni Concept School**.

---

## 🌟 Key Features

1. **Modern Responsive Landing Page**:
   - Clean, thoughtful UI showcasing the evaluation workflow.
   - Quick entry points for Faculty and Students.

2. **Faculty Portal**:
   - **Define Marks**: Configure question-wise maximum marks distribution.
   - **Evaluate Answers**: Upload teacher model answer key and student answer paper (PDF) for automated scoring based on keyword overlap and semantic understanding.
   - **Rank Calculation**: Automatically computes cumulative marks and generates a real-time leaderboard ranked by student performance.

3. **Student Portal**:
   - **View Marks**: Students can enter their Roll Number to view question-by-question breakdown, submitted answers, maximum marks, and awarded marks.

4. **Robust Evaluation Engine**:
   - Hybrid semantic scoring using SpaCy POS/keyword extraction + SentenceTransformers (`all-MiniLM-L6-v2`) cosine similarity.
   - Fault-tolerant fallback similarity algorithm ensuring evaluation remains functional even in offline environments.
   - PDF ingestion powered by Google Gemini API.

---

## 🚀 Quick Start

### 1. Launch the Server
You can simply double-click **`run.bat`** or run:

```bash
python manage.py runserver 127.0.0.1:8000
```

Then open your browser and navigate to:
👉 **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

---

## 🔑 Demo Credentials

Pre-configured user accounts are available in the local SQLite database for instant testing:

| Role | Username | Password |
|---|---|---|
| **Faculty** | `ProfSharma` | `pass123` |
| **Student** | `Meghana` | `pass123` |

You can also create new Faculty or Student accounts anytime using the **New User Signup** link.

---

## 📄 Test Sample Papers Included

Two sample PDF papers and pre-parsed evaluation caches are included in the repository for immediate testing:

- **Faculty Answer Key**: `sample_papers/Faculty_Reference_Key.pdf`
- **Student Answer Sheet**: `sample_papers/Student_Answer_Sheet.pdf`
- **Sample Student Roll Number**: `2026CS101`

### How to test:
1. Log in to the Faculty Portal (`ProfSharma` / `pass123`).
2. Go to **Define Marks** and set Question 1 to 5 as 10 marks.
3. Go to **Evaluate Answers**:
   - Enter Student Name: `Meghana G`
   - Enter Roll Number: `2026CS101`
   - Upload `sample_papers/Faculty_Reference_Key.pdf` as Faculty Paper
   - Upload `sample_papers/Student_Answer_Sheet.pdf` as Student Paper
   - Click **Evaluate Paper**
4. Check the results table with AI marks!
5. Click **Rank Calculation** to view the student leaderboard.
6. Log out, go to **Student Login** (`Meghana` / `pass123`), click **View Marks**, and enter `2026CS101` to view your score breakdown.

---

## ⚙️ Environment Variables (Optional)

To enable live Google Gemini OCR parsing for new handwritten PDFs, set your API key:

```bash
# Windows Command Prompt
set GEMINI_API_KEY=your_gemini_api_key_here

# Windows PowerShell
$env:GEMINI_API_KEY="your_gemini_api_key_here"
```
