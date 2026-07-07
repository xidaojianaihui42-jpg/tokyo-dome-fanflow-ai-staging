import React from "react";
import { Hero } from "./components/Hero";
import { PrefectureMap } from "./components/PrefectureMap";
import { ArrivalTime } from "./components/ArrivalTime";
import { FandomProfile } from "./components/FandomProfile";
import { Comparison } from "./components/Comparison";
import { Ending } from "./components/Ending";
import { NikkeiTrendyLogoFixed } from "./components/NikkeiTrendyLogo";

export default function App() {
  return (
    <div className="w-full min-h-screen relative bg-[#050505] text-white" style={{ position: 'relative' }}>
      <NikkeiTrendyLogoFixed />
      <Hero />
      <PrefectureMap />
      <ArrivalTime />
      <FandomProfile />
      <Comparison />
      <Ending />
    </div>
  );
}
