import React from "react";
import tokyoDomeMapNorth from "../../imports/tokyo-dome-map-north.jpeg";

const MAP_BASE_SIZE = { width: 2881, height: 1921 };
const TOKYO_DOME_POINT = {
  x: 1467 / MAP_BASE_SIZE.width,
  y: 750 / MAP_BASE_SIZE.height,
};
const MAP_OBJECT_POSITION = `center ${Math.round(TOKYO_DOME_POINT.y * 100)}%`;

/**
 * ペイウォール直前の有料コンテンツ・プレビュー。
 * ArrivalTime 冒頭の雰囲気のみを見せ、本文は読み切れないようにフェードアウトする。
 */
export function PaywallPreview() {
  return (
    <section
      className="section-paywall-preview relative h-[30vh] min-h-[200px] max-h-[34vh] md:h-[36vh] md:min-h-[240px] md:max-h-[38vh] bg-[#050505] overflow-hidden"
      style={{ position: "relative" }}
      aria-hidden="true"
    >
      <div className="paywall-preview__frame relative w-full h-full">
        <img
          src={tokyoDomeMapNorth}
          alt=""
          aria-hidden="true"
          className="paywall-preview__map-bg absolute inset-0 w-full h-full object-cover opacity-55 saturate-[0.85] brightness-[0.72]"
          style={{ objectPosition: MAP_OBJECT_POSITION }}
        />

        <div className="paywall-preview__map-overlay absolute inset-0 bg-[#050505]/78" />

        <div
          className="paywall-preview__ambient-glow absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 42% 38% at 50% 58%, rgba(0,209,255,0.08), transparent 70%), radial-gradient(ellipse 36% 32% at 62% 48%, rgba(255,78,219,0.06), transparent 72%)",
          }}
        />

        <div className="paywall-preview__content absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
          <p className="paywall-preview__eyebrow text-[10px] md:text-[11px] font-mono tracking-[0.28em] text-white/35 mb-3 md:mb-4">
            来場時間
          </p>
          <h2 className="paywall-preview__title text-xl md:text-3xl text-white/72 font-bold tracking-[0.1em] mb-3 md:mb-4 drop-shadow-lg">
            人はここを目指して集まる。
          </h2>
          <p className="paywall-preview__copy text-sm md:text-lg text-white/48 tracking-[0.08em] leading-relaxed max-w-[520px]">
            ライブは、開演前から始まっている。
          </p>
        </div>

        <div
          className="paywall-preview__fade absolute inset-x-0 bottom-0 z-20 h-[72%] pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 42%, rgba(0,0,0,0.65) 65%, #000 100%)",
          }}
        />
      </div>
    </section>
  );
}
