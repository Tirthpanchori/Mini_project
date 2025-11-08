from django.urls import path
from .views import QuizCreateView, AddQuestionsView

urlpatterns = [
    path('create/', QuizCreateView.as_view(), name='create-quiz'),
    path('<int:quiz_id>/add-questions/', AddQuestionsView.as_view(), name='add-questions'),
]