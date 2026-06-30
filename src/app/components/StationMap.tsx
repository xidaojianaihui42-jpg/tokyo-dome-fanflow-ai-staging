import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import tokyoDomeAerial from "../../imports/__.jpeg";

const IMAGE_W = 1536;
const IMAGE_H = 1024;

const STATIONS = [
  {
    id: "pin_suidobashi",
    name: "水道橋駅",
    x: 575,
    y: 330,
    color: "#FF6B35",
    delay: 0.3,
    line: "JR中央・総武線",
    walkMin: 5,
    walkM: 400,
  },
  {
    id: "pin_korakuen",
    name: "後楽園駅",
    x: 850,
    y: 390,
    color: "#4ECDC4",
    delay: 0.6,
    line: "東京メトロ 丸ノ内線・南北線",
    walkMin: 3,
    walkM: 250,
  },
  {
    id: "pin_kasuga",
    name: "春日駅",
    x: 1015,
    y: 215,
    color: "#60A5FA",
    delay: 0.9,
    line: "都営三田線・大江戸線",
    walkMin: 9,
    walkM: 700,
  },
  {
    id: "pin_hongo_sanchome",
    name: "本郷三丁目駅",
    x: 1095,
    y: 800,
    color: "#86EFAC",
    delay: 1.2,
    line: "東京メトロ丸ノ内線・都営大江戸線",
    walkMin: 13,
    walkM: 1050,
  },
];

const MAX_WALK = Math.max(...STATIONS.map((s) => s.walkM));

