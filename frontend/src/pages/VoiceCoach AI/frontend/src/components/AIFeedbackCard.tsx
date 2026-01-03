import { Bot, TrendingUp, Target, AlertCircle, Lightbulb, FileText } from "lucide-react";

interface StructuredFeedback {
  overallAssessment?: string;
  communicationStrengths?: string;
  areasToImprove?: string;
  howToImprove?: string;
  improvedSampleAnswer?: string;
}

interface AIFeedbackCardProps {
  structuredFeedback: StructuredFeedback;
}

const AIFeedbackCard = ({ structuredFeedback }: AIFeedbackCardProps) => {
  const sections = [
    {
      key: 'overallAssessment' as const,
      title: 'Overall Assessment',
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      content: structuredFeedback.overallAssessment,
      bgColor: 'bg-primary/5 border-primary/20',
    },
    {
      key: 'communicationStrengths' as const,
      title: 'Communication Strengths',
      icon: <Target className="w-5 h-5 text-success" />,
      content: structuredFeedback.communicationStrengths,
      bgColor: 'bg-success/5 border-success/20',
    },
    {
      key: 'areasToImprove' as const,
      title: 'Areas to Improve',
      icon: <AlertCircle className="w-5 h-5 text-warning" />,
      content: structuredFeedback.areasToImprove,
      bgColor: 'bg-warning/5 border-warning/20',
    },
    {
      key: 'howToImprove' as const,
      title: 'How to Improve',
      icon: <Lightbulb className="w-5 h-5 text-primary" />,
      content: structuredFeedback.howToImprove,
      bgColor: 'bg-primary/5 border-primary/20',
    },
    {
      key: 'improvedSampleAnswer' as const,
      title: 'Improved Sample Answer',
      icon: <FileText className="w-5 h-5 text-primary" />,
      content: structuredFeedback.improvedSampleAnswer,
      bgColor: 'bg-secondary/50 border-border',
    },
  ].filter(section => section.content && section.content.trim().length > 0);

  return (
    <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Bot className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold">AI Coach Feedback</h2>
          <p className="text-muted-foreground text-sm">Personalized coaching recommendations</p>
        </div>
      </div>

      <div className="space-y-5">
        {sections.map((section, index) => (
          <div
            key={section.key}
            className={`p-5 rounded-xl border ${section.bgColor} animate-fade-up`}
            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0">{section.icon}</div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {section.title}
              </h3>
            </div>
            <div className="pl-8">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-muted-foreground text-xs text-center">
          Analysis powered by AI • Keep practicing to improve
        </p>
      </div>
    </div>
  );
};

export default AIFeedbackCard;
