import os
import re
import json
import requests
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

GROK_API_URL = os.getenv("GROK_API_URL", "https://api.groq.com/openai/v1/chat/completions")
GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_MODEL = os.getenv("GROK_MODEL", "llama-3.1-8b-instant")

HEADERS = {
    "Authorization": f"Bearer {GROK_API_KEY}",
    "Content-Type": "application/json",
}


def analyze_weak_topics_with_ai(quiz_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Uses AI to deeply analyze incorrect answers and identify specific weak topics,
    concepts, and misconceptions.
    
    Args:
        quiz_results: List of question results with structure:
            [{
                "question_text": str,
                "selected_option": str (optional),
                "selected_option_text": str,
                "correct_option": str (optional),
                "correct_option_text": str,
                "is_correct": bool,
                "explanation": str (optional)
            }, ...]
    
    Returns:
        Dict containing detailed topic analysis with recommendations
    """
    
    # Validate API key
    if not GROK_API_KEY:
        logger.error("GROK_API_KEY is not set in environment variables")
        return {
            "success": False,
            "error": "API key not configured. Please contact administrator."
        }
    
    # Filter only incorrect answers for analysis
    incorrect_questions = [q for q in quiz_results if not q.get("is_correct", True)]
    
    if not incorrect_questions:
        return {
            "success": True,
            "weak_topics": [],
            "overall_analysis": "Great job! You answered all questions correctly.",
            "priority_actions": ["Keep practicing to maintain your knowledge level."],
            "estimated_study_time": "0 hours - just keep reviewing!"
        }
    
    # Prepare the analysis prompt
    questions_summary = []
    for idx, q in enumerate(incorrect_questions, 1):
        questions_summary.append({
            "number": idx,
            "question": q.get("question_text", ""),
            "your_answer": q.get("selected_option_text", ""),
            "correct_answer": q.get("correct_option_text", ""),
            "explanation": q.get("explanation", "")
        })
    
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert educational analyst specializing in identifying "
                "knowledge gaps and learning needs. Analyze quiz results to identify "
                "specific topics, concepts, and skills the student needs to improve. "
                "Provide actionable, personalized recommendations. "
                "Respond ONLY in valid JSON format."
            )
        },
        {
            "role": "user",
            "content": f"""
Analyze the following incorrect quiz answers and identify specific weak topics and concepts:

{json.dumps(questions_summary, indent=2)}

Provide a detailed analysis in the following JSON format:

{{
  "weak_topics": [
    {{
      "topic": "Name of the specific topic/concept",
      "severity": "critical|high|moderate",
      "questions_affected": [1, 2],
      "description": "Clear explanation of what the student misunderstands",
      "common_misconception": "The specific misconception identified",
      "key_concepts_to_learn": ["concept 1", "concept 2"],
      "study_recommendations": [
        "Specific actionable study tip 1",
        "Specific actionable study tip 2"
      ]
    }}
  ],
  "overall_analysis": "Brief 2-3 sentence summary of student's performance pattern",
  "priority_actions": [
    "Most important thing to work on first",
    "Second priority"
  ],
  "estimated_study_time": "Realistic time estimate to improve (e.g., '2-3 hours')"
}}

Rules:
- Identify 2-5 distinct weak topics (don't over-group or under-group)
- Be specific: "Photosynthesis light reactions" not just "Biology"
- Focus on conceptual gaps, not just facts
- Severity: critical (<40% on topic), high (40-59%), moderate (60-79%)
- Make recommendations actionable and specific
- Analyze patterns in wrong answers (e.g., confusing similar concepts)
- Output ONLY valid JSON, no markdown or extra text
"""
        }
    ]
    
    payload = {
        "model": GROK_MODEL,
        "messages": messages,
        "temperature": 0.3,  # Lower temperature for more focused analysis
        "max_tokens": 2000,
    }
    
    try:
        logger.info(f"Sending request to {GROK_API_URL} for topic analysis")
        resp = requests.post(GROK_API_URL, headers=HEADERS, json=payload, timeout=60)
        resp.raise_for_status()
    except requests.exceptions.Timeout:
        logger.error("Request timed out")
        return {
            "success": False,
            "error": "Request timed out. Please try again."
        }
    except requests.exceptions.ConnectionError:
        logger.error("Connection error")
        return {
            "success": False,
            "error": "Unable to connect to AI service. Please check your internet connection."
        }
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error: {e.response.status_code} - {e.response.text}")
        return {
            "success": False,
            "error": f"AI service error: {e.response.status_code}. Please try again later."
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception: {str(e)}")
        return {
            "success": False,
            "error": f"Network error: {str(e)}"
        }
    
    # Parse response
    try:
        data = resp.json()
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON response: {resp.text[:500]}")
        return {
            "success": False,
            "error": "Invalid response from AI service"
        }
    
    # Extract AI response text
    text = None
    if isinstance(data, dict) and "choices" in data and data["choices"]:
        choice = data["choices"][0]
        text = choice.get("message", {}).get("content", "") or choice.get("text", "")
    
    if not text:
        logger.error(f"No text in AI response: {data}")
        return {
            "success": False,
            "error": "Empty response from AI service"
        }
    
    # Clean markdown fences
    text = re.sub(r"^```(?:json)?\n", "", text.strip())
    text = re.sub(r"\n```$", "", text.strip())
    
    # Extract JSON
    json_match = re.search(r"(\{.*\})", text, re.S)
    json_text = json_match.group(1) if json_match else text
    
    try:
        analysis = json.loads(json_text)
        analysis["success"] = True
        analysis["total_incorrect"] = len(incorrect_questions)
        logger.info(f"Successfully analyzed {len(incorrect_questions)} incorrect answers")
        return analysis
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}\nText: {text[:500]}")
        return {
            "success": False,
            "error": "Failed to parse AI analysis. Please try again."
        }


def generate_quiz_with_ai(topic_or_passage: str, num_questions: int = 5, difficulty: str = "medium", temperature: float = 0.1):
    """
    Calls the model and returns parsed JSON list of questions.
    """
    
    if not GROK_API_KEY:
        logger.error("GROK_API_KEY is not set")
        return {"error": "api_key_not_configured"}
    
    messages = [
        {
            "role": "system",
            "content": (
                "You are a professional quiz generation assistant. "
                "Your task is to create high-quality multiple-choice questions "
                "for teachers to use in assessments. "
                "You must respond ONLY in valid JSON array format. "
                "Do not include any explanations, commentary, or markdown fences."
            ),
        },
        {
            "role": "user",
            "content": f"""
Generate {num_questions} **unique** multiple-choice questions based on the following topic or passage:
\"\"\"{topic_or_passage}\"\"\"

Difficulty level: {difficulty}.

**Important instructions:**
- Each question must test a *different* concept, fact, or subtopic.
- Strictly avoid repeating questions or options.
- Ensure all questions are relevant to the provided content.
- No repetition of any question not even very similar type Questions.
- Use clear, unambiguous phrasing suitable for students.
- Provide 4 distinct answer options labeled A–D.
- Indicate the correct answer by 0-based index (0 = first option).
- Add a short one-sentence explanation for the correct answer.
- Output format must be a valid JSON array only, like:

[
  {{
    "question": "Which pigment absorbs light energy during photosynthesis?",
    "options": ["Chlorophyll", "Hemoglobin", "Carotene", "Melanin"],
    "answer": 0,
    "explanation": "Chlorophyll captures sunlight for photosynthesis."
  }},
  ...
]

DO NOT include markdown, comments, or text outside the JSON.
""",
        },
    ]

    payload = {
        "model": GROK_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 4500,
    }

    try:
        logger.info(f"Generating {num_questions} quiz questions")
        resp = requests.post(GROK_API_URL, headers=HEADERS, json=payload, timeout=60)
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        logger.error(f"Quiz generation error: {str(e)}")
        return {"error": "network_error", "details": str(e)}

    try:
        data = resp.json()
    except Exception:
        logger.error(f"Invalid JSON response: {resp.text[:500]}")
        return {"error": "invalid_json_response", "raw": resp.text[:500]}

    text = None
    if isinstance(data, dict) and "choices" in data and data["choices"]:
        choice = data["choices"][0]
        text = (
            choice.get("message", {}).get("content")
            or choice.get("text")
            or ""
        )

    if not text:
        logger.error(f"No output text: {data}")
        return {"error": "no_output_text", "raw": str(data)[:500]}

    text = re.sub(r"^```(?:json)?\n", "", text.strip())
    text = re.sub(r"\n```$", "", text.strip())

    json_match = re.search(r"(\[.*\])", text, re.S)
    json_text = json_match.group(1) if json_match else text

    try:
        questions = json.loads(json_text)
        validated = [
            q for q in questions
            if isinstance(q, dict) and "question" in q and "options" in q and "answer" in q
        ]
        logger.info(f"Successfully generated {len(validated)} valid questions")
        return {"success": True, "questions": validated, "raw_text": text}
    except Exception as e:
        logger.error(f"Parse failed: {str(e)}\nText: {text[:500]}")
        return {"error": "parse_failed", "exception": str(e), "raw": text[:500]}