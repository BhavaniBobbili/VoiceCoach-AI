import { FileText } from "lucide-react";

interface TranscriptCardProps {
  transcript: string;
}

const TranscriptCard = ({ transcript }: TranscriptCardProps) => {
  return (
    <div className="glass-card p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <h2 className="font-display text-xl font-semibold">Your Speech</h2>
      </div>
      
      <div className="bg-secondary/50 rounded-xl p-5 max-h-48 overflow-y-auto">
        <p className="text-foreground/90 leading-relaxed text-lg">
          "{transcript}"
        </p>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span>Transcription complete</span>
      </div>
    </div>
  );
};

export default TranscriptCard;
