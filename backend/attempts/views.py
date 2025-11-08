from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from quiz.models import Quiz, Question
from quiz.serializers import QuestionSerializer
from rest_framework.permissions import IsAuthenticated
from attempts.models import Attempt
class VerifyQuizCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get("code", "").strip().upper()

        if not code:
            return Response({"detail": "Quiz code is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quiz = Quiz.objects.get(code=code)
        except Quiz.DoesNotExist:
            return Response({"detail": "Invalid quiz code."}, status=status.HTTP_404_NOT_FOUND)

        if Attempt.objects.filter(student=user, code=quiz).exists():
            return Response({"detail": "You have already attempted this quiz."}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            "quiz_id": quiz.id,
            "title": quiz.title,
            "timer": quiz.timer,
            "total_questions": quiz.total_questions,
        }

        return Response({"message": "Quiz code verified successfully!", "quiz": data})
class GetQuizQuestionsView(APIView):
    """
    GET /api/attempt/<quiz_id>/questions/
    Returns all questions of a quiz for students.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({"detail": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

        questions = Question.objects.filter(quiz=quiz)
        serializer = QuestionSerializer(questions, many=True)

        return Response({
            "quiz_id": quiz.id,
            "title": quiz.title,
            "timer": quiz.timer,
            "questions": serializer.data
        }, status=status.HTTP_200_OK)
