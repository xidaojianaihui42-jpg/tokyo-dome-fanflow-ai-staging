import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, animate, AnimatePresence } from "motion/react";
import japanMapImage from "../../imports/map_all.png";
import tokyoDomeMapNorth from "../../imports/tokyo-dome-map-north.jpeg";

const MAP_BASE_SIZE = { width: 2881, height: 1921 };
const TOKYO_DOME_POINT = {
  x: 1585 / MAP_BASE_SIZE.width,
  y: 884 / MAP_BASE_SIZE.height,
};
const MAP_OBJECT_POSITION = `center ${Math.round(TOKYO_DOME_POINT.y * 100)}%`;

const TOKYO_DOME = { x: 530, y: 623 };

const KANTO = ["東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県"];

const REGION_COLORS: Record<string, string> = {
  "北海道": "#A855F7",
  "青森": "#3B82F6", "岩手": "#3B82F6", "宮城": "#3B82F6", "秋田": "#3B82F6", "山形": "#3B82F6", "福島": "#3B82F6",
  "茨城": "#22C55E", "栃木": "#22C55E", "群馬": "#22C55E", "埼玉": "#22C55E", "千葉": "#22C55E", "東京": "#22C55E", "神奈川": "#22C55E",
  "新潟": "#84CC16", "富山": "#84CC16", "石川": "#84CC16", "福井": "#84CC16", "山梨": "#84CC16", "長野": "#84CC16", "岐阜": "#84CC16", "静岡": "#84CC16", "愛知": "#84CC16",
  "三重": "#F97316", "滋賀": "#F97316", "京都": "#F97316", "大阪": "#F97316", "兵庫": "#F97316", "奈良": "#F97316", "和歌山": "#F97316",
  "鳥取": "#EAB308", "島根": "#EAB308", "岡山": "#EAB308", "広島": "#EAB308", "山口": "#EAB308",
  "徳島": "#D946EF", "香川": "#D946EF", "愛媛": "#D946EF", "高知": "#D946EF",
  "福岡": "#EC4899", "佐賀": "#EC4899", "長崎": "#EC4899", "熊本": "#EC4899", "大分": "#EC4899", "宮崎": "#EC4899", "鹿児島": "#EC4899", "沖縄": "#EC4899"
};

function getPrefColor(prefName: string, fallback: string) {
  return REGION_COLORS[prefName] || fallback;
}

const RANKING_HIGHLIGHT_PREFS = {
  FZ: ["愛知県", "兵庫県", "大阪府", "静岡県", "茨城県", "三重県"],
  RZ: ["兵庫県", "大阪府", "宮城県", "福岡県", "茨城県", "愛知県"],
  VD: ["茨城県", "愛知県", "静岡県", "栃木県", "群馬県", "新潟県"],
} as const;

