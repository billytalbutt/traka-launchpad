"use client";

import React from "react";
import Image from "next/image";

interface ResponsiveHeroBannerProps {
  logoUrl?: string;
  backgroundImageUrl?: string;
  badgeText?: string;
  badgeLabel?: string;
  title?: string;
  titleLine2?: string;
  description?: string;
  partnersTitle?: string;
}

const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
  backgroundImageUrl = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2400&q=80",
  badgeLabel = "v1.0",
  badgeText = "Traka Launchpad — Now Live",
  title = "Your tools.",
  titleLine2 = "One place.",
  description = "Access every Traka product from a single command center. Launch, manage, and monitor your entire toolkit — all from one unified dashboard.",
  partnersTitle = "Part of the ASSA ABLOY Group",
}) => {
  return (
    <section className="w-full isolate min-h-screen overflow-hidden relative flex flex-col">
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backgroundImageUrl}
        alt=""
        className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />

      {/* Header */}
      <header className="z-10 relative">
        <div className="mx-6">
          <div className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <Image
                src="/traka-mark.svg"
                alt="Traka"
                width={80}
                height={20}
                className="h-5 w-auto"
              />
              <span className="font-display font-semibold text-[11px] text-white/40 uppercase tracking-[0.1em]">
                Launchpad
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="z-10 relative flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur animate-fade-slide-in-1">
              <span className="inline-flex items-center text-xs font-medium text-neutral-900 bg-traka-orange rounded-full py-0.5 px-2 font-sans">
                {badgeLabel}
              </span>
              <span className="text-sm font-medium text-white/90 font-sans">
                {badgeText}
              </span>
            </div>

            {/* Title */}
            <h1 className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl text-white tracking-tight font-display font-bold animate-fade-slide-in-2">
              {title}
              <br className="hidden sm:block" />
              <span className="text-traka-orange">{titleLine2}</span>
            </h1>

            {/* Description */}
            <p className="sm:text-lg animate-fade-slide-in-3 text-base text-white/70 max-w-2xl mt-6 mx-auto leading-relaxed">
              {description}
            </p>

            {/* Tool indicators */}
            <div className="flex flex-wrap gap-4 mt-10 items-center justify-center animate-fade-slide-in-4">
              {[
                { name: "TrakaWEB", color: "#0078D4" },
                { name: "Log Analyzer", color: "#3b82f6" },
                { name: "Data Tool", color: "#8b5cf6" },
                { name: "Docs AI", color: "#f59e0b" },
                { name: "Jira", color: "#2563eb" },
                { name: "SMTP", color: "#ea580c" },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-sm"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: tool.color,
                      boxShadow: `0 0 6px ${tool.color}60`,
                    }}
                  />
                  <span className="text-white/70 text-xs font-mono tracking-wider">
                    {tool.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Partner / Group */}
          <div className="mx-auto mt-20 max-w-5xl">
            <p className="animate-fade-slide-in-1 text-xs text-white/30 text-center font-mono uppercase tracking-widest">
              {partnersTitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponsiveHeroBanner;
