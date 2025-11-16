from django.urls import path
from .views import GetRecentQuizzesView, QuizCreateView, AddQuestionsView, GetAllStudentQuizzesView, GetAttemptResultForTeacherView

urlpatterns = [
    path('create/', QuizCreateView.as_view(), name='create-quiz'),
    path('<int:quiz_id>/add-questions/', AddQuestionsView.as_view(), name='add-questions'),
    path('recent-quizzes/', GetRecentQuizzesView.as_view(), name='recent-quizzes'),
    path("<int:quiz_id>/attempts/", GetAllStudentQuizzesView.as_view(), name="quiz_attempts"),
    path("teacher/attempts/result/<int:attempt_id>/", GetAttemptResultForTeacherView.as_view(), name="attempt_result_teacher"),
]
