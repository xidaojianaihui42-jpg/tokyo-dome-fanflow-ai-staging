import React from "react";

/** Set to logo import path when official asset is available, e.g.:
 *  import nikkeiTrendyLogo from "../../imports/nikkei-trendy-logo.svg";
 *  export const NIKKEI_TRENDY_LOGO_SRC = nikkeiTrendyLogo;
 */
export const NIKKEI_TRENDY_LOGO_SRC: string | null = null;

function LogoPlaceholder({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`font-semibold uppercase text-white/78 tracking-[0.1em] ${
        compact ? "text-[10px] md:text-[11px]" : "text-[11px] md:text-xs"
      } ${className}`}
    >
      NIKKEI TRENDY
    </span>
  );
}

export function NikkeiTrendyLogoFixed() {
  return (
    <div
      className="nikkei-trendy-logo-fixed fixed top-6 left-7 z-[200] flex items-center justify-center rounded-md border backdrop-blur-sm pointer-events-none select-none"
      style={{
        width: "148px",
        height: "32px",
        backgroundColor: "rgba(255,255,255,0.10)",
        borderColor: "rgba(255,255,255,0.18)",
      }}
      aria-label="NIKKEI TRENDY"
    >
      {NIKKEI_TRENDY_LOGO_SRC ? (
        <img
          src={NIKKEI_TRENDY_LOGO_SRC}
          alt="NIKKEI TRENDY"
          className="h-[18px] w-auto max-w-[130px] object-contain"
        />
      ) : (
        <LogoPlaceholder />
      )}
    </div>
  );
}

export function NikkeiTrendyPresentedBy() {
  return (
    <div className="nikkei-trendy-presented-by w-full text-center mb-5">
      <p className="text-[11px] md:text-[13px] tracking-[0.12em] text-white/55 mb-2 uppercase">
        Presented by
      </p>
      <div
        className="mx-auto inline-flex items-center justify-center rounded-md border backdrop-blur-sm px-4"
        style={{
          minWidth: "148px",
          height: "32px",
          backgroundColor: "rgba(255,255,255,0.10)",
          borderColor: "rgba(255,255,255,0.18)",
        }}
      >
        {NIKKEI_TRENDY_LOGO_SRC ? (
          <img
            src={NIKKEI_TRENDY_LOGO_SRC}
            alt="NIKKEI TRENDY"
            className="h-[18px] w-auto max-w-[130px] object-contain"
          />
        ) : (
          <LogoPlaceholder compact />
        )}
      </div>
    </div>
  );
}
