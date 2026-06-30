import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import tokyoDomeAerial from "../../imports/__.jpeg";

const DOME_CENTER = { x: 500, y: 500 };

const arrivalProgressData = {
  fruitsZipper: [
    { label: "8時間前", percent: 1.8 },
    { label: "7時間前", percent: 3.3 },
    { label: "6時間前", percent: 9.4 },
    { label: "5時間前", percent: 19.1 },
    { label: "4時間前", percent: 23.9 },
    { label: "3時間前", percent: 46.3 },
    { label: "2時間前", percent: 70.1 },
    { label: "1時間前", percent: 84.5 },
    { label: "開演", percent: 100.0 }
  ],
  vaundy: [
    { label: "8時間前", percent: 2.5 },
    { label: "7時間前", percent: 4.8 },
    { label: "6時間前", percent: 6.3 },
    { label: "5時間前", percent: 7.3 },
    { label: "4時間前", percent: 9.0 },
    { label: "3時間前", percent: 11.7 },
    { label: "2時間前", percent: 35.1 },
    { label: "1時間前", percent: 88.5 },
    { label: "開演", percent: 100.0 }
  ],
  riize: [
    { label: "8時間前", percent: 1.8 },
    { label: "7時間前", percent: 8.8 },
    { label: "6時間前", percent: 9.7 },
    { label: "5時間前", percent: 14.5 },
    { label: "4時間前", percent: 18.0 },
    { label: "3時間前", percent: 27.6 },
    { label: "2時間前", percent: 40.3 },
    { label: "1時間前", percent: 76.3 },
    { label: "開演", percent: 100.0 }
  ]
};

const cumulativeData = {
  fruitsZipper: arrivalProgressData.fruitsZipper.map(d => d.percent),
  vaundy: arrivalProgressData.vaundy.map(d => d.percent),
  riize: arrivalProgressData.riize.map(d => d.percent),
};

const TIMELINE_LABELS = [
  { label: "8時間前", cls: "arrival-time__timeline-label--8h" },
  { label: "7時間前", cls: "arrival-time__timeline-label--7h" },
  { label: "6時間前", cls: "arrival-time__timeline-label--6h" },
  { label: "5時間前", cls: "arrival-time__timeline-label--5h" },
  { label: "4時間前", cls: "arrival-time__timeline-label--4h" },
  { label: "3時間前", cls: "arrival-time__timeline-label--3h" },
  { label: "2時間前", cls: "arrival-time__timeline-label--2h" },
  { label: "1時間前", cls: "arrival-time__timeline-label--1h" },
  { label: "開演", cls: "arrival-time__timeline-label--start" }
];

function generateSwarmPaths(count: number, minRadius: number, maxRadius: number) {
  return Array.from({ length: count }).map(() => {
    const angle = Math.random() * Math.PI * 2;
    const dist = minRadius + Math.random() * (maxRadius - minRadius);
    const sx = DOME_CENTER.x + Math.cos(angle) * dist;
    const sy = DOME_CENTER.y + Math.sin(angle) * dist;

    const midX = (sx + DOME_CENTER.x) / 2 + (Math.random() - 0.5) * 300;
    const midY = (sy + DOME_CENTER.y) / 2 + (Math.random() - 0.5) * 300;

    return `M ${sx} ${sy} Q ${midX} ${midY} ${DOME_CENTER.x} ${DOME_CENTER.y}`;
  });
}

function useInterpolatedPercent(progress: MotionValue<number>, data: number[]) {
  return useTransform(progress, (p) => {
    if (p <= 0) return data[0];
    if (p >= 1) return data[data.length - 1];

    const steps = data.length - 1;
    const rawIndex = p * steps;
    const i = Math.floor(rawIndex);
    const fraction = rawIndex - i;

    return data[i] + (data[i + 1] - data[i]) * fraction;
  });
}

function useSteppedPercent(progress: MotionValue<number>, data: number[]) {
  return useTransform(progress, (p) => {
    const steps = data.length - 1;
    const i = Math.min(Math.floor(p * steps), steps);
    return data[i];
  });
}

