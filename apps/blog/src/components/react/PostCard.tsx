import { useState } from "react";

import { Avatar, AvatarImage, AvatarFallback } from "@elcokiin/ui/avatar";
import type { PublicAuthor } from "@elcokiin/backend/lib/types/authors";

type CardProps = {
  title: string;
  description: string;
  image: string;
  author: PublicAuthor | null;
  date: string;
  minDuration: string;
  type: "featured" | "grid-medium" | "grid-large" | "grid-simple";
};

function Card({
  title,
  description,
  image,
  author,
  date,
  minDuration,
  type,
}: CardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const getGlassStyles = () => {
    const baseTransition = "all 0.3s ease-out";

    if (!isHovering) {
      return {
        background: "rgba(255, 255, 255, 0.9)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        transition: baseTransition,
      };
    }

    return {
      background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                  rgba(255, 255, 255, 0.95) 0%, 
                  rgba(248, 250, 252, 0.9) 50%, 
                  rgba(241, 245, 249, 0.85) 100%)`,
      backdropFilter: "blur(15px) saturate(180%)",
      WebkitBackdropFilter: "blur(15px) saturate(180%)",
      border: "1px solid rgba(0, 0, 0, 0.12)",
      boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.1), 
                         0 0 0 1px rgba(0, 0, 0, 0.05),
                         inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
      transition: baseTransition,
    };
  };

  const renderHoverEffects = () => {
    if (!isHovering) return null;

    return (
      <>
        {/* Main liquid glass overlay */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                            rgba(136, 146, 176, 0.06) 0%, 
                            rgba(136, 146, 176, 0.02) 40%, 
                            transparent 70%)`,
            filter: "blur(1px)",
          }}
        />

        {/* Inner glow effect */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                            rgba(136, 146, 176, 0.03) 0%, 
                            transparent 50%)`,
            filter: "blur(2px)",
          }}
        />

        {/* Hover indicator */}
        <div className="absolute top-4 right-4 transition-all duration-300 z-20">
          <div className="w-8 h-8 rounded-full bg-[#64ffda]/20 flex items-center justify-center border border-[#64ffda]/40">
            <svg
              className="w-4 h-4 text-[#64ffda]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </>
    );
  };

  const renderSimpleAuthorInfo = () => {
    if (type !== "grid-simple") return null;

    return (
      <div className="flex items-center justify-start mt-4 text-sm text-[#0a192f]">
        {author?.name || date}
        <span className="mx-2">•</span>
        <span>{minDuration} min read</span>
      </div>
    );
  };

  // Featured Card (Type "featured") - Horizontal layout
  if (type === "featured") {
    return (
      <article
        className="w-full rounded-2xl overflow-hidden relative transition-all duration-300 ease-out cursor-pointer hover:scale-[1.01]"
        style={getGlassStyles()}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {renderHoverEffects()}

        <div className="flex flex-col lg:flex-row h-full relative z-10">
          {/* Image Section */}
          <div className="w-full lg:w-1/2 h-80 lg:h-96">
            <img
              className={`w-full h-full object-cover transition-all duration-300 ${
                isHovering ? "brightness-110 scale-105" : "scale-100"
              }`}
              src={image}
              alt={`Imagen del artículo: ${title}`}
              loading="lazy"
            />
          </div>

          {/* Content Section */}
          <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
            <h2
              className={`font-bold text-3xl lg:text-4xl mb-6 transition-colors duration-300 ${
                isHovering ? "text-[#64ffda]" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-lg lg:text-xl mb-8 line-clamp-4 transition-colors duration-300 ${
                isHovering ? "text-gray-600" : "text-[#0a192f]"
              }`}
            >
              {description}
            </p>

            {author && (
              <div className="flex items-center gap-3 mt-4">
                <Avatar>
                  {author.avatarUrl && (
                    <AvatarImage src={author.avatarUrl} alt={author.name} />
                  )}
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase text-[#0a192f]">{author.name}</span>
                  <span className="text-xs text-[#0a192f]/60">{date}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Grid Large Card (Type "grid-large") - Vertical with larger emphasis
  if (type === "grid-large") {
    return (
      <article
        className="rounded-2xl overflow-hidden relative transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02]"
        style={getGlassStyles()}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {renderHoverEffects()}

        <div className="relative z-10">
          {/* Image Section */}
          <div className="w-full h-72">
            <img
              className={`w-full h-full object-cover transition-all duration-300 ${
                isHovering ? "brightness-110 scale-105" : "scale-100"
              }`}
              src={image}
              alt={`Imagen del artículo: ${title}`}
              loading="lazy"
            />
          </div>

          {/* Content Section */}
          <div className="p-8">
            <h2
              className={`font-bold text-2xl mb-4 transition-colors duration-300 ${
                isHovering ? "text-[#64ffda]" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-base mb-6 line-clamp-3 transition-colors duration-300 ${
                isHovering ? "text-gray-600" : "text-[#0a192f]"
              }`}
            >
              {description}
            </p>

            {author && (
              <div className="flex items-center gap-3 mt-4">
                <Avatar>
                  {author.avatarUrl && (
                    <AvatarImage src={author.avatarUrl} alt={author.name} />
                  )}
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase text-[#0a192f]">{author.name}</span>
                  <span className="text-xs text-[#0a192f]/60">{date}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Grid Medium Card (Type "grid-medium") - Standard grid card
  if (type === "grid-medium") {
    return (
      <article
        className="rounded-2xl overflow-hidden relative transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02]"
        style={getGlassStyles()}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {renderHoverEffects()}

        <div className="relative z-10">
          {/* Image Section */}
          <div className="w-full h-48">
            <img
              className={`w-full h-full object-cover transition-all duration-300 ${
                isHovering ? "brightness-110 scale-105" : "scale-100"
              }`}
              src={image}
              alt={`Imagen del artículo: ${title}`}
              loading="lazy"
            />
          </div>

          {/* Content Section */}
          <div className="p-6">
            <h2
              className={`font-bold text-lg mb-3 transition-colors duration-300 ${
                isHovering ? "text-[#64ffda]" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-sm mb-5 line-clamp-3 transition-colors duration-300 ${
                isHovering ? "text-gray-600" : "text-[#0a192f]"
              }`}
            >
              {description}
            </p>

            {author && (
              <div className="flex items-center gap-3 mt-4">
                <Avatar>
                  {author.avatarUrl && (
                    <AvatarImage src={author.avatarUrl} alt={author.name} />
                  )}
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase text-[#0a192f]">{author.name}</span>
                  <span className="text-xs text-[#0a192f]/60">{date}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Grid Simple Card (Type "grid-simple") - Compact without author component
  if (type === "grid-simple") {
    return (
      <article
        className="w-full max-h-[320px] rounded-2xl overflow-hidden relative transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02]"
        style={getGlassStyles()}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {renderHoverEffects()}

        <div className="relative z-10">
          {/* Image Section */}
          <div className="w-full h-40">
            <img
              className={`w-full h-full object-cover transition-all duration-300 ${
                isHovering ? "brightness-110 scale-105" : "scale-100"
              }`}
              src={image}
              alt={`Imagen del artículo: ${title}`}
              loading="lazy"
            />
          </div>

          {/* Content Section */}
          <div className="p-5">
            <h2
              className={`font-bold text-base mb-3 transition-colors duration-300 ${
                isHovering ? "text-[#64ffda]" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-xs mb-4 line-clamp-2 transition-colors duration-300 ${
                isHovering ? "text-gray-600" : "text-[#0a192f]"
              }`}
            >
              {description}
            </p>

            {renderSimpleAuthorInfo()}
          </div>
        </div>
      </article>
    );
  }

  // Default fallback
  return null;
}

export default Card;
