def confidence_score(wpm, filler_count):
    score = 100

    if wpm < 100:
        score -= 15
    elif wpm > 180:
        score -= 10

    score -= filler_count * 5

    return max(0, min(100, score))


def clarity_score(sentence_count, filler_count):
    score = 100

    if sentence_count < 3:
        score -= 20

    score -= filler_count * 3

    return max(0, min(100, score))
