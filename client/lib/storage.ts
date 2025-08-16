import { DayData, createEmptyDayData } from "@shared/breakfast";

const STORAGE_KEY = "hilldale-breakfast-planner";

export interface StorageData {
  days: Record<string, DayData>; // date -> DayData
  lastUpdated: string;
}

const getStorageData = (): StorageData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }

  return {
    days: {},
    lastUpdated: new Date().toISOString(),
  };
};

const saveStorageData = (data: StorageData): void => {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const getDayData = (date: string): DayData => {
  const storage = getStorageData();
  return storage.days[date] || createEmptyDayData(date);
};

export const saveDayData = (dayData: DayData): void => {
  const storage = getStorageData();
  storage.days[dayData.date] = dayData;
  saveStorageData(storage);
};

export const clearDayData = (date: string): void => {
  const storage = getStorageData();
  if (storage.days[date]) {
    delete storage.days[date];
    saveStorageData(storage);
  }
};

export const duplicateDay = (fromDate: string, toDate: string): void => {
  const storage = getStorageData();
  const sourceDay = storage.days[fromDate];

  if (sourceDay) {
    const duplicatedDay: DayData = {
      ...sourceDay,
      date: toDate,
      rooms: { ...sourceDay.rooms },
    };

    storage.days[toDate] = duplicatedDay;
    saveStorageData(storage);
  }
};

export const getAllStoredDates = (): string[] => {
  const storage = getStorageData();
  return Object.keys(storage.days).sort();
};

export const getDateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const getToday = (): string => {
  return getDateString(new Date());
};

export const getTomorrow = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getDateString(tomorrow);
};

export const formatDateDisplay = (date: string): string => {
  const dateObj = new Date(date);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date === getDateString(today)) {
    return "Today";
  } else if (date === getDateString(tomorrow)) {
    return "Tomorrow";
  } else {
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
};
