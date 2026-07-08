import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue } from "motion/react";
import tokyoDomeMapNorth from "../../imports/tokyo-dome-map-north.jpeg";

const MAP_BASE_SIZE = { width: 2881, height: 1921 };
const TOKYO_DOME_POINT = {
  x: 1467 / MAP_BASE_SIZE.width,
  y: 750 / MAP_BASE_SIZE.height,
};
const MAP_OBJECT_POSITION = `center ${Math.round(TOKYO_DOME_POINT.y * 100)}%`;

/** Map ratio → SVG viewBox coords (1000×1000 overlay aligned to aerial photo). */
function mapRatioToSvgCenter(rx: number, ry: number, anchorY = ry) {
  const viewport = { w: 1920, h: 1080 };
  const viewBox = 1000;
  const scale = viewport.h / MAP_BASE_SIZE.height;
  const displayW = MAP_BASE_SIZE.width * scale;
  const offX = (viewport.w - displayW) / 2;
  const screenX = offX + rx * MAP_BASE_SIZE.width * scale;
  const screenY = viewport.h / 2 + (ry - anchorY) * MAP_BASE_SIZE.height * scale;
  const svgSize = Math.min(viewBox, viewport.w, viewport.h);
  const svgLeft = viewport.w / 2 - svgSize / 2;
  const svgTop = viewport.h / 2 - svgSize / 2;
  return {
    x: ((screenX - svgLeft) / svgSize) * viewBox,
    y: ((screenY - svgTop) / svgSize) * viewBox,
  };
}

const DOME_CENTER = mapRatioToSvgCenter(TOKYO_DOME_POINT.x, TOKYO_DOME_POINT.y);

/** Glow circle center — shifted ~35px right to align with Tokyo Dome on aerial photo. */
const DOME_GLOW_X_OFFSET = 35;
const DOME_GLOW_CENTER = {
  x: DOME_CENTER.x + DOME_GLOW_X_OFFSET,
  y: DOME_CENTER.y,
};

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
    const i = getTimelineStepIndex(p, data.length);
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

const COMP_DOT_RADIUS = {
  small: 5.9,
  normal: 7.0,
  influx: 7.8,
} as const;

type CompDotGlowTier = "soft" | "normal" | "strong";

function compDotGlowFilter(color: string, tier: CompDotGlowTier) {
  if (tier === "soft") {
    return `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 5px ${color})`;
  }
  if (tier === "normal") {
    return `drop-shadow(0 0 14px ${color}) drop-shadow(0 0 7px ${color})`;
  }
  return `drop-shadow(0 0 18px ${color}) drop-shadow(0 0 10px ${color})`;
}

function mapPeakBoost(profileKey: "fz" | "riize" | "vaundy", progress: number) {
  const step = getComparisonStep(progress);
  if (profileKey === "fz" && (step === 5 || step === 6)) return 1.2;
  if (profileKey === "riize" && step === 7) return 1.22;
  if (profileKey === "vaundy" && (step === 6 || step === 7)) return 1.25;
  return 1;
}

const CompDot = ({
  path,
  color,
  minDur = 2,
  maxDur = 5,
  className,
  radius = COMP_DOT_RADIUS.normal,
  glowTier = "normal",
  maxOpacity = 0.9,
}: {
  path: string;
  color: string;
  minDur?: number;
  maxDur?: number;
  className?: string;
  radius?: number;
  glowTier?: CompDotGlowTier;
  maxOpacity?: number;
}) => {
  const duration = minDur + Math.random() * (maxDur - minDur);
  const delay = Math.random() * 3;

  return (
    <motion.circle
      r={radius}
      fill={color}
      className={className}
      // @ts-ignore
      style={{
        offsetPath: `path('${path}')`,
        offsetRotate: "auto",
        filter: compDotGlowFilter(color, glowTier),
      }}
      animate={{ offsetDistance: ["0%", "100%"], opacity: [0, maxOpacity, 0] }}
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
  className,
  radius = COMP_DOT_RADIUS.normal,
  glowTier = "normal",
  maxOpacity = 0.9,
}: {
  paths: string[];
  color: string;
  opacity: MotionValue<number>;
  minDur: number;
  maxDur: number;
  className: string;
  radius?: number;
  glowTier?: CompDotGlowTier;
  maxOpacity?: number;
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
        radius={radius}
        glowTier={glowTier}
        maxOpacity={maxOpacity}
      />
    ))}
  </motion.g>
);

const ArtistDomeGlow = ({
  progress,
  color,
  data,
  stepped = false,
  center = DOME_GLOW_CENTER,
  sizeScale = 1,
}: {
  progress: MotionValue<number>;
  color: string;
  data: number[];
  stepped?: boolean;
  center?: { x: number; y: number };
  sizeScale?: number;
}) => {
  const percent = stepped
    ? useSteppedPercent(progress, data)
    : useInterpolatedPercent(progress, data);

  const glowOpacity = useTransform(percent, (val) => {
    if (val < 10) return 0.25;
    if (val < 30) return 0.45;
    if (val < 60) return 0.6;
    if (val < 85) return 0.75;
    return 0.9;
  });

  const glowRadius = useTransform(percent, (val) => {
    let r: number;
    if (val < 10) r = 64;
    else if (val < 30) r = 70;
    else if (val < 60) r = 80;
    else if (val < 85) r = 90;
    else if (val < 100) r = 100;
    else r = 130;
    return r * sizeScale;
  });

  const blurAmount = useTransform(percent, (val) => {
    if (val < 10) return 12;
    if (val < 30) return 18;
    if (val < 60) return 24;
    if (val < 85) return 30;
    if (val < 100) return 36;
    return 48;
  });

  const gradientId =
    color === "#00D1FF" ? "dome-glow-fz" : color === "#FF4EDB" ? "dome-glow-riize" : "dome-glow-vaundy";

  return (
    <motion.g style={{ opacity: glowOpacity }} className="arrival-time__tokyo-dome-glow">
      <motion.circle
        cx={center.x}
        cy={center.y}
        r={glowRadius}
        fill={`url(#${gradientId})`}
        stroke="none"
        style={{
          filter: useTransform(blurAmount, (b) => `blur(${b * 0.35}px)`),
        }}
      />
    </motion.g>
  );
};

