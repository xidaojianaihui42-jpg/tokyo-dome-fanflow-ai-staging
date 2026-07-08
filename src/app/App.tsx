import React from "react";
import { Hero } from "./components/Hero";
import { PrefectureMap } from "./components/PrefectureMap";
import { ArrivalTime } from "./components/ArrivalTime";
import { FandomProfile } from "./components/FandomProfile";
import { Comparison } from "./components/Comparison";
import { Ending } from "./components/Ending";
import { Paywall } from "./components/Paywall";
import { NikkeiTrendyLogoFixed } from "./components/NikkeiTrendyLogo";
import { LogoVisibilityProvider } from "./components/LogoVisibilityContext";

type AppProps = {
  enablePaywall?: boolean;
};

export default function App({ enablePaywall = false }: AppProps) {
  return (
    <LogoVisibilityProvider>
      <div className="w-full min-h-screen relative bg-[#050505] text-white" style={{ position: "relative" }}>
        <NikkeiTrendyLogoFixed />
        <Hero />
        <PrefectureMap />
        {enablePaywall ? (
          <Paywall />
        ) : (
          <>
            <ArrivalTime />
            <FandomProfile />
            <Comparison />
            <Ending />
          </>
        )}
      </div>
    </LogoVisibilityProvider>
  );
}
