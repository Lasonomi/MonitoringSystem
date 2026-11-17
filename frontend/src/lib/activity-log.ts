export type ActivityType = "upload" | "export";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  fileName: string;
  createdAt: string;
}

const STORAGE_KEY = "dashboard-activity-log";
const LAST_SEEN_KEY = "dashboard-activity-last-seen";
const ACTIVITY_EVENT = "dashboard-activity-updated";
const MAX_ACTIVITIES = 20;

export function getLastSeenActivityId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(LAST_SEEN_KEY);
  } catch (error) {
    console.error("Gagal membaca status notifikasi:", error);
    return null;
  }
}

export function markActivityAsSeen(activityId: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(LAST_SEEN_KEY, activityId);
    window.dispatchEvent(new Event(ACTIVITY_EVENT));
  } catch (error) {
    console.error("Gagal menyimpan status notifikasi:", error);
  }
}

export function getActivities(): ActivityEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is ActivityEntry =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string" &&
        "type" in item &&
        (item.type === "upload" || item.type === "export") &&
        "fileName" in item &&
        typeof item.fileName === "string" &&
        "createdAt" in item &&
        typeof item.createdAt === "string",
    );
  } catch (error) {
    console.error("Gagal membaca riwayat aktivitas:", error);
    return [];
  }
}

export function recordActivity(type: ActivityType, fileName: string): void {
  if (typeof window === "undefined") return;

  const activity: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    fileName,
    createdAt: new Date().toISOString(),
  };

  try {
    const activities = [activity, ...getActivities()].slice(0, MAX_ACTIVITIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    window.dispatchEvent(new Event(ACTIVITY_EVENT));
  } catch (error) {
    console.error("Gagal menyimpan riwayat aktivitas:", error);
  }
}

export function subscribeToActivities(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(ACTIVITY_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(ACTIVITY_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
