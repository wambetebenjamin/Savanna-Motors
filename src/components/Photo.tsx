import Image from "next/image";
import { PHOTOS, type PhotoKey } from "@/data/generated/photos";

type Props = {
  name: PhotoKey;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Render as a sized (non-fill) image. */
  width?: number;
  height?: number;
};

/**
 * Every photograph is a real Pexels / Unsplash shot. A local copy is committed in
 * /public/images (see image-credits.md); the provider CDN url is used for delivery so
 * large surfaces such as the hero get full-resolution pixels. Blur placeholders are
 * generated at build-prep time from the local copy.
 */
export function Photo({
  name,
  alt,
  sizes = "100vw",
  priority = false,
  className,
  width,
  height,
}: Props) {
  const p = PHOTOS[name];
  const common = {
    src: p.remote,
    alt: alt ?? p.alt,
    placeholder: "blur" as const,
    blurDataURL: p.blur,
    priority,
    className,
    unoptimized: true,
  };

  if (width && height) {
    return <Image {...common} width={width} height={height} sizes={sizes} />;
  }
  return <Image {...common} fill sizes={sizes} />;
}

export const photoUrl = (name: PhotoKey) => PHOTOS[name].remote;
export const photoLocal = (name: PhotoKey) => PHOTOS[name].local;
