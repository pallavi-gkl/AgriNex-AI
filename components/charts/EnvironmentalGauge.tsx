"use client";

interface EnvironmentalGaugeProps {
  percentage: number;
}

export default function EnvironmentalGauge({ percentage }: EnvironmentalGaugeProps) {
  // SVG circle calculations
  const radius = 50;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-between h-full min-h-[300px]">
      <div className="w-full text-left">
        <h3 className="gradient-text-green text-base font-semibold">
          Eco-Impact Meter
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">
          Ratio of direct farm-to-consumer orders
        </p>
      </div>

      <div className="relative flex items-center justify-center my-4">
        {/* SVG Circular Arc */}
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="rgba(255, 255, 255, 0.04)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Accent arc */}
          <circle
            stroke="url(#ecoGradient)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="ecoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute text-center">
          <span className="text-3xl font-extrabold gradient-text-green leading-none">
            {percentage}%
          </span>
          <span className="block text-[10px] text-slate-500 font-medium uppercase mt-0.5 tracking-wider">
            Direct Path
          </span>
        </div>
      </div>

      <div className="text-center px-2">
        <p className="text-slate-300 text-xs leading-relaxed">
          🌿 Direct orders bypass traditional middlemen routes, reducing transport packaging and carbon emissions by an estimated <span className="text-emerald-400 font-bold">34%</span>.
        </p>
      </div>
    </div>
  );
}
