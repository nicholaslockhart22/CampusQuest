/**
 * Custom avatar builder options. Stored as JSON string in character.avatar.
 */

export const SKIN_TONES = [
  { id: "1", label: "Light", color: "#f5d0c4" },
  { id: "2", label: "Fair", color: "#e8b4a0" },
  { id: "3", label: "Medium", color: "#c6866a" },
  { id: "4", label: "Olive", color: "#a67c52" },
  { id: "5", label: "Brown", color: "#8d5524" },
  { id: "6", label: "Dark", color: "#5c3317" },
] as const;

export const HAIR_STYLES = [
  { id: "short", label: "Short" },
  { id: "long", label: "Long straight" },
  { id: "curly", label: "Curly" },
  { id: "buzz", label: "Buzz cut" },
  { id: "ponytail", label: "Ponytail" },
  { id: "bun", label: "Bun" },
  { id: "waves", label: "Wavy" },
  { id: "bald", label: "Bald" },
] as const;

export const HAIR_COLORS = [
  { id: "black", label: "Black", color: "#1a1a1a" },
  { id: "brown", label: "Brown", color: "#4a3728" },
  { id: "blonde", label: "Blonde", color: "#d4a84b" },
  { id: "red", label: "Red", color: "#8b4513" },
  { id: "gray", label: "Gray", color: "#6b6b6b" },
  { id: "auburn", label: "Auburn", color: "#722f37" },
] as const;

export const CLOTHES_STYLES = [
  { id: "tshirt", label: "T-shirt" },
  { id: "hoodie", label: "Hoodie" },
  { id: "tank", label: "Tank" },
  { id: "collared", label: "Collared" },
  { id: "sweater", label: "Sweater" },
] as const;

export const CLOTHES_COLORS = [
  { id: "navy", color: "#041E42" },
  { id: "keaney", color: "#68ABE8" },
  { id: "white", color: "#f0f0f0" },
  { id: "gray", color: "#6b7280" },
  { id: "green", color: "#2e7d32" },
  { id: "maroon", color: "#722f37" },
  { id: "gold", color: "#c5a028" },
  { id: "black", color: "#1f2937" },
] as const;

export const BODY_TYPES = [
  { id: "slim", label: "Slim" },
  { id: "medium", label: "Medium" },
  { id: "broad", label: "Broad" },
] as const;

export const GENDERS = [
  { id: "neutral", label: "Neutral" },
  { id: "feminine", label: "Feminine" },
  { id: "masculine", label: "Masculine" },
] as const;

export const FACE_STYLES = [
  { id: "default", label: "Default" },
  { id: "smile", label: "Smile" },
  { id: "happy", label: "Happy" },
  { id: "calm", label: "Calm" },
  { id: "serious", label: "Serious" },
  { id: "wink", label: "Wink" },
] as const;

export const HAT_STYLES = [
  { id: "none", label: "None" },
  { id: "cap", label: "Cap" },
  { id: "beanie", label: "Beanie" },
  { id: "crown", label: "Crown" },
  { id: "wizard", label: "Wizard hat" },
] as const;

export const GLASSES_STYLES = [
  { id: "none", label: "None" },
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
  { id: "sunglasses", label: "Sunglasses" },
] as const;

export const BACKPACK_STYLES = [
  { id: "none", label: "None" },
  { id: "backpack", label: "Backpack" },
  { id: "satchel", label: "Satchel" },
  { id: "cape", label: "Cape" },
] as const;

export interface CustomAvatarData {
  v: 1;
  skin: string;
  hair: string;
  hairColor: string;
  clothes: string;
  clothesColor: string;
  body: string;
  gender: string;
  face: string;
  hat?: string;
  glasses?: string;
  backpack?: string;
}

const DEFAULT_AVATAR: CustomAvatarData = {
  v: 1,
  skin: "2",
  hair: "short",
  hairColor: "brown",
  clothes: "hoodie",
  clothesColor: "keaney",
  body: "medium",
  gender: "neutral",
  face: "smile",
  hat: "none",
  glasses: "none",
  backpack: "none",
};

export function getDefaultCustomAvatar(): CustomAvatarData {
  return { ...DEFAULT_AVATAR };
}

export function parseAvatar(avatar: string): CustomAvatarData | null {
  if (typeof avatar !== "string" || !avatar.startsWith("{")) return null;
  try {
    const data = JSON.parse(avatar) as CustomAvatarData;
    if (data.v === 1) {
      if (data.face == null) (data as CustomAvatarData).face = "smile";
      if (data.hat == null) (data as CustomAvatarData).hat = "none";
      if (data.glasses == null) (data as CustomAvatarData).glasses = "none";
      if (data.backpack == null) (data as CustomAvatarData).backpack = "none";
      return data;
    }
  } catch {
    // ignore
  }
  return null;
}

export function serializeAvatar(data: CustomAvatarData): string {
  return JSON.stringify(data);
}

export function isCustomAvatar(avatar: string): boolean {
  return parseAvatar(avatar) !== null;
}
