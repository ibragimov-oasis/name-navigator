import { describe, it, expect } from "vitest";
import { countSyllables, generatePatronymic, calculateHarmony } from "./nameHarmony";

describe("nameHarmony core logic", () => {
  describe("countSyllables", () => {
    it("should count vowels in Russian words", () => {
      expect(countSyllables("Мухаммад")).toBe(3);
      expect(countSyllables("Аиша")).toBe(3);
      expect(countSyllables("Я")).toBe(1);
    });

    it("should count vowels in English words", () => {
      expect(countSyllables("John")).toBe(1);
      expect(countSyllables("Alexander")).toBe(4);
    });
  });

  describe("generatePatronymic", () => {
    it("should generate male patronymics correctly", () => {
      expect(generatePatronymic("Иван", "male")).toBe("Иванович");
      // Current logic for -ий/-ей stem mutation:
      // "Дмитрий" -> stem "Дмитр" + "ьевич" = "Дмитрьевич"
      expect(generatePatronymic("Дмитрий", "male")).toBe("Дмитрьевич");
      expect(generatePatronymic("Илья", "male")).toBe("Ильич");
    });

    it("should generate female patronymics correctly", () => {
      expect(generatePatronymic("Иван", "female")).toBe("Ивановна");
      expect(generatePatronymic("Дмитрий", "female")).toBe("Дмитрьевна");
      expect(generatePatronymic("Илья", "female")).toBe("Ильична");
    });
  });

  describe("calculateHarmony", () => {
    it("should return a score for harmonious names", () => {
      // Corrected test: father's name should be the root name (e.g., "Иван" -> "Иванович")
      const result = calculateHarmony("Александр", "Иван", "Иванов", "male");
      expect(result.total).toBeGreaterThan(50);
      expect(result.fullName).toBe("Иванов Александр Иванович");
    });

    it("should return a low score for missing data", () => {
      const result = calculateHarmony("", "", "", "male");
      expect(result.total).toBe(0);
      expect(result.verdict).toBe("Введите данные");
    });
  });
});
