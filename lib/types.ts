// Character + stats — one avatar, stats grow from real actions

export const STAT_KEYS = [
  "strength",
  "stamina",
  "knowledge",
  "social",
  "focus",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_LABELS: Record<StatKey, string> = {
  strength: "Strength",
  stamina: "Stamina",
  knowledge: "Knowledge",
  social: "Social",
  focus: "Focus",
};

export const STAT_ICONS: Record<StatKey, string> = {
  strength: "💪",
  stamina: "🏃",
  knowledge: "📚",
  social: "👥",
  focus: "🎯",
};

export interface CharacterStats {
  strength: number;
  stamina: number;
  knowledge: number;
  social: number;
  focus: number;
}

export interface Character {
  id: string;
  name: string;
  username: string; // for @handle in feed
  avatar: string;
  level: number;
  totalXP: number;
  stats: CharacterStats;
  streakDays: number;
  lastActivityDate: string | null; // YYYY-MM-DD
  achievements: string[]; // e.g. "First Quest Completed", "7-Day Streak"
  createdAt: number;
}

// —— Find Friends (social) ——
export type FriendRequestStatus = "pending" | "accepted" | "declined";

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromName: string;
  fromAvatar: string;
  toUsername: string;
  status: FriendRequestStatus;
  createdAt: number;
}

/** Snapshot of a friend for display (level, stats). */
export interface Friend {
  userId: string;
  username: string;
  name: string;
  avatar: string;
  level: number;
  totalXP: number;
  stats: CharacterStats;
  streakDays: number;
  addedAt: number;
}

export interface ActivityDefinition {
  id: string;
  label: string;
  description: string;
  stat: StatKey;
  /** Base XP before streak multiplier and minutes scaling */
  baseXp: number;
  /** Legacy: flat XP if no minutes (use baseXp for spec) */
  xp: number;
  statGain: number;
  icon: string;
  /** If true, XP scales with minutes (+5 per 10 min); stat scales with minutes too */
  usesMinutes?: boolean;
}

export interface ActivityLog {
  id: string;
  characterId: string;
  activityId: string;
  createdAt: number;
  /** Optional: for study/focus, used for XP and stat scaling */
  minutes?: number;
  proofUrl?: string;
  tags?: string[];
  /** XP actually awarded for this log (for streak daily minimum) */
  xpEarned?: number;
}

// —— The Quad (social feed) ——
// RamMark: max 15 chars, up to 10 per Field Note, separate from 300-char limit
export const RAMMARK_MAX_LENGTH = 15;
export const RAMMARK_MAX_PER_POST = 10;
export const FIELD_NOTE_MAX_CHARS = 300;

export interface RamMark {
  id: string;
  tag: string; // normalized lowercase, no # in storage
}

export interface FieldNote {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  body: string;
  ramMarks: RamMark[];
  nodCount: number;
  rallyCount: number;
  nodByUserIds: Set<string>;
  rallyByUserIds: Set<string>;
  createdAt: number;
  proofUrl?: string; // optional proof image for bonus XP
}

// For serialization we store nod/rally as arrays
export interface FieldNoteSerialized {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  body: string;
  ramMarks: RamMark[];
  nodCount: number;
  rallyCount: number;
  nodByUserIds: string[];
  rallyByUserIds: string[];
  createdAt: number;
  proofUrl?: string;
}

// —— Daily quests ——
export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  stat: StatKey;
  targetCount: number;
  xpReward: number;
  icon: string;
}

export interface DailyQuestProgress {
  questId: string;
  currentCount: number;
  completed: boolean;
  claimedAt?: number;
}

// —— Boss battles (midterms, finals, group projects) ——
export type BossType = "midterm" | "final" | "group_project";

export interface Boss {
  id: string;
  type: BossType;
  name: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  xpReward: number;
  icon: string;
  /** Starting HP; study sessions deal damage until 0 */
  bossHp: number;
}

export interface BossProgress {
  bossId: string;
  currentHp: number;
  defeated: boolean;
  defeatedAt?: number;
}

/** Python-style current boss: one active boss (name + HP) that study sessions damage */
export interface CurrentBoss {
  name: string;
  hp: number;
  maxHp: number;
  active: boolean;
  startedAt: number;
}

/** User-created boss: custom name and HP; one can be "active" (receiving study damage). XP = 100 + (maxHp - 250) / 10 * 5. */
export interface UserBoss {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  defeated: boolean;
  defeatedAt?: number;
  createdAt: number;
  /** XP awarded on defeat (100 at 250 HP, +5 per 10 HP above 250) */
  xpReward: number;
}
