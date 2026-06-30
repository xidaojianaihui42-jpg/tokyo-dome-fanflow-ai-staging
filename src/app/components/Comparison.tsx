import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent
} from "motion/react";

const COLORS = {
  FZ: "#00D1FF",
  RZ: "#FF4EDB",
  VD: "#A6FF4D"
};

const TIME_LABELS = ["8h前", "7h前", "6h前", "5h前", "4h前", "3h前", "2h前", "1h前", "開演"];

const DATA = {
  FZ: {
    artist: "FRUITS ZIPPER",
    peakArrival: 4,
    prefectures: 30,
    genderF: 51,
    genderM: 49,
    arrivalTrend: [2, 4, 7, 14, 36, 24, 10, 3, 1]
  },
  RZ: {
    artist: "RIIZE",
    peakArrival: 4,
    prefectures: 28,
    genderF: 81,
    genderM: 19,
    arrivalTrend: [1, 3, 8, 16, 38, 22, 8, 3, 1]
  },
  VD: {
    artist: "Vaundy",
    peakArrival: 2,
    prefectures: 34,
    genderF: 73,
    genderM: 27,
    arrivalTrend: [1, 2, 3, 5, 8, 16, 42, 18, 5]
  }
};

function AnimatedNumber({
  value,
  progress,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = ""
}: {
  value: number;
  progress: any;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState("0");
  const animatedValue = useTransform(progress, [0.4, 0.7], [0, value]);
  const springValue = useSpring(animatedValue, { damping: 20, stiffness: 40 });

  useEffect(() => {
    return springValue.on("change", (latest) => {
      const formatted = latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setDisplayValue(prefix + formatted + suffix);
    });
  }, [springValue, decimals, prefix, suffix]);

  return <span className={className}>{displayValue}</span>;
}

function ArrivalTrendLine({
  values,
  peakTime,
  progress,
  color
}: {
  values: number[];
  peakTime: number;
  progress: any;
  color: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const chartOpacity = useTransform(progress, [0.32, 0.42], [0, 1]);

  useMotionValueEvent(progress, "change", (latest: number) => {
    const t = Math.max(0, Math.min(1, (latest - 0.4) / 0.3));
    setActiveIndex(Math.round(t * (TIME_LABELS.length - 1)));
  });

  const width = 100;
  const height = 46;
  const max = Math.max(...values);

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - (v / max) * height + 6;
    return { x, y, v, label: TIME_LABELS[i] };
  });

  const visiblePoints = points.slice(0, activeIndex + 1);
  const d = visiblePoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const current = points[activeIndex];
  const peakIndex = TIME_LABELS.indexOf(`${peakTime}h前`);

  return (
    <motion.div style={{ opacity: chartOpacity }} className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-xs text-[#888] font-mono mb-1">来場推移</div>
          <div className="text-white text-sm tracking-wider">
            現在：{current?.label}
          </div>
        </div>
        <div className="text-[11px] text-white/70 font-mono">
          PEAK {peakTime}h前
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black/25 border border-white/10 p-3">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "16px 16px"
          }}
        />

        <svg viewBox="0 0 100 72" className="relative w-full h-[110px] overflow-visible">
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 10px ${color})` }}
          />

          {points.map((p, i) => {
            const isActive = i === activeIndex;
            const isPast = i <= activeIndex;
            const isPeak = i === peakIndex;

            return (
              <g key={i}>
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 7 : isPeak ? 5 : 3}
                  fill={isPast ? color : "rgba(255,255,255,0.15)"}
                  opacity={isPast ? 1 : 0.35}
                  style={{
                    filter: isPast ? `drop-shadow(0 0 12px ${color})` : undefined
                  }}
                />

                {isActive && (
                  <>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="13"
                      fill={color}
                      opacity="0.18"
                      style={{ filter: "blur(4px)" }}
                    />
                    <text
                      x={p.x}
                      y={Math.max(8, p.y - 12)}
                      fill="#fff"
                      fontSize="7"
                      textAnchor="middle"
                      className="font-mono"
                      style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,0.9))" }}
                    >
                      {p.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          <text x="0" y="70" fill="rgba(255,255,255,0.45)" fontSize="6" className="font-mono">
            8h前
          </text>
          <text x="50" y="70" fill="rgba(255,255,255,0.45)" fontSize="6" textAnchor="middle" className="font-mono">
            4h前
          </text>
          <text x="100" y="70" fill="rgba(255,255,255,0.45)" fontSize="6" textAnchor="end" className="font-mono">
            開演
          </text>
        </svg>
      </div>
    </motion.div>
  );
}

function GenderBar({ f, progress, color }: { f: number; m: number; progress: any; color: string }) {
  const widthStrF = useTransform(progress, [0.4, 0.7], ["0%", `${f}%`]);

  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
      <motion.div className="h-full rounded-l-full" style={{ width: widthStrF, backgroundColor: color }} />
      <div className="h-full bg-white flex-1 rounded-r-full" />
    </div>
  );
}

function ComparisonCard({
  id,
  data,
  color,
  progress,
  index
}: {
  id: string;
  data: typeof DATA.FZ;
  color: string;
  progress: any;
  index: number;
}) {
  const startY = 0.08 + index * 0.04;
  const endY = 0.2 + index * 0.04;

  const y = useTransform(progress, [startY, endY], [100, 0]);
  const opacity = useTransform(progress, (p: number) => {
    if (p <= startY) return 0;
    if (p >= endY) return 1;
    return (p - startY) / (endY - startY);
  });
  const scale = useTransform(progress, [startY, endY], [0.8, 1]);

  const endXOffset = index === 0 ? 50 : index === 2 ? -50 : 0;
  const x = useTransform(progress, [0.9, 1], [0, endXOffset]);

  const floatY = useTransform(progress, (p: number) => {
    if (p < 0.7 || p > 0.9) return 0;
    const t = (p - 0.7) / 0.2;
    return Math.sin(t * Math.PI * 4 + index) * 10;
  });

  return (
    <motion.div
      className={`comparison__card--${id} flex-1 min-w-[280px] max-w-[360px] bg-gradient-to-br from-white/[0.08] to-white/[0.01] backdrop-blur-2xl border border-white/20 border-b-white/5 border-r-white/5 rounded-2xl p-8 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]`}
      style={{ y: useTransform(() => y.get() + floatY.get()), x, opacity, scale }}
    >
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-40 pointer-events-none"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[60px] opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className={`comparison__artist-name--${id} text-2xl font-bold tracking-widest mb-8`} style={{ color }}>
        {data.artist}
      </div>

      <div className="flex flex-col gap-7">
        <div className={`comparison__arrival-trend--${id}`}>
          <ArrivalTrendLine
            values={data.arrivalTrend}
            peakTime={data.peakArrival}
            progress={progress}
            color={color}
          />
        </div>

        <div className={`comparison__prefecture-count--${id}`}>
          <div className="text-xs text-[#888] font-mono mb-1 flex items-center gap-2">
            <span>来訪都道府県</span>
          </div>
          <div className="text-2xl font-light text-white font-mono tracking-wider flex items-end gap-2">
            <AnimatedNumber
              value={data.prefectures}
              progress={progress}
              className={`comparison__countup--${id}`}
              suffix=" / 47都道府県"
            />
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white/20 mb-1">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
        </div>

        <div className={`comparison__gender-ratio--${id}`}>
          <div className="text-xs text-[#888] font-mono mb-2 flex justify-between">
            <span>男女比</span>
            <span className="text-white flex gap-2">
              <AnimatedNumber value={data.genderF} progress={progress} prefix="女性 " suffix="%" className={`comparison__countup--${id}`} />
              <span className="text-[#888]">/</span>
              <AnimatedNumber value={data.genderM} progress={progress} prefix="男性 " suffix="%" className={`comparison__countup--${id}`} />
            </span>
          </div>
          <div className={`comparison__mini-chart--${id}`}>
            <GenderBar f={data.genderF} m={data.genderM} progress={progress} color={color} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Comparison() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.06, 0.9, 1], [0, 1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.06], [30, 0]);

  return (
    <section ref={containerRef} className="section-comparison relative h-[230vh] bg-[#050505]" style={{ position: "relative" }}>
      <div className="comparison__background sticky top-0 w-full h-[100vh] overflow-hidden flex flex-col items-center justify-center px-4 bg-[#050505]">
        <div className="comparison__map-overlay absolute inset-0 bg-gradient-to-b from-[#050505] via-[#030303] to-[#000000] pointer-events-none" />

        <motion.div className="text-center mb-12 z-20" style={{ opacity: titleOpacity, y: titleY }}>
          <h2 className="comparison__section-title text-4xl md:text-5xl text-white font-bold tracking-[0.1em] mb-6">
            3つのライブ、3つの人流。
          </h2>
          <p className="comparison__section-copy text-[#a0a0a0] text-lg md:text-xl tracking-[0.1em] leading-relaxed">
            同じ東京ドームに集まっても、<br className="md:hidden" />
            来る場所、来る時間、集まる人は違っていた。
          </p>
        </motion.div>

        <div className="comparison__card-container w-full max-w-[1200px] flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center z-10 px-4 perspective-[1000px]">
          <ComparisonCard id="fruits-zipper" data={DATA.FZ} color={COLORS.FZ} progress={scrollYProgress} index={0} />
          <ComparisonCard id="riize" data={DATA.RZ} color={COLORS.RZ} progress={scrollYProgress} index={1} />
          <ComparisonCard id="vaundy" data={DATA.VD} color={COLORS.VD} progress={scrollYProgress} index={2} />
        </div>
      </div>
    </section>
  );
}