/**
 * CampusQuest character classes: base template (same head, eyes, body); swap hair, outfit, prop, color.
 */

import type { CharacterStats } from "./types";
import type { CustomAvatarData } from "./avatarOptions";
import { serializeAvatar } from "./avatarOptions";

export const CHARACTER_CLASSES = [
  {
    id: "gym",
    icon: "💪",
    name: "Iron Ram",
    realm: "Gym",
    styleSub: "Big eyes + thick eyebrows, spiky hair, small muscular body",
    statsBoost: { strength: 3, stamina: 2, knowledge: 0, social: 0, focus: 0 },
    traits: ["Simple dumbbell prop", "Hoodie + armor combo"],
    specialSkill: "Early Morning Grind",
    outfitLabel: "Gym",
    starterWeapon: "dumbbell",
    propIcon: "💪",
  },
  {
    id: "knight",
    icon: "🐏",
    name: "Rhody Knight",
    realm: "Discipline",
    styleSub: "Blue & gold armor, textbook shield",
    statsBoost: { knowledge: 2, strength: 1, stamina: 0, social: 0, focus: 0 },
    traits: ["Blue & gold armor", "Ram horn helmet sticker", "Textbook shield"],
    specialSkill: "Midterm Mastery",
    outfitLabel: "Knight",
    starterWeapon: "textbook",
    propIcon: "📚",
  },
  {
    id: "mage",
    icon: "📚",
    name: "Library Sage",
    realm: "Study",
    styleSub: "Laptop spellbook, coffee potion",
    statsBoost: { knowledge: 3, focus: 2, strength: 0, stamina: 0, social: 0 },
    traits: ["Laptop spellbook", "Coffee potion", "Big nerd glasses"],
    specialSkill: "All-Nighter Spell",
    outfitLabel: "Mage",
    starterWeapon: "laptop",
    propIcon: "💻",
  },
  {
    id: "bard",
    icon: "🎸",
    name: "Quad Bard",
    realm: "Social",
    styleSub: "Guitar or mic, URI scarf",
    statsBoost: { social: 3, strength: 0, stamina: 0, knowledge: 0, focus: 1 },
    traits: ["Guitar or mic", "URI scarf", "Big smile"],
    specialSkill: "Networking Aura",
    outfitLabel: "Bard",
    starterWeapon: "guitar",
    propIcon: "🎸",
  },
  {
    id: "rogue",
    icon: "💼",
    name: "Resume Rogue",
    realm: "Career",
    styleSub: "Suit + cloak, laptop dagger",
    statsBoost: { knowledge: 3, focus: 2, strength: 0, stamina: 0, social: 0 },
    traits: ["Suit + cloak", "Laptop dagger", "Resume scroll"],
    specialSkill: "LinkedIn Strike",
    outfitLabel: "Rogue",
    starterWeapon: "laptop",
    propIcon: "💼",
  },
] as const;

export type CharacterClassId = (typeof CHARACTER_CLASSES)[number]["id"];

/**
 * Base avatar template: same head shape, eye style, body for all.
 * Swap only: hair, outfit, prop, color.
 * Presets match each class style (Gym Warrior = spiky hair, muscular; Knight = blue & gold; etc.)
 */
export const CLASS_AVATAR_PRESETS: Record<CharacterClassId, CustomAvatarData> = {
  gym: {
    v: 1,
    skin: "3",
    hair: "short",
    hairColor: "black",
    clothes: "hoodie",
    clothesColor: "gray",
    body: "broad",
    gender: "masculine",
    face: "serious",
  },
  knight: {
    v: 1,
    skin: "2",
    hair: "short",
    hairColor: "brown",
    clothes: "collared",
    clothesColor: "navy",
    body: "medium",
    gender: "neutral",
    face: "calm",
  },
  mage: {
    v: 1,
    skin: "2",
    hair: "waves",
    hairColor: "brown",
    clothes: "sweater",
    clothesColor: "navy",
    body: "medium",
    gender: "neutral",
    face: "smile",
  },
  bard: {
    v: 1,
    skin: "2",
    hair: "curly",
    hairColor: "auburn",
    clothes: "hoodie",
    clothesColor: "keaney",
    body: "medium",
    gender: "neutral",
    face: "happy",
  },
  rogue: {
    v: 1,
    skin: "3",
    hair: "short",
    hairColor: "black",
    clothes: "collared",
    clothesColor: "black",
    body: "slim",
    gender: "neutral",
    face: "wink",
  },
};

export function getClassById(id: string) {
  return CHARACTER_CLASSES.find((c) => c.id === id) ?? null;
}

/** Display title for profile/character (e.g. "Iron Ram", "Rhody Knight"). */
export function getClassTitle(classId: string | undefined | null): string | null {
  if (!classId) return null;
  const cls = getClassById(classId);
  return cls?.name ?? null;
}

/** Short realm label (e.g. "Gym", "Discipline", "Study"). */
export function getClassRealm(classId: string | undefined | null): string | null {
  if (!classId) return null;
  const cls = getClassById(classId);
  return cls?.realm ?? null;
}

export function getPropIconForClass(classId: string): string | null {
  const cls = getClassById(classId);
  return cls?.propIcon ?? null;
}

export function getPropIconForWeapon(weaponId: string): string | null {
  const w = STARTER_WEAPONS.find((x) => x.id === weaponId);
  return w?.icon ?? null;
}

export function getClassAvatarPreset(classId: CharacterClassId): string {
  return serializeAvatar(CLASS_AVATAR_PRESETS[classId]);
}

/** Apply a class's stat boost to base stats. */
export function applyClassStats(base: CharacterStats, classId: CharacterClassId): CharacterStats {
  const cls = getClassById(classId);
  if (!cls) return base;
  const next = { ...base };
  (Object.keys(cls.statsBoost) as (keyof CharacterStats)[]).forEach((key) => {
    next[key] = (next[key] ?? 0) + (cls.statsBoost[key] ?? 0);
  });
  return next;
}

export const STARTER_WEAPONS = [
  { id: "textbook", label: "Textbook", icon: "📚" },
  { id: "dumbbell", label: "Dumbbell", icon: "💪" },
  { id: "laptop", label: "Laptop", icon: "💻" },
  { id: "coffee", label: "Coffee Cup", icon: "☕" },
  { id: "guitar", label: "Guitar", icon: "🎸" },
] as const;