const VERY_FEW_PATHS = generateSwarmPaths(20, 400, 650);
const SMALL_PATHS = generateSwarmPaths(30, 300, 600);
const MODERATE_PATHS = generateSwarmPaths(50, 200, 550);
const MANY_PATHS = generateSwarmPaths(80, 150, 500);
const MAX_PATHS = generateSwarmPaths(120, 100, 450);

const Dot = ({
  path,
  color,
  minDur = 2,
  maxDur = 5,
  className
}: {
  path: string;
  color: string;
  minDur?: number;
  maxDur?: number;
  className?: string;
}) => {
  const duration = minDur + Math.random() * (maxDur - minDur);
  const delay = Math.random() * 3;

  return (
    <motion.circle
      r="3"
      fill={color}
      className={className}
      // @ts-ignore
      style={{
        offsetPath: `path('${path}')`,
        offsetRotate: "auto",
        filter: `drop-shadow(0 0 6px ${color})`
      }}
      animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 0] }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay }}
    />
  );
};

const SwarmGroup = ({
  paths,
  color,
  opacity,
  minDur,
  maxDur,
  className
}: {
  paths: string[];
  color: string;
  opacity: MotionValue<number>;
  minDur: number;
  maxDur: number;
  className: string;
}) => (
  <motion.g style={{ opacity }}>
    {paths.map((p, i) => (
      <Dot
        key={i}
        path={p}
        color={color}
        minDur={minDur}
        maxDur={maxDur}
        className={className}
      />
    ))}
  </motion.g>
);

