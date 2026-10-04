"use client";

import { useState } from "react";
import { RotateFortyFiveIcon } from "@/components/icons";
import { Photo } from "@/components/Photo";
import { Modal } from "@/components/Modal";
import type { PhotoKey } from "@/data/generated/photos";

export function Gallery({
  photos,
  title,
  has360,
}: {
  photos: PhotoKey[];
  title: string;
  has360: boolean;
}) {
  const [active, setActive] = useState(0);
  const [viewer, setViewer] = useState(false);

  return (
    <div>
      <div className="sm-gallery__stage">
        <Photo
          name={photos[active]}
          alt={`${title} — photo ${active + 1} of ${photos.length}`}
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />
        {has360 ? (
          <button
            type="button"
            className="sm-btn sm-btn--on-dark sm-btn--sm sm-gallery__360"
            onClick={() => setViewer(true)}
          >
            <RotateFortyFiveIcon />
            360° View
          </button>
        ) : null}
      </div>

      <div className="sm-gallery__thumbs" role="tablist" aria-label={`${title} photos`}>
        {photos.map((p, i) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={i === active}
            className="sm-gallery__thumb"
            data-active={i === active}
            onClick={() => setActive(i)}
          >
            <Photo name={p} alt={`${title} thumbnail ${i + 1}`} sizes="120px" />
          </button>
        ))}
      </div>

      <Modal
        open={viewer}
        onClose={() => setViewer(false)}
        title={`${title} — 360° view`}
        subtitle="Drag the slider to rotate the vehicle"
      >
        <Spin360 photos={photos} title={title} />
      </Modal>
    </div>
  );
}

/**
 * Lightweight custom 360 viewer: scrubs through the available angles with a
 * slider. Drops in an embedded provider iframe when `NEXT_PUBLIC_SPIN360_URL`
 * is configured for a listing.
 */
function Spin360({ photos, title }: { photos: PhotoKey[]; title: string }) {
  const [frame, setFrame] = useState(0);
  const embed = process.env.NEXT_PUBLIC_SPIN360_URL;

  if (embed) {
    return (
      <iframe
        src={embed}
        title={`${title} 360 degree view`}
        style={{ width: "100%", aspectRatio: "16 / 10", border: 0 }}
        loading="lazy"
      />
    );
  }

  return (
    <div>
      <div className="sm-gallery__stage">
        <Photo
          name={photos[frame % photos.length]}
          alt={`${title} angle ${frame + 1}`}
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>
      <input
        className="sm-range"
        type="range"
        min={0}
        max={photos.length - 1}
        value={frame}
        aria-label="Rotate vehicle"
        onChange={(e) => setFrame(Number(e.target.value))}
        style={{ marginTop: "var(--sm-space-3)" }}
      />
      <p className="sm-help">
        Full spin sets are captured in our Mombasa Road studio — ask the sales desk for
        the complete 36-frame rotation of this unit.
      </p>
    </div>
  );
}
