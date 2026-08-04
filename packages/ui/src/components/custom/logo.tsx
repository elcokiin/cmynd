import { FlameWrap } from "../canvasui/FlameWrap";

type LogoProps = {
  src: string;
  alt?: string;
  className?: string;
  /** Enable flame effect. Disable for small sizes. */
  flame?: boolean;
  width?: number;
  height?: number;
};

export function Logo({
  src,
  alt = "elcokiin logo",
  className,
  flame = true,
  width,
  height,
}: LogoProps) {
  if (!flame) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover rounded-full ${className ?? ""}`}
        style={{ imageRendering: "auto" }}
      />
    );
  }

  return (
    <FlameWrap
      intensity={1}
      height={120}
      spread={16}
      radius={9999}
      speed={0.2}
      scale={0.8}
      turbulence={0.4}
      turbulenceScale={0.5}
      turbulenceReach={15}
      sparks={2}
      sparkSize={0.3}
      sparkDensity={0.8}
      sparkSpeed={0.8}
      rim={2}
      melt={1}
      distortion={8}
      smoke={1}
      ember={1.5}
      scorch={0}
      color={[0, 0, 0]}
      className={className}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-cover rounded-full w-full h-full"
        style={{ imageRendering: "auto" }}
      />
    </FlameWrap>
  );
}

export default Logo;
