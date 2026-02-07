from django.urls import path
from .views import GenerateQuizAPIView, AnalyzeWeakTopicsAPIView,GetTextOutOfUrl

urlpatterns = [
    path("get-text-outofurl/",GetTextOutOfUrl.as_view(), name="get-text-outofurl"),
    path("generate-quiz/", GenerateQuizAPIView.as_view(), name="ai-generate-quiz"),
    path("analyze-weak-topics/", AnalyzeWeakTopicsAPIView.as_view(), name="analyze-weak-topics"),
]