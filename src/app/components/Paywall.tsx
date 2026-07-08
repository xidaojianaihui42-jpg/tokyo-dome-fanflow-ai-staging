import React from "react";

/** ペイウォール「詳しくはこちら」リンク（後から差し替え） */
export const PAYWALL_DETAIL_URL = "#";

/** ペイウォール「ログイン」リンク（後から差し替え） */
export const PAYWALL_LOGIN_URL = "#";

export function Paywall() {
  return (
    <section
      className="section-paywall relative h-[100vh] bg-[#050505]"
      style={{ position: "relative" }}
    >
      <div className="sticky top-0 w-full h-[100vh] overflow-hidden flex flex-col items-center justify-center bg-[#050505] px-6">
        <div className="paywall__background absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,24,0.9),rgba(5,5,5,1)_72%)]" />
        <div className="paywall__dark-vignette absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(0,0,0,0.75)_100%)]" />

        <div className="paywall__content relative z-10 w-full max-w-[520px] text-center">
          <p className="paywall__eyebrow text-[11px] md:text-xs font-mono tracking-[0.35em] text-white/45 mb-6">
            MEMBERS ONLY
          </p>

          <h2 className="paywall__title text-white text-2xl md:text-3xl font-bold tracking-[0.12em] mb-8 leading-relaxed">
            この記事は有料会員限定です
          </h2>

          <p className="paywall__body text-white/70 text-sm md:text-base tracking-[0.08em] leading-[2] mb-10">
            続きをご覧いただくには、
            <br />
            有料会員登録またはログインが必要です。
          </p>

          <div className="paywall__actions flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={PAYWALL_DETAIL_URL}
              className="paywall__detail-link inline-flex items-center justify-center min-w-[200px] px-8 py-3 rounded-full border border-white/25 bg-white/[0.06] text-white text-sm font-semibold tracking-[0.12em] transition-colors hover:bg-white/[0.12] hover:border-white/40"
            >
              詳しくはこちら
            </a>
            <a
              href={PAYWALL_LOGIN_URL}
              className="paywall__login-link inline-flex items-center justify-center min-w-[200px] px-8 py-3 rounded-full bg-white text-[#050505] text-sm font-semibold tracking-[0.12em] transition-opacity hover:opacity-90"
            >
              ログイン
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
