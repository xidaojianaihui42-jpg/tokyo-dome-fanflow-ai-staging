import React from "react";
import { Hero } from "./components/Hero";
import { PrefectureMap } from "./components/PrefectureMap";
import { StationMap } from "./components/StationMap";
import { ArrivalTime } from "./components/ArrivalTime";
import { FandomProfile } from "./components/FandomProfile";
import { Comparison } from "./components/Comparison";
import { Ending } from "./components/Ending";

export default function App() {
  return (
    <div className="w-full min-h-screen relative bg-[#050505] text-white" style={{ position: 'relative' }}>
      <Hero />
      <PrefectureMap />
      <StationMap />
      <ArrivalTime />
      <FandomProfile />
      <Comparison />
      <Ending />
    </div>
  );
}
