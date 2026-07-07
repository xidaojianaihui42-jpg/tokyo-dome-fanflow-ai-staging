import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent
} from "motion/react";
import {
  PrefectureDetailModal,
  PREFECTURE_MODAL_DATA,
  type PrefectureModalArtistKey,
} from "./PrefectureDetailModal";

const COLORS = {
  FZ: "#00D1FF",
  RZ: "#FF4EDB",
  VD: "#A6FF4D"
};

function withAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}


const DATA = {
  FZ: {
    artist: "FRUITS ZIPPER",
    peakArrival: 4,
    prefectures: 30,
    genderF: 51,
    genderM: 49,
    arrivalTrend: [1.8, 1.5, 6.1, 9.7, 4.8, 22.4, 23.8, 14.4, 15.5],
  },
  RZ: {
    artist: "RIIZE",
    peakArrival: 4,
    prefectures: 28,
    genderF: 81,
    genderM: 19,
    arrivalTrend: [1.8, 7.0, 0.9, 4.8, 3.5, 9.6, 12.7, 36.0, 23.7],
  },
  VD: {
    artist: "Vaundy",
    peakArrival: 2,
    prefectures: 34,
    genderF: 73,
    genderM: 27,
    arrivalTrend: [2.5, 2.3, 1.5, 1.0, 1.7, 2.7, 23.4, 53.4, 11.5],
  },
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

const TIME_SLOT_LABELS = ["8h前", "7h前", "6h前", "5h前", "4h前", "3h前", "2h前", "1h前", "開演"];

const AXIS_TICKS = [
  { index: 0, label: "8h" },
  { index: 2, label: "6h" },
  { index: 4, label: "4h" },
  { index: 6, label: "2h" },
  { index: 8, label: "開演" },
] as const;

const DOT_STACK = {
  maxDotsPerSlot: 10,
  dotSizePx: 9,
  stackHeightPx: 124,
  gapPx: 6,
} as const;

function computeDotCounts(hourlyValues: number[]): number[] {
  const peak = Math.max(...hourlyValues);
  return hourlyValues.map((value) => {
    if (value <= 0) return 0;
    if (value < 2) return 1;
    return Math.max(1, Math.round((value / peak) * DOT_STACK.maxDotsPerSlot));
  });
}

function scrollProgressToActiveIndex(progress: number): number {
  const t = Math.max(0, Math.min(1, (progress - 0.4) / 0.3));
  return Math.round(t * (TIME_SLOT_LABELS.length - 1));
}

function GlowStackDot({
  color,
  isFuture,
  isCurrent,
  delay,
}: {
  color: string;
  isFuture: boolean;
  isCurrent: boolean;
  delay: number;
}) {
  return (
    <motion.span
      className="block rounded-full shrink-0"
      style={{
        width: DOT_STACK.dotSizePx,
        height: DOT_STACK.dotSizePx,
        backgroundColor: isFuture ? "rgba(255,255,255,0.18)" : color,
        boxShadow: isFuture
          ? undefined
          : `0 0 12px ${color}, 0 0 5px ${color}`,
      }}
      initial={{ opacity: 0, scale: 0.35 }}
      animate={{
        opacity: isFuture ? 0.3 : isCurrent ? 1 : 0.88,
        scale: isFuture ? 0.9 : 1,
      }}
      transition={{ duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

function ArrivalTrendDotStack({
  values,
  peakTime,
  progress,
  color,
}: {
  values: number[];
  peakTime: number;
  progress: any;
  color: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const chartOpacity = useTransform(progress, [0.32, 0.42], [0, 1]);
  const dotCounts = useMemo(() => computeDotCounts(values), [values]);

  useMotionValueEvent(progress, "change", (latest: number) => {
    setActiveIndex(scrollProgressToActiveIndex(latest));
  });

  const currentLabel = TIME_SLOT_LABELS[activeIndex];
  const axisLabelByIndex = Object.fromEntries(AXIS_TICKS.map((tick) => [tick.index, tick.label]));

  return (
    <motion.div style={{ opacity: chartOpacity }} className="w-full">
      <div className="flex items-end justify-between mb-3 gap-3">
        <div>
          <div
            className="text-[13px] md:text-[15px] font-semibold font-mono mb-1.5 tracking-wider"
            style={{
              color: "rgba(255,255,255,0.78)",
              textShadow: "0 0 8px rgba(0,0,0,0.85)",
            }}
          >
            来場推移
          </div>
          <div
            className="text-[14px] md:text-[16px] font-bold tracking-wider"
            style={{
              color: "rgba(255,255,255,0.88)",
              textShadow: "0 0 8px rgba(0,0,0,0.8)",
            }}
          >
            現在：{currentLabel}
          </div>
        </div>
        <div
          className="text-[11px] md:text-[13px] font-semibold font-mono shrink-0 rounded-full px-2 py-1 border"
          style={{
            color: "rgba(255,255,255,0.82)",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderColor: "rgba(255,255,255,0.14)",
            textShadow: "0 0 6px rgba(0,0,0,0.75)",
          }}
        >
          PEAK {peakTime}h前
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black/25 border border-white/10 px-2 sm:px-3 pt-4 pb-2">
        <div className="flex items-end justify-between gap-0.5 sm:gap-1">
          {values.map((_, slotIndex) => {
            const count = dotCounts[slotIndex];
            const isCurrent = slotIndex === activeIndex;
            const isFuture = slotIndex > activeIndex;
            const axisLabel = axisLabelByIndex[slotIndex] ?? "";

            return (
              <div key={slotIndex} className="flex flex-1 flex-col items-center min-w-0">
                <div
                  className="flex flex-col-reverse items-center justify-start w-full"
                  style={{
                    height: DOT_STACK.stackHeightPx,
                    gap: DOT_STACK.gapPx,
                  }}
                >
                  {Array.from({ length: count }).map((_, dotIndex) => (
                    <GlowStackDot
                      key={dotIndex}
                      color={color}
                      isFuture={isFuture}
                      isCurrent={isCurrent}
                      delay={
                        isFuture
                          ? 0
                          : isCurrent
                            ? dotIndex * 0.045
                            : Math.min(dotIndex * 0.02, 0.12)
                      }
                    />
                  ))}
                </div>
                <span
                  className="mt-2 text-[11px] md:text-xs font-semibold font-mono h-4 leading-none"
                  style={{
                    color: "rgba(255,255,255,0.68)",
                    textShadow: "0 0 6px rgba(0,0,0,0.9)",
                  }}
                >
                  {axisLabel}
                </span>
              </div>
            );
          })}
        </div>
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
  index,
  onOpenPrefecture,
}: {
  id: string;
  data: typeof DATA.FZ;
  color: string;
  progress: any;
  index: number;
  onOpenPrefecture: () => void;
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
          <ArrivalTrendDotStack
            values={data.arrivalTrend}
            peakTime={data.peakArrival}
            progress={progress}
            color={color}
          />
        </div>

        <button
          type="button"
          onClick={onOpenPrefecture}
          aria-label={`${data.artist}の来訪都道府県地図を見る`}
          className={`comparison__prefecture-count--${id} w-full text-left rounded-xl px-3 py-2.5 -mx-1 transition-all duration-200 cursor-pointer group border border-transparent hover:border-white/[0.08] hover:bg-white/[0.05]`}
          style={
            {
              "--artist-color": color,
              "--artist-glow": withAlpha(color, 0.45),
            } as React.CSSProperties
          }
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs text-[#888] font-mono transition-colors group-hover:text-white/65">
              来訪都道府県
            </span>
            <span
              className="comparison__map-link shrink-0 text-[11px] md:text-xs font-semibold rounded-full px-2 py-1 border transition-all duration-200 group-hover:brightness-110 group-hover:shadow-[0_0_10px_var(--artist-glow)]"
              style={{
                color,
                backgroundColor: withAlpha(color, 0.12),
                borderColor: withAlpha(color, 0.3),
              }}
            >
              地図で見る →
            </span>
          </div>
          <div className="text-2xl font-light text-white/88 font-mono tracking-wider flex items-end gap-2 transition-colors group-hover:text-white">
            <AnimatedNumber
              value={data.prefectures}
              progress={progress}
              className={`comparison__countup--${id}`}
              suffix=" / 47都道府県"
            />
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-5 h-5 mb-1 transition-all duration-200 fill-white/25 group-hover:fill-current group-hover:drop-shadow-[0_0_10px_currentColor]"
              style={{ color }}
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
        </button>

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
  const [modalArtist, setModalArtist] = useState<PrefectureModalArtistKey | null>(null);
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
          <ComparisonCard
            id="fruits-zipper"
            data={DATA.FZ}
            color={COLORS.FZ}
            progress={scrollYProgress}
            index={0}
            onOpenPrefecture={() => setModalArtist("FZ")}
          />
          <ComparisonCard
            id="riize"
            data={DATA.RZ}
            color={COLORS.RZ}
            progress={scrollYProgress}
            index={1}
            onOpenPrefecture={() => setModalArtist("RZ")}
          />
          <ComparisonCard
            id="vaundy"
            data={DATA.VD}
            color={COLORS.VD}
            progress={scrollYProgress}
            index={2}
            onOpenPrefecture={() => setModalArtist("VD")}
          />
        </div>

        {modalArtist && (
          <PrefectureDetailModal
            data={PREFECTURE_MODAL_DATA[modalArtist]}
            onClose={() => setModalArtist(null)}
          />
        )}
      </div>
    </section>
  );
}