const RANKING_DATA = {
  FZ: {
    artist: "FRUITS ZIPPER",
    color: "#00D1FF",
    text: "首都圏に加えて、中部・関西からも",
    kantoRatio: 62,
    highlightPrefectures: RANKING_HIGHLIGHT_PREFS.FZ,
    items: [
      { pref: "東京都", val: 27.9 },
      { pref: "埼玉県", val: 12.0 },
      { pref: "千葉県", val: 11.1 },
      { pref: "神奈川県", val: 11.0 },
      { pref: "愛知県", val: 5.7 },
      { pref: "兵庫県", val: 3.7 },
      { pref: "大阪府", val: 3.2 },
      { pref: "静岡県", val: 2.3 },
      { pref: "茨城県", val: 2.2 },
      { pref: "三重県", val: 2.1 }
    ]
  },
  RZ: {
    artist: "RIIZE",
    color: "#FF4EDB",
    text: "兵庫・大阪・宮城・福岡から来た人も",
    kantoRatio: 65.7,
    liveDateNote: "※ライブは2026年2月21日、22日。データは2026年2月21日のもの",
    highlightPrefectures: RANKING_HIGHLIGHT_PREFS.RZ,
    items: [
      { pref: "東京都", val: 42.2 },
      { pref: "神奈川県", val: 14.7 },
      { pref: "兵庫県", val: 6.6 },
      { pref: "埼玉県", val: 5.3 },
      { pref: "愛知県", val: 3.7 },
      { pref: "大阪府", val: 3.6 },
      { pref: "千葉県", val: 3.6 },
      { pref: "宮城県", val: 2.5 },
      { pref: "茨城県", val: 2.3 },
      { pref: "福岡県", val: 1.8 }
    ]
  },
  VD: {
    artist: "Vaundy",
    color: "#A6FF4D",
    text: "全国ツアーのためか首都圏集中型に",
    kantoRatio: 79,
    liveDateNote: "※ライブは2026年2月14日、15日。データは2026年2月14日のもの",
    highlightPrefectures: RANKING_HIGHLIGHT_PREFS.VD,
    items: [
      { pref: "東京都", val: 41.0 },
      { pref: "神奈川県", val: 17.0 },
      { pref: "埼玉県", val: 11.1 },
      { pref: "千葉県", val: 9.9 },
      { pref: "茨城県", val: 2.8 },
      { pref: "静岡県", val: 2.6 },
      { pref: "愛知県", val: 1.8 },
      { pref: "新潟県", val: 1.4 },
      { pref: "栃木県", val: 1.4 },
      { pref: "群馬県", val: 1.4 }
    ]
  }
};

const KANTO_RATIO_COMPARISON = [
  { name: "FRUITS ZIPPER", color: "#00D1FF", kanto: 62, outside: 38 },
  { name: "RIIZE", color: "#FF4EDB", kanto: 65.7, outside: 34.3 },
  { name: "Vaundy", color: "#A6FF4D", kanto: 79, outside: 21 },
] as const;

