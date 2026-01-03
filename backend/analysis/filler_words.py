import re

FILLER_WORDS = ["um", "uh", "like", "okay", "you know"]

def count_filler_words(transcript):
    transcript = transcript.lower()

    counts = {}
    total = 0

    for word in FILLER_WORDS:
        pattern = r"\b" + re.escape(word) + r"\b"
        matches = re.findall(pattern, transcript)
        counts[word] = len(matches)
        total += len(matches)

    return {
        "per_word": counts,
        "total": total
    }