const CompDot = ({
  path,
  color,
  minDur = 2,
  maxDur = 5,
  className
}: {
  path: string;
  color: string;
  minDur?: number;
  maxDur?: number;
  className?: string;
}) => {
  const duration = minDur + Math.random() * (maxDur - minDur);
  const delay = Math.random() * 3;

  return (
    <motion.circle
      r="3.9"
      fill={color}
      className={className}
      // @ts-ignore
      style={{
        offsetPath: `path('${path}')`,
        offsetRotate: "auto",
        filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 4px ${color})`
      }}
      animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 0.82, 0] }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay }}
    />
  );
};

const CompSwarmGroup = ({
  paths,
  color,
  opacity,
  minDur,
  maxDur,
  className
}: {
  paths: string[];
  color: string;
  opacity: MotionValue<number>;
  minDur: number;
  maxDur: number;
  className: string;
}) => (
  <motion.g style={{ opacity }}>
    {paths.map((p, i) => (
      <CompDot
        key={i}
        path={p}
        color={color}
        minDur={minDur}
        maxDur={maxDur}
        className={className}
      />
    ))}
  </motion.g>
);

const ArtistDomeGlow = ({
  progress,
  color,
  data,
  stepped = false
}: {
  progress: MotionValue<number>;
  color: string;
  data: number[];
  stepped?: boolean;
}) => {
  const percent = stepped
    ? useSteppedPercent(progress, data)
    : useInterpolatedPercent(progress, data);

  const glowOpacity = useTransform(percent, (val) => {
    if (val < 10) return 0.2;
    if (val < 30) return 0.4;
    if (val < 60) return 0.6;
    if (val < 85) return 0.8;
    return 1.0;
  });

  const glowRadius = useTransform(percent, (val) => {
    if (val < 10) return 32;
    if (val < 30) return 35;
    if (val < 60) return 40;
    if (val < 85) return 45;
    if (val < 100) return 50;
    return 65;
  });

  const blurAmount = useTransform(percent, (val) => {
    if (val < 10) return 10;
    if (val < 30) return 15;
    if (val < 60) return 20;
    if (val < 85) return 25;
    if (val < 100) return 30;
    return 40;
  });

  return (
    <motion.circle
      cx="500"
      cy="500"
      r={glowRadius}
      fill={color}
      style={{
        opacity: glowOpacity,
        filter: useTransform(blurAmount, b => `blur(${b}px)`)
      }}
      className="arrival-time__tokyo-dome-glow"
    />
  );
};

const CapacityIndicator = ({
  progress,
  data,
  labels,
  color
}: {
  progress: MotionValue<number>;
  data: number[];
  labels: string[];
  color: string;
}) => {
  const percent = useInterpolatedPercent(progress, data);
  const percentStr = useTransform(percent, val => `${val.toFixed(1)}%`);
  const barWidth = useTransform(percent, val => `${val}%`);

  const timeStr = useTransform(progress, (p) => {
    const steps = labels.length - 1;
    const i = Math.min(Math.floor(p * steps), steps);
    return labels[i];
  });

  return (
    <div className="arrival-time__capacity-indicator w-[280px] md:w-[360px] flex flex-col items-center">
      <div className="arrival-time__capacity-label flex justify-between w-full items-end mb-3">
        <motion.span className="arrival-time__capacity-time-label text-[#e0e0e0] text-sm md:text-base font-mono tracking-widest">
          {timeStr}
        </motion.span>
        <motion.span
          className="arrival-time__capacity-percent font-mono font-bold text-3xl md:text-4xl"
          style={{ color }}
        >
          {percentStr}
        </motion.span>
      </div>

      <div className="arrival-time__capacity-bar w-full h-[8px] md:h-[10px] rounded-full overflow-hidden bg-white/12 relative">
        <motion.div
          className="arrival-time__capacity-bar-fill h-full rounded-full absolute left-0 top-0"
          style={{ width: barWidth, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const BaseMap = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 1000 1000" className="w-full h-full arrival-time__tokyo-dome-map">
    <g className="stroke-[#222] fill-transparent" strokeWidth="1.5">
      <path d="M 500 1000 L 500 500" />
      <path d="M 300 0 L 500 500" />
      <path d="M 1000 300 L 500 500" />
      <path d="M 0 600 L 500 500" />
      <circle cx="500" cy="500" r="150" strokeDasharray="4 4" />
      <circle cx="500" cy="500" r="300" strokeDasharray="4 4" />
      <circle cx="500" cy="500" r="450" strokeDasharray="4 4" />
    </g>

    <text x="450" y="850" fill="#555" fontSize="20" letterSpacing="0.1em" className="arrival-time__station-label--suidobashi font-mono">
      水道橋駅
    </text>
    <text x="350" y="200" fill="#555" fontSize="20" letterSpacing="0.1em" className="arrival-time__station-label--korakuen font-mono">
      後楽園駅
    </text>
    <text x="750" y="250" fill="#555" fontSize="20" letterSpacing="0.1em" className="arrival-time__station-label--kasuga font-mono">
      春日駅
    </text>

    <circle cx="500" cy="500" r="30" fill="#111" stroke="#444" strokeWidth="2" className="arrival-time__tokyo-dome-base" />

    {children}
  </svg>
);

const SwarmLogic = ({
  progress,
  data,
  color,
  className
}: {
  progress: MotionValue<number>;
  data: number[];
  color: string;
  className: string;
}) => {
  const percent = useInterpolatedPercent(progress, data);

  const veryFewOp = useTransform(percent, [0, 5, 10, 100], [0, 1, 1, 1]);
  const smallOp = useTransform(percent, [0, 10, 30, 100], [0, 0, 1, 1]);
  const moderateOp = useTransform(percent, [0, 30, 60, 100], [0, 0, 1, 1]);
  const manyOp = useTransform(percent, [0, 60, 85, 100], [0, 0, 1, 1]);
  const maxOp = useTransform(percent, [0, 85, 100], [0, 0, 1]);

  const heatId = className.split("--")[1];
  const heatOp = useTransform(percent, [0, 10, 30, 60, 85, 100], [0, 0.1, 0.2, 0.4, 0.7, 1]);

  return (
    <>
      <SwarmGroup paths={VERY_FEW_PATHS} color={color} opacity={veryFewOp} minDur={4} maxDur={6} className={className} />
      <SwarmGroup paths={SMALL_PATHS} color={color} opacity={smallOp} minDur={3} maxDur={5} className={className} />
      <SwarmGroup paths={MODERATE_PATHS} color={color} opacity={moderateOp} minDur={2} maxDur={4} className={className} />
      <SwarmGroup paths={MANY_PATHS} color={color} opacity={manyOp} minDur={1.5} maxDur={3} className={className} />
      <SwarmGroup paths={MAX_PATHS} color={color} opacity={maxOp} minDur={1} maxDur={2} className={className} />

      <motion.circle
        cx="500"
        cy="500"
        r="150"
        fill={`url(#heat-${heatId})`}
        style={{ opacity: heatOp }}
        className={`arrival-time__heat-layer--${heatId}`}
      />

      <ArtistDomeGlow progress={progress} color={color} data={data} />
    </>
  );
};

const FZSwarm = ({ progress }: { progress: MotionValue<number> }) => (
  <SwarmLogic progress={progress} data={cumulativeData.fruitsZipper} color="#00D1FF" className="arrival-time__dots--fruits-zipper" />
);

const RIIZESwarm = ({ progress }: { progress: MotionValue<number> }) => (
  <SwarmLogic progress={progress} data={cumulativeData.riize} color="#FF4EDB" className="arrival-time__dots--riize" />
);

const VaundySwarm = ({ progress }: { progress: MotionValue<number> }) => (
  <SwarmLogic progress={progress} data={cumulativeData.vaundy} color="#A6FF4D" className="arrival-time__dots--vaundy" />
);

const S06_DATA = {
  fz: [1.8, 3.3, 9.4, 19.1, 23.9, 46.3, 70.1, 84.5, 100],
  vaundy: [2.5, 4.8, 6.3, 7.3, 9.0, 11.7, 35.1, 88.5, 100],
  riize: [1.8, 8.8, 9.7, 14.5, 18.0, 27.6, 40.3, 76.3, 100],
};

const COMP_PATHS = {
  fz: {
    veryFew: generateSwarmPaths(10, 400, 650),
    small: generateSwarmPaths(15, 300, 600),
    moderate: generateSwarmPaths(25, 200, 550),
    many: generateSwarmPaths(40, 150, 500),
    max: generateSwarmPaths(60, 100, 450),
  },
  vaundy: {
    veryFew: generateSwarmPaths(10, 400, 650),
    small: generateSwarmPaths(15, 300, 600),
    moderate: generateSwarmPaths(25, 200, 550),
    many: generateSwarmPaths(40, 150, 500),
    max: generateSwarmPaths(60, 100, 450),
  },
  riize: {
    veryFew: generateSwarmPaths(10, 400, 650),
    small: generateSwarmPaths(15, 300, 600),
    moderate: generateSwarmPaths(25, 200, 550),
    many: generateSwarmPaths(40, 150, 500),
    max: generateSwarmPaths(60, 100, 450),
  },
};

type CompPaths = typeof COMP_PATHS.fz;

const MiniDomeBase = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 1000 1000" className="w-full h-full">
    <g stroke="#1a1a2a" fill="transparent" strokeWidth="1.5">
      <path d="M 500 1000 L 500 550" />
      <path d="M 220 0 L 500 500" />
      <path d="M 1000 200 L 500 500" />
      <path d="M 0 700 L 500 500" />
      <circle cx="500" cy="500" r="150" strokeDasharray="4 8" opacity="0.6" />
      <circle cx="500" cy="500" r="300" strokeDasharray="4 8" opacity="0.35" />
      <circle cx="500" cy="500" r="450" strokeDasharray="4 8" opacity="0.15" />
    </g>
    <circle cx="500" cy="500" r="26" fill="#05050c" stroke="#2a2a3a" strokeWidth="2" />
    {children}
  </svg>
);

const CompSwarmLogic = ({
  progress,
  data,
  color,
  className,
  paths
}: {
  progress: MotionValue<number>;
  data: number[];
  color: string;
  className: string;
  paths: CompPaths;
}) => {
  const percent = useSteppedPercent(progress, data);

  const veryFewOp = useTransform(percent, [0, 5, 10, 100], [0, 1, 1, 1]);
  const smallOp = useTransform(percent, [0, 10, 30, 100], [0, 0, 1, 1]);
  const modOp = useTransform(percent, [0, 30, 60, 100], [0, 0, 1, 1]);
  const manyOp = useTransform(percent, [0, 60, 85, 100], [0, 0, 1, 1]);
  const maxOp = useTransform(percent, [0, 85, 100], [0, 0, 1]);

  const heatOp = useTransform(percent, [0, 10, 30, 60, 85, 100], [0, 0.12, 0.25, 0.42, 0.60, 0.78]);
  const bgGlowOp = useTransform(percent, [0, 20, 60, 100], [0, 0.05, 0.10, 0.15]);

  const heatId = className.split("--")[1];
  const glowSuffix = heatId === "fz" ? "fruits-zipper" : heatId;

  return (
    <>
      <motion.circle
        cx="500"
        cy="500"
        r="380"
        fill={color}
        className={`arrival-time__comparison-particle-glow--${glowSuffix}`}
        style={{ opacity: bgGlowOp, filter: "blur(80px)" }}
      />

      <CompSwarmGroup paths={paths.veryFew} color={color} opacity={veryFewOp} minDur={4} maxDur={6} className={className} />
      <CompSwarmGroup paths={paths.small} color={color} opacity={smallOp} minDur={3} maxDur={5} className={className} />
      <CompSwarmGroup paths={paths.moderate} color={color} opacity={modOp} minDur={2} maxDur={4} className={className} />
      <CompSwarmGroup paths={paths.many} color={color} opacity={manyOp} minDur={1.5} maxDur={3} className={className} />
      <CompSwarmGroup paths={paths.max} color={color} opacity={maxOp} minDur={1} maxDur={2} className={className} />

      <motion.circle cx="500" cy="500" r="150" fill={`url(#heat-${heatId})`} style={{ opacity: heatOp }} />

      <motion.g opacity={0.70}>
        <ArtistDomeGlow progress={progress} color={color} data={data} stepped />
      </motion.g>
    </>
  );
};

const RaceTrackBar = ({
  progress,
  data,
  color,
  percentClassName
}: {
  progress: MotionValue<number>;
  data: number[];
  color: string;
  percentClassName: string;
}) => {
  const pct = useSteppedPercent(progress, data);
  const widthPct = useTransform(pct, v => `${v}%`);
  const pctStr = useTransform(pct, v => `${Math.round(v)}%`);

  return (
    <div className="w-full">
      <div className="relative w-full h-[7px] rounded-full bg-white/[0.08] overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: widthPct,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}90`
          }}
        />
      </div>

      <div className="flex justify-between items-baseline mt-1.5">
        <span className="text-white/30 text-[9px] tracking-[0.18em] font-mono select-none">
          累積来場率
        </span>
        <motion.span
          className={`${percentClassName} font-mono font-bold tabular-nums`}
          style={{
            color,
            fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)",
            textShadow: `0 0 10px ${color}60`
          }}
        >
          {pctStr}
        </motion.span>
      </div>
    </div>
  );
};

