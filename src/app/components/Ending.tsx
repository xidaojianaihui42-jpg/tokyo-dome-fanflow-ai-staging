import React, { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import japanMapImage from "../../imports/japan-07s.png";
import { NikkeiTrendyPresentedBy } from "./NikkeiTrendyLogo";

// ==========================================
// 定数・設定
// ==========================================
const PARTICLES_PER_ARTIST = 100;
const TOTAL_PARTICLES = PARTICLES_PER_ARTIST * 3;

const COLORS = {
  FZ: "#00D1FF",
  RZ: "#FF4EDB",
  VD: "#A6FF4D"
};

// スクロール区間キーフレーム
const T = {
  cardFade: 0.1,
  mapScatter: 0.25,
  toTokyoStart: 0.4,
  toTokyoEnd: 0.55,
  domeZoom: 0.7,
  audienceLight: 0.8,
  finalMessage: 0.9,
  /** クレジット表示開始（finalMessage の後） */
  credit: 0.91,
  creditFull: 0.95,
  creditHold: 0.985,
};

// ==========================================
// 座標生成ヘルパー
// ==========================================
// 初期位置：比較カードがあった場所（左・中央・右）
function getCardPos(artistIndex: number) {
  const xOffsets = [300, 600, 900]; // 1200幅キャンバス基準
  return { 
    x: xOffsets[artistIndex] + (Math.random() - 0.5) * 200, 
    y: 400 + (Math.random() - 0.5) * 300 
  };
}

// 日本全国のランダムな位置（東京を避ける）
function getJapanPos() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 250 + Math.random() * 300; // 東京(600, 450)からの距離
  return {
    x: 600 + Math.cos(angle) * radius,
    y: 450 + Math.sin(angle) * radius * 0.8 // 楕円形に散らす
  };
}

// 東京ドームの観客席（楕円形）
function getDomePos() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 100 + Math.random() * 150; // ドームの中心を空けて周囲に配置
  return {
    x: 600 + Math.cos(angle) * radius,
    y: 450 + Math.sin(angle) * radius * 0.7
  };
}

const PROJECT_MEMBERS = [
  "Kenji Hada",
  "Masayuki Otani",
  "Tatsuhisa Shirakabe",
  "Yutaka Toba",
  "Masahiro Kurata",
  "Hidekazu Takahashi",
  "Kanae Nishijima",
] as const;

function Particle({ data, progress }: { data: any, progress: MotionValue<number> }) {
  const x = useTransform(progress, data.times, data.xPos);
  const y = useTransform(progress, data.times, data.yPos);
  const scale = useTransform(progress, data.times, data.scales);
  const opacity = useTransform(progress, data.times, data.opacities);
  
  return (
    <motion.circle
      className={`ending__particle ${data.artistClass}`}
      cx={0}
      cy={0}
      r={2}
      fill={data.color}
      style={{ x, y, scale, opacity }}
      animate={{
        cx: [0, data.autoX, data.autoX * -0.45, 0],
        cy: [0, data.autoY, data.autoY * -0.35, 0],
        r: [1.8, 2.8, 2.1, 1.8]
      }}
      transition={{
        duration: data.autoDuration,
        delay: data.autoDelay,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut"
      }}
    />
  );
}

