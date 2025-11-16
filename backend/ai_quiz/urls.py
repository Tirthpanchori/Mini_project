from django.urls import path
from .views import GenerateQuizAPIView, AnalyzeWeakTopicsAPIView

urlpatterns = [
    path("generate-quiz/", GenerateQuizAPIView.as_view(), name="ai-generate-quiz"),
    path("analyze-weak-topics/", AnalyzeWeakTopicsAPIView.as_view(), name="analyze-weak-topics"),
]