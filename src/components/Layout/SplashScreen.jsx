"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "sanixpertSplashSeen";
const REDIRECT_TO = "/";
const REDIRECT_DELAY_MS = 2800;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const redirectTimeoutRef = useRef(null);
  const impactPlayedRef = useRef(false);
  const dominantColorRef = useRef({ r: 80, g: 140, b: 160 });

  const deviceProfile = useMemo(() => {
    if (typeof window === "undefined") {
      return { isMobile: false };
    }
    return { isMobile: window.innerWidth < 768 };
  }, []);
  const useVideo = !deviceProfile.isMobile && !videoFailed;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (seen) {
      if (window.location.pathname !== REDIRECT_TO) {
        window.location.href = REDIRECT_TO;
      }
      return;
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible || useVideo) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const logo = new Image();
    logo.src = "/assets/give-go-logo & sanixpert-logo.png";

    const getDominantColor = (image) => {
      const off = document.createElement("canvas");
      const sampleSize = 80;
      off.width = sampleSize;
      off.height = sampleSize;
      const offCtx = off.getContext("2d");
      if (!offCtx) return { r: 80, g: 140, b: 160 };
      offCtx.drawImage(image, 0, 0, sampleSize, sampleSize);
      const { data } = offCtx.getImageData(0, 0, sampleSize, sampleSize);
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 16) {
        const alpha = data[i + 3];
        if (alpha < 20) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count += 1;
      }
      if (!count) return { r: 80, g: 140, b: 160 };
      return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
      };
    };

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const stop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const impactSound =
      typeof Audio !== "undefined" ? new Audio("/assets/impact.mp3") : null;
    if (impactSound) {
      impactSound.volume = 0.12;
    }

    const start = performance.now();
    const scaleDuration = 1200;
    const impactDuration = deviceProfile.isMobile ? 800 : 1000;
    const settleDuration = 600;
    const totalDuration = scaleDuration + impactDuration + settleDuration;
    const rippleDuration = impactDuration;
    const distortionStrength = deviceProfile.isMobile ? 6 : 12;
    const sliceHeight = deviceProfile.isMobile ? 18 : 10;
    const glowBlur = deviceProfile.isMobile ? 18 : 30;

    const draw = (now) => {
      const elapsed = now - start;
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      const scaleProgress = clamp(elapsed / scaleDuration, 0, 1);
      const scaleEase = easeOutCubic(scaleProgress);
      const scale = 0.6 + scaleEase * 0.4;

      const impactProgress = clamp(
        (elapsed - scaleDuration) / impactDuration,
        0,
        1
      );
      const impactIntensity = 1 - impactProgress;

      const baseSize =
        Math.min(width, height) * (deviceProfile.isMobile ? 0.5 : 0.42);
      const logoWidth = logo.width * (baseSize / logo.width) * scale;
      const logoHeight = logo.height * (baseSize / logo.width) * scale;
      const centerX = width / 2;
      const centerY = height / 2;
      const offsetX =
        impactProgress > 0 && impactProgress < 1
          ? (Math.sin(elapsed * 0.04) + Math.cos(elapsed * 0.06)) *
            2 *
            impactIntensity
          : 0;
      const offsetY =
        impactProgress > 0 && impactProgress < 1
          ? (Math.cos(elapsed * 0.05) - Math.sin(elapsed * 0.07)) *
            2 *
            impactIntensity
          : 0;

      ctx.save();
      const dominantColor = dominantColorRef.current;
      ctx.shadowColor = `rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.65)`;
      ctx.shadowBlur = glowBlur * (0.7 + impactIntensity * 0.6);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const drawX = centerX - logoWidth / 2 + offsetX;
      const drawY = centerY - logoHeight / 2 + offsetY;

      if (impactProgress > 0 && impactProgress < 1) {
        const slices = Math.ceil(logoHeight / sliceHeight);
        for (let i = 0; i < slices; i += 1) {
          const destY = drawY + i * sliceHeight;
          const sliceH = Math.min(sliceHeight, logoHeight - i * sliceHeight);
          const srcY = (i * sliceHeight) / scale;
          const srcH = sliceH / scale;
          const wave =
            Math.sin(i * 0.6 + elapsed * 0.02) +
            Math.cos(i * 1.1 + elapsed * 0.03);
          const sliceOffset = wave * distortionStrength * impactIntensity;
          ctx.drawImage(
            logo,
            0,
            srcY,
            logo.width,
            srcH,
            drawX + sliceOffset,
            destY,
            logoWidth,
            sliceH
          );
        }
      } else {
        ctx.drawImage(logo, drawX, drawY, logoWidth, logoHeight);
      }
      ctx.restore();

      const rippleProgress = clamp(
        (elapsed - scaleDuration) / rippleDuration,
        0,
        1
      );
      if (rippleProgress > 0 && rippleProgress < 1) {
        const radius = baseSize * 0.6 + rippleProgress * baseSize * 1.2;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, ${
          0.35 * (1 - rippleProgress)
        })`;
        ctx.lineWidth = deviceProfile.isMobile ? 2 : 3;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (!impactPlayedRef.current && elapsed > scaleDuration) {
        impactPlayedRef.current = true;
        if (impactSound) {
          impactSound.play().catch(() => {
            // ignore autoplay errors
          });
        }
      }

      if (elapsed < totalDuration) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        window.localStorage.setItem(STORAGE_KEY, "true");
        redirectTimeoutRef.current = setTimeout(() => {
          if (window.location.pathname !== REDIRECT_TO) {
            window.location.href = REDIRECT_TO;
          } else {
            setVisible(false);
          }
        }, REDIRECT_DELAY_MS);
      }
    };

    logo.onload = () => {
      dominantColorRef.current = getDominantColor(logo);
      rafRef.current = requestAnimationFrame(draw);
    };

    return () => {
      stop();
      window.removeEventListener("resize", resize);
    };
  }, [deviceProfile.isMobile, useVideo, visible]);

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
      if (window.location.pathname !== REDIRECT_TO) {
        window.location.href = REDIRECT_TO;
      } else {
        setVisible(false);
      }
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950">
      {useVideo ? (
        <video
          className="h-full w-full object-cover"
          src="/assets/launch.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleSkip}
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" />
      )}
      <div className="absolute inset-0 flex items-end justify-between p-6">
        <button
          onClick={handleSkip}
          className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
