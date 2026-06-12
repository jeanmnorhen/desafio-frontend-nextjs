"use client";

import { useEffect, useState } from "react";

export function TypingIndicator() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-none bg-bg-message-in px-4 py-2 text-sm text-text-primary shadow-sm">
      <span className="font-medium text-text-secondary">Digitando</span>
      <span className="inline-block w-4 text-left">{dots}</span>
    </div>
  );
}
