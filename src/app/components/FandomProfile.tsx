import React, { useRef, useMemo, useEffect, useState } from "react";
import { motion, useScroll, useTransform, MotionValue, useMotionValue, animate } from "motion/react";
import tokyoDomeMapNorth from "../../imports/tokyo-dome-map-north.jpeg";
import { useIsMobile } from "./ui/use-mobile";

const MAP_BASE_SIZE = { width: 2881, height: 1921 };
const TOKYO_DOME_POINT = {
  x: 1585 / MAP_BASE_SIZE.width,
  y: 884 / MAP_BASE_SIZE.height,
};
const MAP_OBJECT_POSITION = `center ${Math.round(TOKYO_DOME_POINT.y * 100)}%`;

/** フェードイン → キープ → フェードアウト（区間外は厳密に 0） */
function sceneOpacity(
  value: number,
  fadeInStart: number,
  fadeInEnd: number,
  holdEnd: number,
  fadeOutEnd: number
) {
  if (value < fadeInStart || value >= fadeOutEnd) return 0;
  if (value < fadeInEnd) return (value - fadeInStart) / (fadeInEnd - fadeInStart);
  if (value <= holdEnd) return 1;
  return (fadeOutEnd - value) / (fadeOutEnd - holdEnd);
}

/** 比較シーン中は個別アーティスト用テキストを完全非表示 */
function isComparisonScroll(value: number) {
  return value >= 0.56 && value < 0.91;
}

const ITEMS_COUNT = 300;

const FZ_F = "#00D1FF";
const RZ_F = "#FF4EDB";
const VD_F = "#A6FF4D";
const MALE = "#CFCFCF";

const TIME_KEYS = [0.0, 0.10, 0.18, 0.28, 0.36, 0.46, 0.54, 0.64, 0.74, 0.84, 0.95];

const GENDER_RATIO = {
  fruitsZipper: { female: 51, male: 49 },
  riize: { female: 81, male: 19 },
  vaundy: { female: 73, male: 27 },
};

const AGE_DIST = {
  fruitsZipper: [29, 26, 18, 27],
  riize: [12, 14, 22, 52],
  vaundy: [25, 15, 19, 41],
};

const AGE_LABEL_VALUES = {
  fruitsZipper: [29.0, 25.6, 17.7, 27.6],
  riize: [12.0, 13.7, 22.0, 52.3],
  vaundy: [24.5, 14.9, 19.1, 41.6],
};

const AGE_GENDER_COUNTS = {
  fruitsZipper: [
    { female: 15, male: 14 },
    { female: 11, male: 15 },
    { female: 10, male: 8 },
    { female: 15, male: 12 },
  ],
  riize: [
    { female: 7, male: 5 },
    { female: 10, male: 4 },
    { female: 17, male: 5 },
    { female: 47, male: 5 },
  ],
  vaundy: [
    { female: 14, male: 11 },
    { female: 10, male: 5 },
    { female: 16, male: 3 },
    { female: 33, male: 8 },
  ],
};

const AGE_LABELS = ["20代", "30代", "40代", "50代"];

function getCloudPos(index: number, centerX: number, centerY: number) {
  const angle = Math.random() * Math.PI * 2;
  const r = 400 + Math.random() * 500;
  return { x: centerX + Math.cos(angle) * r, y: centerY + Math.sin(angle) * r };
}

function getGridPos(index: number, centerX: number, centerY: number, scale = 1) {
  const row = Math.floor(index / 10);
  const col = index % 10;
  return {
    x: centerX + (col - 4.5) * 24 * scale,
    y: centerY + (row - 4.5) * 24 * scale
  };
}

function getAgeGroupInfo(index: number, dist: number[]) {
  let current = 0;

  for (let i = 0; i < dist.length; i++) {
    if (index < current + dist[i]) {
      return {
        ageGroup: i,
        localIdx: index - current
      };
    }
    current += dist[i];
  }

  return {
    ageGroup: dist.length - 1,
    localIdx: dist[dist.length - 1] - 1
  };
}

function getAgeGenderColor(
  index: number,
  dist: number[],
  genderCounts: { female: number; male: number }[],
  femaleColor: string
) {
  const { ageGroup, localIdx } = getAgeGroupInfo(index, dist);
  return localIdx < genderCounts[ageGroup].female ? femaleColor : MALE;
}

function getAgePos(index: number, centerX: number, centerY: number, dist: number[], scale = 1) {
  const { ageGroup, localIdx } = getAgeGroupInfo(index, dist);

  const groupX = centerX + (ageGroup - (dist.length - 1) / 2) * 90 * scale;
  const cols = dist[ageGroup] > 18 ? 5 : 4;
  const row = Math.floor(localIdx / cols);
  const col = localIdx % cols;

  return {
    x: groupX + (col - Math.floor(cols / 2)) * 12 * scale,
    y: centerY - row * 16 * scale
  };
}

function getSilhouettePos(index: number, centerX: number, centerY: number) {
  if (index < 40) {
    const r = Math.sqrt(Math.random()) * 50;
    const theta = Math.random() * 2 * Math.PI;
    return { x: centerX + r * Math.cos(theta), y: centerY - 150 + r * Math.sin(theta) };
  }

  const r = Math.sqrt(Math.random());
  const theta = Math.random() * Math.PI;
  const rx = 140;
  const ry = 220;

  return {
    x: centerX + Math.cos(theta * 2) * rx * r,
    y: centerY + 60 + Math.sin(theta * 2) * ry * r
  };
}

function PersonIcon({ data, progress }: { data: any, progress: MotionValue<number> }) {
  const x = useTransform(progress, TIME_KEYS, data.x);
  const y = useTransform(progress, TIME_KEYS, data.y);
  const scale = useTransform(progress, TIME_KEYS, data.scale);
  const opacity = useTransform(progress, TIME_KEYS, data.opacity);
  const fill = useTransform(progress, TIME_KEYS, data.color);

  return (
    <motion.path
      d="M 0,-4 C 2.2,-4 4,-5.8 4,-8 C 4,-10.2 2.2,-12 0,-12 C -2.2,-12 -4,-10.2 -4,-8 C -4,-5.8 -2.2,-4 0,-4 Z M 0,-2 C -2.7,-2 -8,-0.7 -8,2 L -8,4 L 8,4 L 8,2 C 8,-0.7 2.7,-2 0,-2 Z"
      style={{ x, y, scale, opacity, fill }}
      transition={{ ease: "easeInOut" }}
    />
  );
}

