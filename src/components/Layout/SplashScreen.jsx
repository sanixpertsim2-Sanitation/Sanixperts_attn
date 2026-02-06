"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "sanixpertSplashSeenSession";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const video = videoRef.current;
    if (!video) return;
    const play = async () => {
      try {
        await video.play();
      } catch {
        setReady(true);
      }
    };
    play();
  }, [visible]);

  const closeSplash = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={closeSplash}
        onCanPlay={() => setReady(true)}
      >
        <source src="/assets/intro.webm" type="video/webm" />
        <source src="/assets/intro.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 flex items-end justify-between p-6">
        <button
          onClick={closeSplash}
          className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Skip
        </button>
        {!ready && (
          <button
            onClick={async () => {
              try {
                await videoRef.current?.play();
              } catch {
                // ignore autoplay errors
              }
            }}
            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            Tap to Play
          </button>
        )}
      </div>
    </div>
  );
}
