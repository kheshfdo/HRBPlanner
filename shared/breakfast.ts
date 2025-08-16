export type Room = "101" | "102" | "201" | "202" | "301" | "302";

export type BreakfastType = "English" | "Sri Lankan";

export type GuestType = "Adult" | "Kid";

export interface Guest {
  id: string;
  type: BreakfastType;
  guestType: GuestType;
  note?: string;
}

export interface RoomData {
  room: Room;
  breakfastTime?: string; // HH:MM format
  guestCount: number;
  adultCount: number;
  kidCount: number;
  guests: Guest[];
  isComplete: boolean;
}

export interface DayData {
  date: string; // YYYY-MM-DD format
  rooms: Record<Room, RoomData>;
}

export interface BreakfastSummary {
  totalGuests: number;
  adults: number;
  kids: number;
  englishBreakfasts: number;
  sriLankanBreakfasts: number;
  fruitPlatters: {
    fullPlates: number;
    halfPlates: number;
    totalPlates: number;
  };
  timeSlots: Record<string, number>; // time -> guest count
}

export const ROOMS: Room[] = ["101", "102", "201", "202", "301", "302"];

export const createEmptyRoomData = (room: Room): RoomData => ({
  room,
  breakfastTime: "07:30",
  guestCount: 0,
  adultCount: 0,
  kidCount: 0,
  guests: [],
  isComplete: false,
});

export const createEmptyDayData = (date: string): DayData => ({
  date,
  rooms: ROOMS.reduce(
    (acc, room) => {
      acc[room] = createEmptyRoomData(room);
      return acc;
    },
    {} as Record<Room, RoomData>,
  ),
});

export const calculateFruitPlatters = (
  adults: number,
  kids: number,
): { fullPlates: number; halfPlates: number; totalPlates: number } => {
  // Rule: Adults get 1 full plate each, Kids get 1 half plate each
  const fullPlates = adults;
  const halfPlates = kids;
  const totalPlates = fullPlates + halfPlates * 0.5;

  return {
    fullPlates,
    halfPlates,
    totalPlates,
  };
};

export const generateBreakfastSummary = (
  dayData: DayData,
): BreakfastSummary => {
  const summary: BreakfastSummary = {
    totalGuests: 0,
    adults: 0,
    kids: 0,
    englishBreakfasts: 0,
    sriLankanBreakfasts: 0,
    fruitPlatters: {
      fullPlates: 0,
      halfPlates: 0,
      totalPlates: 0,
    },
    timeSlots: {},
  };

  Object.values(dayData.rooms).forEach((roomData) => {
    if (roomData.isComplete && roomData.guestCount > 0) {
      summary.totalGuests += roomData.guestCount;
      summary.adults += roomData.adultCount;
      summary.kids += roomData.kidCount;

      // Count breakfast types
      roomData.guests.forEach((guest) => {
        if (guest.type === "English") {
          summary.englishBreakfasts += 1;
        } else {
          summary.sriLankanBreakfasts += 1;
        }
      });

      // Count time slots
      if (roomData.breakfastTime) {
        summary.timeSlots[roomData.breakfastTime] =
          (summary.timeSlots[roomData.breakfastTime] || 0) +
          roomData.guestCount;
      }
    }
  });

  summary.fruitPlatters = calculateFruitPlatters(summary.adults, summary.kids);
  return summary;
};
