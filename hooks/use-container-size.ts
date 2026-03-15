"use client";

import { RefObject, useEffect, useState } from "react";

export function useContainerSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 640, height: 320 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;
      setSize({
        width: Math.max(280, Math.floor(width)),
        height: Math.max(220, Math.floor(height)),
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
