"use client";

import Image from "next/image";

const variants = {
  header: {
    icon: "h-9 md:h-10",
    title: "text-sm md:text-base",
    subtitle: "text-[10px] md:text-xs",
  },
  dashboard: {
    icon: "h-7",
    title: "text-[13px]",
    subtitle: "text-[9px]",
  },
};

export default function BrandMark({ variant = "header", className = "" }) {
  const styles = variants[variant] || variants.header;

  return (
    <div
      className={`flex min-h-[44px] items-center gap-3 rounded-xl px-2 py-2 text-slate-200 ${className}`}
    >
      <div className={`flex items-center ${styles.icon}`}>
        <Image
          src="/assets/give-go-logo%20%26%20sanixpert-logo.png"
          alt="Give & Go logo"
          width={260}
          height={48}
          priority={variant === "header"}
          className="h-full w-auto max-w-[170px] object-contain sm:max-w-none"
        />
      </div>
      <div className="hidden flex-col leading-tight sm:flex">
        <span className={`font-semibold tracking-[0.08em] ${styles.title}`}>
          GIVE &amp; GO
        </span>
        <span
          className={`font-medium tracking-[0.2em] text-slate-400/80 ${styles.subtitle}`}
        >
          SANIXPERTS
        </span>
      </div>
    </div>
  );
}
