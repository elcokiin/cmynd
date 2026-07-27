import { Image as UnpicImage, type ImageProps } from "@unpic/react";

export type { ImageProps };

export function OptimizedImage(props: ImageProps) {
  return <UnpicImage {...props} />;
}