const ComparisonDome = ({
  title,
  insightLabel,
  color,
  progress,
  data,
  swarmClassName,
  domeClassName,
  percentClassName,
  paths
}: {
  title: string;
  insightLabel: string;
  color: string;
  progress: MotionValue<number>;
  data: number[];
  swarmClassName: string;
  domeClassName: string;
  percentClassName: string;
  paths: CompPaths;
}) => {
  const pct = useSteppedPercent(progress, data);

  const glowShadow = useTransform(pct, (v) => {
    const alpha = Math.round((0.05 + (v / 100) * 0.22) * 255).toString(16).padStart(2, "0");
    const blur = Math.round(6 + (v / 100) * 18);
    return `0 0 ${blur}px ${color}${alpha}`;
  });

  return (
    <div className={`${domeClassName} flex-1 flex flex-col items-center gap-2 min-w-0`}>
      <p
        className="text-[10px] md:text-[11px] font-bold tracking-[0.22em] font-mono uppercase text-center leading-tight"
        style={{ color }}
      >
        {title}
      </p>

      <RaceTrackBar
        progress={progress}
        data={data}
        color={color}
        percentClassName={percentClassName}
      />

      <motion.div
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#04040b] border border-white/[0.05]"
        style={{ boxShadow: glowShadow, opacity: 0.72 }}
      >
        <MiniDomeBase>
          <CompSwarmLogic
            progress={progress}
            data={data}
            color={color}
            className={swarmClassName}
            paths={paths}
          />
        </MiniDomeBase>
      </motion.div>

      <p className="text-[9px] md:text-[10px] text-white/30 tracking-[0.22em] font-mono">
        {insightLabel}
      </p>
    </div>
  );
};

