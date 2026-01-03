def calculate_wpm(transcript, duration_seconds):
    words = transcript.split()
    word_count = len(words)

    minutes = duration_seconds / 60
    if minutes == 0:
        return 0

    return round(word_count / minutes)
