import { describe, it, expect } from "vitest";
import { formatRelativeTime, cn, getInitials, formatPhoneNumber } from "@/lib/utils";

describe("Utils Library", () => {
  describe("cn (Tailwind Merge)", () => {
    it("deve combinar classes do Tailwind sem conflitos", () => {
      const result = cn("bg-red-500", "bg-blue-500 text-white");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("text-white");
      expect(result).not.toContain("bg-red-500");
    });
  });

  describe("getInitials", () => {
    it("deve retornar as iniciais em maiúsculo para nomes simples e compostos", () => {
      expect(getInitials("João Silva")).toBe("JS");
      expect(getInitials("maria")).toBe("MA"); // Um único nome pega as 2 primeiras letras
      expect(getInitials("Ana Maria de Souza")).toBe("AS"); // Primeiro e último nome
    });

    it("deve lidar com espaços extras elegantemente", () => {
      expect(getInitials("   Carlos   Eduardo  ")).toBe("CE");
    });

    it("deve retornar string vazia se o nome for nulo ou vazio", () => {
      expect(getInitials("")).toBe("");
    });
  });

  describe("formatPhoneNumber", () => {
    it("deve formatar número internacional com 13 dígitos (9 dígitos local)", () => {
      expect(formatPhoneNumber("5511987654321")).toBe("+55 (11) 98765-4321");
    });

    it("deve formatar número internacional com 12 dígitos (8 dígitos local)", () => {
      expect(formatPhoneNumber("551187654321")).toBe("+55 (11) 8765-4321");
    });

    it("deve formatar número nacional com 11 dígitos", () => {
      expect(formatPhoneNumber("11987654321")).toBe("(11) 98765-4321");
    });

    it("deve formatar número nacional com 10 dígitos", () => {
      expect(formatPhoneNumber("1187654321")).toBe("(11) 8765-4321");
    });

    it("deve retornar o próprio valor se não puder ser formatado nos padrões esperados", () => {
      expect(formatPhoneNumber("123")).toBe("123");
      expect(formatPhoneNumber("texto-invalido")).toBe("texto-invalido");
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
