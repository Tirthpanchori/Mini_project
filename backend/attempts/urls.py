from django.urls import path
from .views import VerifyQuizCodeView, GetQuizQuestionsView , SaveAttemptView

urlpatterns = [
    path("verify-code/", VerifyQuizCodeView.as_view(), name="verify-quiz-code"),
    path("<int:quiz_id>/questions/", GetQuizQuestionsView.as_view(), name="get-quiz-questions"),
    path("save/", SaveAttemptView.as_view(), name="save-attempt"),
]
