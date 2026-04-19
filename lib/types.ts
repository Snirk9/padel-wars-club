export type Role = "owner" | "admin" | "member";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: Role;
  joined_at: string;
  profile?: Profile;
}

export interface Match {
  id: string;
  group_id: string;
  team_a_p1: string;
  team_a_p2: string;
  team_b_p1: string;
  team_b_p2: string;
  winner: "team_a" | "team_b";
  score: string;
  played_at: string;
  created_by: string;
  created_at: string;
  team_a_p1_profile?: Profile;
  team_a_p2_profile?: Profile;
  team_b_p1_profile?: Profile;
  team_b_p2_profile?: Profile;
}

export interface Standing {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  wins: number;
  losses: number;
  sets_won: number;
  sets_lost: number;
  set_diff: number;
  matches_played: number;
}

export interface PairStanding {
  player1_id: string;
  player2_id: string;
  player1_name: string;
  player2_name: string;
  player1_avatar: string | null;
  player2_avatar: string | null;
  wins: number;
  losses: number;
  matches_played: number;
}

export interface GroupWithMembership extends Group {
  my_role: Role;
  member_count: number;
  match_count: number;
  my_rank: number | null;
}
