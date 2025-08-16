import { DayData, formatDateDisplay, getToday, getTomorrow } from "./storage";
import { ROOMS, generateBreakfastSummary } from "@shared/breakfast";

const formatWhatsAppDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();

  const today = getToday();
  const tomorrow = getTomorrow();

  if (dateString === today) {
    return `Today ${day} ${month} ${year}`;
  } else if (dateString === tomorrow) {
    return `Tomorrow ${day} ${month} ${year}`;
  } else {
    return `${day} ${month} ${year}`;
  }
};

export const generateWhatsAppMessage = (dayData: DayData): string => {
  const summary = generateBreakfastSummary(dayData);
  const dateDisplay = formatWhatsAppDate(dayData.date);

  let message = `🌅 *Hilldale Breakfast Order*\n*${dateDisplay}*\n\n`;

  // Overall Summary
  message += `📊 *SUMMARY*\n`;
  message += `• Total Guests: ${summary.totalGuests} (${summary.adults} Adults, ${summary.kids} Kids)\n`;
  message += `• English Breakfast: ${summary.englishBreakfasts}\n`;
  message += `• Sri Lankan Breakfast: ${summary.sriLankanBreakfasts}\n`;
  message += `• Fruit Platters: ${summary.fruitPlatters.fullPlates} full + ${summary.fruitPlatters.halfPlates} half (${summary.fruitPlatters.totalPlates} total)\n\n`;

  // Time Slots
  if (Object.keys(summary.timeSlots).length > 0) {
    message += `��� *TIME SLOTS*\n`;
    Object.entries(summary.timeSlots)
      .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
      .forEach(([time, count]) => {
        message += `• ${time}: ${count} guests\n`;
      });
    message += `\n`;
  }

  // Room Details
  message += `🏠 *ROOM BREAKDOWN*\n`;
  ROOMS.forEach((room) => {
    const roomData = dayData.rooms[room];
    if (roomData.isComplete && roomData.guestCount > 0) {
      message += `\n*Room ${room}* - ${roomData.breakfastTime}\n`;
      message += `${roomData.guestCount} guests (${roomData.adultCount}A, ${roomData.kidCount}K)\n`;

      const englishCount = roomData.guests.filter(
        (g) => g.type === "English",
      ).length;
      const sriLankanCount = roomData.guests.filter(
        (g) => g.type === "Sri Lankan",
      ).length;

      if (englishCount > 0) message += `- English: ${englishCount}\n`;
      if (sriLankanCount > 0) message += `- Sri Lankan: ${sriLankanCount}\n`;

      // Special notes
      const notesGuests = roomData.guests.filter(
        (g) => g.note && g.note.trim() !== "",
      );
      if (notesGuests.length > 0) {
        message += `📝 Notes:\n`;
        notesGuests.forEach((guest, index) => {
          const guestNumber = roomData.guests.indexOf(guest) + 1;
          message += `  G${guestNumber}: ${guest.note}\n`;
        });
      }
    }
  });

  const completedRooms = ROOMS.filter(
    (room) =>
      dayData.rooms[room].isComplete && dayData.rooms[room].guestCount > 0,
  );
  if (completedRooms.length === 0) {
    message = `🌅 *Hilldale Breakfast Order*\n*${dateDisplay}*\n\nNo breakfast orders set for this day.`;
  }

  return message;
};

export const generateRoomWhatsAppMessage = (
  dayData: DayData,
  roomId: string,
): string => {
  const roomData = dayData.rooms[roomId as keyof typeof dayData.rooms];
  const dateDisplay = formatWhatsAppDate(dayData.date);

  if (!roomData.isComplete || roomData.guestCount === 0) {
    return `🌅 *Room ${roomId} Breakfast Order*\n*${dateDisplay}*\n\nNo breakfast order set for this room.`;
  }

  let message = `🌅 *Room ${roomId} Breakfast Order*\n*${dateDisplay}*\n\n`;
  message += `⏰ Time: ${roomData.breakfastTime}\n`;
  message += `👥 Guests: ${roomData.guestCount} (${roomData.adultCount} Adults, ${roomData.kidCount} Kids)\n\n`;

  const englishCount = roomData.guests.filter(
    (g) => g.type === "English",
  ).length;
  const sriLankanCount = roomData.guests.filter(
    (g) => g.type === "Sri Lankan",
  ).length;

  message += `🍳 *Breakfast Types:*\n`;
  if (englishCount > 0) message += `• English: ${englishCount}\n`;
  if (sriLankanCount > 0) message += `• Sri Lankan: ${sriLankanCount}\n`;

  // Guest details with notes
  const notesGuests = roomData.guests.filter(
    (g) => g.note && g.note.trim() !== "",
  );
  if (notesGuests.length > 0) {
    message += `\n📝 *Special Notes:*\n`;
    notesGuests.forEach((guest, index) => {
      const guestNumber = roomData.guests.indexOf(guest) + 1;
      message += `• Guest ${guestNumber}: ${guest.note}\n`;
    });
  }

  return message;
};

export const shareViaWhatsApp = (message: string): void => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

  // Try to open WhatsApp
  window.open(whatsappUrl, "_blank");
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};
