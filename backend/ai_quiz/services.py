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
    Uses AI with NLP techniques to deeply analyze incorrect answers and identify 
    specific weak topics, concepts, and misconceptions.
    
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
    
    # NLP Enhancement 1: Extract key terms and concepts from questions
    def extract_key_terms(text: str) -> List[str]:
        """Extract important terms using simple keyword extraction"""
        # Remove common words and focus on domain-specific terms
        stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 
                      'to', 'for', 'of', 'with', 'by', 'from', 'what', 'which', 'how'}
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        return [w for w in words if w not in stop_words][:10]  # Top 10 terms
    
    # NLP Enhancement 2: Calculate semantic similarity between wrong and correct answers
    def calculate_answer_similarity(wrong: str, correct: str) -> str:
        """Determine if answers are conceptually similar or completely different"""
        # Handle None or empty strings
        if not wrong or not correct:
            return "fundamental_gap"  # Changed from "unknown" to valid pattern
        
        wrong_terms = set(extract_key_terms(wrong))
        correct_terms = set(extract_key_terms(correct))
        
        if not wrong_terms or not correct_terms:
            return "fundamental_gap"  # Changed from "unknown" to valid pattern
        
        overlap = len(wrong_terms & correct_terms) / len(correct_terms)
        
        if overlap > 0.5:
            return "partial_understanding"  # Student has some related knowledge
        elif overlap > 0.2:
            return "confused_concepts"  # Student confusing similar concepts
        else:
            return "fundamental_gap"  # Complete misunderstanding
    
    # NLP Enhancement 3: Identify question patterns and types
    def identify_question_type(question: str) -> str:
        """Classify question type based on linguistic patterns"""
        q_lower = question.lower()
        
        if any(word in q_lower for word in ['why', 'explain', 'describe']):
            return "conceptual"
        elif any(word in q_lower for word in ['calculate', 'compute', 'solve']):
            return "computational"
        elif any(word in q_lower for word in ['compare', 'contrast', 'difference']):
            return "comparative"
        elif any(word in q_lower for word in ['when', 'where', 'who', 'what year']):
            return "factual"
        elif any(word in q_lower for word in ['apply', 'use', 'implement']):
            return "application"
        else:
            return "general"
    
    # Prepare enhanced analysis with NLP features
    questions_summary = []
    all_key_terms = []
    error_patterns = {
        "partial_understanding": 0,
        "confused_concepts": 0,
        "fundamental_gap": 0,
        "unknown": 0  # FIX: Added to handle edge cases
    }
    question_type_errors = {}
    
    for idx, q in enumerate(incorrect_questions, 1):
        question_text = q.get("question_text", "")
        your_answer = q.get("selected_option_text", "")
        correct_answer = q.get("correct_option_text", "")
        
        # Extract NLP features
        key_terms = extract_key_terms(question_text)
        all_key_terms.extend(key_terms)
        similarity_type = calculate_answer_similarity(your_answer, correct_answer)
        q_type = identify_question_type(question_text)
        
        # Track patterns
        error_patterns[similarity_type] = error_patterns.get(similarity_type, 0) + 1
        question_type_errors[q_type] = question_type_errors.get(q_type, 0) + 1
        
        questions_summary.append({
            "number": idx,
            "question": question_text,
            "your_answer": your_answer,
            "correct_answer": correct_answer,
            "explanation": q.get("explanation", ""),
            "key_terms": key_terms,
            "error_pattern": similarity_type,
            "question_type": q_type
        })
    
    # NLP Enhancement 4: Find most frequent concepts (simple topic modeling)
    from collections import Counter
    term_frequency = Counter(all_key_terms)
    top_concepts = [term for term, _ in term_frequency.most_common(8)]
    
    # NLP Enhancement 5: Identify learning style from error patterns
    total_errors = len(incorrect_questions)
    learning_insight = ""
    if error_patterns["partial_understanding"] / total_errors > 0.5:
        learning_insight = "Shows partial understanding; needs reinforcement and examples"
    elif error_patterns["confused_concepts"] / total_errors > 0.5:
        learning_insight = "Confusing similar concepts; needs clear differentiation"
    elif error_patterns["fundamental_gap"] / total_errors > 0.5:
        learning_insight = "Has fundamental gaps; needs foundational review"
    
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert educational analyst with NLP capabilities specializing in "
                "identifying knowledge gaps and learning needs. Use the provided NLP analysis "
                "(key terms, error patterns, question types) to identify specific topics, "
                "concepts, and skills the student needs to improve. "
                "Provide actionable, personalized recommendations. "
                "Respond ONLY in valid JSON format."
            )
        },
        {
            "role": "user",
            "content": f"""
Analyze the following incorrect quiz answers with NLP-enhanced insights:

QUESTIONS WITH NLP ANALYSIS:
{json.dumps(questions_summary, indent=2)}

NLP INSIGHTS:
- Frequently appearing concepts: {', '.join(top_concepts)}
- Error pattern distribution: {json.dumps(error_patterns)}
- Question types with most errors: {json.dumps(question_type_errors)}
- Learning insight: {learning_insight}

Provide a detailed analysis in the following JSON format:

{{
  "weak_topics": [
    {{
      "topic": "Name of the specific topic/concept",
      "severity": "critical|high|moderate",
      "questions_affected": [1, 2],
      "description": "Clear explanation of what the student misunderstands",
      "common_misconception": "The specific misconception identified",
      "error_pattern": "partial_understanding|confused_concepts|fundamental_gap",
      "key_concepts_to_learn": ["concept 1", "concept 2"],
      "study_recommendations": [
        "Specific actionable study tip 1",
        "Specific actionable study tip 2"
      ],
      "conceptual_relationships": "How this topic relates to others they struggle with"
    }}
  ],
  "overall_analysis": "Brief 2-3 sentence summary using NLP insights about patterns",
  "learning_style_recommendation": "Suggested approach based on error patterns",
  "conceptual_clusters": [
    {{
      "cluster_name": "Group of related concepts",
      "concepts": ["concept1", "concept2"],
      "relationship": "How they're connected"
    }}
  ],
  "priority_actions": [
    "Most important thing to work on first",
    "Second priority"
  ],
  "estimated_study_time": "Realistic time estimate to improve (e.g., '2-3 hours')"
}}

Rules:
- Use the NLP insights (key terms, error patterns) to identify 2-5 distinct weak topics
- Be specific: "Photosynthesis light reactions" not just "Biology"
- Group related concepts based on key term overlap
- Consider error patterns when making recommendations:
  * partial_understanding → provide examples and practice
  * confused_concepts → focus on differentiating similar ideas
  * fundamental_gap → build from basics
- Severity: critical (<40% on topic), high (40-59%), moderate (60-79%)
- Identify conceptual clusters that connect multiple weak topics
- Make recommendations match the identified learning style
- Output ONLY valid JSON, no markdown or extra text
"""
        }
    ]
    
    payload = {
        "model": GROK_MODEL,
        "messages": messages,
        "temperature": 0.3,  # Lower temperature for more focused analysis
        "max_tokens": 2500,  # Increased for richer analysis
    }
    
    try:
        logger.info(f"Sending NLP-enhanced request to {GROK_API_URL} for topic analysis")
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
        
        # Add NLP metadata to response
        analysis["nlp_metadata"] = {
            "top_concepts": top_concepts,
            "error_patterns": {k: v for k, v in error_patterns.items() if v > 0},  # Only include non-zero patterns
            "question_type_distribution": question_type_errors,
            "dominant_error_pattern": max(
                (k for k, v in error_patterns.items() if k != "unknown" and v > 0),
                key=lambda k: error_patterns[k],
                default="fundamental_gap"
            )
        }
        
        logger.info(f"Successfully analyzed {len(incorrect_questions)} incorrect answers with NLP")
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