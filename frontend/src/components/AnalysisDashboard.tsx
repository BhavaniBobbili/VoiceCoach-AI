import { ArrowLeft, Shield, Sparkles } from "lucide-react";
import TranscriptCard from "./TranscriptCard";
import SpeedGauge from "./SpeedGauge";
import FillerWordsChart from "./FillerWordsChart";
import CircularProgress from "./CircularProgress";
import AIFeedbackCard from "./AIFeedbackCard";

interface AnalysisData {
  transcript: string;
  word_count: number;
  wpm: number;
  confidence_score: number;
  clarity_score: number;
  filler_counts: Record<string, number>;
  ai_feedback: string;
}

interface AnalysisDashboardProps {
  data: AnalysisData;
  onReset: () => void;
}

interface StructuredFeedback {
  overallAssessment?: string;
  communicationStrengths?: string;
  areasToImprove?: string;
  howToImprove?: string;
  improvedSampleAnswer?: string;
}

const parseAIFeedback = (feedbackText: string): StructuredFeedback => {
  const result: StructuredFeedback = {};
  const text = feedbackText.trim();
  
  if (!text) return result;
  
  // Try to extract structured sections based on common patterns
  const sections = [
    { key: 'overallAssessment', patterns: [/overall assessment/i, /^overall/i, /summary/i, /in summary/i] },
    { key: 'communicationStrengths', patterns: [/communication strengths/i, /strengths/i, /what you did well/i, /positive/i] },
    { key: 'areasToImprove', patterns: [/areas to improve/i, /areas for improvement/i, /improvements needed/i, /weaknesses/i] },
    { key: 'howToImprove', patterns: [/how to improve/i, /improvement tips/i, /recommendations/i, /actionable/i, /tips/i] },
    { key: 'improvedSampleAnswer', patterns: [/improved sample/i, /sample answer/i, /rewritten/i, /corrected version/i, /professional version/i] },
  ];
  
  // Split by double newlines or numbered sections
  const paragraphs = text.split(/\n\s*\n+/).filter(p => p.trim().length > 0);
  
  // If we have clear section markers, parse them
  let currentSection: keyof StructuredFeedback | null = null;
  let currentContent: string[] = [];
  
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    
    // Check if this paragraph is a section header
    let foundSection = false;
    for (const section of sections) {
      for (const pattern of section.patterns) {
        if (pattern.test(trimmed) && trimmed.length < 100) {
          // Save previous section
          if (currentSection && currentContent.length > 0) {
            result[currentSection] = currentContent.join('\n\n').trim();
          }
          // Start new section
          currentSection = section.key as keyof StructuredFeedback;
          currentContent = [];
          foundSection = true;
          break;
        }
      }
      if (foundSection) break;
    }
    
    if (!foundSection && trimmed.length > 20) {
      // This is content, add to current section or default
      if (currentSection) {
        currentContent.push(trimmed);
      } else {
        // No section found yet, try to infer from content
        const lower = trimmed.toLowerCase();
        if (!result.overallAssessment && (lower.includes('overall') || lower.includes('summary'))) {
          result.overallAssessment = trimmed;
        } else if (!result.communicationStrengths && (lower.includes('strength') || lower.includes('good') || lower.includes('well'))) {
          result.communicationStrengths = trimmed;
        } else if (!result.areasToImprove && (lower.includes('improve') || lower.includes('reduce') || lower.includes('avoid'))) {
          result.areasToImprove = trimmed;
        } else if (!result.howToImprove && (lower.includes('practice') || lower.includes('try') || lower.includes('tip'))) {
          result.howToImprove = trimmed;
        } else if (!result.improvedSampleAnswer && (lower.includes('sample') || lower.includes('rewritten') || lower.includes('corrected'))) {
          result.improvedSampleAnswer = trimmed;
        } else if (!result.overallAssessment) {
          result.overallAssessment = trimmed;
        }
      }
    }
  }
  
  // Save last section
  if (currentSection && currentContent.length > 0) {
    result[currentSection] = currentContent.join('\n\n').trim();
  }
  
  // If parsing didn't work well, try splitting by numbered items
  if (!result.overallAssessment && !result.communicationStrengths) {
    const numberedSections = text.split(/\d+[\.\)]\s*/).filter(s => s.trim().length > 20);
    if (numberedSections.length >= 2) {
      result.overallAssessment = numberedSections[0].trim();
      if (numberedSections.length >= 3) {
        result.communicationStrengths = numberedSections[1].trim();
      }
      if (numberedSections.length >= 4) {
        result.areasToImprove = numberedSections[2].trim();
      }
      if (numberedSections.length >= 5) {
        result.howToImprove = numberedSections[3].trim();
      }
      if (numberedSections.length >= 6) {
        result.improvedSampleAnswer = numberedSections.slice(4).join(' ').trim();
      }
    }
  }
  
  // Fallback: if nothing was parsed, use the whole text as overall assessment
  if (!result.overallAssessment && !result.communicationStrengths && !result.areasToImprove) {
    result.overallAssessment = text;
  }
  
  return result;
};

const AnalysisDashboard = ({ data, onReset }: AnalysisDashboardProps) => {
  const structuredFeedback = parseAIFeedback(data.ai_feedback);

  return (
    <section className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <button
              onClick={onReset}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Record Again</span>
            </button>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Your <span className="text-gradient">Analysis</span> Results
            </h1>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI Analysis Complete</span>
          </div>
        </div>

        {/* Transcript */}
        <div className="mb-8">
          <TranscriptCard transcript={data.transcript} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            <SpeedGauge wpm={data.wpm} wordCount={data.word_count} />
            <FillerWordsChart fillerCounts={data.filler_counts} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Circular Progress Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <CircularProgress
                  value={data.confidence_score}
                  label="Confidence Score"
                  icon={<Shield className="w-5 h-5 text-success" />}
                  color="success"
                />
              </div>
              <div className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
                <CircularProgress
                  value={data.clarity_score}
                  label="Clarity Score"
                  icon={<Sparkles className="w-5 h-5 text-primary" />}
                  color="primary"
                />
              </div>
            </div>

            {/* AI Feedback */}
            <AIFeedbackCard structuredFeedback={structuredFeedback} />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center animate-fade-up" style={{ animationDelay: "0.6s" }}>
          <button
            onClick={onReset}
            className="px-8 py-4 rounded-xl font-display font-semibold bg-gradient-to-r from-primary to-primary/80 glow-button text-foreground transition-all"
          >
            Practice Another Response
          </button>
          <p className="mt-4 text-muted-foreground text-sm">
            Regular practice leads to interview success
          </p>
        </div>
      </div>
    </section>
  );
};

export default AnalysisDashboard;
