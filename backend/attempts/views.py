from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from quiz.models import Quiz, Question
from quiz.serializers import QuestionSerializer
from rest_framework.permissions import IsAuthenticated
from attempts.models import Attempt, SavedAnswer

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

        # ✅ Fixed line
        if Attempt.objects.filter(student=user, quiz=quiz).exists():
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

class SaveAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        quiz_id = request.data.get("quiz_id")
        answers = request.data.get("answers", [])

        if not quiz_id or not answers:
            return Response(
                {"detail": "Quiz ID and answers are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({"detail": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

        # Prevent multiple attempts
        if Attempt.objects.filter(student=user, quiz=quiz).exists():
            return Response({"detail": "You have already attempted this quiz."}, status=status.HTTP_400_BAD_REQUEST)

        total_questions = len(answers)
        correct_count = 0
        detailed_results = []  

        for ans in answers:
            try:
                question = Question.objects.get(id=ans["question_id"], quiz=quiz)
                is_correct = ans["selected_option"] == question.correct_option

                # 👇 map letters to actual text dynamically
                option_text_map = {
                    "A": question.option_a,
                    "B": question.option_b,
                    "C": question.option_c,
                    "D": question.option_d,
                }

                detailed_results.append({
                    "question_id": question.id,
                    "question_text": question.text,
                    "selected_option": ans["selected_option"],
                    "selected_option_text": option_text_map.get(ans["selected_option"], ""),
                    "correct_option": question.correct_option,
                    "correct_option_text": option_text_map.get(question.correct_option, ""),
                    "is_correct": is_correct,
                })

                if is_correct:
                    correct_count += 1

            except Question.DoesNotExist:
                continue

        score = (correct_count / total_questions) * 100 if total_questions > 0 else 0

        attempt = Attempt.objects.create(student=user, quiz=quiz, score=score)

        for ans in answers:
            SavedAnswer.objects.create(
                attempt=attempt,
                question_id=ans["question_id"],
                selected_option=ans["selected_option"]
            )

        return Response(
            {
                "message": "Attempt saved successfully!",
                "attempt_id": attempt.id,
                "score": score,
                "correct_answers": correct_count,
                "total_questions": total_questions,
                "results": detailed_results,
            },
            status=status.HTTP_201_CREATED
        )
