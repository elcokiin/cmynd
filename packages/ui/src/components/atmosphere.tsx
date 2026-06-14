import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { cn } from "../lib/utils";
import "../styles/atmosphere.css";

interface AtmosphereProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  transparent?: boolean;
  withGrid?: boolean;
}

export function Atmosphere({ className, children, transparent = true, withGrid = false, ...props }: AtmosphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const baseX = e.clientX - rect.left;
      const baseY = e.clientY - rect.top;

      if (withGrid) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }

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
  }, [withGrid]);

  const gridX = withGrid ? (mousePos.x / (typeof window !== 'undefined' ? window.innerWidth : 1000) - 0.5) * -30 : 0;
  const gridY = withGrid ? (mousePos.y / (typeof window !== 'undefined' ? window.innerHeight : 1000) - 0.5) * -30 : 0;

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

      {/* Optional Grid Background */}
      {withGrid && (
        <div 
          className="absolute inset-[-50px] bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] transition-transform duration-300 ease-out opacity-40 pointer-events-none"
          style={{ transform: `translate(${gridX}px, ${gridY}px)` }}
        />
      )}

      {/* CSS Animated Stars layer */}
      <div className="stars-layer-1 pointer-events-none"></div>
      <div className="stars-layer-2 pointer-events-none"></div>
      <div className="stars-layer-3 pointer-events-none"></div>

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
