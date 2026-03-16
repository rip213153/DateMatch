import { ReactElement } from "react";

export type QuizMode = "romance" | "friendship";

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

export interface FriendshipTraits {
  socialEnergy: number;
  maintenance: number;
  boundaries: number;
  spontaneity: number;
  empathy: number;
  reliability: number;
  depth: number;
  openness: number;
}

export type RomanceQuestionCategory =
  | "social"
  | "dating"
  | "lifestyle"
  | "communication"
  | "values"
  | "career"
  | "commitment"
  | "trust"
  | "support";

export type FriendshipQuestionCategory =
  | "social_energy"
  | "maintenance"
  | "role"
  | "empathy"
  | "boundaries"
  | "values"
  | "comfort"
  | "lifestyle";

export interface QuizAnswer<TTraits extends object = PersonalityTraits> {
  text: string;
  traits: Partial<TTraits>;
  explanation?: string; // Used for analysis generation
}

export interface QuizQuestion<
  TTraits extends object = PersonalityTraits,
  TCategory extends string = RomanceQuestionCategory,
> {
  id: string;
  text: string;
  category: TCategory;
  icon: ReactElement;
  answers: QuizAnswer<TTraits>[];
}

export type Answer = QuizAnswer<PersonalityTraits>;
export type Question = QuizQuestion<PersonalityTraits, RomanceQuestionCategory>;
export type FriendshipAnswer = QuizAnswer<FriendshipTraits>;
export type FriendshipQuestion = QuizQuestion<FriendshipTraits, FriendshipQuestionCategory>;

export interface UserProfile {
  id: number | string;
  created_at: string | Date | null;
  name: string;
  age: number;
  gender: string;
  seeking: string;
  university: string;
  email: string;
  wechat_open_id?: string | null;
  wechat_union_id?: string | null;
  wechat_notice_opt_in?: boolean | null;
  wechat_bound_at?: string | number | Date | null;
  interests: string | string[];
  ideal_date: string;
  bio?: string;
  personality_profile?: PersonalityTraits | FriendshipTraits | string;
  matching_status?: "WAITING" | "MATCHED" | "VIEWED";
  match_at?: string | number | Date | null;
  eligible_release_at?: string | number | Date | null;
  match_opt_out_until?: string | number | Date | null;
}

export interface Match {
  id: string;
  created_at: string;
  user1_id: string;
  user2_id: string;
  status: "pending" | "accepted" | "rejected";
}

export type ChatNotificationEventType = "NEW_MESSAGE";
export type ChatNotificationEventStatus = "PENDING" | "PROCESSED" | "FAILED" | "SKIPPED";

export interface ChatNotificationEvent {
  id: number;
  messageId: number;
  senderId: number;
  receiverId: number;
  eventType: ChatNotificationEventType;
  status: ChatNotificationEventStatus;
  lastError?: string | null;
  createdAt: string | null;
  consumedAt: string | null;
}