export function ArrivalTime() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const introOp = useTransform(scrollYProgress, [0, 0.05, 0.08, 0.1], [0, 1, 1, 0]);

  const fzSceneOp = useTransform(scrollYProgress, [0.1, 0.12, 0.23, 0.25], [0, 1, 1, 0]);
  const riizeSceneOp = useTransform(scrollYProgress, [0.25, 0.27, 0.38, 0.40], [0, 1, 1, 0]);
  const vaundySceneOp = useTransform(scrollYProgress, [0.40, 0.42, 0.53, 0.55], [0, 1, 1, 0]);

  const compareOp = useTransform(scrollYProgress, [0.55, 0.57, 0.68, 0.70], [0, 1, 1, 0]);
  const climaxOp = useTransform(scrollYProgress, [0.70, 0.72, 0.90, 0.95], [0, 1, 1, 0]);

  const mainMapOp = useTransform(scrollYProgress, [0, 0.53, 0.55, 0.70, 0.72, 1], [1, 1, 0, 0, 1, 1]);
  const timelineUiOp = useTransform(scrollYProgress, [0.08, 0.1, 0.53, 0.55], [0, 1, 1, 0]);

  const fzTimeP = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
  const riizeTimeP = useTransform(scrollYProgress, [0.25, 0.40], [0, 1]);
  const vaundyTimeP = useTransform(scrollYProgress, [0.40, 0.55], [0, 1]);
  const compareTimeP = useTransform(scrollYProgress, [0.55, 0.68], [0, 1]);

  const maxTimeP = useTransform(scrollYProgress, () => 1);

  const compTimeUpper = useTransform(compareTimeP, (p) => {
    const step = Math.min(Math.floor(p * 8), 8);
    return step < 8 ? "開演まで" : "";
  });

  const compTimeLower = useTransform(compareTimeP, (p) => {
    const step = Math.min(Math.floor(p * 8), 8);
    return ["8時間", "7時間", "6時間", "5時間", "4時間", "3時間", "2時間", "1時間", "開演"][step];
  });

  const compCopyText = useTransform(compareTimeP, (p) => {
    const step = Math.min(Math.floor(p * 8), 8);

    if (step >= 8) return "3つのドームは、満員の熱量に包まれる。";
    if (step >= 7) return "Vaundyは開演直前に最も集中する。RIIZEはその中間に位置する。";
    if (step >= 6) return "FRUITS ZIPPERはすでに7割が到着。Vaundyはここから急増する。";
    if (step >= 5) return "FRUITS ZIPPERは、すでに半数近くが集まっている。";

    return "同じ東京ドームでも、集まり方は違う。";
  });

  const indicatorTop = useTransform(scrollYProgress, (p) => {
    if (p >= 0.1 && p < 0.25) return `${((p - 0.1) / 0.15) * 100}%`;
    if (p >= 0.25 && p < 0.40) return `${((p - 0.25) / 0.15) * 100}%`;
    if (p >= 0.40 && p < 0.55) return `${((p - 0.40) / 0.15) * 100}%`;
    return "0%";
  });

  return (
    <section
      ref={containerRef}
      className="section-arrival-time h-[600vh] relative bg-[#050505]"
      style={{ position: "relative" }}
    >
      <div className="sticky top-0 w-full h-[100vh] overflow-hidden flex items-center justify-center arrival-time__background">
        <img
          src={tokyoDomeAerial}
          alt=""
          aria-hidden="true"
          className="arrival-time__map-bg absolute inset-0 w-full h-full object-cover"
        />

        <div className="arrival-time__map-overlay absolute inset-0 bg-[#050505]/82" />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: compareOp, background: "rgba(5,5,5,0.28)", zIndex: 1 }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: compareOp,
            zIndex: 1,
            background: "radial-gradient(ellipse at 50% 52%, transparent 20%, rgba(0,0,0,0.55) 100%)"
          }}
        />

        <svg className="w-0 h-0 absolute">
          <defs>
            <radialGradient id="heat-fz">
              <stop offset="0%" stopColor="#00D1FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00D1FF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heat-riize">
              <stop offset="0%" stopColor="#FF4EDB" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FF4EDB" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heat-vaundy">
              <stop offset="0%" stopColor="#A6FF4D" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#A6FF4D" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        <motion.div className="absolute inset-0 flex items-center justify-center opacity-60" style={{ opacity: mainMapOp }}>
          <div className="relative w-full max-w-[1000px] aspect-square">
            <BaseMap>
              <motion.g style={{ opacity: fzSceneOp }}>
                <FZSwarm progress={fzTimeP} />
              </motion.g>

              <motion.g style={{ opacity: riizeSceneOp }}>
                <RIIZESwarm progress={riizeTimeP} />
              </motion.g>

              <motion.g style={{ opacity: vaundySceneOp }}>
                <VaundySwarm progress={vaundyTimeP} />
              </motion.g>

              <motion.g style={{ opacity: climaxOp }}>
                <FZSwarm progress={maxTimeP} />
                <RIIZESwarm progress={maxTimeP} />
                <VaundySwarm progress={maxTimeP} />
              </motion.g>
            </BaseMap>

            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 mt-[60px] md:mt-[80px] pointer-events-none">
              <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] md:w-[360px]" style={{ opacity: fzSceneOp }}>
                <CapacityIndicator progress={fzTimeP} data={cumulativeData.fruitsZipper} labels={TIMELINE_LABELS.map(l => l.label)} color="#00D1FF" />
              </motion.div>

              <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] md:w-[360px]" style={{ opacity: riizeSceneOp }}>
                <CapacityIndicator progress={riizeTimeP} data={cumulativeData.riize} labels={TIMELINE_LABELS.map(l => l.label)} color="#FF4EDB" />
              </motion.div>

              <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] md:w-[360px]" style={{ opacity: vaundySceneOp }}>
                <CapacityIndicator progress={vaundyTimeP} data={cumulativeData.vaundy} labels={TIMELINE_LABELS.map(l => l.label)} color="#A6FF4D" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="arrival-time__timeline absolute left-8 top-1/2 -translate-y-1/2 flex flex-col h-[60vh] justify-between border-l border-[#333] pl-6 z-40"
          style={{ opacity: timelineUiOp }}
        >
          <motion.div
            className="arrival-time__timeline-indicator absolute left-[-4.5px] w-[8px] h-[8px] rounded-full bg-white shadow-[0_0_8px_white]"
            style={{ top: indicatorTop }}
          />

          {TIMELINE_LABELS.map((item, i) => (
            <div key={i} className={`${item.cls} text-[#888] text-sm font-mono tracking-widest relative`}>
              <span className="absolute left-[-28px] top-1/2 -translate-y-1/2 w-[4px] h-[1px] bg-[#333]" />
              {item.label}
            </div>
          ))}
        </motion.div>

        <motion.div className="absolute z-10 flex flex-col items-center text-center px-4" style={{ opacity: introOp }}>
          <h2 className="arrival-time__section-title text-4xl md:text-5xl text-white font-bold tracking-[0.1em] mb-6 drop-shadow-lg">
            ライブは、開演前から始まっている。
          </h2>

          <p className="arrival-time__section-copy text-[#a0a0a0] text-lg md:text-xl tracking-[0.1em] leading-relaxed">
            グッズを買う人。友人と待ち合わせる人。<br />
            早くから会場の熱気を感じたい人。<br />
            東京ドーム周辺には、開演の何時間も前からファンが集まり始める。
          </p>
        </motion.div>

        <motion.div className="absolute top-1/4 right-[10%] z-10 text-right max-w-sm" style={{ opacity: fzSceneOp }}>
          <h3 className="arrival-time__artist-name--fruits-zipper text-[#00D1FF] text-4xl md:text-5xl font-bold tracking-wider mb-4 drop-shadow-[0_0_10px_rgba(0,209,255,0.5)]">
            FRUITS ZIPPER
          </h3>
          <p className="arrival-time__scene-copy text-white/90 text-lg tracking-widest leading-relaxed">
            早くから集まり、<br />開演前の時間も楽しむ
          </p>
        </motion.div>

        <motion.div className="absolute top-1/4 right-[10%] z-10 text-right max-w-sm" style={{ opacity: riizeSceneOp }}>
          <h3 className="arrival-time__artist-name--riize text-[#FF4EDB] text-4xl md:text-5xl font-bold tracking-wider mb-4 drop-shadow-[0_0_10px_rgba(255,78,219,0.5)]">
            RIIZE
          </h3>
          <p className="arrival-time__scene-copy text-white/90 text-lg tracking-widest leading-relaxed">
            遠くから、早くから、<br />熱量が集まる
          </p>
        </motion.div>

        <motion.div className="absolute top-1/4 right-[10%] z-10 text-right max-w-sm" style={{ opacity: vaundySceneOp }}>
          <h3 className="arrival-time__artist-name--vaundy text-[#A6FF4D] text-4xl md:text-5xl font-bold tracking-wider mb-4 drop-shadow-[0_0_10px_rgba(166,255,77,0.5)]">
            Vaundy
          </h3>
          <p className="arrival-time__scene-copy text-white/90 text-lg tracking-widest leading-relaxed">
            開演に向けて、<br />都市の中から人が集まる
          </p>
        </motion.div>

        <motion.div
          className="arrival-time__comparison-view absolute inset-0 z-20 flex flex-col justify-center items-center gap-3 md:gap-4 px-6 md:px-12 pointer-events-none"
          style={{ opacity: compareOp }}
        >
          <div className="arrival-time__comparison-time-label flex flex-col items-center leading-none mb-1">
            <motion.span
              className="text-white/45 font-mono tracking-[0.45em] uppercase select-none"
              style={{ fontSize: "clamp(0.6rem, 1.2vw, 0.85rem)" }}
            >
              {compTimeUpper}
            </motion.span>

            <motion.span
              className="text-white font-bold tracking-tight leading-none"
              style={{
                fontSize: "clamp(2.8rem, 6.5vw, 5rem)",
                textShadow: "0 0 40px rgba(255,255,255,0.15)"
              }}
            >
              {compTimeLower}
            </motion.span>
          </div>

          <div className="flex w-full max-w-[900px] gap-4 md:gap-6 justify-between items-start">
            <ComparisonDome
              title="FRUITS ZIPPER"
              insightLabel="早め来場型"
              color="#00D1FF"
              progress={compareTimeP}
              data={S06_DATA.fz}
              swarmClassName="arrival-time__comparison-particles--fz"
              domeClassName="arrival-time__comparison-dome--fruits-zipper"
              percentClassName="arrival-time__comparison-percent--fruits-zipper"
              paths={COMP_PATHS.fz}
            />

            <ComparisonDome
              title="Vaundy"
              insightLabel="直前集中型"
              color="#A6FF4D"
              progress={compareTimeP}
              data={S06_DATA.vaundy}
              swarmClassName="arrival-time__comparison-particles--vaundy"
              domeClassName="arrival-time__comparison-dome--vaundy"
              percentClassName="arrival-time__comparison-percent--vaundy"
              paths={COMP_PATHS.vaundy}
            />

            <ComparisonDome
              title="RIIZE"
              insightLabel="中間型"
              color="#FF4EDB"
              progress={compareTimeP}
              data={S06_DATA.riize}
              swarmClassName="arrival-time__comparison-particles--riize"
              domeClassName="arrival-time__comparison-dome--riize"
              percentClassName="arrival-time__comparison-percent--riize"
              paths={COMP_PATHS.riize}
            />
          </div>

          <motion.p
            className="arrival-time__comparison-copy text-center text-white/50 tracking-[0.16em] leading-relaxed max-w-2xl mt-1"
            style={{ fontSize: "clamp(0.65rem, 1.1vw, 0.82rem)" }}
          >
            {compCopyText}
          </motion.p>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          style={{ opacity: climaxOp }}
        >
          <div className="bg-black/40 px-12 py-6 backdrop-blur-sm rounded-2xl border border-white/10">
            <h2 className="arrival-time__section-title text-white text-3xl md:text-5xl font-bold tracking-[0.2em] drop-shadow-2xl text-center">
              開演前の数時間に、<br />都市の密度は変わる。
            </h2>
          </div>
        </motion.div>
      </div>
    </section>
  );
}