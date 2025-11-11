import os
import re
import json
import requests

GROK_API_URL = os.getenv("GROK_API_URL", "https://api.groq.com/openai/v1/chat/completions")
GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_MODEL = os.getenv("GROK_MODEL", "llama-3.1-8b-instant")

HEADERS = {
    "Authorization": f"Bearer {GROK_API_KEY}",
    "Content-Type": "application/json",
}


def generate_quiz_with_ai(topic_or_passage: str, num_questions: int = 5, difficulty: str = "medium", temperature: float = 0.1):
    """
    Calls the model and returns parsed JSON list of questions.
    """

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

    # print("DEBUG - Sending request to:", GROK_API_URL)
    # print("DEBUG - Headers:", HEADERS)
    # print("DEBUG - Payload:", json.dumps(payload, indent=2))

    try:
        resp = requests.post(GROK_API_URL, headers=HEADERS, json=payload, timeout=60)
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        return {"error": "network_error", "details": str(e)}

    # Try to parse response
    try:
        data = resp.json()
    except Exception:
        return {"error": "invalid_json_response", "raw": resp.text}

    # Extract model output text
    text = None
    if isinstance(data, dict) and "choices" in data and data["choices"]:
        choice = data["choices"][0]
        text = (
            choice.get("message", {}).get("content")
            or choice.get("text")
            or ""
        )

    if not text:
        return {"error": "no_output_text", "raw": data}

    # Remove markdown fences if any
    text = re.sub(r"^```(?:json)?\n", "", text.strip())
    text = re.sub(r"\n```$", "", text.strip())

    # Try to extract JSON array
    json_match = re.search(r"(\[.*\])", text, re.S)
    json_text = json_match.group(1) if json_match else text

    try:
        questions = json.loads(json_text)
        validated = [
            q for q in questions
            if isinstance(q, dict) and "question" in q and "options" in q and "answer" in q
        ]
        return {"success": True, "questions": validated, "raw_text": text}
    except Exception as e:
        return {"error": "parse_failed", "exception": str(e), "raw": text}
