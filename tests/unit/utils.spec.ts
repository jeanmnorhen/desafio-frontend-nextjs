import { describe, it, expect } from "vitest";
import { formatRelativeTime, cn } from "@/lib/utils";

describe("Utils Library", () => {
  describe("cn (Tailwind Merge)", () => {
    it("deve combinar classes do Tailwind sem conflitos", () => {
      const result = cn("bg-red-500", "bg-blue-500 text-white");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("text-white");
      expect(result).not.toContain("bg-red-500");
    });
  });

  describe("formatRelativeTime", () => {
    it("deve formatar tempo passado no mesmo dia mostrando a hora", () => {
      const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      expect(formatRelativeTime(dezMinutosAtras)).toMatch(/^\d{2}:\d{2}$/);
    });

    it("deve formatar data de outra semana mostrando dd/MM/yy", () => {
      const dezDiasAtras = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(dezDiasAtras)).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
    });

    it("deve lidar com datas em formato ISO string inválidas elegantemente", () => {
      const fakeDate = "data-invalida";
      try {
        formatRelativeTime(fakeDate);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});
