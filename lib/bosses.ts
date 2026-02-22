import type { Boss } from "./types";

// Example bosses; in a real app these would be user-created or from calendar
export function getSampleBosses(): Boss[] {
  const today = new Date();
  const inTwoWeeks = new Date(today);
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
  const inFourWeeks = new Date(today);
  inFourWeeks.setDate(inFourWeeks.getDate() + 28);
  const inOneWeek = new Date(today);
  inOneWeek.setDate(inOneWeek.getDate() + 7);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return [
    {
      id: "boss-midterm-1",
      type: "midterm",
      name: "Econometrics Midterm",
      description: "Ch 1–5. Show up prepared.",
      dueDate: fmt(inTwoWeeks),
      xpReward: 150,
      icon: "📐",
      bossHp: 250,
    },
    {
      id: "boss-final-1",
      type: "final",
      name: "Data Science Final",
      description: "Final project + exam.",
      dueDate: fmt(inFourWeeks),
      xpReward: 300,
      icon: "🐍",
      bossHp: 400,
    },
    {
      id: "boss-group-1",
      type: "group_project",
      name: "Group Project Deadline",
      description: "Submit deliverable with your team.",
      dueDate: fmt(inOneWeek),
      xpReward: 100,
      icon: "👥",
      bossHp: 150,
    },
  ];
}

export function getBossTypeLabel(type: Boss["type"]): string {
  switch (type) {
    case "midterm":
      return "Midterm";
    case "final":
      return "Final";
    case "group_project":
      return "Group Project";
    default:
      return "Boss";
  }
}
