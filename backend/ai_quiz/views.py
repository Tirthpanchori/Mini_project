from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import generate_quiz_with_ai, analyze_weak_topics_with_ai

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


class AnalyzeWeakTopicsAPIView(APIView):
    """
    Endpoint to analyze quiz results and identify weak topics using AI/NLP
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        quiz_results = request.data.get("quiz_results")
        
        if not quiz_results:
            return Response({
                "success": False,
                "error": "quiz_results_required"
            }, status=400)
        
        if not isinstance(quiz_results, list):
            return Response({
                "success": False,
                "error": "quiz_results_must_be_array"
            }, status=400)
        
        # Call the AI analysis service
        analysis_result = analyze_weak_topics_with_ai(quiz_results)
        
        # Return the analysis
        if analysis_result.get("success"):
            return Response(analysis_result, status=200)
        else:
            return Response(analysis_result, status=500)