const CapacityIndicator = ({
  progress,
  data,
  labels,
  color,
  mobile = false,
}: {
  progress: MotionValue<number>;
  data: number[];
  labels: string[];
  color: string;
  mobile?: boolean;
}) => {
  const percent = useInterpolatedPercent(progress, data);
  const percentStr = useTransform(percent, val => `${val.toFixed(1)}%`);
  const barWidth = useTransform(percent, val => `${val}%`);

  const timeStr = useTransform(progress, (p) => {
    const i = getTimelineStepIndex(p, labels.length);
    return labels[i];
  });

  if (mobile) {
    return (
      <div className="arrival-time__capacity-indicator arrival-time__capacity-indicator--mobile w-[calc(100vw-48px)] max-w-[360px] flex flex-col items-center">
        <div className="arrival-time__capacity-label flex justify-between w-full items-baseline mb-2">
          <motion.span className="arrival-time__capacity-time-label text-[#e0e0e0] text-xs font-mono tracking-wide">
            現在：
            <motion.span>{timeStr}</motion.span>
          </motion.span>
          <motion.span
            className="arrival-time__capacity-percent font-mono font-bold text-2xl"
            style={{ color }}
          >
            {percentStr}
          </motion.span>
        </div>

        <div className="arrival-time__capacity-bar w-full h-[8px] rounded-full overflow-hidden bg-white/12 relative">
          <motion.div
            className="arrival-time__capacity-bar-fill h-full rounded-full absolute left-0 top-0"
            style={{ width: barWidth, backgroundColor: color }}
          />
        </div>

        <div className="arrival-time__capacity-range mt-2 flex justify-between w-full text-[10px] text-[#666] font-mono tracking-wide">
          <span>8時間前</span>
          <span>開演</span>
        </div>
      </div>
    );
  }

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

function MobileTimeScale({
  progress,
  color,
  opacity,
}: {
  progress: MotionValue<number>;
  color: string;
  opacity: MotionValue<number>;
}) {
  const [activeStep, setActiveStep] = useState(0);

  useMotionValueEvent(progress, "change", (p) => {
    setActiveStep(getComparisonStep(p));
  });

  React.useEffect(() => {
    setActiveStep(getComparisonStep(progress.get()));
  }, [progress]);

  return (
    <motion.div
      className="arrival-time__mobile-timeline md:hidden absolute left-7 top-[26%] h-[52%] flex flex-col justify-between z-[12] pointer-events-none border-l border-white/10 pl-2.5"
      style={{ opacity }}
    >
      {TIMELINE_LABELS.map((item, i) => {
        const isActive = i === activeStep;

        return (
          <div
            key={item.label}
            className={`${item.cls} relative flex items-center gap-1.5 pl-0.5`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: color,
                opacity: isActive ? 1 : 0,
                boxShadow: isActive ? `0 0 6px ${color}` : undefined,
              }}
            />
            <span
              className={`text-[11px] font-mono tracking-[0.02em] leading-none ${
                isActive ? "text-white/85 font-bold" : "text-white/[0.38] font-semibold"
              }`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
};

const BaseMap = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 1000 1000" className="w-full h-full arrival-time__tokyo-dome-map">
    <g className="stroke-[#222] fill-transparent" strokeWidth="1.5">
      <path d={`M ${DOME_CENTER.x} 1000 L ${DOME_CENTER.x} ${DOME_CENTER.y}`} />
      <path d={`M 300 0 L ${DOME_CENTER.x} ${DOME_CENTER.y}`} />
      <path d={`M 1000 300 L ${DOME_CENTER.x} ${DOME_CENTER.y}`} />
      <path d={`M 0 600 L ${DOME_CENTER.x} ${DOME_CENTER.y}`} />
    </g>

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

  return (
    <>
      <SwarmGroup paths={VERY_FEW_PATHS} color={color} opacity={veryFewOp} minDur={4} maxDur={6} className={className} />
      <SwarmGroup paths={SMALL_PATHS} color={color} opacity={smallOp} minDur={3} maxDur={5} className={className} />
      <SwarmGroup paths={MODERATE_PATHS} color={color} opacity={moderateOp} minDur={2} maxDur={4} className={className} />
      <SwarmGroup paths={MANY_PATHS} color={color} opacity={manyOp} minDur={1.5} maxDur={3} className={className} />
      <SwarmGroup paths={MAX_PATHS} color={color} opacity={maxOp} minDur={1} maxDur={2} className={className} />

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

const COMPARISON_TIME_LABELS = ["8時間", "7時間", "6時間", "5時間", "4時間", "3時間", "2時間", "1時間", "開演"] as const;
const COMPARE_TIME_SCROLL_START = 0.58;
const COMPARE_TIME_SCROLL_END = 0.92;

function clampProgress(progress: number) {
  return Math.max(0, Math.min(1, progress));
}

function getTimelineStepIndex(progress: number, slotCount: number) {
  const clamped = clampProgress(progress);
  return Math.min(Math.floor(clamped * slotCount), slotCount - 1);
}

function getComparisonStep(progress: number) {
  return getTimelineStepIndex(progress, COMPARISON_TIME_LABELS.length);
}

function getComparisonCopyText(step: number) {
  if (step === 1) return "RIIZE はこの時間から動きが見られた。";
  if (step === 6) return "FRUITS ZIPPER はすでに7割が到着していた。";
  if (step === 7) return "Vaundy は開演直前に最も集中していた。";
  if (step === 8) return "3つのドームは熱量に包まれる。";
  return "同じ東京ドームでも、人の集まり方は違った。";
}

type ArrivalProfileStep = { label: string; hourly: number; cumulative: number };

const ARRIVAL_TIME_PROFILE: Record<"fz" | "riize" | "vaundy", ArrivalProfileStep[]> = {
  fz: [
    { label: "8時間前", hourly: 1.8, cumulative: 1.8 },
    { label: "7時間前", hourly: 1.5, cumulative: 3.3 },
    { label: "6時間前", hourly: 6.1, cumulative: 9.4 },
    { label: "5時間前", hourly: 9.7, cumulative: 19.1 },
    { label: "4時間前", hourly: 4.8, cumulative: 23.9 },
    { label: "3時間前", hourly: 22.4, cumulative: 46.3 },
    { label: "2時間前", hourly: 23.8, cumulative: 70.1 },
    { label: "1時間前", hourly: 14.4, cumulative: 84.5 },
    { label: "開演", hourly: 15.5, cumulative: 100 },
  ],
  riize: [
    { label: "8時間前", hourly: 1.8, cumulative: 1.8 },
    { label: "7時間前", hourly: 7.0, cumulative: 8.8 },
    { label: "6時間前", hourly: 0.9, cumulative: 9.7 },
    { label: "5時間前", hourly: 4.8, cumulative: 14.5 },
    { label: "4時間前", hourly: 3.5, cumulative: 18.0 },
    { label: "3時間前", hourly: 9.6, cumulative: 27.6 },
    { label: "2時間前", hourly: 12.7, cumulative: 40.3 },
    { label: "1時間前", hourly: 36.0, cumulative: 76.3 },
    { label: "開演", hourly: 23.7, cumulative: 100 },
  ],
  vaundy: [
    { label: "8時間前", hourly: 2.5, cumulative: 2.5 },
    { label: "7時間前", hourly: 2.3, cumulative: 4.8 },
    { label: "6時間前", hourly: 1.5, cumulative: 6.3 },
    { label: "5時間前", hourly: 1.0, cumulative: 7.3 },
    { label: "4時間前", hourly: 1.7, cumulative: 9.0 },
    { label: "3時間前", hourly: 2.7, cumulative: 11.7 },
    { label: "2時間前", hourly: 23.4, cumulative: 35.1 },
    { label: "1時間前", hourly: 53.4, cumulative: 88.5 },
    { label: "開演", hourly: 11.5, cumulative: 100 },
  ],
};

function useSteppedProfileField(
  progress: MotionValue<number>,
  profile: ArrivalProfileStep[],
  field: "cumulative" | "hourly"
) {
  return useTransform(progress, (p) => {
    const i = getTimelineStepIndex(p, profile.length);
    return profile[i][field];
  });
}

function mapCumulativeToBaseOpacity(cumulative: number) {
  if (cumulative <= 10) return 0.28 + (cumulative / 10) * 0.07;
  if (cumulative <= 25) return 0.38 + ((cumulative - 10) / 15) * 0.12;
  if (cumulative <= 50) return 0.55 + ((cumulative - 25) / 25) * 0.15;
  if (cumulative <= 75) return 0.75 + ((cumulative - 50) / 25) * 0.13;
  return 0.9 + ((cumulative - 75) / 25) * 0.1;
}

function mapHourlyToInfluxOpacity(hourly: number, baseOpacity: number) {
  if (hourly < 5) return baseOpacity * 0.1;
  if (hourly < 12) return baseOpacity * (0.1 + ((hourly - 5) / 7) * 0.22);
  if (hourly < 20) return baseOpacity * (0.32 + ((hourly - 12) / 8) * 0.28);
  if (hourly < 30) return baseOpacity * (0.6 + ((hourly - 20) / 10) * 0.18);
  if (hourly < 50) return baseOpacity * (0.78 + ((hourly - 30) / 20) * 0.14);
  return baseOpacity * Math.min(1.15, 0.92 + ((hourly - 50) / 10) * 0.23);
}

function mapEarlyArtistBoost(
  profileKey: "fz" | "riize" | "vaundy",
  progress: number,
  cumulative: number
) {
  const step = getComparisonStep(progress);

  if (profileKey === "fz") {
    if (step >= 2 && step <= 3) return 1.18;
    if (step === 4) return 1.14;
    if (step === 5) return 1.28;
    if (step === 6) return 1.22;
  }

  if (profileKey === "riize") {
    if (step === 1) return 1.25;
    if (step >= 4 && step <= 5) return 1.1 + (cumulative / 30) * 0.12;
  }

  if (profileKey === "vaundy") {
    if (step <= 5) return 0.92;
    if (step === 6) return 1.18;
    if (step === 7) return 1.3;
  }

  return 1;
}

const COMP_PATHS = {
  fz: {
    veryFew: generateSwarmPaths(14, 400, 650),
    small: generateSwarmPaths(20, 300, 600),
    moderate: generateSwarmPaths(26, 200, 550),
    many: generateSwarmPaths(42, 150, 500),
    max: generateSwarmPaths(58, 100, 450),
    influx: generateSwarmPaths(32, 250, 520),
  },
  vaundy: {
    veryFew: generateSwarmPaths(10, 400, 650),
    small: generateSwarmPaths(14, 300, 600),
    moderate: generateSwarmPaths(20, 200, 550),
    many: generateSwarmPaths(36, 150, 500),
    max: generateSwarmPaths(52, 100, 450),
    influx: generateSwarmPaths(30, 250, 520),
  },
  riize: {
    veryFew: generateSwarmPaths(12, 400, 650),
    small: generateSwarmPaths(18, 300, 600),
    moderate: generateSwarmPaths(24, 200, 550),
    many: generateSwarmPaths(40, 150, 500),
    max: generateSwarmPaths(56, 100, 450),
    influx: generateSwarmPaths(30, 250, 520),
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
    </g>
    {children}
  </svg>
);

function laneRandom(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

type LaneParticleConfig = {
  id: number;
  side: "left" | "right" | "center";
  startX: number;
  endX: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  brightness: number;
};

function generateLaneParticles(count: number): LaneParticleConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const sideRoll = laneRandom(i * 3.17);
    const side: LaneParticleConfig["side"] =
      sideRoll < 0.4 ? "left" : sideRoll < 0.8 ? "right" : "center";
    const y = 18 + laneRandom(i * 5.11) * 64;
    const anchorX = 46 + laneRandom(i * 7.03) * 8;
    const duration = 2.4 + laneRandom(i * 13.7) * 2.2;
    const delay = laneRandom(i * 17.3) * 3.2;
    const distToCenter = Math.abs(anchorX - 50);
    const brightness = 0.55 + (1 - distToCenter / 50) * 0.45;
    const size = 1.5 + laneRandom(i * 11.9) * 2.5 + (side === "center" ? 0.35 : 0);

    if (side === "left") {
      const startX = 5 + laneRandom(i * 19.1) * 36;
      const endX = 44 + laneRandom(i * 23.5) * 12;
      return { id: i, side, startX, endX, y, size, duration, delay, brightness };
    }

    if (side === "right") {
      const startX = 59 + laneRandom(i * 19.1) * 36;
      const endX = 44 + laneRandom(i * 23.5) * 12;
      return { id: i, side, startX, endX, y, size, duration, delay, brightness };
    }

    return {
      id: i,
      side,
      startX: anchorX,
      endX: anchorX,
      y,
      size,
      duration: 1.4 + laneRandom(i * 29.1) * 1.6,
      delay,
      brightness: Math.min(1, brightness + 0.15),
    };
  });
}

const LANE_PARTICLES = generateLaneParticles(56);

function laneGrainStyle(size: number, color: string, brightness: number) {
  const glow = Math.max(2, size * 1.6);
  const halo = Math.max(4, size * 2.8);
  return {
    width: size,
    height: size,
    background: `radial-gradient(circle at 38% 38%, rgba(255,255,255,${0.55 + brightness * 0.4}) 0%, ${color} 42%, ${color}cc 68%, transparent 100%)`,
    boxShadow: `0 0 ${glow}px ${color}${Math.round(brightness * 180)
      .toString(16)
      .padStart(2, "0")}, 0 0 ${halo}px ${color}${Math.round(brightness * 60)
      .toString(16)
      .padStart(2, "0")}`,
  } as const;
}

function LaneGrain({
  particle,
  color,
}: {
  particle: LaneParticleConfig;
  color: string;
}) {
  const grainStyle = laneGrainStyle(particle.size, color, particle.brightness);
  const baseStyle = {
    ...grainStyle,
    top: `${particle.y}%`,
    marginTop: -particle.size / 2,
    marginLeft: -particle.size / 2,
  };

  if (particle.side === "center") {
    return (
      <motion.span
        className="absolute block rounded-full pointer-events-none will-change-[opacity,transform]"
        style={{ ...baseStyle, left: `${particle.startX}%` }}
        animate={{
          opacity: [0.45 * particle.brightness, 1 * particle.brightness, 0.55 * particle.brightness],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: particle.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: particle.delay,
        }}
      />
    );
  }

  return (
    <motion.span
      className="absolute block rounded-full pointer-events-none will-change-[opacity,left]"
      style={baseStyle}
      initial={{ left: `${particle.startX}%`, opacity: 0.25 * particle.brightness }}
      animate={{
        left: [`${particle.startX}%`, `${particle.endX}%`, `${particle.endX}%`],
        opacity: [0.3 * particle.brightness, 0.92 * particle.brightness, 0.38 * particle.brightness],
      }}
      transition={{
        duration: particle.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: particle.delay,
      }}
    />
  );
}

/** SP compact comparison cards — horizontal lane with particles flowing inward. */
function MiniFlowLane({
  progress,
  data,
  color,
  className,
}: {
  progress: MotionValue<number>;
  data: number[];
  color: string;
  className?: string;
}) {
  const fillOpacity = useTransform(useSteppedPercent(progress, data), (v) =>
    Math.min(1, 0.38 + (v / 100) * 0.62)
  );
  const centerGlowOpacity = useTransform(useSteppedPercent(progress, data), (v) =>
    0.08 + (v / 100) * 0.28
  );

  return (
    <div className="relative w-full h-full overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(90deg, rgba(0,0,0,0.45) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.45) 100%),
            linear-gradient(90deg, ${color}08 0%, transparent 18%, transparent 82%, ${color}08 100%)
          `,
        }}
      />

      <div className="absolute inset-x-[5%] top-1/2 h-px -translate-y-1/2 bg-white/[0.05]" />
      <div
        className="absolute inset-x-[5%] top-1/2 h-px -translate-y-1/2 opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}22 50%, transparent 100%)`,
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[26%] h-[78%] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${color}35 0%, ${color}12 42%, transparent 72%)`,
          opacity: centerGlowOpacity,
        }}
      />

      <motion.div className={`absolute inset-0 ${className ?? ""}`} style={{ opacity: fillOpacity }}>
        {LANE_PARTICLES.map((particle) => (
          <LaneGrain key={particle.id} particle={particle} color={color} />
        ))}
      </motion.div>
    </div>
  );
}

const CompSwarmLogic = ({
  progress,
  data,
  color,
  className,
  paths,
  profileKey,
}: {
  progress: MotionValue<number>;
  data: number[];
  color: string;
  className: string;
  paths: CompPaths;
  profileKey: "fz" | "riize" | "vaundy";
}) => {
  const profile = ARRIVAL_TIME_PROFILE[profileKey];
  const cumulative = useSteppedProfileField(progress, profile, "cumulative");
  const hourly = useSteppedProfileField(progress, profile, "hourly");

  const baseOpacity = useTransform(cumulative, mapCumulativeToBaseOpacity);

  const earlyBoost = useTransform([progress, cumulative], ([p, cum]) =>
    mapEarlyArtistBoost(profileKey, p as number, cum as number)
  );

  const veryFewOp = useTransform([baseOpacity, earlyBoost], ([b, e]) =>
    Math.min(1, Math.max(0.28, (b as number) * (e as number)))
  );

  const smallVis = useTransform(cumulative, [0, 8, 20, 100], [0.45, 0.72, 1, 1]);
  const modVis = useTransform(cumulative, [0, 18, 40, 100], [0, 0.55, 1, 1]);
  const manyVis = useTransform(cumulative, [0, 40, 68, 100], [0, 0, 1, 1]);
  const maxVis = useTransform(cumulative, [0, 65, 82, 100], [0, 0, 1, 1]);

  const smallOp = useTransform([baseOpacity, smallVis, earlyBoost], ([b, v, e]) =>
    Math.min(1, (b as number) * (v as number) * (e as number))
  );
  const modOp = useTransform([baseOpacity, modVis, earlyBoost], ([b, v, e]) =>
    Math.min(1, (b as number) * (v as number) * (e as number))
  );
  const manyOp = useTransform([baseOpacity, manyVis, earlyBoost], ([b, v, e]) =>
    Math.min(1, (b as number) * (v as number) * (e as number))
  );
  const maxOp = useTransform([baseOpacity, maxVis, earlyBoost], ([b, v, e]) =>
    Math.min(1, (b as number) * (v as number) * (e as number))
  );

  const influxOp = useTransform([hourly, baseOpacity], ([h, b]) =>
    mapHourlyToInfluxOpacity(h as number, b as number)
  );

  const peakBoost = useTransform(progress, (p) => mapPeakBoost(profileKey, p));

  const influxOpBoosted = useTransform([influxOp, peakBoost], ([op, boost]) =>
    Math.min(1, (op as number) * (boost as number))
  );

  const manyOpBoosted = useTransform([manyOp, peakBoost, cumulative], ([op, boost, cum]) => {
    const b = boost as number;
    if (b <= 1) return op as number;
    const mix = Math.min(1, ((cum as number) - 40) / 35);
    return (op as number) * (1 + (b - 1) * mix * 0.35);
  });

  const maxOpBoosted = useTransform([maxOp, peakBoost, cumulative], ([op, boost, cum]) => {
    const b = boost as number;
    if (b <= 1) return op as number;
    const mix = Math.min(1, ((cum as number) - 65) / 25);
    return Math.min(1, (op as number) * (1 + (b - 1) * mix * 0.45));
  });

  const glowPulse = useTransform([hourly, cumulative], ([h, c]) =>
    0.62 + Math.min((h as number) / 55, 0.22) + ((c as number) / 100) * 0.12
  );

  return (
    <>
      <CompSwarmGroup paths={paths.veryFew} color={color} opacity={veryFewOp} minDur={4.5} maxDur={6.5} className={className} radius={COMP_DOT_RADIUS.small} glowTier="soft" maxOpacity={0.82} />
      <CompSwarmGroup paths={paths.small} color={color} opacity={smallOp} minDur={3.5} maxDur={5.5} className={className} radius={COMP_DOT_RADIUS.small} glowTier="soft" maxOpacity={0.86} />
      <CompSwarmGroup paths={paths.moderate} color={color} opacity={modOp} minDur={2.5} maxDur={4.5} className={className} radius={COMP_DOT_RADIUS.normal} glowTier="normal" maxOpacity={0.9} />
      <CompSwarmGroup paths={paths.many} color={color} opacity={manyOpBoosted} minDur={1.8} maxDur={3.2} className={className} radius={COMP_DOT_RADIUS.normal} glowTier="normal" maxOpacity={0.92} />
      <CompSwarmGroup paths={paths.max} color={color} opacity={maxOpBoosted} minDur={1.2} maxDur={2.2} className={className} radius={COMP_DOT_RADIUS.normal + 0.5} glowTier="normal" maxOpacity={0.95} />
      <CompSwarmGroup paths={paths.influx} color={color} opacity={influxOpBoosted} minDur={0.9} maxDur={1.8} className={className} radius={COMP_DOT_RADIUS.influx} glowTier="strong" maxOpacity={1} />

      <motion.g style={{ opacity: glowPulse }}>
        <ArtistDomeGlow
          progress={progress}
          color={color}
          data={data}
          stepped
          center={{ x: 500, y: 500 }}
          sizeScale={0.5}
        />
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
        <span
          className="text-[12px] md:text-[14px] tracking-[0.08em] font-semibold font-mono select-none"
          style={{ color: "rgba(255,255,255,0.78)" }}
        >
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

const MOBILE_COMPARE_ARTISTS = [
  {
    title: "FRUITS ZIPPER",
    insightLabel: "早め来場型",
    color: "#00D1FF",
    data: S06_DATA.fz,
    swarmClassName: "arrival-time__comparison-particles--fz",
    domeClassName: "arrival-time__comparison-dome--fruits-zipper",
    percentClassName: "arrival-time__comparison-percent--fruits-zipper",
    paths: COMP_PATHS.fz,
    profileKey: "fz" as const,
  },
  {
    title: "RIIZE",
    insightLabel: "中間型",
    color: "#FF4EDB",
    data: S06_DATA.riize,
    swarmClassName: "arrival-time__comparison-particles--riize",
    domeClassName: "arrival-time__comparison-dome--riize",
    percentClassName: "arrival-time__comparison-percent--riize",
    paths: COMP_PATHS.riize,
    profileKey: "riize" as const,
  },
  {
    title: "Vaundy",
    insightLabel: "直前集中型",
    color: "#A6FF4D",
    data: S06_DATA.vaundy,
    swarmClassName: "arrival-time__comparison-particles--vaundy",
    domeClassName: "arrival-time__comparison-dome--vaundy",
    percentClassName: "arrival-time__comparison-percent--vaundy",
    paths: COMP_PATHS.vaundy,
    profileKey: "vaundy" as const,
  },
] as const;

function MobileComparisonView({
  progress,
  compTimeUpper,
  compTimeLower,
  compCopyText,
}: {
  progress: MotionValue<number>;
  compTimeUpper: MotionValue<string>;
  compTimeLower: MotionValue<string>;
  compCopyText: MotionValue<string>;
}) {
  return (
    <div className="arrival-time__mobile-comparison w-[calc(100vw-40px)] max-w-[380px] flex flex-col items-center gap-2 pt-2">
      <div className="arrival-time__mobile-comparison-time text-center leading-none mb-1">
        <motion.span className="block text-white/45 text-[11px] font-mono tracking-[0.35em] uppercase">
          {compTimeUpper}
        </motion.span>
        <motion.span
          className="block text-white font-bold text-[44px] tracking-tight mt-0.5"
          style={{ textShadow: "0 0 40px rgba(255,255,255,0.15)" }}
        >
          {compTimeLower}
        </motion.span>
      </div>

      <div className="w-full flex flex-col gap-2.5">
        {MOBILE_COMPARE_ARTISTS.map((artist) => (
          <ComparisonDome
            key={artist.title}
            compact
            title={artist.title}
            insightLabel={artist.insightLabel}
            color={artist.color}
            progress={progress}
            data={[...artist.data]}
            swarmClassName={artist.swarmClassName}
            domeClassName={artist.domeClassName}
            percentClassName={artist.percentClassName}
            paths={artist.paths}
            profileKey={artist.profileKey}
          />
        ))}
      </div>

      <motion.p
        className="arrival-time__mobile-comparison-copy text-center text-[16px] tracking-wide leading-[1.85] mt-1"
        style={{ color: "rgba(255,255,255,0.72)" }}
      >
        {compCopyText}
      </motion.p>
    </div>
  );
}

const ComparisonDome = ({
  title,
  insightLabel,
  color,
  progress,
  data,
  swarmClassName,
  domeClassName,
  percentClassName,
  paths,
  profileKey,
  compact = false,
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
  profileKey: "fz" | "riize" | "vaundy";
  compact?: boolean;
}) => {
  const profile = ARRIVAL_TIME_PROFILE[profileKey];
  const cumulative = useSteppedProfileField(progress, profile, "cumulative");
  const pct = useSteppedPercent(progress, data);
  const pctStr = useTransform(pct, (v) => `${Math.round(v)}%`);

  const glowShadow = useTransform(cumulative, (v) => {
    const alpha = Math.round((0.10 + (v / 100) * 0.28) * 255).toString(16).padStart(2, "0");
    const blur = Math.round(10 + (v / 100) * 26);
    return `0 0 ${blur}px ${color}${alpha}`;
  });

  const cardOpacity = useTransform(cumulative, (v) => 0.72 + (v / 100) * 0.24);

  if (compact) {
    return (
      <div
        className={`${domeClassName} arrival-time__comparison-dome--compact w-full rounded-2xl border border-white/12 bg-black/35 px-3 py-2.5 flex flex-col gap-1.5`}
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-[12px] font-bold tracking-[0.1em] font-mono uppercase leading-tight"
            style={{ color }}
          >
            {title}
          </p>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-white/55 tracking-wide leading-none mb-0.5">累積来場率</p>
            <motion.span
              className={`${percentClassName} font-mono font-bold tabular-nums text-[22px] leading-none`}
              style={{ color, textShadow: `0 0 8px ${color}60` }}
            >
              {pctStr}
            </motion.span>
          </div>
        </div>

        <motion.div
          className="relative w-full h-[44px] rounded-xl overflow-hidden bg-[#04040b] border border-white/[0.08]"
          style={{ boxShadow: glowShadow, opacity: cardOpacity }}
        >
          <MiniFlowLane
            progress={progress}
            data={data}
            color={color}
            className={swarmClassName}
          />
        </motion.div>

        <p
          className="text-[13px] font-semibold tracking-wide font-mono text-center leading-snug"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          {insightLabel}
        </p>
      </div>
    );
  }

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
        style={{ boxShadow: glowShadow, opacity: cardOpacity }}
      >
        <MiniDomeBase>
          <CompSwarmLogic
            progress={progress}
            data={data}
            color={color}
            className={swarmClassName}
            paths={paths}
            profileKey={profileKey}
          />
        </MiniDomeBase>
      </motion.div>

      <p
        className="text-[14px] md:text-[16px] font-semibold tracking-[0.1em] font-mono text-center leading-snug"
        style={{ color: "rgba(255,255,255,0.75)" }}
      >
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

  const introOp = useTransform(scrollYProgress, [0, 0.06, 0.12, 0.16], [0, 1, 1, 0]);

  const fzSceneOp = useTransform(scrollYProgress, [0.08, 0.12, 0.24, 0.28], [0, 1, 1, 0]);
  const riizeSceneOp = useTransform(scrollYProgress, [0.24, 0.28, 0.40, 0.44], [0, 1, 1, 0]);
  const vaundySceneOp = useTransform(scrollYProgress, [0.40, 0.44, 0.56, 0.60], [0, 1, 1, 0]);

  const compareOp = useTransform(scrollYProgress, [0.56, 0.60, 0.94, 0.98], [0, 1, 1, 0]);
  const climaxOp = useTransform(scrollYProgress, [0.96, 0.98, 0.995, 1], [0, 1, 1, 0]);

  const mainMapOp = useTransform(scrollYProgress, [0, 0.56, 0.60, 0.96, 0.98, 1], [1, 1, 0, 0, 1, 1]);
  const timelineUiOp = useTransform(scrollYProgress, [0.08, 0.12, 0.56, 0.60], [0, 1, 1, 0]);

  const fzTimeP = useTransform(scrollYProgress, [0.08, 0.28], [0, 1]);
  const riizeTimeP = useTransform(scrollYProgress, [0.24, 0.44], [0, 1]);
  const vaundyTimeP = useTransform(scrollYProgress, [0.40, 0.60], [0, 1]);
  const compareTimeP = useTransform(scrollYProgress, (scrollP) => {
    if (scrollP <= COMPARE_TIME_SCROLL_START) return 0;
    if (scrollP >= COMPARE_TIME_SCROLL_END) return 1;
    return (scrollP - COMPARE_TIME_SCROLL_START) / (COMPARE_TIME_SCROLL_END - COMPARE_TIME_SCROLL_START);
  });

  const maxTimeP = useTransform(scrollYProgress, () => 1);

  const compTimeUpper = useTransform(compareTimeP, (p) => {
    const step = getComparisonStep(p);
    return step < 8 ? "開演まで" : "";
  });

  const compTimeLower = useTransform(compareTimeP, (p) => {
    return COMPARISON_TIME_LABELS[getComparisonStep(p)];
  });

  const compCopyText = useTransform(compareTimeP, (p) => {
    return getComparisonCopyText(getComparisonStep(p));
  });

  const indicatorTop = useTransform(scrollYProgress, (p) => {
    if (p >= 0.08 && p < 0.28) return `${((p - 0.08) / 0.20) * 100}%`;
    if (p >= 0.24 && p < 0.44) return `${((p - 0.24) / 0.20) * 100}%`;
    if (p >= 0.40 && p < 0.60) return `${((p - 0.40) / 0.20) * 100}%`;
    return "0%";
  });

  const fzMobileTimelineOp = useTransform([timelineUiOp, fzSceneOp], ([t, s]) => (t as number) * (s as number));
  const riizeMobileTimelineOp = useTransform([timelineUiOp, riizeSceneOp], ([t, s]) => (t as number) * (s as number));
  const vaundyMobileTimelineOp = useTransform([timelineUiOp, vaundySceneOp], ([t, s]) => (t as number) * (s as number));

  return (
    <section
      ref={containerRef}
      className="section-arrival-time h-[1000vh] md:h-[850vh] relative bg-[#050505]"
      style={{ position: "relative" }}
    >
      <div className="sticky top-0 w-full h-[100vh] overflow-hidden flex items-center justify-center arrival-time__background">
        <img
          src={tokyoDomeMapNorth}
          alt=""
          aria-hidden="true"
          className="arrival-time__map-bg absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: MAP_OBJECT_POSITION }}
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
            <radialGradient id="dome-glow-fz" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00D1FF" stopOpacity="0.24" />
              <stop offset="28%" stopColor="#00D1FF" stopOpacity="0.14" />
              <stop offset="55%" stopColor="#00D1FF" stopOpacity="0.06" />
              <stop offset="78%" stopColor="#00D1FF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dome-glow-riize" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF4EDB" stopOpacity="0.24" />
              <stop offset="28%" stopColor="#FF4EDB" stopOpacity="0.14" />
              <stop offset="55%" stopColor="#FF4EDB" stopOpacity="0.06" />
              <stop offset="78%" stopColor="#FF4EDB" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dome-glow-vaundy" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A6FF4D" stopOpacity="0.24" />
              <stop offset="28%" stopColor="#A6FF4D" stopOpacity="0.14" />
              <stop offset="55%" stopColor="#A6FF4D" stopOpacity="0.06" />
              <stop offset="78%" stopColor="#A6FF4D" stopOpacity="0" />
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

            <div className="hidden md:block absolute top-[50%] left-1/2 -translate-x-1/2 mt-[80px] pointer-events-none">
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

        <div className="md:hidden absolute bottom-14 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-48px)] max-w-[360px] pointer-events-none">
          <div className="relative min-h-[80px] w-full">
            <motion.div className="absolute inset-x-0 top-0" style={{ opacity: fzSceneOp }}>
              <CapacityIndicator
                mobile
                progress={fzTimeP}
                data={cumulativeData.fruitsZipper}
                labels={TIMELINE_LABELS.map((l) => l.label)}
                color="#00D1FF"
              />
            </motion.div>

            <motion.div className="absolute inset-x-0 top-0" style={{ opacity: riizeSceneOp }}>
              <CapacityIndicator
                mobile
                progress={riizeTimeP}
                data={cumulativeData.riize}
                labels={TIMELINE_LABELS.map((l) => l.label)}
                color="#FF4EDB"
              />
            </motion.div>

            <motion.div className="absolute inset-x-0 top-0" style={{ opacity: vaundySceneOp }}>
              <CapacityIndicator
                mobile
                progress={vaundyTimeP}
                data={cumulativeData.vaundy}
                labels={TIMELINE_LABELS.map((l) => l.label)}
                color="#A6FF4D"
              />
            </motion.div>
          </div>
        </div>

        <MobileTimeScale progress={fzTimeP} color="#00D1FF" opacity={fzMobileTimelineOp} />
        <MobileTimeScale progress={riizeTimeP} color="#FF4EDB" opacity={riizeMobileTimelineOp} />
        <MobileTimeScale progress={vaundyTimeP} color="#A6FF4D" opacity={vaundyMobileTimelineOp} />

        <motion.div
          className="arrival-time__timeline hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col h-[60vh] justify-between border-l border-[#333] pl-6 z-40"
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
            人はここを目指して集まる。
          </h2>

          <p className="arrival-time__section-copy text-[#a0a0a0] text-lg md:text-xl tracking-[0.1em] leading-relaxed">
            ライブは、開演前から始まっている。
            <br />
            グッズを買う人。友人と待ち合わせる人。
            <br />
            早くから会場の熱気を感じたい人。
            <br />
            東京ドーム周辺には、開演前からファンが集まり始める。
            <br />
            何時間前から人は集まってくるのか。
          </p>
        </motion.div>

        <motion.div className="absolute top-16 md:top-1/4 left-0 right-0 md:left-auto md:right-[10%] z-10 text-center md:text-right max-w-[340px] md:max-w-sm px-4 mx-auto md:mx-0" style={{ opacity: fzSceneOp }}>
          <h3 className="arrival-time__artist-name--fruits-zipper text-[#00D1FF] text-2xl md:text-5xl font-bold tracking-wider mb-3 md:mb-4 drop-shadow-[0_0_10px_rgba(0,209,255,0.5)]">
            FRUITS ZIPPER
          </h3>
          <p className="arrival-time__scene-copy text-white/90 text-base md:text-lg tracking-wide md:tracking-widest leading-[1.85] md:leading-relaxed">
            開演の数時間前から来場が始まり、会場周辺で過ごすファンが目立つ。
            <br />
            ライブ前の時間も含めて、体験として楽しむ傾向が見られた。
          </p>
        </motion.div>

        <motion.div className="absolute top-16 md:top-1/4 left-0 right-0 md:left-auto md:right-[10%] z-10 text-center md:text-right max-w-[340px] md:max-w-sm px-4 mx-auto md:mx-0" style={{ opacity: riizeSceneOp }}>
          <h3 className="arrival-time__artist-name--riize text-[#FF4EDB] text-2xl md:text-5xl font-bold tracking-wider mb-3 md:mb-4 drop-shadow-[0_0_10px_rgba(255,78,219,0.5)]">
            RIIZE
          </h3>
          <p className="arrival-time__scene-copy text-white/90 text-base md:text-lg tracking-wide md:tracking-widest leading-[1.85] md:leading-relaxed">
            遠方からの来場者も含め、開演前から会場周辺に集まる動きが見られた。
            <br />
            ファンダムの広域性と早めの来場傾向が重なっている。
          </p>
        </motion.div>

        <motion.div className="absolute top-16 md:top-1/4 left-0 right-0 md:left-auto md:right-[10%] z-10 text-center md:text-right max-w-[340px] md:max-w-sm px-4 mx-auto md:mx-0" style={{ opacity: vaundySceneOp }}>
          <h3 className="arrival-time__artist-name--vaundy text-[#A6FF4D] text-2xl md:text-5xl font-bold tracking-wider mb-3 md:mb-4 drop-shadow-[0_0_10px_rgba(166,255,77,0.5)]">
            Vaundy
          </h3>
          <p className="arrival-time__scene-copy text-white/90 text-base md:text-lg tracking-wide md:tracking-widest leading-[1.85] md:leading-relaxed">
            首都圏在住者を中心に、開演時刻に向けて段階的に人流が増えていく。
            <br />
            都市部の生活圏から会場へ向かう動きが読み取れる。
          </p>
        </motion.div>

        <motion.div
          className="arrival-time__comparison-view absolute inset-0 z-20 flex flex-col justify-center items-center pointer-events-none overflow-y-auto md:overflow-visible"
          style={{ opacity: compareOp }}
        >
          <div className="md:hidden w-full flex justify-center px-5 pt-14 pb-6">
            <MobileComparisonView
              progress={compareTimeP}
              compTimeUpper={compTimeUpper}
              compTimeLower={compTimeLower}
              compCopyText={compCopyText}
            />
          </div>

          <div className="hidden md:flex flex-col justify-center items-center gap-4 px-12 w-full">
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

            <div className="flex w-full max-w-[900px] gap-6 justify-between items-start">
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
                profileKey="fz"
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
                profileKey="riize"
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
                profileKey="vaundy"
              />
            </div>

            <motion.p
              className="arrival-time__comparison-copy text-center tracking-[0.06em] max-w-2xl mt-3"
              style={{
                fontSize: "clamp(17px, 1.75vw, 22px)",
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.85,
              }}
            >
              {compCopyText}
            </motion.p>
          </div>
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