import type { PersonalityTraits } from "@/app/data/types";

export type UserSummary = {
  id: number;
  name: string;
  age: number;
  university: string;
  email?: string;
  gender?: string;
  seeking?: string;
  ideal_date?: string;
  ideal_date_tags?: string[];
  bio?: string;
  interests?: unknown;
  personality_profile?: string | PersonalityTraits;
  match_opt_out_until?: string | number | Date | null;
};

export type MatchItem = {
  user: {
    id: number;
    name: string;
    age: number;
    university: string;
    email: string | undefined;
    ideal_date: string;
    ideal_date_tags?: string[];
    bio?: string;
    interests: unknown;
    personality_profile?: string | PersonalityTraits;
  };
  match: {
    overallScore: number;
    breakdown: {
      personality: number;
      interests: number;
      background: number;
      complementary: number;
    };
    matches: string[];
    recommendations: string[];
  };
};

export type MatchConfirmationStatus = {
  selfConfirmed: boolean;
  otherConfirmed: boolean;
  canMessage: boolean;
};
