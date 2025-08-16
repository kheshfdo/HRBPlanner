import { getAllStoredDates, clearDayData, getDateString } from "./storage";

export const checkAndCleanupExpiredData = (): string[] => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = getDateString(now);

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = getDateString(yesterday);

  const clearedDates: string[] = [];
  const storedDates = getAllStoredDates();

  storedDates.forEach((date) => {
    // Always clear yesterday's data
    if (date === yesterdayDate) {
      clearDayData(date);
      clearedDates.push(date);
      return;
    }

    // Clear today's data if it's past 12 noon
    if (date === currentDate && currentHour >= 12) {
      clearDayData(date);
      clearedDates.push(date);
      return;
    }

    // Clear any data older than yesterday
    const dataDate = new Date(date);
    if (dataDate < yesterday) {
      clearDayData(date);
      clearedDates.push(date);
    }
  });

  return clearedDates;
};

export const shouldAutoCleanup = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = getDateString(now);

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = getDateString(yesterday);

  const storedDates = getAllStoredDates();

  // Check if there's data that should be cleaned
  return storedDates.some((date) => {
    // Check for yesterday's data
    if (date === yesterdayDate) return true;

    // Check for today's data past 12 noon
    if (date === currentDate && currentHour >= 12) return true;

    // Check for any older data
    const dataDate = new Date(date);
    return dataDate < yesterday;
  });
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getCurrentDateDisplay = (): string => {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
