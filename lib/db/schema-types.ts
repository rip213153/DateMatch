import type { QuizMode } from "@/app/data/types";

export type DateLike = Date | string | number | null;
export type MatchingStatus = "WAITING" | "MATCHED" | "VIEWED";
export type DraftStatus = "PENDING" | "APPLIED";

export type ProfileRow = {
  id: number;
  name: string;
  age: number;
  gender: string;
  seeking: string;
  university: string;
  email: string;
  instagram: string | null;
  chat_user_id: string | null;
  wechat_open_id: string | null;
  wechat_union_id: string | null;
  wechat_notice_opt_in: boolean | null;
  wechat_bound_at: DateLike;
  interests: string | string[] | null;
  ideal_date: string;
  ideal_date_tags: string | string[];
  bio: string | null;
  personality_profile: unknown;
  matching_status: MatchingStatus | null;
  match_at: DateLike;
  eligible_release_at: DateLike;
  match_opt_out_until: DateLike;
  email_sent_at: DateLike;
  created_at: DateLike;
};

export type EmailLoginTokenRow = {
  id: number;
  email: string;
  code_hash: string;
  token_hash: string;
  expires_at: number;
  used_at: number | null;
  created_at: number;
};

export type MutualPairRow = {
  id: number;
  round_key: string;
  mode: QuizMode;
  user_a_id: number;
  user_b_id: number;
  base_score: number;
  user_a_rank: number;
  user_b_rank: number;
  pair_score: number;
  user_a_confirmed_at: DateLike;
  user_b_confirmed_at: DateLike;
  created_at: DateLike;
};

export type MutualPairInsert = {
  round_key: string;
  mode: QuizMode;
  user_a_id: number;
  user_b_id: number;
  base_score: number;
  user_a_rank: number;
  user_b_rank: number;
  pair_score: number;
  user_a_confirmed_at?: DateLike;
  user_b_confirmed_at?: DateLike;
  created_at?: DateLike;
};

export type DraftRow = {
  id: number;
  user_id: number;
  mode: QuizMode;
  draft_payload: unknown;
  effective_at: DateLike;
  status: DraftStatus;
  created_at: DateLike;
  updated_at: DateLike;
};
