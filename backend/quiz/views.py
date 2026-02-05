from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Quiz, Question
from .serializers import QuizSerializer, QuestionSerializer
from attempts.models import Attempt, SavedAnswer
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Avg, Count


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
                correct_option=chr(65 + q['correct']) 
            )

        return Response({"message": "Questions added successfully!"}, status=status.HTTP_201_CREATED)


class GetRecentQuizzesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        quizes = Quiz.objects.filter(teacher=user).order_by('-created_at')

        data = []
        for quiz in quizes:
            data.append({
                "id": quiz.id,
                "title": quiz.title,
                "code": quiz.code,
                "created_at": quiz.created_at,
                "total_questions": quiz.total_questions,
                "attempts_count": quiz.attempts.count()
            })
        return Response(data, status=status.HTTP_200_OK)



class GetAllStudentQuizzesView(APIView):
    """
    GET /api/quiz/<quiz_id>/attempts/
    Returns list of all students who attempted a specific quiz,
    with their score, attempt time, and identifying info.
    """
    permission_classes = [permissions.IsAuthenticated]  # optional: restrict to teachers

    def get(self, request, quiz_id):
        # 1️⃣ Verify that the quiz exists
        quiz = get_object_or_404(Quiz, id=quiz_id)

        # 2️⃣ Fetch all attempts for this quiz (order by latest attempt time)
        attempts_qs = (
            Attempt.objects.filter(quiz=quiz)
            .select_related("student")          # optimize student fetching
            .order_by("-attempted_at")         # <-- use attempted_at (not created_at)
        )

        # 3️⃣ Build response data
        data = []
        for attempt in attempts_qs:
            # compute saved answers + correct count
            saved_answers = SavedAnswer.objects.filter(attempt=attempt).select_related("question")
            correct_count = sum(
                sa.selected_option == sa.question.correct_option for sa in saved_answers
            )

            data.append({
                "attempt_id": attempt.id,
                "student_id": attempt.student.id,
                "student_name": attempt.student.get_full_name() or attempt.student.username,
                "student_email": getattr(attempt.student, "email", None),
                "quiz_title": quiz.title,
                "score": round(attempt.score, 2),
                "correct_answers": correct_count,
                "total_questions": len(saved_answers),
                "attempted_at": attempt.attempted_at.isoformat(), 
            })

        return Response({
            "quiz_id": quiz.id,
            "quiz_title": quiz.title,
            "total_attempts": len(data),
            "attempts": data,
            "quiz_code": quiz.code,
        }, status=status.HTTP_200_OK)
    

class GetAttemptResultForTeacherView(APIView):
    """
    GET /api/teacher/attempts/result/<attempt_id>/
    Returns full quiz analysis for a specific attempt (for teachers).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        try:
            attempt = Attempt.objects.select_related("student", "quiz").get(id=attempt_id)
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
            "student_name": attempt.student.get_full_name() or attempt.student.username,
            "student_email": getattr(attempt.student, "email", None),
            "score": round(score, 2),
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "attempted_at": attempt.attempted_at.isoformat(),
            "results": results,
        }, status=status.HTTP_200_OK)


class TeacherDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != "teacher":
            return Response({"detail": "Only teachers can access this dashboard."},
                            status=status.HTTP_403_FORBIDDEN)

        # ✅ Total quizzes by teacher
        total_quizzes = Quiz.objects.filter(teacher=user).count()

        # ✅ "Active quizzes" (fallback logic: created in last 7 days)
        seven_days_ago = now() - timedelta(days=7)
        active_quizzes = Quiz.objects.filter(teacher=user, created_at__gte=seven_days_ago).count()

        # ✅ Total attempts on teacher quizzes
        attempts_qs = Attempt.objects.filter(quiz__teacher=user)
        total_attempts = attempts_qs.count()

        # ✅ Average score across all attempts (if none, return 0)
        avg_score = attempts_qs.aggregate(avg=Avg("score"))["avg"] or 0

        # ✅ Recent quizzes (last 5) with attempts count
        recent_quizzes_qs = (
            Quiz.objects.filter(teacher=user)
            .annotate(attempt_count=Count("attempts"))
            .order_by("-created_at")[:5]
        )

        recent_quizzes = []
        for quiz in recent_quizzes_qs:
            recent_quizzes.append({
                "id": quiz.id,
                "title": quiz.title,
                "code": quiz.code,
                "timer": quiz.timer,
                "total_questions": quiz.total_questions,
                "created_at": quiz.created_at.isoformat(),
                "attempts_count": quiz.attempt_count,
            })

        return Response({
            "stats": {
                "totalQuizzes": total_quizzes,
                "activeQuizzes": active_quizzes,
                "totalAttempts": total_attempts,
                "avgScore": round(avg_score, 2),
            },
            "recentQuizzes": recent_quizzes,
        }, status=status.HTTP_200_OK)
