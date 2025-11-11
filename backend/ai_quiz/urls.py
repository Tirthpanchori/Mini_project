from django.urls import path
from .views import GenerateQuizAPIView

urlpatterns = [
    path("generate-quiz/", GenerateQuizAPIView.as_view(), name="ai-generate-quiz"),
]
