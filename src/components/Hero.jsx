"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, BarChart3, Globe } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-[#0F172A] text-white overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-emerald-400 uppercase bg-emerald-400/10 border border-emerald-400/20 rounded-full">
              Future of Urban Hygiene
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Intelligence for a <br />
              <span className="italic font-serif text-emerald-400 text-6xl">
                Cleaner Tomorrow.
              </span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-lg leading-relaxed">
              Experience the next generation of infrastructure management. Our
              real-time analytics and smart sanitation systems redefine how
              cities breathe, live, and sustain.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                Access Command Center
              </button>
              <button className="px-8 py-4 border border-slate-700 hover:bg-slate-800 text-white font-medium rounded-xl transition-all">
                View Impact Report
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <video
                className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                src="/assets/logo-Picwand.mp4"
                poster="/assets/sanitation-bg.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 z-20 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <BarChart3 className="text-emerald-400" size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">
                    Efficiency
                  </p>
                  <p className="text-xl font-bold text-white">+94.8%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-32 border-t border-slate-800 pt-16">
          <FeatureCard
            icon={<ShieldCheck />}
            title="Integrity Monitoring"
            desc="Advanced sensor arrays ensuring continuous asset health."
          />
          <FeatureCard
            icon={<Globe />}
            title="Zero Waste Logistics"
            desc="Optimized routing algorithms reducing carbon footprints."
          />
          <FeatureCard
            icon={<BarChart3 />}
            title="Impact Analytics"
            desc="Translate raw data into actionable environmental insights."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group p-6 hover:bg-white/5 rounded-2xl transition-all cursor-default">
    <div className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default HeroSection;
