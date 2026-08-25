import { describe, it, expect } from "vitest";
import {
  tajikRegistryNames,
  TAJIK_ALPHABET,
  checkTajikNameLegality,
  getTajikAlphabetStats,
} from "@/data/tajikRegistry";

describe("Tajik National Names Registry", () => {
  it("should contain exactly 3,461 official names from Decree №98", () => {
    expect(tajikRegistryNames.length).toBe(3461);
  });

  it("should have exactly 1,454 female names and 2,007 male names", () => {
    const female = tajikRegistryNames.filter((n) => n.gender === "female");
    const male = tajikRegistryNames.filter((n) => n.gender === "male");
    expect(female.length).toBe(1454);
    expect(male.length).toBe(2007);
  });

  it("should correctly identify officially permitted names", () => {
    const check1 = checkTajikNameLegality("Абирафшон");
    expect(check1.isPermitted).toBe(true);
    expect(check1.exactMatch?.name_latin).toBe("Abirafshon");

    const check2 = checkTajikNameLegality("Абдуваҳҳоб");
    expect(check2.isPermitted).toBe(true);
    expect(check2.exactMatch?.gender).toBe("male");

    const check3 = checkTajikNameLegality("Abduvahhob");
    expect(check3.isPermitted).toBe(true);

    const check4 = checkTajikNameLegality("НесуществующееИмя12345");
    expect(check4.isPermitted).toBe(false);
  });

  it("should provide alphabet statistics for all letters", () => {
    const stats = getTajikAlphabetStats();
    expect(stats.length).toBeGreaterThanOrEqual(29);
    const totalCount = stats.reduce((acc, s) => acc + s.count, 0);
    expect(totalCount).toBe(3461);
  });
});
