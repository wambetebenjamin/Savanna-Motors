"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Per-digit flip animation. Each character that changes re-triggers a fast flip;
 * under prefers-reduced-motion the value simply updates (CSS disables the keyframe).
 */
export function FlipNumber({ value, prefix = "" }: { value: string; prefix?: string }) {
  const previous = useRef(value);
  const [flipped, setFlipped] = useState<number[]>([]);

  useEffect(() => {
    const prev = previous.current;
    const changed: number[] = [];
    const length = Math.max(prev.length, value.length);
    for (let i = 0; i < length; i += 1) {
      if (prev[i] !== value[i]) changed.push(i);
    }
    previous.current = value;
    setFlipped(changed);
    const timeout = window.setTimeout(() => setFlipped([]), 280);
    return () => window.clearTimeout(timeout);
  }, [value]);

  return (
    <span className="sm-calc__value" aria-label={`${prefix}${value}`}>
      {prefix ? <span aria-hidden="true">{prefix}</span> : null}
      {value.split("").map((char, index) => (
        <span
          key={`${index}-${char}`}
          aria-hidden="true"
          className={`sm-digit${flipped.includes(index) ? " sm-digit--flip" : ""}`}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
