"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const IDLE_MS = 30 * 60 * 1000; // 30분
const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

export default function IdleLogout() {
  const router = useRouter();
  const timer = useRef(null);

  useEffect(() => {
    // 로그인 페이지에서는 동작하지 않음
    if (window.location.pathname === "/login") return;

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } finally {
          router.replace("/login?reason=idle");
        }
      }, IDLE_MS);
    };

    EVENTS.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset(); // 최초 타이머 시작

    return () => {
      if (timer.current) clearTimeout(timer.current);
      EVENTS.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [router]);

  return null;
}
