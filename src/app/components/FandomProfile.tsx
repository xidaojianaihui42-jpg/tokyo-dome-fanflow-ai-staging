import React, { useRef, useMemo, useEffect, useState } from "react";
import { motion, useScroll, useTransform, MotionValue, useMotionValue, animate } from "motion/react";
import tokyoDomeMapNorth from "../../imports/tokyo-dome-map-north.jpeg";

const MAP_BASE_SIZE = { width: 2881, height: 1921 };
const TOKYO_DOME_POINT = {
  x: 1585 / MAP_BASE_SIZE.width,
  y: 884 / MAP_BASE_SIZE.height,
};
const MAP_OBJECT_POSITION = `center ${Math.round(TOKYO_DOME_POINT.y * 100)}%`;

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
    <div className={`mt-8 flex flex-col gap-3 ${align === "right" ? "items-end" : "items-start"}`}>
      <div className="flex items-center gap-3">
        <span
          className="inline-block w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
          style={{ backgroundColor: color, color }}
        />
        <span className="text-white/80 text-sm tracking-[0.16em] font-mono">
          女性 {female}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: MALE }}
        />
        <span className="text-white/70 text-sm tracking-[0.16em] font-mono">
          男性 {male}%
        </span>
      </div>
    </div>
  );
}

function AgeAxisLabels({
  opacity,
  centerX,
  y,
  values,
  spacing,
  fontSize = 14
}: {
  opacity: MotionValue<number>;
  centerX: number;
  y: number;
  values: number[];
  spacing: number;
  fontSize?: number;
}) {
  return (
    <motion.g style={{ opacity }}>
      {AGE_LABELS.map((label, i) => (
        <text
          key={`${centerX}-${label}`}
          x={centerX + (i - 1.5) * spacing}
          y={y}
          fill="#FFFFFF"
          fontSize={fontSize}
          fontWeight="700"
          textAnchor="middle"
          className="font-mono"
          style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,0.9))" }}
        >
          <tspan x={centerX + (i - 1.5) * spacing}>{label}</tspan>
          <tspan
            x={centerX + (i - 1.5) * spacing}
            dy="18"
            fill="#A0A0A0"
            fontSize={fontSize - 2}
            fontWeight="500"
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
      if (latest >= 0.10 && latest < 0.28) {
        if (currentScene !== "fz") {
          setCurrentScene("fz");
          fzInternalProgress.set(0);
          animate(fzInternalProgress, 1, { duration: 1.8, ease: "easeInOut", delay: 0.3 });
        }
      } else if (latest >= 0.28 && latest < 0.46) {
        if (currentScene !== "rz") {
          setCurrentScene("rz");
          rzInternalProgress.set(0);
          animate(rzInternalProgress, 1, { duration: 1.8, ease: "easeInOut", delay: 0.3 });
        }
      } else if (latest >= 0.46 && latest < 0.64) {
        if (currentScene !== "vd") {
          setCurrentScene("vd");
          vdInternalProgress.set(0);
          animate(vdInternalProgress, 1, { duration: 1.8, ease: "easeInOut", delay: 0.3 });
        }
      } else if (latest >= 0.64 && latest < 0.74) {
        if (currentScene !== "age-comp") {
          setCurrentScene("age-comp");
          ageCompInternalProgress.set(0);
          animate(ageCompInternalProgress, 1, { duration: 2.0, ease: "easeInOut", delay: 0.3 });
        }
      } else if (latest >= 0.74 && latest < 0.84) {
        if (currentScene !== "gender-comp") {
          setCurrentScene("gender-comp");
          genderCompInternalProgress.set(0);
          animate(genderCompInternalProgress, 1, { duration: 2.0, ease: "easeInOut", delay: 0.3 });
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

      if (scroll >= 0.10 && scroll < 0.28) {
        adjusted = 0.10 + (fzInternalProgress.get() * 0.08);
      } else if (scroll >= 0.28 && scroll < 0.46) {
        adjusted = 0.28 + (rzInternalProgress.get() * 0.08);
      } else if (scroll >= 0.46 && scroll < 0.64) {
        adjusted = 0.46 + (vdInternalProgress.get() * 0.08);
      } else if (scroll >= 0.64 && scroll < 0.74) {
        adjusted = 0.54 + (ageCompInternalProgress.get() * 0.10);
      } else if (scroll >= 0.74 && scroll < 0.84) {
        adjusted = 0.64 + (genderCompInternalProgress.get() * 0.10);
      }

      compositeProgress.set(adjusted);
    });

    const unsubscribeFZ = fzInternalProgress.on("change", () => {
      const scroll = scrollYProgress.get();
      if (scroll >= 0.10 && scroll < 0.28) compositeProgress.set(0.10 + (fzInternalProgress.get() * 0.08));
    });

    const unsubscribeRZ = rzInternalProgress.on("change", () => {
      const scroll = scrollYProgress.get();
      if (scroll >= 0.28 && scroll < 0.46) compositeProgress.set(0.28 + (rzInternalProgress.get() * 0.08));
    });

    const unsubscribeVD = vdInternalProgress.on("change", () => {
      const scroll = scrollYProgress.get();
      if (scroll >= 0.46 && scroll < 0.64) compositeProgress.set(0.46 + (vdInternalProgress.get() * 0.08));
    });

    const unsubscribeAgeComp = ageCompInternalProgress.on("change", () => {
      const scroll = scrollYProgress.get();
      if (scroll >= 0.64 && scroll < 0.74) compositeProgress.set(0.54 + (ageCompInternalProgress.get() * 0.10));
    });

    const unsubscribeGenderComp = genderCompInternalProgress.on("change", () => {
      const scroll = scrollYProgress.get();
      if (scroll >= 0.74 && scroll < 0.84) compositeProgress.set(0.64 + (genderCompInternalProgress.get() * 0.10));
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

  const introOp = useTransform(scrollYProgress, [0, 0.05, 0.08, 0.12], [0, 1, 1, 0]);
  const fzTextOp = useTransform(scrollYProgress, [0.08, 0.12, 0.25, 0.28], [0, 1, 1, 0]);
  const fzAgeLabelOp = useTransform(scrollYProgress, [0.16, 0.18, 0.25, 0.28], [0, 1, 1, 0]);
  const rzTextOp = useTransform(scrollYProgress, [0.26, 0.29, 0.43, 0.46], [0, 1, 1, 0]);
  const rzAgeLabelOp = useTransform(scrollYProgress, [0.34, 0.36, 0.43, 0.46], [0, 1, 1, 0]);
  const vdTextOp = useTransform(scrollYProgress, [0.44, 0.47, 0.61, 0.64], [0, 1, 1, 0]);
  const vdAgeLabelOp = useTransform(scrollYProgress, [0.52, 0.54, 0.61, 0.64], [0, 1, 1, 0]);
  const compAgeOp = useTransform(scrollYProgress, [0.62, 0.65, 0.71, 0.74], [0, 1, 1, 0]);
  const compGenderOp = useTransform(scrollYProgress, [0.72, 0.75, 0.81, 0.84], [0, 1, 1, 0]);
  const silhouetteOp = useTransform(scrollYProgress, [0.82, 0.85, 0.92, 0.95], [0, 1, 1, 0]);

  const ageNoteOpacity = useTransform(scrollYProgress, (s) => {
    if (s < 0.12) return 0;
    if (s <= 0.14) return (s - 0.12) / 0.02;
    if (s <= 0.82) return 1;
    if (s <= 0.84) return (0.84 - s) / 0.02;
    return 0;
  });

  return (
    <section ref={containerRef} className="section-fandom-profile relative h-[500vh] bg-[#050505]" style={{ position: "relative" }}>
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
          className="fandom-profile__artist-spotlight fandom-profile__artist-spotlight--age-comparison absolute inset-0 pointer-events-none"
          style={{
            opacity: compAgeOp,
            background:
              "radial-gradient(circle at 22% 50%, rgba(0,209,255,0.14), transparent 28%), radial-gradient(circle at 50% 50%, rgba(255,78,219,0.14), transparent 28%), radial-gradient(circle at 78% 50%, rgba(166,255,77,0.12), transparent 28%)"
          }}
        />

        <motion.div
          className="fandom-profile__artist-spotlight fandom-profile__artist-spotlight--gender-comparison absolute inset-0 pointer-events-none"
          style={{
            opacity: compGenderOp,
            background:
              "radial-gradient(circle at 22% 50%, rgba(0,209,255,0.12), transparent 28%), radial-gradient(circle at 50% 50%, rgba(255,78,219,0.12), transparent 28%), radial-gradient(circle at 78% 50%, rgba(166,255,77,0.10), transparent 28%)"
          }}
        />

        <div className="fandom-profile__dark-vignette absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(0,0,0,0.75)_100%)]" />

        <div className="fandom-profile__people-cloud hidden" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <svg viewBox="0 0 1200 800" className="w-full h-full max-h-screen">
            <AgeAxisLabels opacity={fzAgeLabelOp} centerX={600} y={525} values={AGE_LABEL_VALUES.fruitsZipper} spacing={90} />
            <AgeAxisLabels opacity={rzAgeLabelOp} centerX={600} y={525} values={AGE_LABEL_VALUES.riize} spacing={90} />
            <AgeAxisLabels opacity={vdAgeLabelOp} centerX={600} y={525} values={AGE_LABEL_VALUES.vaundy} spacing={90} />

            <AgeAxisLabels opacity={compAgeOp} centerX={220} y={525} values={AGE_LABEL_VALUES.fruitsZipper} spacing={70} fontSize={11} />
            <AgeAxisLabels opacity={compAgeOp} centerX={600} y={525} values={AGE_LABEL_VALUES.riize} spacing={70} fontSize={11} />
            <AgeAxisLabels opacity={compAgeOp} centerX={980} y={525} values={AGE_LABEL_VALUES.vaundy} spacing={70} fontSize={11} />

            <g className="fandom-profile__fan-silhouette">
              {items.map((item) => (
                <PersonIcon key={item.id} data={item} progress={compositeProgress} />
              ))}
            </g>
          </svg>
        </div>

        <motion.div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4" style={{ opacity: introOp }}>
          <h2 className="fandom-profile__section-title text-4xl md:text-5xl text-white font-bold tracking-[0.1em] mb-8">
            集まったのは、<br className="md:hidden" />どんな人たちなのか。
          </h2>
          <p className="fandom-profile__section-copy text-[#a0a0a0] text-lg md:text-xl tracking-[0.1em] leading-loose">
            人流の先には<br />それぞれの物語がある。
          </p>
        </motion.div>

        <motion.div className="fandom-profile__people-grid--fruits-zipper absolute top-1/4 left-[10%] z-20 max-w-sm" style={{ opacity: fzTextOp }}>
          <h3 className="fandom-profile__artist-name--fruits-zipper text-[#00D1FF] text-4xl md:text-5xl font-bold tracking-widest mb-4">
            FRUITS ZIPPER
          </h3>
          <p className="fandom-profile__scene-copy text-white/90 text-lg tracking-wider leading-relaxed">
            20〜50代で見ると<br />年代・性別ともにバランス型
          </p>
          <GenderLegend color={FZ_F} female={GENDER_RATIO.fruitsZipper.female} male={GENDER_RATIO.fruitsZipper.male} />
        </motion.div>

        <motion.div className="fandom-profile__people-grid--riize absolute top-1/4 right-[10%] z-20 max-w-sm text-right" style={{ opacity: rzTextOp }}>
          <h3 className="fandom-profile__artist-name--riize text-[#FF4EDB] text-4xl md:text-5xl font-bold tracking-widest mb-4">
            RIIZE
          </h3>
          <p className="fandom-profile__scene-copy text-white/90 text-lg tracking-wider leading-relaxed">
            50代女性を中心に<br />強い女性支持が目立つ
          </p>
          <GenderLegend color={RZ_F} female={GENDER_RATIO.riize.female} male={GENDER_RATIO.riize.male} align="right" />
        </motion.div>

        <motion.div className="fandom-profile__people-grid--vaundy absolute top-[15%] left-[10%] z-20 max-w-sm" style={{ opacity: vdTextOp }}>
          <h3 className="fandom-profile__artist-name--vaundy text-[#A6FF4D] text-4xl md:text-5xl font-bold tracking-widest mb-4">
            Vaundy
          </h3>
          <p className="fandom-profile__scene-copy text-white/90 text-lg tracking-wider leading-relaxed">
            50代を中心に<br />幅広い年代から支持
          </p>
          <GenderLegend color={VD_F} female={GENDER_RATIO.vaundy.female} male={GENDER_RATIO.vaundy.male} />
        </motion.div>

        <motion.div className="fandom-profile__age-comparison absolute top-[10%] inset-x-0 z-20 flex flex-col items-center" style={{ opacity: compAgeOp }}>
          <h3 className="fandom-profile__age-chart text-white text-3xl font-bold tracking-[0.2em] mb-12">年代比較</h3>
          <div className="w-full max-w-[1200px] flex justify-between px-12 mt-[45vh]">
            <div className="text-[#00D1FF] font-bold tracking-widest text-lg w-32 text-center">F. ZIPPER</div>
            <div className="text-[#FF4EDB] font-bold tracking-widest text-lg w-32 text-center">RIIZE</div>
            <div className="text-[#A6FF4D] font-bold tracking-widest text-lg w-32 text-center">Vaundy</div>
          </div>
        </motion.div>

        <motion.div className="fandom-profile__gender-comparison absolute top-[10%] inset-x-0 z-20 flex flex-col items-center" style={{ opacity: compGenderOp }}>
          <h3 className="fandom-profile__gender-comparison-title text-white text-3xl font-bold tracking-[0.2em] mb-12">性別比較</h3>
          <div className="w-full max-w-[1200px] flex justify-between px-12 mt-[35vh]">
            <div className="text-center w-32">
              <div className="text-[#00D1FF] font-bold tracking-widest text-lg mb-2">F. ZIPPER</div>
              <div className="text-[#888] font-mono text-sm">女性51% / 男性49%</div>
            </div>
            <div className="text-center w-32">
              <div className="text-[#FF4EDB] font-bold tracking-widest text-lg mb-2">RIIZE</div>
              <div className="text-[#888] font-mono text-sm">女性81% / 男性19%</div>
            </div>
            <div className="text-center w-32">
              <div className="text-[#A6FF4D] font-bold tracking-widest text-lg mb-2">Vaundy</div>
              <div className="text-[#888] font-mono text-sm">女性73% / 男性27%</div>
            </div>
          </div>
        </motion.div>

        <motion.div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none" style={{ opacity: silhouetteOp }}>
          <div className="bg-[#050505]/70 border border-white/10 px-10 py-8 rounded-2xl backdrop-blur-md text-center shadow-2xl">
            <p className="fandom-profile__scene-copy text-white text-2xl md:text-3xl tracking-[0.15em] leading-[2.5]">
              同じ会場に集まる。<br />しかし、その顔ぶれは違う。
            </p>
            <div className="w-12 h-[1px] bg-[#333] mx-auto my-8" />
            <p className="text-[#a0a0a0] text-lg md:text-xl tracking-widest">
              人流は、ファンのかたちを映し出す。
            </p>
          </div>
        </motion.div>

        <motion.p
          className="fandom-profile__age-data-note absolute bottom-6 right-4 md:bottom-8 md:right-10 z-25 max-w-[300px] text-[10px] md:text-[11px] text-white/50 leading-[1.9] tracking-[0.03em] text-right pointer-events-none"
          style={{ opacity: ageNoteOpacity }}
        >
          ※年代分析はLAPのデータから20代・30代・40代・50代を抽出して集計しています。
        </motion.p>
      </div>
    </section>
  );
}