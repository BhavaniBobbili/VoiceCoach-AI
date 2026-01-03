import { useEffect, useState } from "react";

interface CircularProgressProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  color?: "primary" | "success" | "warning";
}

const CircularProgress = ({ value, label, icon, color = "primary" }: CircularProgressProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 200);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  const colorClasses = {
    primary: {
      stroke: "stroke-primary",
      text: "text-primary",
      bg: "bg-primary/20",
    },
    success: {
      stroke: "stroke-success",
      text: "text-success",
      bg: "bg-success/20",
    },
    warning: {
      stroke: "stroke-warning",
      text: "text-warning",
      bg: "bg-warning/20",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="glass-card p-6 flex flex-col items-center">
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-3xl font-bold ${colors.text}`}>
            {animatedValue}%
          </span>
        </div>
      </div>

      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <span className="font-display text-lg font-semibold text-center">{label}</span>
    </div>
  );
};

export default CircularProgress;
