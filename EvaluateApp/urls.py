from django.urls import path
from django.shortcuts import redirect

from . import views

urlpatterns = [path('', lambda request: redirect('index')),
               path("index.html", views.index, name="index"),
               path("RegisterAction", views.RegisterAction, name="RegisterAction"),
               path("Register.html", views.Register, name="Register"),
               path("FacultyLogin.html", views.FacultyLogin, name="FacultyLogin"),
	       path("FacultyLoginAction", views.FacultyLoginAction, name="FacultyLoginAction"),
	       path("StudentLogin.html", views.StudentLogin, name="StudentLogin"),
	       path("StudentLoginAction", views.StudentLoginAction, name="StudentLoginAction"),
	       path("DefineMarks.html", views.DefineMarks, name="DefineMarks"),
               path("DefineMarksAction", views.DefineMarksAction, name="DefineMarksAction"),
	       path("EvaluatePaper.html", views.EvaluatePaper, name="EvaluatePaper"),
               path("EvaluatePaperAction", views.EvaluatePaperAction, name="EvaluatePaperAction"),
	       path("RankCalculate", views.RankCalculate, name="RankCalculate"),
	       path("ViewMarks.html", views.ViewMarks, name="ViewMarks"),
	       path("ViewMarksAction", views.ViewMarksAction, name="ViewMarksAction"),	  
	       
]
