import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import tokyoDomeMapNorth from "../../imports/tokyo-dome-map-north.jpeg";

const MAP_BASE_SIZE = { width: 2881, height: 1921 };
const TOKYO_DOME_POINT = {
  x: 1585 / MAP_BASE_SIZE.width,
  y: 884 / MAP_BASE_SIZE.height,
};
const MAP_OBJECT_POSITION = `center ${Math.round(TOKYO_DOME_POINT.y * 100)}%`;

const STATIONS = [
  {
    id: "pin_korakuen",
    name: "後楽園駅",
    x: 1325,
    y: 730,
    color: "#4ECDC4",
    delay: 0.3,
  },
  {
    id: "pin_kasuga",
    name: "春日駅",
    x: 1412,
    y: 634,
    color: "#60A5FA",
    delay: 0.6,
  },
  {
    id: "pin_suidobashi",
    name: "水道橋駅",
    x: 1527,
    y: 1345,
    color: "#FF6B35",
    delay: 0.9,
  },
  {
    id: "pin_hongo_sanchome",
    name: "本郷三丁目駅",
    x: 2535,
    y: 884,
    color: "#86EFAC",
    delay: 1.2,
  },
];

function StationPin({
  station,
  pinsVisible,
}: {
  station: (typeof STATIONS)[0];
  pinsVisible: boolean;
}) {
  const xPct = (station.x / MAP_BASE_SIZE.width) * 100;
  const yPct = (station.y / MAP_BASE_SIZE.height) * 100;

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

export function StationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [pinsVisible, setPinsVisible] = React.useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.05) setPinsVisible(true);
  });

  const scene1LabelOpacity = useTransform(
    scrollYProgress,
    [0.0, 0.08, 0.72, 0.82],
    [0, 1, 1, 0]
  );

  return (
    <section
      ref={containerRef}
      className="section-station-map relative bg-[#050505]"
      style={{ height: "160vh" }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <div className="station-map__bg absolute inset-0 overflow-hidden">
          <img
            src={tokyoDomeMapNorth}
            alt="東京ドーム周辺航空写真"
            className="station-map__aerial-photo absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: MAP_OBJECT_POSITION }}
          />

          <div
            className="station-map__vignette absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at ${TOKYO_DOME_POINT.x * 100}% ${TOKYO_DOME_POINT.y * 100}%, transparent 28%, rgba(0,0,0,0.55) 100%)`,
            }}
          />

          <div
            className="station-map__dome-center-glow absolute pointer-events-none"
            style={{
              left: `${TOKYO_DOME_POINT.x * 100}%`,
              top: `${TOKYO_DOME_POINT.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: 160,
                height: 160,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle, rgba(0,209,255,0.22) 0%, rgba(0,209,255,0.08) 38%, transparent 72%)",
                filter: "blur(10px)",
              }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 64,
                height: 64,
                left: "50%",
                top: "50%",
                marginLeft: -32,
                marginTop: -32,
                boxShadow:
                  "0 0 36px rgba(0,209,255,0.4), 0 0 72px rgba(0,209,255,0.18)",
                border: "1px solid rgba(0,209,255,0.28)",
              }}
              animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 12,
                height: 12,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,209,255,0.42)",
                boxShadow:
                  "0 0 14px rgba(0,209,255,0.5), 0 0 28px rgba(0,209,255,0.22)",
              }}
            />
          </div>
        </div>

        <div className="station-map__pins-layer absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            {STATIONS.map((station) => (
              <StationPin
                key={station.id}
                station={station}
                pinsVisible={pinsVisible}
              />
            ))}

            <div
              className="station-map__dome-badge absolute flex items-center gap-2 px-3 py-2 rounded-lg pointer-events-none"
              style={{
                left: `${TOKYO_DOME_POINT.x * 100}%`,
                top: `${TOKYO_DOME_POINT.y * 100}%`,
                transform: "translate(-50%, -120%)",
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
      </div>
    </section>
  );
}
