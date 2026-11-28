import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
import { mergeLegality, adabLevel, LEGALITY_OPTIONS, type DecisionResult } from "@/lib/ai/geminiDecisions";

const ai = (decision: string, confidence = 0.8): DecisionResult => ({ decision, confidence, options: [], reason: "", model: "m" });

describe("decision agents", () => {
  it("exact registry match wins over AI", () => {
    const r = mergeLegality("permitted", ai(LEGALITY_OPTIONS[2]));
    expect(r?.label).toBe(LEGALITY_OPTIONS[0]);
    expect(r?.source).toBe("registry");
  });
  it("uses AI answer when not in registry", () => {
    expect(mergeLegality("not_found", ai(LEGALITY_OPTIONS[2]))?.label).toBe(LEGALITY_OPTIONS[2]);
    expect(mergeLegality("not_found", null)).toBeNull();
  });
  it("maps rubric scores to adab levels", () => {
    expect(adabLevel(ai("4")).label).toBe("Мустахабб");
    expect(adabLevel(ai("0")).label).toBe("Харам");
  });
});
