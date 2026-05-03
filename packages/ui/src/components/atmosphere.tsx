"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

import { cn } from "../lib/utils";
import "../styles/atmosphere.css";

interface AtmosphereProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  transparent?: boolean;
}

export function Atmosphere({ className, children, transparent = true, ...props }: AtmosphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Initialize Shery Mouse Follower if not already initialized
    // Usually it's better to do this once per app, but for this specific component
    // we can use a custom mouse trail using GSAP to match the "soft stardust" exactly.
    
    // Custom GSAP Stardust Trail
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const baseX = e.clientX - rect.left;
      const baseY = e.clientY - rect.top;

      // Spawn fewer sparkles per mouse move for a subtler trail
      const particleCount = Math.floor(Math.random() * 2); // 0 to 1 particle
      
      for (let i = 0; i < particleCount; i++) {
        const dust = document.createElement("div");
        dust.classList.add("stardust-particle");
        
        // Slight initial scatter around the cursor
        const initOffsetX = (Math.random() - 0.5) * 15;
        const initOffsetY = (Math.random() - 0.5) * 15;
        
        dust.style.left = `${baseX + initOffsetX}px`;
        dust.style.top = `${baseY + initOffsetY}px`;
        
        // Randomize size
        const size = Math.random() * 4 + 1.5;
        
        // Ending scatter distance
        const endOffsetX = (Math.random() - 0.5) * 40;
        const endOffsetY = (Math.random() - 0.5) * 40;
        
        dust.style.width = `${size}px`;
        dust.style.height = `${size}px`;

        container.appendChild(dust);

        gsap.to(dust, {
          x: endOffsetX,
          y: endOffsetY,
          opacity: 0,
          scale: 0.1,
          duration: 1.5 + Math.random() * 2, // 1.5s to 3.5s
          ease: "power1.out",
          onComplete: () => {
            dust.remove();
          }
        });
      }
    };

    // Starburst Click Effect
    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Spawn multiple little stars on click
      const particleCount = 10 + Math.floor(Math.random() * 5); // 10 to 15 particles
      
      for (let i = 0; i < particleCount; i++) {
        const star = document.createElement("div");
        star.classList.add("stardust-particle");
        
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        
        const size = Math.random() * 6 + 2; // slightly larger than the trail particles
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        container.appendChild(star);

        // Explode outward in random directions
        const angle = Math.random() * Math.PI * 2;
        const velocity = 20 + Math.random() * 80;
        
        const endOffsetX = Math.cos(angle) * velocity;
        const endOffsetY = Math.sin(angle) * velocity;

        gsap.to(star, {
          x: endOffsetX,
          y: endOffsetY,
          opacity: 0,
          scale: Math.random() * 0.5,
          rotation: Math.random() * 360,
          duration: 1 + Math.random() * 1.5,
          ease: "expo.out",
          onComplete: () => {
            star.remove();
          }
        });
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full min-h-[500px] overflow-hidden",
        !transparent && "bg-[#050B14]",
        transparent && "bg-transparent",
        className
      )}
      {...props}
    >
      {/* Background gradients for the night sky */}
      {!transparent && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900/80 to-[#050B14]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        </>
      )}

      {/* CSS Animated Stars layer */}
      <div className="stars-layer-1"></div>
      <div className="stars-layer-2"></div>
      <div className="stars-layer-3"></div>

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
