import { describe, it, expect, beforeAll } from "vitest";
import {
  TAJIK_ALPHABET,
  checkTajikNameLegality,
  getTajikAlphabetStats,
  getTajikCounts,
  tajikNameSlug,
} from "@/data/tajikRegistry";
import { fetchRegistry } from "@/lib/api/tajikRegistryApi";
import { checkTajikFio } from "@/lib/tajik/fio";
import { levenshtein, normalizeLoose, hasRareLetters } from "@/lib/tajik/text";
import type { TajikRegistryName } from "@/data/tajikTypes";

let names: TajikRegistryName[] = [];

beforeAll(async () => {
  names = await fetchRegistry();
});

describe("Tajik National Names Registry", () => {
  it("should contain exactly 3,461 official names from Decree №98", () => {
    expect(names.length).toBe(3461);
  });

  it("should have exactly 1,454 female names and 2,007 male names", () => {
    const counts = getTajikCounts(names);
    expect(counts.female).toBe(1454);
    expect(counts.male).toBe(2007);
  });

  it("should correctly identify officially permitted names", () => {
    const check1 = checkTajikNameLegality("Абирафшон", names);
    expect(check1.status).toBe("permitted");
    expect(check1.exactMatch?.name_latin).toBe("Abirafshon");

    const check2 = checkTajikNameLegality("Абдуваҳҳоб", names);
    expect(check2.isPermitted).toBe(true);
    expect(check2.exactMatch?.gender).toBe("male");

    const check3 = checkTajikNameLegality("Abduvahhob", names);
    expect(check3.status).toBe("permitted");

    const check4 = checkTajikNameLegality("НесуществующееИмя12345", names);
    expect(check4.status).toBe("not_found");
    expect(check4.isPermitted).toBe(false);
  });

  it("should suggest close matches for misspelled names", () => {
    const res = checkTajikNameLegality("Абирафшн", names);
    expect(res.status).not.toBe("permitted");
    expect(res.suggestions.length).toBeGreaterThan(0);
  });

  it("should provide alphabet statistics for all letters", () => {
    const stats = getTajikAlphabetStats(names);
    expect(stats.length).toBeGreaterThanOrEqual(29);
    const totalCount = stats.reduce((acc, s) => acc + s.count, 0);
    expect(totalCount).toBe(3461);
  });

  it("should build stable slugs", () => {
    const first = names[0];
    expect(tajikNameSlug(first)).toMatch(/^[a-z0-9-]+$/);
  });

  it("should expose the full Tajik alphabet", () => {
    expect(TAJIK_ALPHABET).toContain("Ҷ");
    expect(TAJIK_ALPHABET).toContain("Ғ");
  });
});

describe("Text helpers", () => {
  it("computes levenshtein distance", () => {
    expect(levenshtein("Рустам", "Рустам")).toBe(0);
    expect(levenshtein("Рустам", "Рустом")).toBe(1);
  });

  it("normalizes tajik letters", () => {
    expect(normalizeLoose("Ҷамшед")).toBe(normalizeLoose("Жамшед"));
  });

  it("detects rare tajik letters", () => {
    expect(hasRareLetters("Ғафур")).toBe(true);
    expect(hasRareLetters("Рустам")).toBe(false);
  });
});

describe("FIO rules", () => {
  it("flags russified surnames", () => {
    const res = checkTajikFio({ firstName: "Фирӯз", patronymic: "Сомон", lastName: "Рахимов" });
    expect(res.score).toBeLessThan(100);
    expect(res.issues.some((i) => i.level === "warning")).toBe(true);
    expect(res.suggestedFio).toContain("зода");
  });

  it("accepts national surnames", () => {
    const res = checkTajikFio({ firstName: "Фирӯз", patronymic: "Сомон", lastName: "Раҳимзода" });
    expect(res.score).toBe(100);
  });
});
