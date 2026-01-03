import { BarChart3, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface FillerWordsChartProps {
  fillerCounts: Record<string, number>;
}

const FillerWordsChart = ({ fillerCounts }: FillerWordsChartProps) => {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const fillers = Object.entries(fillerCounts);
  const maxCount = Math.max(...fillers.map(([, count]) => count), 1);
  const totalFillers = fillers.reduce((sum, [, count]) => sum + count, 0);
  const hasFillers = totalFillers > 0;

  const getBarColor = (word: string) => {
    const colors: Record<string, string> = {
      uh: "from-destructive to-destructive/70",
      um: "from-warning to-warning/70",
      like: "from-primary to-primary/70",
      okay: "from-success to-success/70",
    };
    return colors[word] || "from-muted-foreground to-muted-foreground/70";
  };

  return (
    <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="font-display text-xl font-semibold">Filler Words</h2>
      </div>

      {hasFillers ? (
        <div className="space-y-4">
          {fillers.map(([word, count]) => {
            const percentage = (count / maxCount) * 100;
            return (
              <div key={word} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium capitalize">"{word}"</span>
                  <span className="text-muted-foreground text-sm">{count}x</span>
                </div>
                <div className="h-8 bg-secondary rounded-lg overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getBarColor(word)} rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-3`}
                    style={{ width: animated ? `${Math.max(percentage, 8)}%` : "0%" }}
                  >
                    {count > 0 && (
                      <span className="text-xs font-semibold text-foreground/90">{count}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Total */}
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total filler words</span>
              <span className="font-semibold text-warning">{totalFillers}</span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm mt-2">
            💡 Reducing filler words will make your responses sound more confident.
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-success" />
          </div>
          <h3 className="font-display text-xl font-semibold text-success mb-2">
            Excellent! 🎉
          </h3>
          <p className="text-muted-foreground">
            No filler words detected in your speech.
          </p>
        </div>
      )}
    </div>
  );
};

export default FillerWordsChart;
