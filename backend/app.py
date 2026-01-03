from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import speech
import google.generativeai as genai
import os
from dotenv import load_dotenv

from analysis.filler_words import count_filler_words
from analysis.speaking_speed import calculate_wpm
from analysis.scoring import confidence_score, clarity_score

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

AUDIO_FOLDER = "audio"
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# ---------------- Speech to Text ----------------
def speech_to_text(audio_path):
    client = speech.SpeechClient()

    with open(audio_path, "rb") as f:
        audio_bytes = f.read()

    audio = speech.RecognitionAudio(content=audio_bytes)

    config = speech.RecognitionConfig(
        language_code="en-US",
        enable_automatic_punctuation=True,
        model="latest_long"
    )

    response = client.recognize(config=config, audio=audio)

    transcript = ""
    for result in response.results:
        transcript += result.alternatives[0].transcript + " "

    return transcript.strip()

# ---------------- Gemini Feedback ----------------
def ai_feedback(transcript):
    model = genai.GenerativeModel("models/gemini-2.5-flash")
    prompt = f"""
You are an interview coach.

Analyze the following answer:
"{transcript}"

1. Correct grammar
2. Rewrite professionally
3. List filler words removed
4. Give 3 improvement tips
"""

    response = model.generate_content(prompt)
    return response.text

# ---------------- Routes ----------------
@app.route("/analyze", methods=["POST"])
def analyze():
    audio_file = request.files["audio"]
    duration = float(request.form.get("duration", 60))  # seconds

    audio_path = os.path.join(AUDIO_FOLDER, "input.wav")
    audio_file.save(audio_path)

    transcript = speech_to_text(audio_path)

    filler = count_filler_words(transcript)
    wpm = calculate_wpm(transcript, duration)

    sentence_count = transcript.count(".")
    confidence = confidence_score(wpm, filler["total"])
    clarity = clarity_score(sentence_count, filler["total"])

    feedback = ai_feedback(transcript)

    return jsonify({
        "raw_transcript": transcript,

        # 🔢 Chart-ready numbers
        "metrics": {
            "wpm": wpm,
            "confidence": confidence,
            "clarity": clarity,
            "total_words": len(transcript.split()),
            "filler_total": filler["total"],
            "filler_breakdown": filler["per_word"]
        },

        # 🧠 AI text
        "ai_feedback": feedback
    })

@app.route("/health")
def health():
    return {"status": "OK"}

if __name__ == "__main__":
    app.run(debug=True)
