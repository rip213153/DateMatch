import { ReactElement } from "react";

export interface PersonalityTraits {
  socialStyle: number; // How they interact in social settings
  emotionalReadiness: number; // Readiness for relationship
  dateStyle: number; // Dating approach and preferences
  commitment: number; // Attitude towards commitment
  communication: number; // Communication skills
  independence: number; // Level of independence
  career: number; // Career focus and ambition
  flexibility: number;
}

export interface Answer {
  text: string;
  traits: Partial<PersonalityTraits>;
  explanation?: string; // Used for analysis generation
}

export interface Question {
  id: string;
  text: string;
  category:
    | "social"
    | "dating"
    | "lifestyle"
    | "communication"
    | "values"
    | "career"
    | "commitment"
    | "trust"
    | "support";
  icon: ReactElement;
  answers: Answer[];
}

export interface UserProfile {
  id: number | string;
  created_at: string | Date | null;
  name: string;
  age: number;
  gender: string;
  seeking: string;
  university: string;
  email: string;
  interests: string | string[];
  ideal_date: string;
  bio?: string;
  personality_profile?: PersonalityTraits | string;
  matching_status?: "WAITING" | "MATCHED" | "VIEWED";
  match_at?: string | number | Date | null;
}

export interface Match {
  id: string;
  created_at: string;
  user1_id: string;
  user2_id: string;
  status: "pending" | "accepted" | "rejected";
}
