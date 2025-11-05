from rest_framework import generics, permissions
from .models import Quiz
from .serializers import QuizSerializer
from rest_framework.exceptions import PermissionDenied


class CreateQuizView(generics.CreateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'teacher':
            raise PermissionDenied("Only teachers can create quizzes.")
        serializer.save(teacher=user)
