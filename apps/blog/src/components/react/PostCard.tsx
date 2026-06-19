import { useState, useEffect } from "react";

import Author from "./Author";

type CardProps = {
  title: string;
  description: string;
  image: string;
  authorName: string;
  authorAvatarUrl?: string;
  date: string;
  minDuration?: string;
  type: "featured" | "grid-medium" | "grid-large";
};

function getTitleColor(isHovering: boolean, isDark: boolean) {
  if (isHovering) return "text-[var(--text-hover)]";
  return isDark
    ? "text-[var(--text-title-dark)]"
    : "text-[var(--text-title-light)]";
}

function getDescColor(isHovering: boolean, isDark: boolean) {
  if (isHovering) return "text-[var(--desc-hover-color)]";
  return isDark
    ? "text-[var(--text-desc-dark)]"
    : "text-[var(--text-desc-light)]";
}

function Image({
  image,
  title,
  height,
  isHovering,
}: {
  image: string;
  title: string;
  height: string;
  isHovering: boolean;
}) {
  return (
    <div className={`w-full ${height} shrink-0`}>
      <img
        className={`w-full h-full object-cover transition-all duration-300 ${
          isHovering ? "brightness-110 scale-105" : "scale-100"
        }`}
        src={image}
        alt={`Imagen del artículo: ${title}`}
        loading="lazy"
      />
    </div>
  );
}

function HoverEffects({
  mousePosition,
}: {
  mousePosition: { x: number; y: number };
}) {
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
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center border"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--accent) 20%, transparent)",
            borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "var(--accent)" }}
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
}

const BASE_ARTICLE =
  "w-full h-full rounded-2xl overflow-hidden relative cursor-pointer will-change-transform";

const GRADIENTS = {
  darkHover: (x: number, y: number) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(136, 146, 176, 0.15) 0%, rgba(136, 146, 176, 0.08) 50%, rgba(11, 26, 50, 0.6) 100%)`,
  lightHover: (x: number, y: number) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 50%, rgba(241, 245, 249, 0.85) 100%)`,
  darkHoverGlow: (x: number, y: number) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(136, 146, 176, 0.06) 0%, rgba(136, 146, 176, 0.02) 40%, transparent 70%)`,
};

function getGlassStyles(
  isDark: boolean,
  isHovering: boolean,
  mousePos: { x: number; y: number },
) {
  const base = { transition: "all 0.3s ease-out" };

  if (isDark) {
    return isHovering
      ? {
          background: GRADIENTS.darkHover(mousePos.x, mousePos.y),
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid var(--hover-border-dark)",
          boxShadow: `0 25px 50px -12px var(--glass-dark-shadow), 0 0 0 1px var(--glass-dark-highlight), inset 0 1px 0 var(--glass-dark-highlight)`,
          ...base,
        }
      : {
          background: "var(--glass-dark-base)",
          border: "1px solid var(--glass-dark-border)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          ...base,
        };
  }

  return isHovering
    ? {
        background: GRADIENTS.lightHover(mousePos.x, mousePos.y),
        backdropFilter: "blur(15px) saturate(180%)",
        WebkitBackdropFilter: "blur(15px) saturate(180%)",
        border: "1px solid var(--hover-border-light)",
        boxShadow: `0 10px 25px -5px var(--glass-light-shadow), 0 0 0 1px rgba(0, 0, 0, 0.05), inset 0 1px 0 var(--glass-light-highlight)`,
        ...base,
      }
    : {
        background: "var(--glass-light-base)",
        border: "1px solid var(--glass-light-border)",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        ...base,
      };
}

type LayoutProps = {
  title: string;
  description: string;
  image: string;
  authorName: string;
  authorAvatarUrl?: string;
  date: string;
  minDuration?: string;
  isHovering: boolean;
  isDark: boolean;
  mousePosition: { x: number; y: number };
};

function FeaturedLayout({
  title,
  description,
  image,
  authorName,
  authorAvatarUrl,
  date,
  minDuration,
  isHovering,
  isDark,
}: LayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row h-full relative z-10">
      <div className="w-full lg:w-1/2 h-80 lg:h-96">
        <Image
          image={image}
          title={title}
          height="h-80 lg:h-96"
          isHovering={isHovering}
        />
      </div>

      <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
        <h2
          className={`font-bold text-3xl lg:text-4xl mb-2 transition-colors duration-300 ${getTitleColor(isHovering, isDark)}`}
        >
          {title}
        </h2>
        <p
          className={`text-lg lg:text-xl mb-8 line-clamp-4 transition-colors duration-300 ${getDescColor(isHovering, isDark)}`}
        >
          {description}
        </p>
        <Author
          name={authorName}
          avatarUrl={authorAvatarUrl}
          date={date}
          minDuration={minDuration}
          isDark={isDark}
        />
      </div>
    </div>
  );
}

function GridLayout({
  title,
  description,
  image,
  authorName,
  authorAvatarUrl,
  date,
  minDuration,
  isHovering,
  isDark,
  variant,
}: LayoutProps & { variant?: "large" | "medium" }) {
  const heights = { large: "h-72", medium: "h-48" };
  const paddings = { large: "p-8", medium: "p-6" };
  const titleSizes = { large: "text-2xl", medium: "text-lg" };
  const descSizes = {
    large: "text-base mb-6 line-clamp-3",
    medium: "text-sm mb-5 line-clamp-3",
  };

  const height = heights[variant ?? "medium"];
  const padding = paddings[variant ?? "medium"];
  const titleSize = titleSizes[variant ?? "medium"];
  const descSize = descSizes[variant ?? "medium"];

  return (
    <div className="relative z-10 h-full flex flex-col">
      <Image
        image={image}
        title={title}
        height={height}
        isHovering={isHovering}
      />

      <div className={`${padding} grow flex flex-col justify-between`}>
        <div>
          <h2
            className={`font-bold ${titleSize} mb-1 transition-colors duration-300 ${getTitleColor(isHovering, isDark)}`}
          >
            {title}
          </h2>
          <p
            className={`${descSize} transition-colors duration-300 ${getDescColor(isHovering, isDark)}`}
          >
            {description}
          </p>
        </div>

        <Author
          name={authorName}
          avatarUrl={authorAvatarUrl}
          date={date}
          minDuration={minDuration}
          isDark={isDark}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  image,
  authorName,
  authorAvatarUrl,
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
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const layoutProps = {
    title,
    description,
    image,
    authorName,
    authorAvatarUrl,
    date,
    minDuration,
    isHovering,
    isDark,
    mousePosition,
  };

  const layouts = {
    featured: <FeaturedLayout {...layoutProps} />,
    "grid-large": <GridLayout {...layoutProps} variant="large" />,
    "grid-medium": <GridLayout {...layoutProps} variant="medium" />,
  };

  const scale = isHovering ? (type === "featured" ? 1.01 : 1.02) : 1;

  return (
    <div
      className="w-full h-full transition-transform duration-300 ease-out"
      style={{ transform: `scale(${scale})` }}
    >
      <article
        className={BASE_ARTICLE}
        style={getGlassStyles(isDark, isHovering, mousePosition)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isHovering && <HoverEffects mousePosition={mousePosition} />}
        {layouts[type]}
      </article>
    </div>
  );
}

export default Card;

