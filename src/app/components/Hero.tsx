import React, { useEffect, useRef, useMemo, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, animate } from "motion/react";
import type { MotionValue } from "motion/react";

import heroMapImage from "../../imports/heromap1.png";
import tokyoDomePhoto from "../../imports/Dome_hero.jpg";

const MAP_BASE_SIZE = { width: 1000, height: 1000 };
const TOKYO_MAP_POINT = {
  x: 530 / MAP_BASE_SIZE.width,
  y: 623 / MAP_BASE_SIZE.height,
};
const TOKYO_MAP_ORIGIN = `${TOKYO_MAP_POINT.x * 100}% ${TOKYO_MAP_POINT.y * 100}%`;

function JapanMapLayer({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const mapScale = useTransform(scrollProgress, [0, 0.2], [1, 20]);
  const mapOpacity = useTransform(scrollProgress, [0.1, 0.2], [1, 0]);

  const tokyoGlowOpacity = useTransform(scrollProgress, [0.02, 0.08, 0.18, 0.2], [0, 1, 1, 0]);
  const tokyoGlowScale = useTransform(scrollProgress, [0.02, 0.12, 0.2], [0.6, 1.6, 3.2]);
  const tokyoPulseOpacity = useTransform(scrollProgress, [0.02, 0.12, 0.2], [0.2, 0.75, 0]);

  const particles = useMemo(() => {
    const dots: any[] = [];

    const addDots = (cx: number, cy: number, rx: number, ry: number, count: number, color: string) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random();
        dots.push({
          x: cx + Math.cos(angle) * rx * r,
          y: cy + Math.sin(angle) * ry * r,
          size: Math.random() * 2 + 1,
          delay: Math.random() * 2,
          color,
        });
      }
    };

    addDots(750, 180, 70, 60, 40, "rgba(120,120,120,0.45)");
    addDots(650, 320, 60, 90, 50, "rgba(120,120,120,0.4)");
    addDots(580, 450, 50, 50, 80, "rgba(0,209,255,0.65)");
    addDots(480, 520, 80, 60, 60, "rgba(120,120,120,0.35)");
    addDots(400, 600, 60, 50, 40, "rgba(120,120,120,0.35)");
    addDots(220, 720, 60, 70, 40, "rgba(120,120,120,0.35)");

    return dots;
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      style={{ opacity: mapOpacity }}
    >
      <motion.div
        className="relative w-full max-w-[1000px] aspect-square"
        style={{
          scale: mapScale,
          transformOrigin: TOKYO_MAP_ORIGIN,
        }}
      >
        <img
          src={heroMapImage}
          alt="日本地図"
          className="hero__japan-map-image w-full h-full object-contain opacity-95"
        />

        <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full">
          {particles.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill={p.color}
              initial={{ opacity: 0.15 }}
              animate={{ opacity: [0.15, 0.65, 0.15] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>

        <motion.div
          className="hero__tokyo-glow absolute rounded-full pointer-events-none"
          style={{
            left: `${TOKYO_MAP_POINT.x * 100}%`,
            top: `${TOKYO_MAP_POINT.y * 100}%`,
            x: "-50%",
            y: "-50%",
            width: "18px",
            height: "18px",
            scale: tokyoGlowScale,
            opacity: tokyoGlowOpacity,
            background: "#00D1FF",
            boxShadow:
              "0 0 20px #00D1FF, 0 0 56px rgba(0,209,255,0.85), 0 0 120px rgba(0,209,255,0.45)",
          }}
        />

        <motion.div
          className="hero__tokyo-glow-ring absolute rounded-full border border-[#00D1FF] pointer-events-none"
          style={{
            left: `${TOKYO_MAP_POINT.x * 100}%`,
            top: `${TOKYO_MAP_POINT.y * 100}%`,
            x: "-50%",
            y: "-50%",
            width: "86px",
            height: "86px",
            scale: tokyoGlowScale,
            opacity: tokyoPulseOpacity,
            boxShadow: "0 0 60px rgba(0,209,255,0.55)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

function ParticleCanvas({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);

  useEffect(() => {
    const p = [];

    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 1200 + 600;
      const rand = Math.random();

      p.push({
        angle,
        distance,
        speedFactor: Math.random() * 0.5 + 0.5,
        size: Math.random() * 3.5 + 1.5,
        delay: 0.05 + rand * rand * 0.5,
        duration: 0.15 + Math.random() * 0.1,
      });
    }

    particles.current = p;
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const latest = scrollProgress.get();
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.7;

      particles.current.forEach((particle) => {
        let pt = (latest - particle.delay) / particle.duration;
        pt = Math.max(0, Math.min(1, pt));

        const easePt = pt < 0.5 ? 2 * pt * pt : 1 - Math.pow(-2 * pt + 2, 2) / 2;
        const currentDistance = particle.distance * (1 - easePt);
        const currentAngle = particle.angle + pt * 1.5 * (particle.speedFactor > 0.7 ? 1 : -1);

        const x = centerX + Math.cos(currentAngle) * currentDistance;
        const y = centerY + Math.sin(currentAngle) * currentDistance;
        const size = particle.size * (1 - pt * 0.8);

        let opacity = 0;

        if (latest < particle.delay) {
          opacity = 0.15 * (latest / particle.delay);
        } else if (pt < 1) {
          opacity = 1 - Math.pow(pt, 3);
        }

        if (opacity <= 0) return;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 220, 100, ${opacity})`;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y);

        const velocity = pt < 0.5 ? 4 * pt : 4 * (1 - pt);
        const tailLength = (velocity * 80 + 10) * particle.speedFactor * (1 - pt);
        const tailX = centerX + Math.cos(currentAngle) * (currentDistance + tailLength);
        const tailY = centerY + Math.sin(currentAngle) * (currentDistance + tailLength);

        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = `rgba(160, 200, 80, ${opacity * 0.7})`;
        ctx.lineWidth = size * 1.2;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [scrollProgress]);

  return (
    <canvas
      ref={canvasRef}
      className="hero__particle-flow js-hero-particles absolute inset-0 pointer-events-none z-20"
    />
  );
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const autoProgress = useMotionValue(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 800));

      await animate(autoProgress, 0.2, {
        duration: 3.0,
        ease: "easeInOut",
      });

      await animate(autoProgress, 0.9, {
        duration: 3.0,
        ease: "easeInOut",
      });

      setAnimationComplete(true);
    };

    sequence();
  }, [autoProgress]);

  const titleOpacityScroll = useTransform(scrollYProgress, (s) => {
    if (s >= 0.72) return 0;
    if (s <= 0.62) return 1;
    return 1 - (s - 0.62) / 0.1;
  });
  const titleY = useTransform(scrollYProgress, [0.62, 0.72], [0, -50]);
  const titleScale = useTransform(scrollYProgress, [0.62, 0.72], [1, 0.95]);

  const titleOpacityFromDome = useTransform(autoProgress, [0.15, 0.25], [1, 0.6]);

  const titleOpacity = useTransform(
    [titleOpacityScroll, titleOpacityFromDome],
    ([scrollOp, domeOp]: number[]) => scrollOp * domeOp
  );

  const titleBlockYFromDome = useTransform(autoProgress, [0.12, 0.25], [0, -110]);

  const titleBlockY = useTransform(
    [titleY, titleBlockYFromDome],
    ([scrollY, domeY]: number[]) => scrollY + domeY
  );

  const subtitleY = useTransform(autoProgress, [0.15, 0.25], [20, 0]);

  const subtitleOpacity = useTransform(
    [autoProgress, scrollYProgress],
    ([a, s]: number[]) => {
      const fromAuto = a < 0.15 ? 0 : a > 0.25 ? 1 : (a - 0.15) / 0.1;
      const fromScroll = s > 0.72 ? 0 : s > 0.62 ? 1 - (s - 0.62) / 0.1 : 1;
      return Math.min(fromAuto, fromScroll);
    }
  );

  const domeOpacity = useTransform(
    [autoProgress, scrollYProgress],
    ([a, s]: number[]) => {
      const fromAuto = a < 0.15 ? 0 : a > 0.25 ? 1 : (a - 0.15) / 0.1;
      const fromScroll = s > 0.86 ? 0 : s > 0.8 ? 1 - (s - 0.8) / 0.06 : 1;
      return Math.min(fromAuto, fromScroll);
    }
  );

  const domeScale = useTransform(
    [autoProgress, scrollYProgress],
    ([a, s]: number[]) => {
      const fromAuto = a < 0.15 ? 0.6 : a > 0.25 ? 1 : 0.6 + ((a - 0.15) / 0.1) * 0.4;
      const fromScroll = s > 0.86 ? 0.7 : s > 0.8 ? 1 - ((s - 0.8) / 0.06) * 0.3 : 1;
      return fromAuto * fromScroll;
    }
  );

  const glowGlass = useTransform(scrollYProgress, [0.3, 0.6, 0.8, 0.86], [0, 0.45, 0.6, 0]);
  const glowRoof = useTransform(scrollYProgress, [0.6, 0.8, 0.84, 0.88], [0, 0.45, 0.75, 0]);
  const glowFlash = useTransform(scrollYProgress, [0.75, 0.8, 0.83, 0.88], [0, 0.25, 0.08, 0]);

  const canvasOpacity = useTransform(scrollYProgress, [0.78, 0.86], [1, 0.25]);

  const heroEndingGlowOpacity = useTransform(
    scrollYProgress,
    [0.76, 0.82, 0.92, 1],
    [0, 1, 0.65, 0.15]
  );

  const heroEndingGlowScale = useTransform(
    scrollYProgress,
    [0.76, 0.86, 1],
    [0.8, 1.25, 1.6]
  );

  const heroEndSoftFadeOpacity = useTransform(
    scrollYProgress,
    [0.88, 1],
    [0, 0.32]
  );

  const nextSectionHeadingOpacity = useTransform(scrollYProgress, (s) => {
    if (s < 0.62) return 0;
    if (s <= 0.68) return (s - 0.62) / 0.06;
    if (s <= 0.96) return 1;
    if (s <= 0.99) return 1 - (s - 0.96) / 0.03;
    return 0;
  });

  const nextSectionHeadingY = useTransform(
    scrollYProgress,
    [0.62, 0.68, 0.96],
    [28, 0, 0]
  );

  const nextSectionHeadingBlur = useTransform(
    scrollYProgress,
    [0.62, 0.68, 0.96],
    ["blur(14px)", "blur(0px)", "blur(0px)"]
  );

  const nextSectionBodyOpacity = useTransform(scrollYProgress, (s) => {
    if (s < 0.68) return 0;
    if (s <= 0.74) return (s - 0.68) / 0.06;
    if (s <= 0.96) return 1;
    if (s <= 0.99) return 1 - (s - 0.96) / 0.03;
    return 0;
  });

  const nextSectionBodyY = useTransform(
    scrollYProgress,
    [0.68, 0.74, 0.96],
    [22, 0, 0]
  );

  const nextSectionBodyBlur = useTransform(
    scrollYProgress,
    [0.68, 0.74, 0.96],
    ["blur(12px)", "blur(0px)", "blur(0px)"]
  );

  const nextSectionNoteOpacity = useTransform(scrollYProgress, (s) => {
    if (s < 0.82) return 0;
    if (s <= 0.88) return (s - 0.82) / 0.06;
    if (s <= 0.96) return 1;
    if (s <= 0.99) return 1 - (s - 0.96) / 0.03;
    return 0;
  });

  const nextSectionNoteY = useTransform(
    scrollYProgress,
    [0.82, 0.88, 0.96],
    [14, 0, 0]
  );

  const nextSectionNoteBlur = useTransform(
    scrollYProgress,
    [0.82, 0.88, 0.96],
    ["blur(6px)", "blur(0px)", "blur(0px)"]
  );

  const initialScrollIndicatorOpacity = useTransform(
    scrollYProgress,
    [0, 0.1],
    [animationComplete ? 1 : 0, 0]
  );

  return (
    <section
      ref={containerRef}
      className="section-hero h-[560vh] relative w-full bg-[#050505]"
      style={{ fontFamily: "'Noto Sans JP', sans-serif", position: "relative" }}
    >
      <div className="sticky top-0 w-full h-[100vh] overflow-hidden flex flex-col items-center justify-center">
        <div className="hero__background absolute inset-0 bg-[#050505] z-0" />

        <div
          className="hero__noise-overlay absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-screen z-50"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />

        <JapanMapLayer scrollProgress={autoProgress} />

        <motion.div
          className="hero__tokyo-dome-photo absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] md:w-[56%] max-w-[900px] flex justify-center z-10 pointer-events-none"
          style={{ scale: domeScale, opacity: domeOpacity }}
        >
          <div className="relative w-full aspect-[16/9]">
            <div
              className="relative w-full h-full"
              style={{
                maskImage:
                  "radial-gradient(ellipse 100% 92% at 50% 52%, black 48%, rgba(0,0,0,0.75) 68%, transparent 92%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 100% 92% at 50% 52%, black 48%, rgba(0,0,0,0.75) 68%, transparent 92%)",
              }}
            >
              <img
                src={tokyoDomePhoto}
                alt="Tokyo Dome"
                className="hero__tokyo-dome-image w-full h-full object-cover saturate-[0.85] brightness-[0.88] contrast-[1.08]"
              />

              <div
                className="absolute inset-0 backdrop-blur-[3px] pointer-events-none"
                style={{
                  maskImage: "radial-gradient(ellipse at center, transparent 58%, black 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse at center, transparent 58%, black 100%)",
                }}
              />

              <div className="absolute inset-0 bg-[#020513] mix-blend-overlay opacity-35 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_52%,#050505_100%)] opacity-55 pointer-events-none" />
              <div className="absolute inset-0 shadow-[inset_0_0_56px_24px_#050505] pointer-events-none" />

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68%] h-[55%] bg-blue-500/12 blur-[45px] mix-blend-screen pointer-events-none" />

              <motion.div
                className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[62%] h-[36%] bg-blue-400 blur-[36px] mix-blend-screen pointer-events-none"
                style={{ opacity: glowGlass }}
              />

              <motion.div
                className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[56%] h-[28%] bg-blue-200 blur-[38px] mix-blend-screen pointer-events-none"
                style={{ opacity: glowRoof }}
              />

              <motion.div
                className="absolute inset-0 bg-blue-400 blur-[45px] mix-blend-screen pointer-events-none"
                style={{ opacity: glowFlash }}
              />
            </div>

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 38%, rgba(5,5,5,0.72) 66%, #050505 88%)",
              }}
            />
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ opacity: canvasOpacity }}
        >
          <ParticleCanvas scrollProgress={scrollYProgress} />
        </motion.div>

        <motion.div
          className="hero__ending-glow absolute inset-0 pointer-events-none z-25"
          style={{
            opacity: heroEndingGlowOpacity,
            scale: heroEndingGlowScale,
            background:
              "radial-gradient(circle at 50% 62%, rgba(120,200,255,0.85) 0%, rgba(60,150,255,0.52) 20%, rgba(15,35,70,0.72) 48%, rgba(5,5,10,0.88) 78%, rgba(0,0,0,0.95) 100%)",
            mixBlendMode: "screen",
          }}
        />

        <motion.div
          className="hero__end-soft-fade absolute inset-0 pointer-events-none z-26 bg-[#05070d]"
          style={{ opacity: heroEndSoftFadeOpacity }}
        />

        <div className="hero__next-section-copy absolute inset-0 z-[29] flex flex-col items-center justify-center pointer-events-none px-5 md:px-6 pt-14 md:pt-0 w-full max-w-full overflow-hidden box-border">
          <motion.div
            className="w-full max-w-[320px] md:max-w-none mx-auto"
            style={{
              opacity: nextSectionHeadingOpacity,
              y: nextSectionHeadingY,
              filter: nextSectionHeadingBlur,
            }}
          >
            <p className="text-white text-[32px] md:text-[44px] lg:text-[56px] font-bold tracking-[0.06em] md:tracking-[0.14em] leading-[1.3] md:leading-relaxed text-center drop-shadow-[0_0_32px_rgba(255,255,255,0.32)] break-keep">
              <span className="md:hidden">
                人流データから
                <br />
                見えてきたもの
              </span>
              <span className="hidden md:inline">人流データから見えてきたもの</span>
            </p>
          </motion.div>

          <motion.div
            className="hero__next-section-body mt-5 md:mt-8 w-full max-w-[320px] md:max-w-[860px] lg:max-w-[900px]"
            style={{
              opacity: nextSectionBodyOpacity,
              y: nextSectionBodyY,
              filter: nextSectionBodyBlur,
            }}
          >
            <p
              className="text-[18px] md:text-[18px] lg:text-[22px] text-center tracking-[0.02em] md:tracking-[0.06em] font-medium break-keep leading-[1.75] md:leading-[1.9]"
              style={{ color: "rgba(255,255,255,0.84)" }}
            >
              <span className="md:hidden block">
                <span className="block">東京ドームという同じ会場でも、</span>
                <span className="block">来場者の動きは一様ではない。</span>
                <span className="block mt-3">居住地、来場時間、年代・性別の</span>
                <span className="block">データを追うと、</span>
                <span className="block mt-3">アーティストごとに異なる</span>
                <span className="block">ファンダムの輪郭が見えてくる。</span>
              </span>
              <span className="hidden md:inline">
                東京ドームという同じ会場でも、来場者の動きは一様ではない。
                <br />
                居住地、来場時間、年代・性別のデータを追うと、
                <br />
                アーティストごとに異なるファンダムの輪郭が見えてくる。
              </span>
            </p>
          </motion.div>

          <motion.div
            className="hero__data-source-note mt-8 md:mt-12 w-full max-w-[min(100%,calc(100vw-32px))] md:max-w-[720px] mx-auto box-border px-4 py-4 md:px-6 md:py-4 rounded-lg bg-black/28 border border-white/[0.07] min-w-0"
            style={{
              opacity: nextSectionNoteOpacity,
              y: nextSectionNoteY,
              filter: nextSectionNoteBlur,
            }}
          >
            <p
              className="text-[12px] text-left md:text-center tracking-[0.01em] md:tracking-[0.02em] leading-[1.75] md:leading-[1.85] break-words [overflow-wrap:anywhere]"
              style={{
                color: "rgba(255,255,255,0.58)",
              }}
            >
              今回のインフォグラフィックは、Location AI（東京・渋谷）が独自開発した『Location AI Platform（LAP）』を活用して制作しました。LAPは、提携先のスマートフォンアプリを通じて利用者の許諾を得て取得した累計3兆レコードを超える位置情報ビッグデータをAI技術により解析・統計データ化し、多様な人流分析を可能にしています。
            </p>
          </motion.div>
        </div>

        <motion.div
          className="hero__title-wrapper absolute top-[20%] md:top-[25%] z-30 flex flex-col items-center text-center px-4 w-full"
          style={{
            opacity: titleOpacity,
            y: titleBlockY,
            scale: titleScale,
          }}
        >
          <h1 className="hero__title js-hero-title text-white font-bold tracking-[0.15em] leading-[1.2] text-[42px] md:text-[64px] lg:text-[84px] drop-shadow-2xl">
            推しが動かす人流。
          </h1>

          <motion.p
            className="hero__subtitle js-hero-subtitle text-[#a0a0a0] text-[16px] md:text-[20px] lg:text-[24px] mt-8 tracking-[0.1em] font-medium max-w-2xl leading-relaxed"
            style={{ opacity: subtitleOpacity, y: subtitleY }}
          >
            東京ドームに集うファンの、<br className="md:hidden" />
            行動と属性。
          </motion.p>
        </motion.div>

        <motion.div
          className="hero__scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30 pointer-events-none"
          style={{ opacity: initialScrollIndicatorOpacity }}
        >
          <motion.span className="text-[12px] tracking-[0.3em] uppercase font-mono text-white/90 font-bold">
            Scroll to Explore
          </motion.span>

          <motion.div className="w-[2px] h-16 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}