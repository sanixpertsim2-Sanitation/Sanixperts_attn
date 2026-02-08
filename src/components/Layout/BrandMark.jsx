"use client";

import Image from "next/image";

// Mobile-first logo system: icon-only on mobile, full lockup on desktop
const variants = {
  // Mobile header - compact icon only
  mobile: {
    container: "flex items-center",
    icon: "h-8 w-8", // Fixed square dimensions for mobile
    showText: false,
  },
  // Desktop header - full brand lockup
  desktop: {
    container: "flex items-center gap-3",
    icon: "h-10", // Taller on desktop
    title: "text-sm font-semibold tracking-wide",
    subtitle: "text-xs font-medium tracking-wider text-slate-400",
    showText: true,
  },
  // Dashboard variant - smaller overall
  dashboard: {
    container: "flex items-center gap-2",
    icon: "h-7",
    title: "text-xs font-semibold tracking-wide",
    subtitle: "text-[10px] font-medium tracking-wider text-slate-500",
    showText: true,
  },
};

export default function BrandMark({ variant = "mobile", className = "" }) {
  const config = variants[variant] || variants.mobile;
  
  return (
    <div className={`${config.container} ${className}`}>
      
      {/* Logo icon - mobile-first, no background images */}
      <div className={`flex items-center justify-center ${config.icon}`}>
        <Image
          src="/assets/give-go-sanixpert-logo.png"
          alt="Give & Go Sanitation"
          width={40}
          height={40}
          priority={variant === "mobile"}
          className="h-full w-full object-contain"
          style={{
            // Remove any background effects on mobile
            filter: variant === "mobile" ? "none" : "brightness(1.1)",
          }}
        />
      </div>

      {/* Text lockup - hidden on mobile, visible on desktop */}
      {config.showText && (
        <div className="hidden flex-col leading-tight lg:flex">
          <span className={config.title}>
            GIVE &amp; GO
          </span>
          <span className={config.subtitle}>
            SANIXPERTS
          </span>
        </div>
      )}
    </div>
  );
}

// Helper component for pages that need desktop logo
export function BrandMarkDesktop(props) {
  return <BrandMark variant="desktop" {...props} />;
}

// Helper component for dashboard
export function BrandMarkDashboard(props) {
  return <BrandMark variant="dashboard" {...props} />;
}