from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated  # restrict to teachers
from .services import generate_quiz_with_ai

class GenerateQuizAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        topic = request.data.get("topic") or request.data.get("passage")
        num_questions = int(request.data.get("num_questions", 5))
        difficulty = request.data.get("difficulty", "medium")

        if not topic:
            return Response({"error": "topic_or_passage_required"}, status=400)

        result = generate_quiz_with_ai(topic, num_questions, difficulty)
        return Response({"result": result})
