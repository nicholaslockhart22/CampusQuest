/**
 * Placeholder campus-wide leaderboard entries (levels + stats).
 * In a real app this would come from the backend.
 */
export interface CampusLeaderboardEntry {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
  totalXP: number;
  stats: {
    strength: number;
    stamina: number;
    knowledge: number;
    social: number;
    focus: number;
  };
  bossesDefeatedCount?: number;
  finalBossesDefeatedCount?: number;
  highestGuildLevel?: number;
}

const AVATARS = ["🎓", "🦉", "🐏", "⚡", "🌟", "🔥", "📚", "🏃", "🎯", "💪", "🧠", "👟"];

/** Deterministic placeholder data for campus leaderboard. */
export const CAMPUS_LEADERBOARD_PLACEHOLDERS: CampusLeaderboardEntry[] = [
  { id: "campus-1", name: "Jordan Blake", username: "jordan_blake", avatar: AVATARS[0], level: 24, totalXP: 8520, stats: { strength: 72, stamina: 68, knowledge: 88, social: 65, focus: 81 }, bossesDefeatedCount: 12, finalBossesDefeatedCount: 3, highestGuildLevel: 6 },
  { id: "campus-2", name: "Sam Rivera", username: "sam_rivera", avatar: AVATARS[1], level: 22, totalXP: 7200, stats: { strength: 55, stamina: 90, knowledge: 75, social: 82, focus: 70 }, bossesDefeatedCount: 8, finalBossesDefeatedCount: 1, highestGuildLevel: 5 },
  { id: "campus-3", name: "Alex Chen", username: "alex_chen", avatar: AVATARS[2], level: 21, totalXP: 6800, stats: { strength: 62, stamina: 58, knowledge: 95, social: 60, focus: 88 }, bossesDefeatedCount: 15, finalBossesDefeatedCount: 4, highestGuildLevel: 4 },
  { id: "campus-4", name: "Morgan Taylor", username: "morgan_t", avatar: AVATARS[3], level: 19, totalXP: 5900, stats: { strength: 78, stamina: 72, knowledge: 70, social: 85, focus: 65 }, bossesDefeatedCount: 6, finalBossesDefeatedCount: 2 },
  { id: "campus-5", name: "Riley Foster", username: "riley_foster", avatar: AVATARS[4], level: 18, totalXP: 5400, stats: { strength: 65, stamina: 80, knowledge: 82, social: 78, focus: 72 }, bossesDefeatedCount: 10, finalBossesDefeatedCount: 2 },
  { id: "campus-6", name: "Casey Kim", username: "casey_kim", avatar: AVATARS[5], level: 17, totalXP: 4950, stats: { strength: 70, stamina: 65, knowledge: 88, social: 62, focus: 85 }, bossesDefeatedCount: 9, finalBossesDefeatedCount: 1 },
  { id: "campus-7", name: "Quinn Davis", username: "quinn_d", avatar: AVATARS[6], level: 16, totalXP: 4500, stats: { strength: 58, stamina: 75, knowledge: 90, social: 70, focus: 78 }, bossesDefeatedCount: 7, finalBossesDefeatedCount: 0 },
  { id: "campus-8", name: "Jamie Walsh", username: "jamie_walsh", avatar: AVATARS[7], level: 15, totalXP: 4100, stats: { strength: 82, stamina: 68, knowledge: 65, social: 88, focus: 60 }, bossesDefeatedCount: 11, finalBossesDefeatedCount: 3 },
  { id: "campus-9", name: "Skyler Hayes", username: "skyler_h", avatar: AVATARS[8], level: 14, totalXP: 3700, stats: { strength: 60, stamina: 85, knowledge: 72, social: 75, focus: 80 }, bossesDefeatedCount: 5, finalBossesDefeatedCount: 1 },
  { id: "campus-10", name: "Drew Martinez", username: "drew_m", avatar: AVATARS[9], level: 13, totalXP: 3300, stats: { strength: 75, stamina: 62, knowledge: 78, social: 82, focus: 68 }, bossesDefeatedCount: 4, finalBossesDefeatedCount: 0 },
  { id: "campus-11", name: "Parker Jones", username: "parker_j", avatar: AVATARS[10], level: 12, totalXP: 2900, stats: { strength: 68, stamina: 70, knowledge: 85, social: 65, focus: 75 }, bossesDefeatedCount: 8, finalBossesDefeatedCount: 2 },
  { id: "campus-12", name: "Avery Smith", username: "avery_smith", avatar: AVATARS[11], level: 11, totalXP: 2550, stats: { strength: 72, stamina: 58, knowledge: 80, social: 90, focus: 70 }, bossesDefeatedCount: 3, finalBossesDefeatedCount: 0 },
  { id: "campus-13", name: "Reese Brown", username: "reese_b", avatar: AVATARS[0], level: 10, totalXP: 2200, stats: { strength: 55, stamina: 78, knowledge: 72, social: 68, focus: 82 }, bossesDefeatedCount: 6, finalBossesDefeatedCount: 1 },
  { id: "campus-14", name: "Cameron Lee", username: "cameron_lee", avatar: AVATARS[1], level: 9, totalXP: 1850, stats: { strength: 80, stamina: 65, knowledge: 68, social: 72, focus: 65 }, bossesDefeatedCount: 2, finalBossesDefeatedCount: 0 },
  { id: "campus-15", name: "Finley Clark", username: "finley_c", avatar: AVATARS[2], level: 8, totalXP: 1520, stats: { strength: 62, stamina: 72, knowledge: 75, social: 80, focus: 78 }, bossesDefeatedCount: 4, finalBossesDefeatedCount: 0 },
].sort((a, b) => b.level - a.level);
