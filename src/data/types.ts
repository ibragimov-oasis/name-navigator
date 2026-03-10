export interface ChildName {
  id: string;
  name: string;
  gender: "male" | "female" | "unisex";
  origin: string;
  culture: string;
  religion?: string;
  meaning: string;
  attributes: string[];
  popularity: number; // 1-100
  namedAfter?: string[];
  famousPeople?: string[];
  history: string;
  nameDay?: string;
  languages: string[];
}
