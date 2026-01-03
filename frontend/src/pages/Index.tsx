import { useState } from "react";
import RecordingSection from "@/components/RecordingSection";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import { Mic, Loader2 } from "lucide-react";
import { analyzeAudio, AnalysisResponse } from "@/services/api";

interface AnalysisData {
  transcript: string;
  word_count: number;
  wpm: number;
  confidence_score: number;
  clarity_score: number;
  filler_counts: Record<string, number>;
  ai_feedback: string;
}

const Index = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transformApiResponse = (response: AnalysisResponse): AnalysisData => {
    return {
      transcript: response.raw_transcript,
      word_count: response.metrics.total_words,
      wpm: response.metrics.wpm,
      confidence_score: response.metrics.confidence,
      clarity_score: response.metrics.clarity,
      filler_counts: response.metrics.filler_breakdown,
      ai_feedback: response.ai_feedback,
    };
  };

  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await analyzeAudio(audioBlob, duration);
      const transformedData = transformApiResponse(response);
      setAnalysisData(transformedData);
      setShowAnalysis(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze audio. Please try again.');
      setShowAnalysis(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowAnalysis(false);
    setAnalysisData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/50 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Mic className="w-5 h-5 text-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Interview Coach</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="glass-card p-12 w-full max-w-md text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl font-semibold mb-2">Analyzing Your Speech</h2>
              <p className="text-muted-foreground">
                Processing audio and generating feedback...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="glass-card p-12 w-full max-w-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2 text-destructive">Analysis Failed</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-primary text-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : showAnalysis && analysisData ? (
          <AnalysisDashboard data={analysisData} onReset={handleReset} />
        ) : (
          <RecordingSection onComplete={handleRecordingComplete} />
        )}
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-success/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>
    </div>
  );
};

export default Index;
