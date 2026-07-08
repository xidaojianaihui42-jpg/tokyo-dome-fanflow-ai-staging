import React from "react";
import { motion } from "motion/react";
import nikkeiEntertainmentLogo from "../../imports/EntLOGO.png";
import { useLogoVisibility } from "./LogoVisibilityContext";

export const NIKKEI_ENTERTAINMENT_LOGO_SRC = nikkeiEntertainmentLogo;

export function NikkeiTrendyLogoFixed() {
  const { visible } = useLogoVisibility();

  return (
    <motion.div
      className="nikkei-entertainment-logo-fixed fixed top-6 left-7 z-[200] pointer-events-none select-none"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      aria-hidden={!visible}
    >
      <img
        src={NIKKEI_ENTERTAINMENT_LOGO_SRC}
        alt="日経エンタテインメント！"
        className="w-[160px] md:w-[210px] h-auto object-contain"
      />
    </motion.div>
  );
}

export function NikkeiTrendyPresentedBy() {
  return (
    <div className="nikkei-entertainment-presented-by w-full text-center mb-5">
      <p className="text-[11px] md:text-[13px] tracking-[0.12em] text-white/55 mb-3 uppercase">
        Presented by
      </p>
      <img
        src={NIKKEI_ENTERTAINMENT_LOGO_SRC}
        alt="日経エンタテインメント！"
        className="mx-auto w-[min(260px,72vw)] md:w-[320px] h-auto object-contain"
      />
    </div>
  );
}
