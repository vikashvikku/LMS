"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function TopProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const isFirstMount = useRef(true);

  // Complete progress on route change after initial mount
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const finishTimer = setTimeout(() => {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        const resetTimer = setTimeout(() => {
          setProgress(0);
        }, 200);
        return () => clearTimeout(resetTimer);
      }, 250);
      return () => clearTimeout(hideTimer);
    }, 0);

    return () => clearTimeout(finishTimer);
  }, [pathname, searchParams]);

  // Intercept clicks to start progress immediately
  useEffect(() => {
    let timer = null;

    const startProgress = () => {
      setVisible(true);
      setProgress(20);

      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          if (prev < 40) return prev + 15;
          if (prev < 70) return prev + 8;
          return prev + 2;
        });
      }, 150);
    };

    const handleClick = (e) => {
      const target = e.target.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        target.getAttribute("target") === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      try {
        const url = new URL(target.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
          startProgress();
        }
      } catch (err) {
        // ignore
      }
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (timer) clearInterval(timer);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none transition-opacity duration-200"
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-200 ease-out shadow-[0_0_10px_var(--primary)]"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

export function TopProgressBar() {
  return (
    <React.Suspense fallback={null}>
      <TopProgressBarInner />
    </React.Suspense>
  );
}
