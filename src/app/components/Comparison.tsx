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
import { useLogoVisibility } from "./LogoVisibilityContext";

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
    peakArrival: 2,
    prefectures: 30,
    genderF: 51,
    genderM: 49,
    arrivalType: "早めの来場型",
    arrivalTrend: [1.8, 1.5, 6.1, 9.7, 4.8, 22.4, 23.8, 14.4, 15.5],
  },
  RZ: {
    artist: "RIIZE",
    peakArrival: 1,
    prefectures: 28,
    genderF: 81,
    genderM: 19,
    arrivalType: "中間型",
    arrivalTrend: [1.8, 7.0, 0.9, 4.8, 3.5, 9.6, 12.7, 36.0, 23.7],
  },
  VD: {
    artist: "Vaundy",
    peakArrival: 1,
    prefectures: 34,
    genderF: 73,
    genderM: 27,
    arrivalType: "直前集中型",
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

function StaticGenderBar({ f, color }: { f: number; color: string }) {
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
      <div className="h-full rounded-l-full" style={{ width: `${f}%`, backgroundColor: color }} />
      <div className="h-full bg-white flex-1 rounded-r-full" />
    </div>
  );
}

function MobileArrivalStackedBar({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const total = values.reduce((sum, value) => sum + value, 0);
  const peak = Math.max(...values);

  return (
    <div className="comparison__mobile-arrival-bar w-full">
      <div className="flex w-full h-[10px] rounded-full overflow-hidden bg-white/10 gap-px">
        {values.map((value, index) => {
          const widthPct = total > 0 ? (value / total) * 100 : 0;
          const isPeak = value === peak && value > 0;
          const tone = peak > 0 ? 0.32 + (value / peak) * 0.58 : 0.32;

          return (
            <div
              key={index}
              className="h-full shrink-0"
              style={{
                width: `${widthPct}%`,
                backgroundColor: withAlpha(color, isPeak ? 1 : tone),
                boxShadow: isPeak ? `0 0 8px ${withAlpha(color, 0.45)}` : undefined,
              }}
              aria-hidden="true"
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-mono text-white/45 tracking-wide">
        <span>8h前</span>
        <span>開演</span>
      </div>
    </div>
  );
}

function MobileComparisonCard({
  id,
  data,
  color,
  onOpenPrefecture,
}: {
  id: string;
  data: typeof DATA.FZ;
  color: string;
  onOpenPrefecture: () => void;
}) {
  return (
    <div
      className={`comparison__mobile-card--${id} w-[calc(100vw-40px)] max-w-[390px] min-h-[220px] max-h-[270px] rounded-[22px] px-5 py-4 bg-gradient-to-br from-white/[0.08] to-white/[0.01] backdrop-blur-2xl border border-white/20 border-b-white/5 border-r-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] relative overflow-hidden`}
    >
      <div
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[50px] opacity-30 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-start justify-between gap-3 mb-3">
        <h3
          className={`comparison__mobile-artist-name--${id} text-[17px] font-bold tracking-[0.08em] leading-tight`}
          style={{ color }}
        >
          {data.artist}
        </h3>
        <button
          type="button"
          onClick={onOpenPrefecture}
          aria-label={`${data.artist}の来訪都道府県地図を見る`}
          className={`comparison__mobile-map-link--${id} shrink-0 text-[11px] font-semibold rounded-full px-2.5 py-1 border transition-all duration-200 active:brightness-110`}
          style={{
            color,
            backgroundColor: withAlpha(color, 0.12),
            borderColor: withAlpha(color, 0.3),
            boxShadow: `0 0 10px ${withAlpha(color, 0.25)}`,
          }}
        >
          地図で見る →
        </button>
      </div>

      <div className={`comparison__mobile-prefecture--${id} mb-3`}>
        <p className="text-[11px] text-[#888] font-mono mb-1 tracking-wide">来訪都道府県</p>
        <p className="text-[22px] font-light text-white/90 font-mono tracking-wide leading-none">
          {data.prefectures} / 47都道府県
        </p>
      </div>

      <div className={`comparison__mobile-gender-ratio--${id}`}>
        <div className="text-[11px] font-mono mb-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="text-[#888]">男女比</span>
          <span className="text-white/90">
            女性 {data.genderF}%
            <span className="text-white/35 mx-1.5">/</span>
            男性 {data.genderM}%
          </span>
        </div>
        <StaticGenderBar f={data.genderF} color={color} />
      </div>

      <div className={`comparison__mobile-arrival--${id} mt-4`}>
        <div className="text-[11px] font-mono mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-[#888]">来場時間</span>
          <span className="font-semibold tracking-wide" style={{ color }}>
            {data.arrivalType}
          </span>
        </div>
        <MobileArrivalStackedBar values={data.arrivalTrend} color={color} />
      </div>
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
  const startY = 0.12 + index * 0.05;
  const endY = 0.28 + index * 0.05;

  const y = useTransform(progress, [startY, endY], [100, 0]);
  const opacity = useTransform(progress, (p: number) => {
    if (p <= startY) return 0;
    if (p >= endY) return 1;
    return (p - startY) / (endY - startY);
  });
  const scale = useTransform(progress, [startY, endY], [0.8, 1]);

  const endXOffset = index === 0 ? 50 : index === 2 ? -50 : 0;
  const x = useTransform(progress, [0.88, 1], [0, endXOffset]);

  const floatY = useTransform(progress, (p: number) => {
    if (p < 0.75 || p > 0.92) return 0;
    const t = (p - 0.75) / 0.17;
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
  const { setModalOpen } = useLogoVisibility();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    setModalOpen(modalArtist !== null);
    return () => setModalOpen(false);
  }, [modalArtist, setModalOpen]);

  const titleOpacity = useTransform(scrollYProgress, [0, 0.10, 0.85, 0.95, 1], [0, 1, 1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.10, 0.85, 1], [30, 0, 0, -20]);

  return (
    <section ref={containerRef} className="section-comparison relative h-[360vh] md:h-[280vh] bg-[#050505]" style={{ position: "relative" }}>
      <div className="comparison__background sticky top-0 w-full h-[100vh] overflow-y-auto md:overflow-hidden flex flex-col items-center px-4 pt-[120px] pb-8 md:pt-0 md:pb-0 md:justify-center bg-[#050505]">
        <div className="comparison__map-overlay absolute inset-0 bg-gradient-to-b from-[#050505] via-[#030303] to-[#000000] pointer-events-none" />

        <motion.div className="text-center mb-6 md:mb-12 z-20 shrink-0" style={{ opacity: titleOpacity, y: titleY }}>
          <h2 className="comparison__section-title text-2xl md:text-5xl text-white font-bold tracking-[0.1em] mb-3 md:mb-6">
            3つのライブ、3つの人流
          </h2>
          <p className="comparison__section-copy text-[#a0a0a0] text-sm md:text-xl tracking-[0.08em] md:tracking-[0.1em] leading-relaxed max-w-[340px] md:max-w-none mx-auto">
            同じ東京ドームのライブでも、<br className="md:hidden" />
            どこから来るか、来る時間、来る人は違っていた。
          </p>
        </motion.div>

        <div className="hidden md:flex comparison__card-container w-full max-w-[1200px] flex-row gap-8 justify-center items-center z-10 px-4 perspective-[1000px]">
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

        <div className="md:hidden comparison__mobile-card-container w-full flex flex-col items-center gap-5 z-10">
          <MobileComparisonCard
            id="fruits-zipper"
            data={DATA.FZ}
            color={COLORS.FZ}
            onOpenPrefecture={() => setModalArtist("FZ")}
          />
          <MobileComparisonCard
            id="riize"
            data={DATA.RZ}
            color={COLORS.RZ}
            onOpenPrefecture={() => setModalArtist("RZ")}
          />
          <MobileComparisonCard
            id="vaundy"
            data={DATA.VD}
            color={COLORS.VD}
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