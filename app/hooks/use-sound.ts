import { useCallback } from "react";

// Um pequeno som de "pop" em base64 (formato wav) para não precisar carregar arquivos externos
const POP_SOUND = "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAABDAU0BNQERAREBvQDBAA==";

export function useSound() {
  const playPop = useCallback(() => {
    try {
      const audio = new Audio(POP_SOUND);
      // Volume suave
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignorar erros de reprodução (ex: autoplay blockado pelo navegador)
      });
    } catch (e) {
      // Ignorar erros se Audio API não for suportada
    }
  }, []);

  return { playPop };
}
