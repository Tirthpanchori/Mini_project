from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Quiz, Question
from .serializers import QuizSerializer, QuestionSerializer

class QuizCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'teacher':
            return Response({"detail": "Only teachers can create quizzes."}, status=status.HTTP_403_FORBIDDEN)

        serializer = QuizSerializer(data=request.data)
        if serializer.is_valid():
            quiz = serializer.save(teacher=user)
            return Response(
                {"message": "Quiz created successfully!", "quiz_id": quiz.id, "code": quiz.code},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddQuestionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id, teacher=request.user)
        except Quiz.DoesNotExist:
            return Response({"detail": "Quiz not found or not authorized"}, status=status.HTTP_404_NOT_FOUND)

        questions = request.data.get('questions', [])
        for q in questions:
            Question.objects.create(
                quiz=quiz,
                text=q['text'],
                option_a=q['options'][0],
                option_b=q['options'][1],
                option_c=q['options'][2],
                option_d=q['options'][3],
                correct_option=chr(65 + q['correct'])  # convert 0->A, 1->B, etc.
            )

        return Response({"message": "Questions added successfully!"}, status=status.HTTP_201_CREATED)