function KantoRatioBar({
  color,
  kanto,
  delay,
}: {
  color: string;
  kanto: number;
  delay: number;
}) {
  return (
    <div className="relative h-2.5 md:h-3.5 rounded-full overflow-hidden bg-white/20">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}70`,
        }}
        initial={{ width: "0%" }}
        animate={{ width: `${kanto}%` }}
        transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

const PREF_COORDS: Record<string, { x: number; y: number }> = {
  "東京都": { x: TOKYO_DOME.x, y: TOKYO_DOME.y },
  "神奈川県": { x: 523, y: 639 },
  "埼玉県": { x: 523, y: 606 },
  "千葉県": { x: 563, y: 628 },
  "茨城県": { x: 565, y: 595 },
  "栃木県": { x: 543, y: 574 },
  "群馬県": { x: 507, y: 582 },
  "愛知県": { x: 435, y: 656 },
  "静岡県": { x: 475, y: 657 },
  "三重県": { x: 404, y: 682 },
  "大阪府": { x: 365, y: 678 },
  "兵庫県": { x: 336, y: 655 },
  "宮城県": { x: 593, y: 479 },
  "福岡県": { x: 166, y: 727 },
  "新潟県": { x: 510, y: 528 }
};

function toPrefColorKey(pref: string) {
  if (pref === "東京都") return "東京";
  if (pref === "北海道") return "北海道";
  return pref.replace(/[都府県]$/, "");
}

function buildFlowPoints(items: { pref: string; val: number }[]) {
  return items
    .filter((item) => item.pref !== "東京都")
    .flatMap((item) => {
      const coord = PREF_COORDS[item.pref];
      if (!coord) return [];

      return [{
        x: coord.x,
        y: coord.y,
        name: toPrefColorKey(item.pref),
        weight: item.val
      }];
    });
}

const FZ_FLOW_POINTS = buildFlowPoints(RANKING_DATA.FZ.items);
const RIIZE_FLOW_POINTS = buildFlowPoints(RANKING_DATA.RZ.items);
const VAUNDY_FLOW_POINTS = buildFlowPoints(RANKING_DATA.VD.items);

function AnimatedValue({ value, isVisible, delay }: { value: number; isVisible: boolean; delay: number }) {
  const [display, setDisplay] = React.useState("0.0");

  React.useEffect(() => {
    if (isVisible) {
      const controls = animate(0, value, {
        duration: 1,
        delay,
        ease: "easeOut",
        onUpdate: (v) => setDisplay(v.toFixed(1))
      });
      return controls.stop;
    } else {
      setDisplay("0.0");
    }
  }, [isVisible, value, delay]);

  return <span>{display}%</span>;
}

function InsightCardContent({ id, data }: { id: string; data: typeof RANKING_DATA.FZ }) {
  const maxVal = data.items[0].val;

  return (
    <motion.div
      className={`prefecture-map__insight-card--${id.toLowerCase()} p-5 md:p-6 flex flex-col h-full`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="prefecture-map__card-header mb-3 md:mb-4">
        <div className="prefecture-map__card-label text-[9px] text-white/70 tracking-widest mb-1 font-mono drop-shadow-md">
          LIVE FAN RESIDENCE
        </div>
        <div
          className="prefecture-map__card-artist-name text-xl md:text-2xl font-bold tracking-wider mb-1"
          style={{ color: data.color, textShadow: `0 0 15px ${data.color}80` }}
        >
          {data.artist}
        </div>
        <div className="text-[10px] md:text-xs text-white/90 drop-shadow-sm">来場者の居住地 TOP10</div>
      </div>

      <div className="prefecture-map__ranking-list flex flex-col gap-1.5 md:gap-2 mb-3 md:mb-4">
        {data.items.map((item, i) => {
          const isHighlighted = data.highlightPrefectures.includes(item.pref);

          return (
            <div
              key={item.pref}
              className={`prefecture-map__ranking-item--${(i + 1).toString().padStart(2, "0")} relative flex items-center justify-between text-[10px] md:text-xs`}
            >
              <div className="flex items-center gap-2 w-[70px] md:w-[80px]">
                <span className="prefecture-map__ranking-rank font-mono text-white/60 text-[9px] md:text-[10px] w-4 text-right">
                  {i + 1}
                </span>
                <span
                  className={`prefecture-map__ranking-prefecture ${isHighlighted ? "prefecture-map__highlight-prefecture font-bold" : "text-white/90"}`}
                  style={{
                    color: isHighlighted ? data.color : undefined,
                    textShadow: isHighlighted ? `0 0 8px ${data.color}60` : undefined
                  }}
                >
                  {item.pref}
                </span>
              </div>

              <div className="flex-1 mx-2 h-1 bg-black/20 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <motion.div
                  className="prefecture-map__ranking-bar h-full rounded-full"
                  style={{ backgroundColor: data.color, boxShadow: `0 0 8px ${data.color}` }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${(item.val / maxVal) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.05 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              <div className="prefecture-map__ranking-value font-mono text-[9px] md:text-[10px] w-8 md:w-10 text-right text-white font-medium drop-shadow-md">
                <AnimatedValue value={item.val} isVisible={true} delay={i * 0.05 + 0.2} />
              </div>
            </div>
          );
        })}
      </div>

      {"liveDateNote" in data && data.liveDateNote ? (
        <p className="prefecture-map__live-date-note text-[9px] md:text-[10px] text-white/45 tracking-wide leading-relaxed mt-1">
          {data.liveDateNote}
        </p>
      ) : null}
    </motion.div>
  );
}

function MapPulseMarker({
  coord,
  rank,
  isKanto,
  color,
  delay
}: {
  coord: { x: number; y: number };
  rank: number;
  isKanto: boolean;
  color: string;
  delay: number;
}) {
  const baseScale = Math.max(0.5, 1.5 - rank * 0.08);
  const baseOpacity = Math.max(0.35, 1 - rank * 0.07);
  const duration = isKanto ? 2 : 3.4;

  return (
    <motion.g>
      <motion.circle
        cx={coord.x}
        cy={coord.y}
        r={baseScale * 14}
        fill={color}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [baseOpacity * 0.16, baseOpacity * 0.52, baseOpacity * 0.16],
          scale: [0.9, 1.55, 0.9]
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }}
        style={{ filter: `blur(${isKanto ? 5 : 8}px)` }}
      />

      <motion.circle
        cx={coord.x}
        cy={coord.y}
        r={Math.max(4, baseScale * 4.5)}
        fill={color}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [baseOpacity * 0.45, baseOpacity, baseOpacity * 0.45],
          scale: [0.9, 1.25, 0.9]
        }}
        transition={{
          duration: isKanto ? 1.8 : 2.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }}
        style={{ filter: `drop-shadow(0 0 12px ${color})` }}
      />
    </motion.g>
  );
}

const FlowLine = ({
  start,
  end,
  color,
  weight = 1,
  className,
  particleClassName
}: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  color: string;
  weight?: number;
  className?: string;
  particleClassName?: string;
}) => {
  const cx = (start.x + end.x) / 2 - (start.y - end.y) * 0.2;
  const cy = (start.y + end.y) / 2 + (start.x - end.x) * 0.2;
  const d = `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;

  const id = React.useId();
  const strokeW = Math.max(1.4, weight * 0.5);
  const motionDuration = React.useMemo(() => 2.0 + Math.random() * 0.7, []);
  const motionDelay = React.useMemo(() => Math.random() * 1.6, []);

  return (
    <g>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <path
        d={d}
        fill="none"
        stroke={`url(#grad-${id})`}
        strokeWidth={strokeW}
        strokeLinecap="round"
        className={className}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />

      <g
        className={particleClassName}
        style={{ filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 20px ${color})` }}
      >
        <animateMotion
          path={d}
          dur={`${motionDuration}s`}
          begin={`${motionDelay}s`}
          repeatCount="indefinite"
          rotate="0"
          calcMode="spline"
          keyTimes="0;1"
          keySplines="0.42 0 0.58 1"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.14;0.86;1"
          dur={`${motionDuration}s`}
          begin={`${motionDelay}s`}
          repeatCount="indefinite"
        />

        <g className="prefecture-map__flow-person" transform="scale(1.45)">
          <circle
            className="prefecture-map__flow-person-head"
            cx="0"
            cy="-5"
            r={Math.max(2.8, strokeW * 0.9)}
            fill={color}
          />
          <path
            className="prefecture-map__flow-person-body"
            d="M 0 -1 L 0 8 M -5 3 L 5 3 M 0 8 L -4 15 M 0 8 L 4 15"
            fill="none"
            stroke={color}
            strokeWidth={Math.max(1.9, strokeW * 0.6)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </g>
  );
};

export function PrefectureMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [activeArtist, setActiveArtist] = React.useState<"FZ" | "RZ" | "VD" | null>(null);
  const [isCompareVisible, setIsCompareVisible] = React.useState(false);
  const [isMobileLayout, setIsMobileLayout] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (event: MediaQueryListEvent) => setIsMobileLayout(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.15 && v < 0.33) setActiveArtist("FZ");
    else if (v >= 0.33 && v < 0.50) setActiveArtist("RZ");
    else if (v >= 0.50 && v < 0.68) setActiveArtist("VD");
    else setActiveArtist(null);

    setIsCompareVisible(v >= 0.66 && v < 0.85);
  });

  const introOpacity = useTransform(scrollYProgress, [0.02, 0.08, 0.12, 0.18], [0, 1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0.02, 0.08], [20, 0]);

  const fzOpacity = useTransform(scrollYProgress, [0.15, 0.20, 0.30, 0.35], [0, 1, 1, 0]);
  const fzY = useTransform(scrollYProgress, [0.15, 0.20], [20, 0]);

  const riizeOpacity = useTransform(scrollYProgress, [0.32, 0.37, 0.47, 0.52], [0, 1, 1, 0]);
  const riizeY = useTransform(scrollYProgress, [0.32, 0.37], [20, 0]);

  const vaundyOpacity = useTransform(scrollYProgress, [0.49, 0.54, 0.64, 0.69], [0, 1, 1, 0]);
  const vaundyY = useTransform(scrollYProgress, [0.49, 0.54], [20, 0]);

  const compareOpacity = useTransform(scrollYProgress, [0.66, 0.70, 0.82, 0.85], [0, 1, 1, 0]);

  const mapScale = useTransform(scrollYProgress, [0.82, 1], [1, 15]);
  const mapOriginX = useTransform(scrollYProgress, [0.82, 1], ["50%", "61.5%"]);
  const mapOriginY = useTransform(scrollYProgress, [0.82, 1], ["50%", "58.5%"]);

  const mapOpacity = useTransform(scrollYProgress, [0.86, 0.93], [1, 0]);
  const domeBgOpacity = useTransform(scrollYProgress, [0.88, 0.95], [0, 0.6]);
  const domeBgScale = useTransform(scrollYProgress, [0.88, 1], [1.1, 1]);

  const zoomTextOpacity = useTransform(scrollYProgress, [0.88, 0.95], [0, 1]);

  const isCardVisible = activeArtist !== null;
  const spCompareLayout = isCompareVisible && isMobileLayout;

  return (
    <section ref={containerRef} className="section-prefecture-map h-[500vh] relative bg-[#050505]" style={{ position: "relative" }}>
      <div
        className={`sticky top-0 w-full h-[100vh] overflow-hidden flex flex-col items-center md:block md:pt-0 md:pb-0 ${
          spCompareLayout ? "justify-center py-3" : "justify-start pt-10 pb-2"
        }`}
      >
        <div className="prefecture-map__background absolute inset-0 bg-[#050505]" />

        <motion.div
          className={`prefecture-map__camera-zoom relative flex w-full shrink-0 items-center justify-center pointer-events-none mt-1 md:absolute md:inset-0 md:mt-0 md:h-auto md:max-h-none md:min-h-0 md:justify-start md:pl-[5%] ${
            spCompareLayout
              ? "h-[min(34vh,260px)] min-h-[220px] max-h-[260px]"
              : "h-[min(40vh,360px)] min-h-[280px] max-h-[360px]"
          }`}
          style={{
            scale: mapScale,
            transformOrigin: useTransform(() => `${mapOriginX.get()} ${mapOriginY.get()}`),
            opacity: mapOpacity
          }}
        >
          <div className="relative w-[88vw] max-w-[400px] aspect-square opacity-95 md:w-[64vw] md:max-w-[980px] md:opacity-90">
            <div className="relative w-full h-full">
              <img
                src={japanMapImage}
                alt="日本地図"
                className="prefecture-map__japan-map-image w-full h-full object-contain opacity-[0.55] saturate-[0.75] brightness-[1.05] contrast-[0.9] drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]"
              />

              <div className="absolute inset-0 bg-[#050505]/12 pointer-events-none" />

              <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full prefecture-map__japan-map">
                <g className="prefecture-map__flow-layer">
                  <motion.g style={{ opacity: fzOpacity }}>
                    {FZ_FLOW_POINTS.map((p, i) => (
                      <FlowLine
                        key={`fz-${i}`}
                        start={p}
                        end={TOKYO_DOME}
                        color={getPrefColor(p.name, "#00D1FF")}
                        weight={p.weight}
                        className="prefecture-map__flow-line--fruits-zipper"
                        particleClassName="prefecture-map__particles--fruits-zipper"
                      />
                    ))}
                    {FZ_FLOW_POINTS.map((p, i) => (
                      <circle
                        key={`fz-p-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        className="prefecture-map__source-points--fruits-zipper"
                        fill={getPrefColor(p.name, "#00D1FF")}
                        style={{ filter: `drop-shadow(0 0 8px ${getPrefColor(p.name, "#00D1FF")})` }}
                      />
                    ))}
                  </motion.g>

                  <motion.g style={{ opacity: riizeOpacity }}>
                    {RIIZE_FLOW_POINTS.map((p, i) => (
                      <FlowLine
                        key={`riize-${i}`}
                        start={p}
                        end={TOKYO_DOME}
                        color={getPrefColor(p.name, "#FF4EDB")}
                        weight={p.weight}
                        className="prefecture-map__flow-line--riize"
                        particleClassName="prefecture-map__particles--riize"
                      />
                    ))}
                    {RIIZE_FLOW_POINTS.map((p, i) => (
                      <circle
                        key={`riize-p-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill={getPrefColor(p.name, "#FF4EDB")}
                        style={{ filter: `drop-shadow(0 0 8px ${getPrefColor(p.name, "#FF4EDB")})` }}
                      />
                    ))}
                  </motion.g>

                  <motion.g style={{ opacity: vaundyOpacity }}>
                    {VAUNDY_FLOW_POINTS.map((p, i) => (
                      <FlowLine
                        key={`vaundy-${i}`}
                        start={p}
                        end={TOKYO_DOME}
                        color={getPrefColor(p.name, "#A6FF4D")}
                        weight={p.weight}
                        className="prefecture-map__flow-line--vaundy"
                        particleClassName="prefecture-map__particles--vaundy"
                      />
                    ))}
                    {VAUNDY_FLOW_POINTS.map((p, i) => (
                      <circle
                        key={`vaundy-p-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill={getPrefColor(p.name, "#A6FF4D")}
                        style={{ filter: `drop-shadow(0 0 8px ${getPrefColor(p.name, "#A6FF4D")})` }}
                      />
                    ))}
                  </motion.g>

                  <motion.g style={{ opacity: compareOpacity }}>
                    {FZ_FLOW_POINTS.map((p, i) => (
                      <FlowLine key={`c-fz-${i}`} start={p} end={TOKYO_DOME} color="#00D1FF" weight={p.weight} />
                    ))}
                    {RIIZE_FLOW_POINTS.map((p, i) => (
                      <FlowLine key={`c-rz-${i}`} start={p} end={TOKYO_DOME} color="#FF4EDB" weight={p.weight} />
                    ))}
                    {VAUNDY_FLOW_POINTS.map((p, i) => (
                      <FlowLine key={`c-vd-${i}`} start={p} end={TOKYO_DOME} color="#A6FF4D" weight={p.weight} />
                    ))}
                  </motion.g>

                  <AnimatePresence>
                    {activeArtist && (
                      <motion.g key="glowing-prefs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {RANKING_DATA[activeArtist].items.map((item, i) => {
                          const isKanto = KANTO.includes(item.pref);
                          const coord = PREF_COORDS[item.pref];
                          if (!coord) return null;

                          return (
                            <MapPulseMarker
                              key={item.pref}
                              coord={coord}
                              rank={i + 1}
                              isKanto={isKanto}
                              color={RANKING_DATA[activeArtist].color}
                              delay={i * 0.05}
                            />
                          );
                        })}
                      </motion.g>
                    )}
                  </AnimatePresence>
                </g>
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={`prefecture-map__insight-card relative z-30 mx-auto mt-6 mb-2 w-[calc(100vw-32px)] max-w-[380px] shrink-0 bg-gradient-to-br from-white/[0.15] to-white/[0.02] backdrop-blur-[32px] border border-t-white/[0.35] border-l-white/[0.35] border-b-white/[0.1] border-r-white/[0.1] rounded-[22px] shadow-[0_24px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_0_20px_rgba(255,255,255,0.05)] overflow-hidden md:absolute md:right-[80px] md:top-1/2 md:-translate-y-1/2 md:mx-0 md:mt-0 md:mb-0 md:w-[240px] lg:w-[280px] md:rounded-2xl ${isCardVisible ? "" : "max-md:hidden"}`}
          initial={{ opacity: 0, x: isMobileLayout ? 0 : 80, y: isMobileLayout ? 40 : 0, filter: "blur(8px)" }}
          animate={{
            opacity: isCardVisible ? 1 : 0,
            x: isMobileLayout ? 0 : isCardVisible ? 0 : 80,
            y: isMobileLayout ? (isCardVisible ? 0 : 40) : 0,
            filter: isCardVisible ? "blur(0px)" : "blur(8px)",
            pointerEvents: isCardVisible ? "auto" : "none"
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            {activeArtist && (
              <InsightCardContent key={activeArtist} id={activeArtist} data={RANKING_DATA[activeArtist]} />
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
          style={{ opacity: introOpacity, y: introY }}
        >
          <div className="prefecture-map__intro-copy w-full max-w-3xl">
            <h2 className="prefecture-map__section-title text-4xl md:text-5xl lg:text-6xl text-white font-bold tracking-[0.1em] mb-8 md:mb-10 break-keep">
              ファンはどこから来たのか。
            </h2>
            <p
              className="prefecture-map__section-copy text-base md:text-lg lg:text-xl tracking-[0.08em] font-normal"
              style={{ color: "rgba(255,255,255,0.72)", lineHeight: 2.0 }}
            >
              東京ドームへ向かう――
              <br />
              ライブはその瞬間から始まっている。
            </p>
          </div>
        </motion.div>

        <motion.div className="absolute top-14 md:top-1/4 left-0 right-0 md:left-[5%] md:right-auto z-10 max-w-md px-4 text-center md:text-left mx-auto md:mx-0" style={{ opacity: fzOpacity, y: fzY }}>
          <h3 className="prefecture-map__artist-name--fruits-zipper text-[#00D1FF] text-2xl md:text-5xl font-bold tracking-wider mb-2 md:mb-4 drop-shadow-[0_0_10px_rgba(0,209,255,0.5)]">
            FRUITS ZIPPER
          </h3>
          <p className="text-white/80 text-sm md:text-xl font-medium tracking-widest mb-1 md:mb-2">{RANKING_DATA.FZ.text}</p>
          <p className="text-[#a0a0a0] text-xs md:text-sm tracking-widest leading-relaxed">TOP10 の 1都3県比率　{RANKING_DATA.FZ.kantoRatio}％</p>
        </motion.div>

        <motion.div className="absolute top-14 md:top-1/4 left-0 right-0 md:left-[5%] md:right-auto z-10 max-w-md px-4 text-center md:text-left mx-auto md:mx-0" style={{ opacity: riizeOpacity, y: riizeY }}>
          <h3 className="prefecture-map__artist-name--riize text-[#FF4EDB] text-2xl md:text-5xl font-bold tracking-wider mb-2 md:mb-4 drop-shadow-[0_0_10px_rgba(255,78,219,0.5)]">
            RIIZE
          </h3>
          <p className="text-white/80 text-sm md:text-xl font-medium tracking-widest mb-1 md:mb-2">{RANKING_DATA.RZ.text}</p>
          <p className="text-[#a0a0a0] text-xs md:text-sm tracking-widest leading-relaxed">TOP10 の 1都3県比率　{RANKING_DATA.RZ.kantoRatio}％</p>
          <p className="text-[#888] text-[10px] md:text-xs tracking-wide leading-relaxed mt-2">{RANKING_DATA.RZ.liveDateNote}</p>
        </motion.div>

        <motion.div className="absolute top-14 md:top-1/4 left-0 right-0 md:left-[5%] md:right-auto z-10 max-w-md px-4 text-center md:text-left mx-auto md:mx-0" style={{ opacity: vaundyOpacity, y: vaundyY }}>
          <h3 className="prefecture-map__artist-name--vaundy text-[#A6FF4D] text-2xl md:text-5xl font-bold tracking-wider mb-2 md:mb-4 drop-shadow-[0_0_10px_rgba(166,255,77,0.5)]">
            Vaundy
          </h3>
          <p className="text-white/80 text-sm md:text-xl font-medium tracking-widest mb-1 md:mb-2">{RANKING_DATA.VD.text}</p>
          <p className="text-[#a0a0a0] text-xs md:text-sm tracking-widest leading-relaxed">TOP10 の 1都3県比率　{RANKING_DATA.VD.kantoRatio}％</p>
          <p className="text-[#888] text-[10px] md:text-xs tracking-wide leading-relaxed mt-2">{RANKING_DATA.VD.liveDateNote}</p>
        </motion.div>

        <motion.div
          className={`prefecture-map__comparison-view relative z-20 flex w-full shrink-0 justify-center items-start mt-4 px-4 pointer-events-none md:absolute md:inset-0 md:mt-0 md:px-0 md:pb-0 md:justify-end md:items-center md:p-16 ${isCompareVisible ? "" : "max-md:hidden"}`}
          style={{ opacity: compareOpacity }}
        >
          <div className="prefecture-map__comparison-card w-full max-w-[380px] md:max-w-[480px] md:w-[480px] bg-[#111]/80 backdrop-blur-md border border-[#333] rounded-[18px] md:rounded-xl p-4 md:p-8 pointer-events-auto">
            <div className="mb-3 md:mb-8">
              <h3 className="text-white text-lg md:text-3xl font-bold tracking-widest mb-1 md:mb-3">
                首都圏比率比較
              </h3>
              <p className="text-white/65 text-[11px] md:text-sm tracking-wide md:tracking-widest leading-snug md:leading-relaxed">
                <span className="md:hidden">
                  初ドームの FRUITS ZIPPER は全国から
                  <br />
                  ドームツアー中の Vaundy は首都圏集中
                </span>
                <span className="hidden md:block">
                  初ドームの FRUITS ZIPPER は全国から
                  <br />
                  ドームツアー中の Vaundy は首都圏集中
                </span>
              </p>
            </div>

            <div className="space-y-3 md:space-y-8">
              {KANTO_RATIO_COMPARISON.map((item, index) => (
                <div key={item.name} className="space-y-1 md:space-y-3">
                  <div
                    className="text-[11px] md:text-base font-bold tracking-wide md:tracking-wider"
                    style={{ color: item.color }}
                  >
                    {item.name}
                  </div>

                  <div className="flex flex-wrap items-baseline gap-x-1.5 md:gap-x-3 gap-y-0.5 text-[11px] md:text-base font-mono leading-tight">
                    <span className="text-white/90">
                      首都圏{" "}
                      <span className="font-bold tabular-nums">{item.kanto}%</span>
                    </span>
                    <span className="text-white/35">/</span>
                    <span className="text-white/65">
                      首都圏外{" "}
                      <span className="font-bold tabular-nums text-white/80">{item.outside}%</span>
                    </span>
                  </div>

                  <KantoRatioBar color={item.color} kanto={item.kanto} delay={index * 0.12 + 0.15} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="prefecture-map__dome-bg absolute inset-0 pointer-events-none z-20" style={{ opacity: domeBgOpacity }}>
          <div className="relative w-full h-full">
            <motion.img
              src={tokyoDomeMapNorth}
              alt="Tokyo Dome"
              className="w-full h-full object-cover"
              style={{ scale: domeBgScale, objectPosition: MAP_OBJECT_POSITION }}
            />
            <div className="absolute inset-0 bg-[#050505]/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80" />
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 px-5 md:px-0"
          style={{ opacity: zoomTextOpacity }}
        >
          <p className="text-white text-[38px] md:text-5xl font-bold tracking-[0.1em] md:tracking-[0.2em] leading-[1.4] md:leading-tight text-center drop-shadow-2xl w-[calc(100vw-40px)] max-w-[380px] md:w-auto md:max-w-none break-keep">
            <span className="md:hidden">
              人は、ここを目指して
              <br />
              あつまる。
            </span>
            <span className="hidden md:inline">人は、ここを目指してあつまる。</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}