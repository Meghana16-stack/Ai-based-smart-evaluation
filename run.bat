@echo off
echo Starting AI-Based Smart Evaluation System...
echo Access the website at http://127.0.0.1:8000/
start http://127.0.0.1:8000/
python manage.py runserver 127.0.0.1:8000
pause