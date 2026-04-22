import { useState, useEffect } from "react";

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
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme !== "light");
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const getGlassStyles = () => {
    const baseTransition = "all 0.3s ease-out";

    if (isDark) {
      if (!isHovering) {
        return {
          background: "rgba(11, 26, 50, 0.1)",
          border: "1px solid rgba(136, 146, 176, 0.2)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: baseTransition,
        };
      }

      return {
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                    rgba(136, 146, 176, 0.15) 0%, 
                    rgba(136, 146, 176, 0.08) 50%, 
                    rgba(11, 26, 50, 0.6) 100%)`,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(136, 146, 176, 0.3)",
        boxShadow: `0 25px 50px -12px rgba(0,0,0,0.4), 
                           0 0 0 1px rgba(136, 146, 176, 0.25),
                           inset 0 1px 0 rgba(136, 146, 176, 0.25)`,
        transition: baseTransition,
      };
    } else {
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
    }
  };

  const getTextColor = (hover: boolean, variant: "title" | "desc") => {
    const aquamarine = "text-[#64ffda]";
    if (hover) return aquamarine;
    if (isDark) {
      return variant === "title" ? "text-white" : "text-gray-300";
    }
    return variant === "title" ? "text-gray-900" : "text-[#0a192f]";
  };

  const getDescColor = (hover: boolean) => {
    const aquamarine = "text-[#64ffda]";
    if (hover) return aquamarine;
    if (isDark) {
      return "text-gray-300";
    }
    return "text-[#0a192f]";
  };

  const renderHoverEffects = () => {
    if (!isHovering) return null;

    return (
      <>
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

        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                            rgba(136, 146, 176, 0.03) 0%, 
                            transparent 50%)`,
            filter: "blur(2px)",
          }}
        />

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
      <div className="flex items-center justify-start mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>{date}</span>
        <span className="mx-2">•</span>
        <span>{minDuration} min read</span>
      </div>
    );
  };

  const authorColor = isDark ? "text-gray-100" : "text-[#0a192f]";
  const authorSubColor = isDark ? "text-gray-400" : "text-[#0a192f]/60";

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

          <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
            <h2
              className={`font-bold text-3xl lg:text-4xl mb-2 transition-colors duration-300 ${
                isHovering ? "text-[#64ffda]" : isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-lg lg:text-xl mb-8 line-clamp-4 transition-colors duration-300 ${
                isHovering ? "text-gray-400" : isDark ? "text-gray-300" : "text-[#0a192f]"
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
                  <span className={`text-sm font-bold uppercase ${authorColor}`}>{author.name}</span>
                  <span className={`text-xs ${authorSubColor}`}>{date} • {minDuration} min read</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

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

          <div className="p-8">
            <h2
              className={`font-bold text-2xl mb-1 transition-colors duration-300 ${
                isHovering ? "text-[#64ffda]" : isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-base mb-6 line-clamp-3 transition-colors duration-300 ${
                isHovering ? "text-gray-400" : isDark ? "text-gray-300" : "text-[#0a192f]"
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
                  <span className={`text-sm font-bold uppercase ${authorColor}`}>{author.name}</span>
                  <span className={`text-xs ${authorSubColor}`}>{date} • {minDuration} min read</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

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

          <div className="p-6">
            <h2
              className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                isHovering ? "text-[#64ffda]" : isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-sm mb-5 line-clamp-3 transition-colors duration-300 ${
                isHovering ? "text-gray-400" : isDark ? "text-gray-300" : "text-[#0a192f]"
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
                  <span className={`text-sm font-bold uppercase ${authorColor}`}>{author.name}</span>
                  <span className={`text-xs ${authorSubColor}`}>{date} • {minDuration} min read</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

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

          <div className="p-5">
            <h2
              className={`font-bold text-base mb-1 transition-colors duration-300 ${
                isHovering ? "text-[#64ffda]" : isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-xs mb-4 line-clamp-2 transition-colors duration-300 ${
                isHovering ? "text-gray-400" : isDark ? "text-gray-400" : "text-[#0a192f]"
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

  return null;
}

export default Card;