// ==========================================
// Station pin component
// ==========================================
function StationPin({
  station,
  pinsVisible,
}: {
  station: (typeof STATIONS)[0];
  pinsVisible: boolean;
}) {
  const xPct = (station.x / IMAGE_W) * 100;
  const yPct = (station.y / IMAGE_H) * 100;

  return (
    <div
      id={station.id}
      className="station-map__pin-anchor absolute"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: "translate(-12px, -36px)",
      }}
    >
      <motion.div
        className="station-map__pin-group relative"
        initial={{ y: -120, opacity: 0 }}
        animate={pinsVisible ? { y: 0, opacity: 1 } : { y: -120, opacity: 0 }}
        transition={{
          y: {
            type: "spring",
            damping: 9,
            stiffness: 200,
            mass: 0.65,
            delay: station.delay,
          },
          opacity: { duration: 0.01, delay: station.delay },
        }}
      >
        <svg
          className="station-map__pin-svg"
          width="24"
          height="36"
          viewBox="0 0 24 36"
          style={{
            filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.75)) drop-shadow(0 0 10px ${station.color}55)`,
          }}
        >
          <path
            d="M12 0 C5.4 0 0 5.4 0 12 C0 20 12 36 12 36 C12 36 24 20 24 12 C24 5.4 18.6 0 12 0Z"
            fill={station.color}
          />
          <circle cx="12" cy="11" r="5" fill="white" fillOpacity="0.95" />
          <circle cx="12" cy="11" r="2.5" fill={station.color} fillOpacity="0.5" />
        </svg>

        <div
          className="station-map__station-label absolute flex items-center gap-2 px-3 py-[5px] bg-white rounded-lg whitespace-nowrap"
          style={{
            left: "30px",
            top: "2px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="station-map__label-dot w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: station.color }}
          />
          <span className="station-map__label-name text-[#111] text-[12px] font-bold tracking-wide leading-none">
            {station.name}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// Walk-time timeline row
// ==========================================
function TimelineRow({
  station,
  index,
  isVisible,
}: {
  station: (typeof STATIONS)[0];
  index: number;
  isVisible: boolean;
}) {
  const barPct = (station.walkM / MAX_WALK) * 100;

  return (
    <motion.div
      className="station-map__timeline-row flex items-center gap-4 md:gap-6"
      initial={{ opacity: 0, x: -24 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
      transition={{
        duration: 0.55,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Station name col */}
      <div className="station-map__tl-name w-[130px] md:w-[170px] flex-shrink-0">
        <p
          className="station-map__tl-station-name text-[13px] md:text-[15px] font-bold tracking-wide leading-snug"
          style={{ color: station.color }}
        >
          {station.name}
        </p>
        <p className="station-map__tl-line text-[#666] text-[10px] tracking-wide leading-snug mt-0.5">
          {station.line}
        </p>
      </div>

      {/* Bar track */}
      <div className="station-map__tl-track flex-1 h-[3px] bg-white/10 rounded-full relative overflow-visible">
        <motion.div
          className="station-map__tl-bar absolute left-0 top-0 h-full rounded-full"
          style={{ backgroundColor: station.color }}
          initial={{ width: "0%" }}
          animate={isVisible ? { width: `${barPct}%` } : { width: "0%" }}
          transition={{
            duration: 0.8,
            delay: index * 0.12 + 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* glow tip */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              backgroundColor: station.color,
              boxShadow: `0 0 8px 2px ${station.color}`,
            }}
          />
        </motion.div>
      </div>

      {/* Time + distance col */}
      <div className="station-map__tl-meta flex-shrink-0 text-right w-[72px] md:w-[86px]">
        <p className="station-map__tl-time text-white text-[15px] md:text-[18px] font-bold font-mono leading-none">
          {station.walkMin}
          <span className="text-[10px] text-white/60 font-normal ml-0.5">分</span>
        </p>
        <p className="station-map__tl-distance text-[#666] text-[10px] font-mono leading-snug mt-0.5">
          {station.walkM}m
        </p>
      </div>
    </motion.div>
  );
}

// ==========================================
// Main component
// ==========================================
export function StationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Scene 1: pins appear when section hits viewport
  const [pinsVisible, setPinsVisible] = React.useState(false);
  const [timelineVisible, setTimelineVisible] = React.useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.05) setPinsVisible(true);
    if (v > 0.45) setTimelineVisible(true);
    else if (v < 0.35) setTimelineVisible(false);
  });

  // Scene 2 — overlay filter on the aerial photo
  const overlayOpacity = useTransform(
    scrollYProgress,
    [0.35, 0.58],
    [0, 1]
  );

  // Scene 2 — timeline panel fade
  const panelOpacity = useTransform(scrollYProgress, [0.42, 0.65], [0, 1]);
  const panelY = useTransform(scrollYProgress, [0.42, 0.65], [32, 0]);

  // Scene label (top-left eyebrow) opacity per scene
  const scene1LabelOpacity = useTransform(
    scrollYProgress,
    [0.0, 0.08, 0.38, 0.48],
    [0, 1, 1, 0]
  );
  const scene2LabelOpacity = useTransform(
    scrollYProgress,
    [0.42, 0.55],
    [0, 1]
  );

  return (
    <section
      ref={containerRef}
      className="section-station-map relative bg-[#050505]"
      style={{ height: "220vh" }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">

        {/* ── Background: aerial photo (always shown) ── */}
        <div className="station-map__bg absolute inset-0">
          <img
            src={tokyoDomeAerial}
            alt="東京ドーム周辺航空写真"
            className="station-map__aerial-photo w-full h-full object-cover"
          />

          {/* Base vignette (scene 1) */}
          <div
            className="station-map__vignette absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 42% 55%, transparent 30%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {/* Scene 2 overlay — dark filter for readability */}
          <motion.div
            className="station-map__scene2-overlay absolute inset-0 pointer-events-none"
            style={{ opacity: overlayOpacity }}
          >
            {/* Deep dark base */}
            <div className="absolute inset-0 bg-[#050505]/70" />
            {/* Left-side gradient to give the timeline panel a clean bg */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(105deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.75) 45%, rgba(5,5,5,0.0) 75%)",
              }}
            />
            {/* Subtle cool tint to desaturate the photo */}
            <div className="absolute inset-0 bg-[#0a0f1e]/30 mix-blend-multiply" />
          </motion.div>
        </div>

        {/* ── Station pins (both scenes) ── */}
        <div className="station-map__pins-layer absolute inset-0 pointer-events-none">
          {/* Aspect-ratio wrapper matching image coords */}
          <div
            className="absolute"
            style={{
              /* Fill the viewport; coordinate system is 1536×1024 mapped to viewport */
              inset: 0,
            }}
          >
            {/* Inner frame scaled to maintain 1536:1024 within the viewport */}
            <div
              className="relative w-full h-full"
              style={{ position: "relative" }}
            >
              {STATIONS.map((station) => (
                <StationPin
                  key={station.id}
                  station={station}
                  pinsVisible={pinsVisible}
                />
              ))}

              {/* Tokyo Dome badge */}
              <div
                className="station-map__dome-badge absolute flex items-center gap-2 px-3 py-2 rounded-lg pointer-events-none"
                style={{
                  left: "36%",
                  top: "54%",
                  background: "rgba(5,5,5,0.72)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[11px] font-bold tracking-[0.18em]">
                  東京ドーム
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Scene 1 label ── */}
        <motion.div
          className="station-map__scene1-ui absolute top-8 left-8 md:top-12 md:left-14 z-20"
          style={{ opacity: scene1LabelOpacity }}
        >
          <p className="text-[#666] text-[10px] tracking-[0.42em] font-mono mb-2 uppercase">
            Section 03 — Access
          </p>
          <h2 className="text-white text-2xl md:text-4xl tracking-[0.08em] leading-tight">
            東京ドームへの<br />アクセス
          </h2>
          <p className="text-[#888] text-xs tracking-[0.15em] mt-3 leading-relaxed">
            4つの主要駅から徒歩圏内
          </p>
        </motion.div>

        {/* ── Scene 2: timeline panel ── */}
        <motion.div
          className="station-map__timeline-panel absolute left-0 top-0 bottom-0 z-30 flex flex-col justify-center px-8 md:px-14 pointer-events-none"
          style={{
            opacity: panelOpacity,
            y: panelY,
            width: "min(520px, 55vw)",
          }}
        >
          {/* Scene 2 eyebrow */}
          <motion.p
            className="station-map__tl-eyebrow text-[#555] text-[10px] tracking-[0.42em] font-mono mb-6 uppercase"
            style={{ opacity: scene2LabelOpacity }}
          >
            徒歩アクセス — Walk Time
          </motion.p>

          {/* Section heading */}
          <h3 className="station-map__tl-heading text-white text-2xl md:text-3xl tracking-[0.08em] mb-2 leading-tight">
            最寄り駅から<br />
            <span className="text-white/50">東京ドームまで</span>
          </h3>
          <p className="station-map__tl-subheading text-[#666] text-[11px] tracking-[0.15em] mb-10">
            徒歩所要時間・距離の比較
          </p>

          {/* Timeline rows */}
          <div className="station-map__timeline-rows flex flex-col gap-7">
            {STATIONS.sort((a, b) => a.walkMin - b.walkMin).map(
              (station, i) => (
                <TimelineRow
                  key={station.id}
                  station={station}
                  index={i}
                  isVisible={timelineVisible}
                />
              )
            )}
          </div>

          {/* Axis label */}
          <div className="station-map__tl-axis flex items-center gap-2 mt-8">
            <div className="flex-1 h-px bg-white/10" />
            <p className="text-[#555] text-[9px] tracking-[0.3em] font-mono">
              ← 近い　　　　遠い →
            </p>
          </div>

          {/* Footnote */}
          <p className="station-map__tl-note text-[#444] text-[9px] tracking-[0.18em] font-mono mt-4">
            ※ 所要時間は目安です / 混雑状況により異なる場合があります
          </p>
        </motion.div>

      </div>
    </section>
  );
}
