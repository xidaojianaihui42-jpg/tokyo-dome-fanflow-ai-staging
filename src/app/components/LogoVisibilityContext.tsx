import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useIsMobile } from "./ui/use-mobile";

type LogoVisibilityContextValue = {
  visible: boolean;
  setModalOpen: (open: boolean) => void;
};

const LogoVisibilityContext = createContext<LogoVisibilityContextValue | null>(null);

const SECTION_SELECTOR =
  "section.section-hero, section.section-prefecture-map, section.section-arrival-time, section.section-fandom-profile, section.section-comparison, section.section-ending";

function getActiveSection(): HTMLElement | null {
  const sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
  const vh = window.innerHeight;

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > vh) {
      return section;
    }
  }

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top > 0 && rect.top < vh) {
      return section;
    }
  }

  return sections[0] ?? null;
}

function getSectionProgress(section: HTMLElement): number {
  const vh = window.innerHeight;
  const scrollable = section.offsetHeight - vh;
  if (scrollable <= 0) return 0;
  return Math.max(0, Math.min(1, -section.getBoundingClientRect().top / scrollable));
}

function getSectionId(section: HTMLElement | null): string | null {
  if (!section) return null;
  const match = section.className.match(/section-[\w-]+/);
  return match?.[0] ?? null;
}

function computeLogoVisible(isMobile: boolean, modalOpen: boolean): boolean {
  if (modalOpen) return false;

  const activeSection = getActiveSection();
  const sectionId = getSectionId(activeSection);
  if (!sectionId || !activeSection) return true;

  const progress = getSectionProgress(activeSection);

  if (isMobile) {
    if (sectionId === "section-hero") {
      return progress < 0.32;
    }
    return false;
  }

  if (sectionId === "section-ending") {
    return progress < 0.82;
  }

  if (sectionId === "section-prefecture-map") {
    return progress < 0.06;
  }

  if (sectionId === "section-comparison" || sectionId === "section-fandom-profile") {
    return progress < 0.05;
  }

  if (sectionId === "section-arrival-time") {
    return progress < 0.04;
  }

  return true;
}

export function LogoVisibilityProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpenState] = useState(false);
  const [visible, setVisible] = useState(true);

  const setModalOpen = useCallback((open: boolean) => {
    setModalOpenState(open);
  }, []);

  useEffect(() => {
    const update = () => {
      setVisible(computeLogoVisible(isMobile, modalOpen));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isMobile, modalOpen]);

  const value = useMemo(
    () => ({
      visible,
      setModalOpen,
    }),
    [visible, setModalOpen]
  );

  return <LogoVisibilityContext.Provider value={value}>{children}</LogoVisibilityContext.Provider>;
}

export function useLogoVisibility() {
  const context = useContext(LogoVisibilityContext);
  if (!context) {
    throw new Error("useLogoVisibility must be used within LogoVisibilityProvider");
  }
  return context;
}