function GenderLegend({
  color,
  female,
  male,
  align = "left"
}: {
  color: string;
  female: number;
  male: number;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`mt-5 md:mt-8 flex flex-col gap-2.5 md:gap-3 ${
        align === "right" ? "md:items-end items-center" : "md:items-start items-center"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-block w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
          style={{ backgroundColor: color, color }}
        />
        <span className="text-white/80 text-[14px] md:text-base tracking-[0.16em] font-mono">
          女性 {female}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: MALE }}
        />
        <span className="text-white/70 text-[14px] md:text-base tracking-[0.16em] font-mono">
          男性 {male}%
        </span>
      </div>
    </div>
  );
}

function getMobileSvgViewBox(scene: string) {
  if (scene === "fz" || scene === "rz" || scene === "vd") {
    return "398 326 404 168";
  }
  if (scene === "age-comp") {
    return "90 330 1020 240";
  }
  return "0 0 1200 800";
}

function MobileAgeAxisLabels({
  opacity,
  values,
  className = "",
}: {
  opacity: MotionValue<number>;
  values: number[];
  className?: string;
}) {
  return (
    <motion.div
      className={`w-full max-w-[min(340px,calc(100vw-32px))] mx-auto grid grid-cols-4 gap-0.5 px-1 ${className}`}
      style={{ opacity }}
    >
      {AGE_LABELS.map((label, i) => (
        <div key={label} className="text-center leading-tight">
          <p className="text-white font-bold font-mono text-[15px] tracking-wide">{label}</p>
          <p className="text-[#a0a0a0] font-mono text-[13px] mt-0.5 tabular-nums">
            {values[i].toFixed(1)}%
          </p>
        </div>
      ))}
    </motion.div>
  );
}

function MobileIndividualAgeLabels({
  currentScene,
  fzAgeLabelOp,
  rzAgeLabelOp,
  vdAgeLabelOp,
}: {
  currentScene: string;
  fzAgeLabelOp: MotionValue<number>;
  rzAgeLabelOp: MotionValue<number>;
  vdAgeLabelOp: MotionValue<number>;
}) {
  if (currentScene === "fz") {
    return (
      <div className="w-full mt-3 shrink-0">
        <MobileAgeAxisLabels opacity={fzAgeLabelOp} values={AGE_LABEL_VALUES.fruitsZipper} />
      </div>
    );
  }

  if (currentScene === "rz") {
    return (
      <div className="w-full mt-3 shrink-0">
        <MobileAgeAxisLabels opacity={rzAgeLabelOp} values={AGE_LABEL_VALUES.riize} />
      </div>
    );
  }

  if (currentScene === "vd") {
    return (
      <div className="w-full mt-3 shrink-0">
        <MobileAgeAxisLabels opacity={vdAgeLabelOp} values={AGE_LABEL_VALUES.vaundy} />
      </div>
    );
  }

  return null;
}

const GENDER_COMPARISON_COLUMNS = [
  { name: "F. ZIPPER", color: "#00D1FF", female: 51, male: 49 },
  { name: "RIIZE", color: "#FF4EDB", female: 81, male: 19 },
  { name: "Vaundy", color: "#A6FF4D", female: 73, male: 27 },
] as const;

function GenderComparisonColumn({
  name,
  color,
  female,
  male,
}: {
  name: string;
  color: string;
  female: number;
  male: number;
}) {
  return (
    <div className="fandom-profile__gender-comparison-column flex flex-col items-center flex-1 min-w-0 text-center">
      <div
        className="font-bold tracking-widest text-base md:text-lg mb-2"
        style={{ color }}
      >
        {name}
      </div>
      <div className="text-[#888] font-mono text-xs md:text-sm whitespace-nowrap">
        女性{female}% / 男性{male}%
      </div>
    </div>
  );
}

const PERSON_ICON_PATH =
  "M 0,-4 C 2.2,-4 4,-5.8 4,-8 C 4,-10.2 2.2,-12 0,-12 C -2.2,-12 -4,-10.2 -4,-8 C -4,-5.8 -2.2,-4 0,-4 Z M 0,-2 C -2.7,-2 -8,-0.7 -8,2 L -8,4 L 8,4 L 8,2 C 8,-0.7 2.7,-2 0,-2 Z";

const AGE_COMPARISON_COLUMNS = [
  {
    name: "F. ZIPPER",
    color: FZ_F,
    dist: AGE_DIST.fruitsZipper,
    values: AGE_LABEL_VALUES.fruitsZipper,
    genderCounts: AGE_GENDER_COUNTS.fruitsZipper,
  },
  {
    name: "RIIZE",
    color: RZ_F,
    dist: AGE_DIST.riize,
    values: AGE_LABEL_VALUES.riize,
    genderCounts: AGE_GENDER_COUNTS.riize,
  },
  {
    name: "Vaundy",
    color: VD_F,
    dist: AGE_DIST.vaundy,
    values: AGE_LABEL_VALUES.vaundy,
    genderCounts: AGE_GENDER_COUNTS.vaundy,
  },
] as const;

function getGlobalComparisonMorph(scroll: number) {
  if (scroll <= 0.665) return 0;
  if (scroll >= 0.835) return 1;
  return (scroll - 0.665) / 0.17;
}

function buildCompactMorphParticles(
  dist: readonly number[],
  genderCounts: readonly { female: number; male: number }[],
  femaleColor: string,
  femaleRatio: number
) {
  const ageCenterX = 130;
  const ageCenterY = 66;
  const ageScale = 0.56;
  const genderCenterX = 130;
  const genderCenterY = 44;
  const genderScale = 0.5;

  return Array.from({ length: 100 }, (_, i) => {
    const age = getAgePos(i, ageCenterX, ageCenterY, [...dist], ageScale);
    const gender = getGridPos(i, genderCenterX, genderCenterY, genderScale);
    return {
      id: i,
      ageX: age.x,
      ageY: age.y,
      genderX: gender.x,
      genderY: gender.y,
      ageFill: getAgeGenderColor(i, [...dist], [...genderCounts], femaleColor),
      genderFill: i < femaleRatio ? femaleColor : MALE,
    };
  });
}

function StaticGenderBar({ f, color }: { f: number; color: string }) {
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
      <div className="h-full rounded-l-full" style={{ width: `${f}%`, backgroundColor: color }} />
      <div className="h-full bg-white flex-1 rounded-r-full" />
    </div>
  );
}

function MorphPictogram({
  particle,
  morph,
  scale = 1,
}: {
  particle: ReturnType<typeof buildCompactMorphParticles>[number];
  morph: MotionValue<number>;
  scale?: number;
}) {
  const x = useTransform(morph, [0, 1], [particle.ageX, particle.genderX]);
  const y = useTransform(morph, [0, 1], [particle.ageY, particle.genderY]);
  const fill = useTransform(morph, (t) => (t < 0.5 ? particle.ageFill : particle.genderFill));

  return <motion.path d={PERSON_ICON_PATH} style={{ x, y, fill, scale }} />;
}

function MobileCompactArtistRow({
  name,
  color,
  dist,
  values,
  genderCounts,
  female,
  male,
  morph,
}: {
  name: string;
  color: string;
  dist: readonly number[];
  values: readonly number[];
  genderCounts: readonly { female: number; male: number }[];
  female: number;
  male: number;
  morph: MotionValue<number>;
}) {
  const ageLabelOp = useTransform(morph, (t) => {
    if (t <= 0.42) return 1;
    if (t >= 0.55) return 0;
    return (0.55 - t) / 0.13;
  });
  const genderLabelOp = useTransform(morph, (t) => {
    if (t <= 0.45) return 0;
    if (t >= 0.58) return 1;
    return (t - 0.45) / 0.13;
  });
  const ageLabelVisibility = useTransform(ageLabelOp, (v) => (v > 0.001 ? "visible" : "hidden"));
  const genderLabelVisibility = useTransform(genderLabelOp, (v) => (v > 0.001 ? "visible" : "hidden"));

  const viewBox = useTransform(morph, (t) => {
    const age = { x: 8, y: -8, w: 244, h: 88 };
    const gender = { x: 76, y: -12, w: 108, h: 108 };
    const x = age.x + (gender.x - age.x) * t;
    const y = age.y + (gender.y - age.y) * t;
    const w = age.w + (gender.w - age.w) * t;
    const h = age.h + (gender.h - age.h) * t;
    return `${x} ${y} ${w} ${h}`;
  });

  const svgHeight = useTransform(morph, [0, 1], [58, 108]);
  const svgMaxWidth = useTransform(morph, (t) => `${Math.round(320 - t * 212)}px`);

  const particles = useMemo(
    () => buildCompactMorphParticles(dist, genderCounts, color, female),
    [dist, genderCounts, color, female]
  );

  return (
    <article className="fandom-profile__mobile-compact-artist min-h-[158px] max-h-[184px] flex flex-col">
      <h4
        className="fandom-profile__mobile-compact-artist-name text-[13px] font-bold tracking-[0.1em] mb-1.5 pl-0.5"
        style={{ color }}
      >
        {name}
      </h4>

      <div className="flex justify-center w-full shrink-0">
        <motion.svg
          viewBox={viewBox}
          style={{ height: svgHeight, maxWidth: svgMaxWidth, width: "100%" }}
          className="mx-auto"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {particles.map((particle) => (
            <MorphPictogram key={particle.id} particle={particle} morph={morph} scale={0.92} />
          ))}
        </motion.svg>
      </div>

      <div className="relative h-[36px] mt-0 shrink-0">
        <motion.div className="grid grid-cols-4 gap-0.5 px-0.5 pb-0.5" style={{ opacity: ageLabelOp, visibility: ageLabelVisibility }}>
          {AGE_LABELS.map((label, i) => (
            <div key={label} className="text-center leading-tight">
              <p
                className="font-bold font-mono text-[13px] tracking-wide"
                style={{ color: "rgba(255,255,255,0.88)", textShadow: "0 0 8px rgba(0,0,0,0.8)" }}
              >
                {label}
              </p>
              <p
                className="font-semibold font-mono text-[12px] mt-1 tabular-nums"
                style={{ color: "rgba(255,255,255,0.72)", textShadow: "0 0 8px rgba(0,0,0,0.8)" }}
              >
                {values[i].toFixed(1)}%
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-start px-1"
          style={{ opacity: genderLabelOp, visibility: genderLabelVisibility }}
        >
          <p className="text-[11px] font-mono text-white/65 tracking-wide leading-none">
            女性 {female}%
            <span className="text-white/25 mx-1.5">/</span>
            男性 {male}%
          </p>
          <div className="w-full mt-1">
            <StaticGenderBar f={female} color={color} />
          </div>
        </motion.div>
      </div>
    </article>
  );
}

const MOBILE_MORPH_ARTISTS = [
  {
    ...AGE_COMPARISON_COLUMNS[0],
    female: GENDER_RATIO.fruitsZipper.female,
    male: GENDER_RATIO.fruitsZipper.male,
  },
  {
    ...AGE_COMPARISON_COLUMNS[1],
    female: GENDER_RATIO.riize.female,
    male: GENDER_RATIO.riize.male,
  },
  {
    ...AGE_COMPARISON_COLUMNS[2],
    female: GENDER_RATIO.vaundy.female,
    male: GENDER_RATIO.vaundy.male,
  },
] as const;

function MobileDemographicComparisonStack({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const morph = useTransform(scrollYProgress, (s) => getGlobalComparisonMorph(s));
  const ageTitleOp = useTransform(morph, (t) => {
    if (t <= 0.42) return 1;
    if (t >= 0.55) return 0;
    return (0.55 - t) / 0.13;
  });
  const genderTitleOp = useTransform(morph, (t) => {
    if (t <= 0.45) return 0;
    if (t >= 0.58) return 1;
    return (t - 0.45) / 0.13;
  });
  const ageTitleVisibility = useTransform(ageTitleOp, (v) => (v > 0.001 ? "visible" : "hidden"));
  const genderTitleVisibility = useTransform(genderTitleOp, (v) => (v > 0.001 ? "visible" : "hidden"));

  return (
    <div className="fandom-profile__mobile-demographic-stack flex flex-col justify-center w-full h-full pt-[108px] pb-3 px-4 pointer-events-none">
      <div className="relative h-7 mb-3 shrink-0">
        <motion.h3
          className="absolute inset-0 flex items-center justify-center text-white text-[17px] font-bold tracking-[0.2em]"
          style={{ opacity: ageTitleOp, visibility: ageTitleVisibility }}
        >
          年代比較
        </motion.h3>
        <motion.h3
          className="absolute inset-0 flex items-center justify-center text-white text-[17px] font-bold tracking-[0.2em]"
          style={{ opacity: genderTitleOp, visibility: genderTitleVisibility }}
        >
          性別比較
        </motion.h3>
      </div>

      <div className="flex flex-col gap-[18px] w-full max-w-[min(360px,calc(100vw-32px))] mx-auto shrink-0">
        {MOBILE_MORPH_ARTISTS.map((artist) => (
          <MobileCompactArtistRow key={artist.name} morph={morph} {...artist} />
        ))}
      </div>

      <p className="fandom-profile__mobile-stack-footnote mt-3 shrink-0 text-[9px] text-white/45 text-center leading-[1.7] tracking-[0.02em] max-w-[min(320px,calc(100vw-40px))] mx-auto">
        ※年代分析はLAPのデータから20代・30代・40代・50代を抽出して集計しています。
      </p>
    </div>
  );
}

function AgeAxisLabels({
  opacity,
  centerX,
  y,
  values,
  spacing,
  fontSize = 14,
  percentSize,
  lineGap = 16,
  labelFill = "rgba(255,255,255,0.88)",
  percentFill = "rgba(255,255,255,0.72)",
}: {
  opacity: MotionValue<number>;
  centerX: number;
  y: number;
  values: number[];
  spacing: number;
  fontSize?: number;
  percentSize?: number;
  lineGap?: number;
  labelFill?: string;
  percentFill?: string;
}) {
  const pctSize = percentSize ?? Math.max(fontSize - 2, 12);
  const labelVisibility = useTransform(opacity, (v) => (v > 0.001 ? "visible" : "hidden"));

  return (
    <motion.g style={{ opacity, visibility: labelVisibility }}>
      {AGE_LABELS.map((label, i) => (
        <text
          key={`${centerX}-${label}`}
          x={centerX + (i - 1.5) * spacing}
          y={y}
          fill={labelFill}
          fontSize={fontSize}
          fontWeight="700"
          textAnchor="middle"
          className="font-mono"
          style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.8))" }}
        >
          <tspan x={centerX + (i - 1.5) * spacing}>{label}</tspan>
          <tspan
            x={centerX + (i - 1.5) * spacing}
            dy={lineGap}
            fill={percentFill}
            fontSize={pctSize}
            fontWeight="600"
            style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.8))" }}
          >
            {values[i].toFixed(1)}%
          </tspan>
        </text>
      ))}
    </motion.g>
  );
}

export function FandomProfile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const fzInternalProgress = useMotionValue(0);
  const rzInternalProgress = useMotionValue(0);
  const vdInternalProgress = useMotionValue(0);
  const ageCompInternalProgress = useMotionValue(0);
  const genderCompInternalProgress = useMotionValue(0);

  const [currentScene, setCurrentScene] = useState<string>("");
  const compositeProgress = useMotionValue(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest >= 0.06 && latest < 0.30) {
        if (currentScene !== "fz") {
          setCurrentScene("fz");
          fzInternalProgress.set(0);
          animate(fzInternalProgress, 1, { duration: 2.4, ease: "easeInOut", delay: 0.3 });
        }
      } else if (latest >= 0.24 && latest < 0.48) {
        if (currentScene !== "rz") {
          setCurrentScene("rz");
          rzInternalProgress.set(0);
          animate(rzInternalProgress, 1, { duration: 2.4, ease: "easeInOut", delay: 0.3 });
        }
      } else if (latest >= 0.42 && latest < 0.66) {
        if (currentScene !== "vd") {
          setCurrentScene("vd");
          vdInternalProgress.set(0);
          animate(vdInternalProgress, 1, { duration: 2.4, ease: "easeInOut", delay: 0.3 });
        }
      } else if (latest >= 0.58 && latest < 0.78) {
        if (currentScene !== "age-comp") {
          setCurrentScene("age-comp");
          ageCompInternalProgress.set(0);
          animate(ageCompInternalProgress, 1, { duration: 2.6, ease: "easeInOut", delay: 0.3 });
        }
      } else if (latest >= 0.70 && latest < 0.90) {
        if (currentScene !== "gender-comp") {
          setCurrentScene("gender-comp");
          genderCompInternalProgress.set(0);
          animate(genderCompInternalProgress, 1, { duration: 2.6, ease: "easeInOut", delay: 0.3 });
        }
      }
    });
  }, [scrollYProgress, currentScene, fzInternalProgress, rzInternalProgress, vdInternalProgress, ageCompInternalProgress, genderCompInternalProgress]);

  useEffect(() => {
    compositeProgress.set(scrollYProgress.get());
  }, [compositeProgress, scrollYProgress]);

  useEffect(() => {
    const unsubscribeScroll = scrollYProgress.on("change", (scroll) => {
      let adjusted = scroll;

      if (scroll >= 0.06 && scroll < 0.30) {
        adjusted = 0.10 + (fzInternalProgress.get() * 0.08);
      } else if (scroll >= 0.24 && scroll < 0.48) {
        adjusted = 0.28 + (rzInternalProgress.get() * 0.08);
      } else if (scroll >= 0.42 && scroll < 0.66) {
        adjusted = 0.46 + (vdInternalProgress.get() * 0.08);
      } else if (scroll >= 0.58 && scroll < 0.78) {
        adjusted = 0.54 + (ageCompInternalProgress.get() * 0.10);
      } else if (scroll >= 0.70 && scroll < 0.90) {
        adjusted = 0.64 + (genderCompInternalProgress.get() * 0.10);
      }

      compositeProgress.set(adjusted);
    });

    const unsubscribeFZ = fzInternalProgress.on("change", () => {
      const scroll = scrollYProgress.get();
      if (scroll >= 0.06 && scroll < 0.30) compositeProgress.set(0.10 + (fzInternalProgress.get() * 0.08));
    });

    const unsubscribeRZ = rzInternalProgress.on("change", () => {
      const scroll = scrollYProgress.get();
      if (scroll >= 0.24 && scroll < 0.48) compositeProgress.set(0.28 + (rzInternalProgress.get() * 0.08));
    });

    const unsubscribeVD = vdInternalProgress.on("change", () => {
      const scroll = scrollYProgress.get();
      if (scroll >= 0.42 && scroll < 0.66) compositeProgress.set(0.46 + (vdInternalProgress.get() * 0.08));
    });

    const unsubscribeAgeComp = ageCompInternalProgress.on("change", () => {
      const scroll = scrollYProgress.get();
      if (scroll >= 0.58 && scroll < 0.78) compositeProgress.set(0.54 + (ageCompInternalProgress.get() * 0.10));
    });

    const unsubscribeGenderComp = genderCompInternalProgress.on("change", () => {
      const scroll = scrollYProgress.get();
      if (scroll >= 0.70 && scroll < 0.90) compositeProgress.set(0.64 + (genderCompInternalProgress.get() * 0.10));
    });

    return () => {
      unsubscribeScroll();
      unsubscribeFZ();
      unsubscribeRZ();
      unsubscribeVD();
      unsubscribeAgeComp();
      unsubscribeGenderComp();
    };
  }, [scrollYProgress, fzInternalProgress, rzInternalProgress, vdInternalProgress, ageCompInternalProgress, genderCompInternalProgress, compositeProgress]);

  const items = useMemo(() => {
    const arr = [];

    for (let i = 0; i < ITEMS_COUNT; i++) {
      const x = [];
      const y = [];
      const scale = [];
      const opacity = [];
      const color = [];

      if (i < 100) {
        let p = getCloudPos(i, 600, 400);
        x.push(p.x); y.push(p.y); scale.push(0.1); opacity.push(0.3); color.push(i < GENDER_RATIO.fruitsZipper.female ? FZ_F : MALE);

        p = getGridPos(i, 600, 400);
        x.push(p.x); y.push(p.y); scale.push(1); opacity.push(1); color.push(i < GENDER_RATIO.fruitsZipper.female ? FZ_F : MALE);

        p = getAgePos(i, 600, 480, AGE_DIST.fruitsZipper);
        x.push(p.x); y.push(p.y); scale.push(1); opacity.push(1); color.push(
          getAgeGenderColor(i, AGE_DIST.fruitsZipper, AGE_GENDER_COUNTS.fruitsZipper, FZ_F)
        );

        p = getGridPos(i, 600, 400);
        x.push(p.x); y.push(p.y); scale.push(1); opacity.push(1); color.push(i < GENDER_RATIO.riize.female ? RZ_F : MALE);

        p = getAgePos(i, 600, 480, AGE_DIST.riize);
        x.push(p.x); y.push(p.y); scale.push(1); opacity.push(1); color.push(
          getAgeGenderColor(i, AGE_DIST.riize, AGE_GENDER_COUNTS.riize, RZ_F)
        );

        p = getGridPos(i, 600, 400);
        x.push(p.x); y.push(p.y); scale.push(1); opacity.push(1); color.push(i < GENDER_RATIO.vaundy.female ? VD_F : MALE);

        p = getAgePos(i, 600, 480, AGE_DIST.vaundy);
        x.push(p.x); y.push(p.y); scale.push(1); opacity.push(1); color.push(
          getAgeGenderColor(i, AGE_DIST.vaundy, AGE_GENDER_COUNTS.vaundy, VD_F)
        );

        p = getAgePos(i, 980, 480, AGE_DIST.vaundy, 0.75);
        x.push(p.x); y.push(p.y); scale.push(0.75); opacity.push(1); color.push(
          getAgeGenderColor(i, AGE_DIST.vaundy, AGE_GENDER_COUNTS.vaundy, VD_F)
        );

        p = getGridPos(i, 980, 400, 0.85);
        x.push(p.x); y.push(p.y); scale.push(0.85); opacity.push(1); color.push(i < GENDER_RATIO.vaundy.female ? VD_F : MALE);

        p = getSilhouettePos(i, 600, 400);
        x.push(p.x); y.push(p.y); scale.push(1); opacity.push(1); color.push(i < GENDER_RATIO.vaundy.female ? VD_F : MALE);

        p = getCloudPos(i, 600, 400);
        x.push(p.x); y.push(p.y); scale.push(0.1); opacity.push(0); color.push(i < GENDER_RATIO.vaundy.female ? VD_F : MALE);
      } else if (i < 200) {
        const localIdx = i - 100;

        for (let s = 0; s <= 6; s++) {
          const p = getCloudPos(i, 600, 400);
          x.push(p.x); y.push(p.y); scale.push(0.1); opacity.push(0); color.push(localIdx < GENDER_RATIO.fruitsZipper.female ? FZ_F : MALE);
        }

        let p = getAgePos(localIdx, 220, 480, AGE_DIST.fruitsZipper, 0.75);
        x.push(p.x); y.push(p.y); scale.push(0.75); opacity.push(1); color.push(
          getAgeGenderColor(localIdx, AGE_DIST.fruitsZipper, AGE_GENDER_COUNTS.fruitsZipper, FZ_F)
        );

        p = getGridPos(localIdx, 220, 400, 0.85);
        x.push(p.x); y.push(p.y); scale.push(0.85); opacity.push(1); color.push(localIdx < GENDER_RATIO.fruitsZipper.female ? FZ_F : MALE);

        p = getSilhouettePos(i, 600, 400);
        x.push(p.x); y.push(p.y); scale.push(1); opacity.push(1); color.push(localIdx < GENDER_RATIO.fruitsZipper.female ? FZ_F : MALE);

        p = getCloudPos(i, 600, 400);
        x.push(p.x); y.push(p.y); scale.push(0.1); opacity.push(0); color.push(localIdx < GENDER_RATIO.fruitsZipper.female ? FZ_F : MALE);
      } else {
        const localIdx = i - 200;

        for (let s = 0; s <= 6; s++) {
          const p = getCloudPos(i, 600, 400);
          x.push(p.x); y.push(p.y); scale.push(0.1); opacity.push(0); color.push(localIdx < GENDER_RATIO.riize.female ? RZ_F : MALE);
        }

        let p = getAgePos(localIdx, 600, 480, AGE_DIST.riize, 0.75);
        x.push(p.x); y.push(p.y); scale.push(0.75); opacity.push(1); color.push(
          getAgeGenderColor(localIdx, AGE_DIST.riize, AGE_GENDER_COUNTS.riize, RZ_F)
        );

        p = getGridPos(localIdx, 600, 400, 0.85);
        x.push(p.x); y.push(p.y); scale.push(0.85); opacity.push(1); color.push(localIdx < GENDER_RATIO.riize.female ? RZ_F : MALE);

        p = getSilhouettePos(i, 600, 400);
        x.push(p.x); y.push(p.y); scale.push(1); opacity.push(1); color.push(localIdx < GENDER_RATIO.riize.female ? RZ_F : MALE);

        p = getCloudPos(i, 600, 400);
        x.push(p.x); y.push(p.y); scale.push(0.1); opacity.push(0); color.push(localIdx < GENDER_RATIO.riize.female ? RZ_F : MALE);
      }

      arr.push({ id: i, x, y, scale, opacity, color });
    }

    return arr;
  }, []);

  const introOp = useTransform(scrollYProgress, [0, 0.06, 0.12, 0.16], [0, 1, 1, 0]);
  const fzTextBaseOp = useTransform(scrollYProgress, [0.06, 0.10, 0.26, 0.30], [0, 1, 1, 0]);
  const fzAgeLabelOp = useTransform(scrollYProgress, [0.14, 0.18, 0.26, 0.30], [0, 1, 1, 0]);
  const rzTextBaseOp = useTransform(scrollYProgress, [0.24, 0.28, 0.44, 0.48], [0, 1, 1, 0]);
  const rzAgeLabelOp = useTransform(scrollYProgress, [0.32, 0.36, 0.44, 0.48], [0, 1, 1, 0]);
  const vdTextBaseOp = useTransform(scrollYProgress, [0.42, 0.46, 0.54, 0.58], [0, 1, 1, 0]);
  const vdAgeLabelOp = useTransform(scrollYProgress, [0.50, 0.54, 0.56, 0.58], [0, 1, 1, 0]);

  const compAgeOp = useTransform(scrollYProgress, (s) => sceneOpacity(s, 0.58, 0.62, 0.73, 0.77));
  const compGenderOp = useTransform(scrollYProgress, (s) => sceneOpacity(s, 0.75, 0.79, 0.86, 0.90));
  const compAgeVisibility = useTransform(compAgeOp, (v) => (v > 0.001 ? "visible" : "hidden"));
  const compGenderVisibility = useTransform(compGenderOp, (v) => (v > 0.001 ? "visible" : "hidden"));

  const artistTextMask = useTransform(scrollYProgress, (s) => (isComparisonScroll(s) ? 0 : 1));
  const fzTextOp = useTransform([fzTextBaseOp, artistTextMask], ([base, mask]: number[]) => base * mask);
  const rzTextOp = useTransform([rzTextBaseOp, artistTextMask], ([base, mask]: number[]) => base * mask);
  const vdTextOp = useTransform([vdTextBaseOp, artistTextMask], ([base, mask]: number[]) => base * mask);
  const fzTextVisibility = useTransform(fzTextOp, (v) => (v > 0.001 ? "visible" : "hidden"));
  const rzTextVisibility = useTransform(rzTextOp, (v) => (v > 0.001 ? "visible" : "hidden"));
  const vdTextVisibility = useTransform(vdTextOp, (v) => (v > 0.001 ? "visible" : "hidden"));

  const mobileMorphOp = useTransform(scrollYProgress, [0.56, 0.60, 0.86, 0.90], [0, 1, 1, 0]);
  const silhouetteOp = useTransform(scrollYProgress, [0.84, 0.87, 0.94, 0.97], [0, 1, 1, 0]);

  const ageNoteOpacity = useTransform(scrollYProgress, (s) => {
    if (s < 0.12) return 0;
    if (s <= 0.14) return (s - 0.12) / 0.02;
    if (s >= 0.56 && s <= 0.91) return 0;
    if (s <= 0.88) return 1;
    if (s <= 0.90) return (0.90 - s) / 0.02;
    return 0;
  });

  const isArtistScene =
    currentScene === "fz" || currentScene === "rz" || currentScene === "vd";
  const svgViewBox = isMobile ? getMobileSvgViewBox(currentScene) : "0 0 1200 800";
  const showMobileAgeLabels = isMobile && isArtistScene;
  const hideMainSvgPictograms =
    isMobile && (currentScene === "gender-comp" || currentScene === "age-comp");

  return (
    <section ref={containerRef} className="section-fandom-profile relative h-[580vh] md:h-[480vh] bg-[#050505]" style={{ position: "relative" }}>
      <div className="fandom-profile__background sticky top-0 w-full h-[100vh] overflow-hidden">
        <img
          src={tokyoDomeMapNorth}
          alt=""
          aria-hidden="true"
          className="fandom-profile__map-bg absolute inset-0 w-full h-full object-cover opacity-[0.12] blur-[10px] scale-105"
          style={{ objectPosition: MAP_OBJECT_POSITION }}
        />

        <div className="fandom-profile__base-gradient absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,24,0.9),rgba(5,5,5,1)_72%)]" />

        <motion.div
          className="fandom-profile__artist-spotlight fandom-profile__artist-spotlight--fruits-zipper absolute inset-0 pointer-events-none"
          style={{
            opacity: fzTextOp,
            background: `radial-gradient(circle at ${TOKYO_DOME_POINT.x * 100}% ${TOKYO_DOME_POINT.y * 100}%, rgba(0,209,255,0.22), transparent 38%)`
          }}
        />

        <motion.div
          className="fandom-profile__artist-spotlight fandom-profile__artist-spotlight--riize absolute inset-0 pointer-events-none"
          style={{
            opacity: rzTextOp,
            background: `radial-gradient(circle at ${TOKYO_DOME_POINT.x * 100}% ${TOKYO_DOME_POINT.y * 100}%, rgba(255,78,219,0.22), transparent 38%)`
          }}
        />

        <motion.div
          className="fandom-profile__artist-spotlight fandom-profile__artist-spotlight--vaundy absolute inset-0 pointer-events-none"
          style={{
            opacity: vdTextOp,
            background: `radial-gradient(circle at ${TOKYO_DOME_POINT.x * 100}% ${TOKYO_DOME_POINT.y * 100}%, rgba(166,255,77,0.2), transparent 38%)`
          }}
        />

        <motion.div
          className="fandom-profile__artist-spotlight fandom-profile__artist-spotlight--age-comparison absolute inset-0 pointer-events-none hidden md:block"
          style={{
            opacity: compAgeOp,
            visibility: compAgeVisibility,
            background:
              "radial-gradient(circle at 22% 50%, rgba(0,209,255,0.14), transparent 28%), radial-gradient(circle at 50% 50%, rgba(255,78,219,0.14), transparent 28%), radial-gradient(circle at 78% 50%, rgba(166,255,77,0.12), transparent 28%)"
          }}
        />

        <motion.div
          className="fandom-profile__artist-spotlight fandom-profile__artist-spotlight--gender-comparison absolute inset-0 pointer-events-none hidden md:block"
          style={{
            opacity: compGenderOp,
            visibility: compGenderVisibility,
            background:
              "radial-gradient(circle at 22% 50%, rgba(0,209,255,0.12), transparent 28%), radial-gradient(circle at 50% 50%, rgba(255,78,219,0.12), transparent 28%), radial-gradient(circle at 78% 50%, rgba(166,255,77,0.10), transparent 28%)"
          }}
        />

        <motion.div
          className="fandom-profile__artist-spotlight fandom-profile__artist-spotlight--mobile-morph absolute inset-0 pointer-events-none md:hidden"
          style={{
            opacity: mobileMorphOp,
            background:
              "radial-gradient(circle at 50% 22%, rgba(0,209,255,0.10), transparent 32%), radial-gradient(circle at 50% 50%, rgba(255,78,219,0.10), transparent 32%), radial-gradient(circle at 50% 78%, rgba(166,255,77,0.08), transparent 32%)"
          }}
        />

        <div className="fandom-profile__dark-vignette absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(0,0,0,0.75)_100%)]" />

        <div className="fandom-profile__people-cloud hidden" />

        <div
          className={`absolute inset-0 flex justify-center pointer-events-none z-10 ${
            showMobileAgeLabels
              ? "flex-col items-center top-[44%] bottom-[84px] px-4"
              : "items-center"
          }`}
        >
          <svg
            viewBox={svgViewBox}
            preserveAspectRatio="xMidYMid meet"
            className={
              showMobileAgeLabels
                ? "w-full max-w-[min(360px,calc(100vw-32px))] flex-1 min-h-0"
                : "w-full h-full max-h-screen"
            }
          >
            {!showMobileAgeLabels && (
              <>
                <AgeAxisLabels
                  opacity={fzAgeLabelOp}
                  centerX={600}
                  y={525}
                  values={AGE_LABEL_VALUES.fruitsZipper}
                  spacing={90}
                  fontSize={17}
                  lineGap={20}
                />
                <AgeAxisLabels
                  opacity={rzAgeLabelOp}
                  centerX={600}
                  y={525}
                  values={AGE_LABEL_VALUES.riize}
                  spacing={90}
                  fontSize={17}
                  lineGap={20}
                />
                <AgeAxisLabels
                  opacity={vdAgeLabelOp}
                  centerX={600}
                  y={525}
                  values={AGE_LABEL_VALUES.vaundy}
                  spacing={90}
                  fontSize={17}
                  lineGap={20}
                />
              </>
            )}

            {!isMobile && (
              <>
                <AgeAxisLabels opacity={compAgeOp} centerX={220} y={528} values={AGE_LABEL_VALUES.fruitsZipper} spacing={70} fontSize={15} percentSize={13} lineGap={16} />
                <AgeAxisLabels opacity={compAgeOp} centerX={600} y={528} values={AGE_LABEL_VALUES.riize} spacing={70} fontSize={15} percentSize={13} lineGap={16} />
                <AgeAxisLabels opacity={compAgeOp} centerX={980} y={528} values={AGE_LABEL_VALUES.vaundy} spacing={70} fontSize={15} percentSize={13} lineGap={16} />
              </>
            )}

            <g className="fandom-profile__fan-silhouette" style={{ opacity: hideMainSvgPictograms ? 0 : 1 }}>
              {items.map((item) => (
                <PersonIcon key={item.id} data={item} progress={compositeProgress} />
              ))}
            </g>
          </svg>

          {showMobileAgeLabels && (
            <MobileIndividualAgeLabels
              currentScene={currentScene}
              fzAgeLabelOp={fzAgeLabelOp}
              rzAgeLabelOp={rzAgeLabelOp}
              vdAgeLabelOp={vdAgeLabelOp}
            />
          )}
        </div>

        <motion.div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4" style={{ opacity: introOp }}>
          <h2 className="fandom-profile__section-title text-4xl md:text-5xl text-white font-bold tracking-[0.1em] mb-8">
            ここに集まったのは、<br className="md:hidden" />どんな人たちなのか
          </h2>
        </motion.div>

        <motion.div
          className="fandom-profile__people-grid--fruits-zipper absolute z-20 w-full max-w-sm px-5 pt-14 top-0 left-0 right-0 mx-auto flex flex-col items-center text-center md:top-1/4 md:left-[10%] md:right-auto md:mx-0 md:px-0 md:pt-0 md:items-start md:text-left"
          style={{ opacity: fzTextOp, visibility: fzTextVisibility }}
        >
          <h3 className="fandom-profile__artist-name--fruits-zipper text-[#00D1FF] text-[28px] md:text-6xl font-bold tracking-widest mb-2 md:mb-4">
            FRUITS ZIPPER
          </h3>
          <p className="fandom-profile__scene-copy text-white/90 text-[17px] md:text-xl tracking-wide md:tracking-wider leading-relaxed">
            20〜50代で見ると<br />年代・性別ともにバランス型
          </p>
          <GenderLegend color={FZ_F} female={GENDER_RATIO.fruitsZipper.female} male={GENDER_RATIO.fruitsZipper.male} />
        </motion.div>

        <motion.div
          className="fandom-profile__people-grid--riize absolute z-20 w-full max-w-sm px-5 pt-14 top-0 left-0 right-0 mx-auto flex flex-col items-center text-center md:top-1/4 md:right-[10%] md:left-auto md:mx-0 md:px-0 md:pt-0 md:items-end md:text-right"
          style={{ opacity: rzTextOp, visibility: rzTextVisibility }}
        >
          <h3 className="fandom-profile__artist-name--riize text-[#FF4EDB] text-[28px] md:text-6xl font-bold tracking-widest mb-2 md:mb-4">
            RIIZE
          </h3>
          <p className="fandom-profile__scene-copy text-white/90 text-[17px] md:text-xl tracking-wide md:tracking-wider leading-relaxed">
            50代女性を中心に<br />強い女性支持が目立つ
          </p>
          <GenderLegend color={RZ_F} female={GENDER_RATIO.riize.female} male={GENDER_RATIO.riize.male} align="right" />
        </motion.div>

        <motion.div
          className="fandom-profile__people-grid--vaundy absolute z-20 w-full max-w-sm px-5 pt-14 top-0 left-0 right-0 mx-auto flex flex-col items-center text-center md:top-[15%] md:left-[10%] md:right-auto md:mx-0 md:px-0 md:pt-0 md:items-start md:text-left"
          style={{ opacity: vdTextOp, visibility: vdTextVisibility }}
        >
          <h3 className="fandom-profile__artist-name--vaundy text-[#A6FF4D] text-[28px] md:text-6xl font-bold tracking-widest mb-2 md:mb-4">
            Vaundy
          </h3>
          <p className="fandom-profile__scene-copy text-white/90 text-[17px] md:text-xl tracking-wide md:tracking-wider leading-relaxed">
            50代を中心に<br />幅広い年代から支持
          </p>
          <GenderLegend color={VD_F} female={GENDER_RATIO.vaundy.female} male={GENDER_RATIO.vaundy.male} />
        </motion.div>

        <motion.div
          className="fandom-profile__age-comparison hidden md:flex absolute inset-0 z-20 flex-col pointer-events-none overflow-hidden"
          style={{ opacity: compAgeOp, visibility: compAgeVisibility }}
        >
          <div className="shrink-0 pt-[10vh] text-center px-4">
            <h3 className="fandom-profile__age-chart text-white text-3xl font-bold tracking-[0.2em]">
              年代比較
            </h3>
          </div>

          <div className="w-full max-w-[1200px] mx-auto flex justify-between px-12 mt-[45vh]">
            <div className="text-[#00D1FF] font-bold tracking-widest text-lg w-32 text-center">F. ZIPPER</div>
            <div className="text-[#FF4EDB] font-bold tracking-widest text-lg w-32 text-center">RIIZE</div>
            <div className="text-[#A6FF4D] font-bold tracking-widest text-lg w-32 text-center">Vaundy</div>
          </div>

          <p className="fandom-profile__age-comparison-footnote absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[520px] px-4 text-xs text-white/50 text-center leading-relaxed tracking-[0.03em]">
            ※年代分析はLAPのデータから20代・30代・40代・50代を抽出して集計しています。
          </p>
        </motion.div>

        <motion.div
          className="fandom-profile__gender-comparison hidden md:flex absolute inset-0 z-20 flex-col pointer-events-none overflow-hidden"
          style={{ opacity: compGenderOp, visibility: compGenderVisibility }}
        >
          <div className="shrink-0 pt-[10vh] text-center px-4">
            <h3 className="fandom-profile__gender-comparison-title text-white text-3xl font-bold tracking-[0.2em]">
              性別比較
            </h3>
          </div>

          <div className="fandom-profile__gender-comparison-columns w-full max-w-[1200px] mx-auto px-12 flex justify-between gap-4 mt-[50vh]">
            {GENDER_COMPARISON_COLUMNS.map((column) => (
              <GenderComparisonColumn key={column.name} {...column} />
            ))}
          </div>

          <p className="fandom-profile__gender-comparison-footnote absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[520px] px-4 text-xs text-white/50 text-center leading-relaxed tracking-[0.03em]">
            ※年代分析はLAPのデータから20代・30代・40代・50代を抽出して集計しています。
          </p>
        </motion.div>

        <motion.div
          className="fandom-profile__mobile-demographic-morph-section md:hidden absolute inset-0 z-20 overflow-hidden pointer-events-none"
          style={{ opacity: mobileMorphOp }}
        >
          <MobileDemographicComparisonStack scrollYProgress={scrollYProgress} />
        </motion.div>

        <motion.div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none" style={{ opacity: silhouetteOp }}>
          <div className="bg-[#050505]/70 border border-white/10 px-10 py-8 rounded-2xl backdrop-blur-md text-center shadow-2xl">
            <p className="fandom-profile__scene-copy text-white text-2xl md:text-3xl tracking-[0.15em] leading-[2.5]">
              同じ会場に集まる。<br />しかし、その顔ぶれは異なる。
            </p>
            <div className="w-12 h-[1px] bg-[#333] mx-auto my-8" />
            <p className="text-[#a0a0a0] text-lg md:text-xl tracking-widest">
              人流は、ファンの形を映し出す。
            </p>
          </div>
        </motion.div>

        <motion.p
          className="fandom-profile__age-data-note absolute bottom-3 left-1/2 -translate-x-1/2 z-25 max-w-[min(340px,92vw)] px-3 text-[10px] text-white/50 leading-[1.9] tracking-[0.03em] text-center pointer-events-none md:bottom-8 md:right-10 md:left-auto md:translate-x-0 md:max-w-[300px] md:px-0 md:text-[11px] md:text-right"
          style={{ opacity: ageNoteOpacity }}
        >
          ※年代分析はLAPのデータから20代・30代・40代・50代を抽出して集計しています。
        </motion.p>
      </div>
    </section>
  );
}