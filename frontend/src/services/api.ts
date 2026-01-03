const API_BASE_URL = 'http://127.0.0.1:5000';

export interface AnalysisResponse {
  raw_transcript: string;
  metrics: {
    wpm: number;
    confidence: number;
    clarity: number;
    total_words: number;
    filler_total: number;
    filler_breakdown: Record<string, number>;
  };
  ai_feedback: string;
}

export const analyzeAudio = async (audioBlob: Blob, duration: number): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.wav');
  formData.append('duration', duration.toString());

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Analysis failed: ${response.status} ${errorText}`);
  }

  return response.json();
};