// ==========================================
// メインセクション
// ==========================================
export function Ending() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // ------------------------------------------------
  // 粒子の軌道計算
  // ------------------------------------------------
  const particles = useMemo(() => {
    const arr = [];
    const artists = ["FZ", "RZ", "VD"];
    
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const artistIndex = Math.floor(i / PARTICLES_PER_ARTIST);
      const color = COLORS[artists[artistIndex] as keyof typeof COLORS];
      
      const posCard = getCardPos(artistIndex);
      const posJapan = getJapanPos();
      const posDome = getDomePos();
      
      const toTokyoDelay = Math.random() * 0.05; // 粒ごとに向かうタイミングをずらす
      const autoAngle = Math.random() * Math.PI * 2;
      const autoRadius = 2 + Math.random() * 7;
      
      arr.push({
        id: i,
        color,
        artistClass: `ending__particles--${artists[artistIndex].toLowerCase()}`,
        times: [
          0, 
          T.cardFade, 
          T.mapScatter, 
          T.toTokyoStart + toTokyoDelay, 
          T.toTokyoEnd + toTokyoDelay, 
          T.domeZoom, 
          T.audienceLight
        ],
        xPos: [posCard.x, posCard.x, posJapan.x, posJapan.x, 600, 600, posDome.x],
        yPos: [posCard.y, posCard.y, posJapan.y, posJapan.y, 450, 450, posDome.y],
        scales: [2, 1, 1, 1, 1, 2, 0.8],
        opacities: [0, 1, 0.6, 0.6, 0.8, 1, 0.48],
        autoX: Math.cos(autoAngle) * autoRadius,
        autoY: Math.sin(autoAngle) * autoRadius,
        autoDuration: 3.8 + Math.random() * 4.2,
        autoDelay: Math.random() * 2.4
      });
    }
    return arr;
  }, []);

  // ------------------------------------------------
  // 背景要素・テキストの不透明度制御
  // ------------------------------------------------
  
  // 日本地図（線）
  const mapOpacity = useTransform(scrollYProgress, [T.cardFade, T.mapScatter, T.toTokyoStart, T.toTokyoEnd], [0, 0.2, 0.2, 0]);
  const mapScale = useTransform(scrollYProgress, [T.cardFade, T.toTokyoEnd], [0.9, 1.2]);
  
  // コピー群
  const copy01Op = useTransform(scrollYProgress, [T.cardFade, T.mapScatter, T.toTokyoStart, T.toTokyoStart + 0.05], [0, 1, 1, 0]);
  
  const copy02Op = useTransform(scrollYProgress, [T.toTokyoStart, T.toTokyoStart + 0.05, T.toTokyoEnd - 0.05, T.toTokyoEnd], [0, 1, 1, 0]);
  const copy03Op = useTransform(scrollYProgress, [T.toTokyoStart + 0.05, T.toTokyoStart + 0.1, T.toTokyoEnd - 0.04, T.toTokyoEnd], [0, 1, 1, 0]);
  const copy04Op = useTransform(scrollYProgress, [T.toTokyoStart + 0.1, T.toTokyoStart + 0.12, T.toTokyoEnd - 0.01, T.toTokyoEnd], [0, 1, 1, 0]);

  // 東京ドーム（ワイヤーフレーム）
  const domeScale = useTransform(scrollYProgress, [T.toTokyoEnd, T.domeZoom], [0.1, 1]);
  const domeOpacity = useTransform(scrollYProgress, [T.toTokyoEnd, T.domeZoom, T.finalMessage], [0, 0.5, 0.1]);

  // コピー群（ドーム内）
  const copy05Op = useTransform(scrollYProgress, [T.domeZoom, T.domeZoom + 0.03, T.audienceLight - 0.02, T.audienceLight], [0, 1, 1, 0]);
  const copy06Op = useTransform(scrollYProgress, [T.domeZoom + 0.04, T.domeZoom + 0.07, T.audienceLight - 0.02, T.audienceLight], [0, 1, 1, 0]);
  const copy07Op = useTransform(scrollYProgress, [T.domeZoom + 0.08, T.domeZoom + 0.095, T.audienceLight - 0.003, T.audienceLight], [0, 1, 1, 0]);

  // ラストメッセージ（クレジット表示前にフェードアウト）
  const finalTitleOp = useTransform(
    scrollYProgress,
    [T.audienceLight, T.finalMessage, T.credit - 0.01, T.credit + 0.03],
    [0, 1, 1, 0]
  );
  const finalTitleY = useTransform(scrollYProgress, [T.audienceLight, T.finalMessage], [20, 0]);
  const finalCopyOp = useTransform(
    scrollYProgress,
    [T.finalMessage, T.finalMessage + 0.02, T.credit + 0.02, T.credit + 0.05],
    [0, 1, 1, 0]
  );
  const finalCopyY = useTransform(scrollYProgress, [T.finalMessage, T.finalMessage + 0.04], [20, 0]);

  // クレジット（ゆっくりフェードイン → 長めにキープ → 最後まで表示維持）
  const creditOp = useTransform(
    scrollYProgress,
    [T.credit, T.creditFull, T.creditHold, 1],
    [0, 1, 1, 1]
  );
  const creditY = useTransform(scrollYProgress, [T.credit, T.creditFull], [20, 0]);

  return (
    <section ref={containerRef} className="section-ending relative h-[600vh] bg-[#050505]" style={{ position: "relative" }}>
      <div className="ending__background sticky top-0 w-full h-[100vh] overflow-hidden flex flex-col items-center justify-center bg-[#050505]">
        
        {/* --- 背景キャンバス層 --- */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <svg viewBox="0 0 1200 900" className="w-full h-full max-h-screen">

            {/* 日本地図の抽象表現（極薄の画像） */}
            <motion.g
              className="ending__japan-map"
              style={{ opacity: mapOpacity, scale: mapScale, transformOrigin: "600px 450px" }}
            >
              <foreignObject x="300" y="150" width="600" height="600">
                <img
                  src={japanMapImage}
                  alt="日本地図"
                  style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.14 }}
                />
              </foreignObject>
              <circle cx="600" cy="450" r="10" fill="none" stroke="rgba(255,255,255,0.1)" />
            </motion.g>

            {/* 東京ドーム（ワイヤーフレーム） */}
            <motion.g
              className="ending__tokyo-dome"
              style={{ opacity: domeOpacity, scale: domeScale, transformOrigin: "600px 450px" }}
              animate={{ rotate: [0, 0.45, -0.28, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* ドームの屋根の骨組み */}
              <ellipse cx="600" cy="450" rx="300" ry="200" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <ellipse cx="600" cy="450" rx="200" ry="130" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <ellipse cx="600" cy="450" rx="100" ry="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <path d="M 300 450 Q 600 200 900 450" fill="none" stroke="rgba(255,255,255,0.1)" />
              <path d="M 600 250 Q 600 450 600 650" fill="none" stroke="rgba(255,255,255,0.1)" />
              <path d="M 400 300 Q 600 450 800 600" fill="none" stroke="rgba(255,255,255,0.05)" />
              <path d="M 400 600 Q 600 450 800 300" fill="none" stroke="rgba(255,255,255,0.05)" />
            </motion.g>

            {/* 自動で呼吸する客席の残光 */}
            <motion.g
              className="ending__ambient-audience-glow"
              style={{ opacity: domeOpacity, transformOrigin: "600px 450px" }}
              animate={{ scale: [0.985, 1.025, 0.995], rotate: [0, -0.35, 0.25, 0] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ellipse cx="600" cy="450" rx="255" ry="168" fill="none" stroke="rgba(0,209,255,0.08)" strokeWidth="2" />
              <ellipse cx="600" cy="450" rx="218" ry="142" fill="none" stroke="rgba(255,78,219,0.07)" strokeWidth="2" />
              <ellipse cx="600" cy="450" rx="178" ry="114" fill="none" stroke="rgba(166,255,77,0.06)" strokeWidth="2" />
            </motion.g>

            {/* 粒子の流れと観客席の光 */}
            <g className="ending__tokyo-dome-particle-flow ending__audience-lights">
              {particles.map((p) => (
                <Particle key={p.id} data={p} progress={scrollYProgress} />
              ))}
            </g>
          </svg>
        </div>

        {/* --- テキストレイヤー --- */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          
          <motion.div style={{ opacity: copy01Op }} className="absolute">
            <p className="ending__copy-01 text-white/80 text-2xl md:text-3xl tracking-[0.2em] font-light">
              人は、なぜ集まるのだろう。
            </p>
          </motion.div>

          <div className="absolute flex flex-col gap-6">
            <motion.div style={{ opacity: copy02Op }}>
              <p className="ending__copy-02 text-white/80 text-xl md:text-2xl tracking-[0.2em] font-light">東京へ。</p>
            </motion.div>
            <motion.div style={{ opacity: copy03Op }}>
              <p className="ending__copy-03 text-white/80 text-xl md:text-2xl tracking-[0.2em] font-light">東京ドームへ。</p>
            </motion.div>
          </div>

          <div className="absolute flex flex-col gap-6">
            <motion.div style={{ opacity: copy05Op }}>
              <p className="ending__copy-05 text-white/80 text-xl md:text-2xl tracking-[0.2em] font-light">誰かに会うために。</p>
            </motion.div>
            <motion.div style={{ opacity: copy06Op }}>
              <p className="ending__copy-06 text-white/80 text-xl md:text-2xl tracking-[0.2em] font-light">音楽を聴くために。</p>
            </motion.div>
          </div>

          <motion.div style={{ opacity: finalTitleOp, y: finalTitleY }} className="absolute -mt-16">
            <h2 className="ending__final-title text-white text-3xl md:text-5xl tracking-[0.15em] leading-[1.8] font-medium">
              推しが変われば、<br className="md:hidden"/>人の流れも変わる。
            </h2>
          </motion.div>

          <motion.div style={{ opacity: finalCopyOp, y: finalCopyY }} className="absolute mt-32">
            <p className="ending__final-copy text-[#a0a0a0] text-xl md:text-2xl tracking-[0.15em] leading-[2]">
              しかし、人が集まる理由は<br className="md:hidden"/>きっと変わらない。
            </p>
          </motion.div>

          {/* クレジット */}
          <motion.div
            style={{ opacity: creditOp, y: creditY }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-0 max-w-md mx-auto px-4 pointer-events-none"
          >
            <div className="ending__credit-title text-[#555] text-sm tracking-[0.3em] uppercase mb-1.5">
              2025 Tokyo Dome Fan Mobility Analysis
            </div>
            <div className="ending__credit-artist-list text-[#333] text-xs tracking-widest font-mono">
              FRUITS ZIPPER / RIIZE / Vaundy
            </div>
            <div className="ending__credit-note text-[#333] text-xs tracking-widest font-mono mt-3 mb-4">
              Data Visualization Project
            </div>

            <NikkeiTrendyPresentedBy />

            <p
              className="ending__credit-heading text-sm md:text-base font-semibold tracking-[0.16em] text-white/75 mb-4"
              style={{ textShadow: "0 0 12px rgba(0,0,0,0.8)" }}
            >
              CREDIT
            </p>

            <div className="ending__credit-members w-full text-center mb-4">
              <p className="text-[11px] md:text-[13px] tracking-[0.12em] text-white/55 mb-2 uppercase">
                Project Members
              </p>
              <ul className="space-y-0.5">
                {PROJECT_MEMBERS.map((name) => (
                  <li
                    key={name}
                    className="text-[13px] md:text-[15px] leading-[1.65] text-white/72 font-light"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ending__credit-cooperation w-full text-center">
              <p className="text-[11px] md:text-[13px] tracking-[0.12em] text-white/55 mb-1.5 uppercase">
                Data Cooperation
              </p>
              <p className="text-[13px] md:text-[15px] leading-[1.65] text-white/72 font-light">
                Location AI Inc.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
