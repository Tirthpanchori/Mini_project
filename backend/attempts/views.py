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
                selected_opt = ans["selected_option"]
                is_correct = selected_opt and selected_opt == question.correct_option

                # map letters to actual text dynamically
                option_text_map = {
                    "A": question.option_a,
                    "B": question.option_b,
                    "C": question.option_c,
                    "D": question.option_d,
                }

                detailed_results.append({
                    "question_id": question.id,
                    "question_text": question.text,
                    "selected_option": selected_opt,
                    "selected_option_text": option_text_map.get(selected_opt, "") if selected_opt else "Not Attempted",
                    "correct_option": question.correct_option,
                    "correct_option_text": option_text_map.get(question.correct_option, ""),
                    "is_correct": is_correct,
                    "attempted": selected_opt is not None,  # NEW: flag for unattempted
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
                selected_option=ans["selected_option"]  # will be None for unattempted
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

class GetRecentQuizzesView(APIView):
    """
    GET /api/recent-quizzes/
    Returns all quiz attempts by the logged-in student.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        attempts = Attempt.objects.filter(student=user).select_related("quiz", "quiz__teacher").order_by("-attempted_at")

        data = []
        for attempt in attempts:
            data.append({
                "id": attempt.id,
                "score": round(attempt.score),
                "attempted_at": attempt.attempted_at,
                "quiz": {
                    "title": attempt.quiz.title,
                    # "created_by": attempt.quiz.teacher.username if attempt.quiz.teacher else "N/A",
                },
            })
        return Response(data, status=status.HTTP_200_OK)
    
class GetAttemptResultView(APIView):
    """
    GET /api/attempts/result/<attempt_id>/
    Returns full quiz analysis for a specific attempt.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        try:
            attempt = Attempt.objects.get(id=attempt_id, student=request.user)
        except Attempt.DoesNotExist:
            return Response({"detail": "Attempt not found."}, status=status.HTTP_404_NOT_FOUND)

        saved_answers = SavedAnswer.objects.filter(attempt=attempt).select_related("question")
        results = []

        for sa in saved_answers:
            q = sa.question
            option_text_map = {
                "A": q.option_a,
                "B": q.option_b,
                "C": q.option_c,
                "D": q.option_d,
            }
            results.append({
                "question_id": q.id,
                "question_text": q.text,
                "selected_option": sa.selected_option,
                "selected_option_text": option_text_map.get(sa.selected_option, ""),
                "correct_option": q.correct_option,
                "correct_option_text": option_text_map.get(q.correct_option, ""),
                "is_correct": sa.selected_option == q.correct_option,
            })

        correct_count = sum(r["is_correct"] for r in results)
        total_questions = len(results)
        score = attempt.score

        return Response({
            "attempt_id": attempt.id,
            "quiz_title": attempt.quiz.title,
            "score": round(score, 2),
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "results": results,
        }, status=status.HTTP_200_OK)

