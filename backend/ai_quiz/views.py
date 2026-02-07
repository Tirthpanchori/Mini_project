from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import generate_quiz_with_ai, analyze_weak_topics_with_ai, get_text_from_urlid
import pdfplumber,re

class GenerateQuizAPIView(APIView):
    permission_classes = [IsAuthenticated]

    # def extract_pdf_text(self, pdf_file):
    #     """Extracts all text from a PDF file."""
    #     try:
    #         reader = PdfReader(pdf_file)
    #         text = ""
    #         for page in reader.pages:
    #             text += page.extract_text() or ""
    #         return text.strip()
    #     except Exception as e:
    #         print("PDF extract error:", e)
    #         return ""
        

    def extract_pdf_text(self, pdf_file):
        try:
            text = ""
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
            return text.strip()
        except Exception as e:
            print("pdfplumber error:", e)
        return ""


    def post(self, request):
        topic = request.data.get("topic")  # optional
        title = request.data.get("title")  # NEW
        pdf_file = request.FILES.get("pdf")  # NEW
        num_questions = int(request.data.get("num_questions", 5))
        difficulty = request.data.get("difficulty", "medium")

        pdf_text = ""

        # If PDF was uploaded, extract text
        if pdf_file:
            pdf_text = self.extract_pdf_text(pdf_file)

        # Merge topic + PDF text depending on which exists
        combined_text = ""

        if topic:
            combined_text += (title + ": " + topic) + "\n\n"

        if pdf_text:
            combined_text += pdf_text

        # If nothing was provided, return error
        if not combined_text.strip():
            return Response({"error": "topic_or_pdf_required"}, status=400)

        # Pass combined text to AI generator
        result = generate_quiz_with_ai(combined_text, num_questions, difficulty)

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


class GetTextOutOfUrl(APIView):
    permission_classes = [IsAuthenticated]

    YOUTUBE_ID_REGEX = re.compile(
        r"(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&\/]|$)"
    )

    def extract_video_id(self, url: str):
        match = self.YOUTUBE_ID_REGEX.search(url)
        return match.group(1) if match else None

    def post(self, request):
        url = request.data.get("url")
        if not url:
            return Response({"error": "url_required"}, status=400)

        video_id = self.extract_video_id(url)
        if not video_id:
            return Response({"error": "invalid_youtube_url"}, status=400)

        text = get_text_from_urlid(video_id)

        return Response({"text": text})

