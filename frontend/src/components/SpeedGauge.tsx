import { Gauge } from "lucide-react";

interface SpeedGaugeProps {
  wpm: number;
  wordCount: number;
}

const SpeedGauge = ({ wpm, wordCount }: SpeedGaugeProps) => {
  // Determine status based on WPM
  const getStatus = () => {
    if (wpm < 100) return { color: "destructive", label: "Slow", message: "Try speaking slightly faster to maintain engagement." };
    if (wpm <= 160) return { color: "success", label: "Ideal", message: "Great pace! Your speaking speed is optimal." };
    return { color: "warning", label: "Fast", message: "Consider slowing down for better clarity." };
  };

  const status = getStatus();
  
  // Calculate gauge position (0-200 WPM scale)
  const percentage = Math.min((wpm / 200) * 100, 100);

  return (
    <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Gauge className="w-5 h-5 text-primary" />
        </div>
        <h2 className="font-display text-xl font-semibold">Speaking Speed</h2>
      </div>

      {/* Large WPM Display */}
      <div className="text-center mb-6">
        <div className="font-display text-6xl font-bold text-gradient mb-1">{wpm}</div>
        <div className="text-muted-foreground">Words Per Minute</div>
      </div>

      {/* Gauge Bar */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden mb-4">
        {/* Color zones */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-destructive/30" /> {/* Slow zone: 0-100 */}
          <div className="w-[30%] bg-success/30" /> {/* Ideal zone: 100-160 */}
          <div className="w-[20%] bg-warning/30" /> {/* Fast zone: 160-200 */}
        </div>
        
        {/* Indicator */}
        <div
          className="absolute top-0 h-full w-1 bg-foreground rounded-full transition-all duration-1000 ease-out shadow-lg"
          style={{ left: `calc(${percentage}% - 2px)` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>Slow</span>
        <span>100</span>
        <span>160</span>
        <span>Fast</span>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-${status.color}/20 text-${status.color === 'success' ? 'success' : status.color === 'warning' ? 'warning' : 'destructive'}`}>
        <span className={`w-2 h-2 rounded-full bg-${status.color === 'success' ? 'success' : status.color === 'warning' ? 'warning' : 'destructive'}`} />
        {status.label} ({wpm} WPM)
      </div>

      {/* Feedback */}
      <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
        {status.message}
      </p>

      {/* Word count */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total words spoken</span>
          <span className="font-semibold">{wordCount}</span>
        </div>
      </div>
    </div>
  );
};

export default SpeedGauge;
