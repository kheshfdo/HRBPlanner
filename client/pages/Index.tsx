import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Users, CalendarDays, Settings, ChefHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  getDayData,
  getToday,
  getTomorrow,
  formatDateDisplay,
  clearDayData,
} from "@/lib/storage";
import { Room, ROOMS, RoomData } from "@shared/breakfast";
import WhatsAppShare from "@/components/WhatsAppShare";
import { useToast } from "@/hooks/use-toast";
import {
  checkAndCleanupExpiredData,
  getCurrentDateDisplay,
} from "@/lib/cleanup";

export default function Index() {
  const [selectedDate, setSelectedDate] = useState<string>(getTomorrow());
  const [dayData, setDayData] = useState(() => getDayData(selectedDate));
  const [isToday, setIsToday] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const newDate = isToday ? getToday() : getTomorrow();
    setSelectedDate(newDate);
    setDayData(getDayData(newDate));
  }, [isToday]);

  // Automatic cleanup on component mount
  useEffect(() => {
    const clearedDates = checkAndCleanupExpiredData();
    if (clearedDates.length > 0) {
      // Refresh data after cleanup
      const currentDate = isToday ? getToday() : getTomorrow();
      setDayData(getDayData(currentDate));

      toast({
        title: "Data cleaned up",
        description: `Cleared ${clearedDates.length} expired breakfast order(s)`,
      });
    }
  }, []); // Run once on mount

  const handleClearDay = () => {
    clearDayData(selectedDate);
    setDayData(getDayData(selectedDate));
    toast({
      title: "Day cleared",
      description: `All breakfast orders for ${formatDateDisplay(selectedDate)} have been cleared.`,
    });
  };

  const getRoomStatus = (roomData: RoomData) => {
    if (!roomData.isComplete || roomData.guestCount === 0) {
      return { text: "Not Set", variant: "secondary" as const };
    }

    const guestText =
      roomData.guestCount === 1 ? "1 guest" : `${roomData.guestCount} guests`;
    const timeText = roomData.breakfastTime || "No time";
    return {
      text: `Set • ${guestText} • ${timeText}`,
      variant: "default" as const,
    };
  };

  const getTotalGuests = () => {
    return Object.values(dayData.rooms).reduce((total, room) => {
      return total + (room.isComplete ? room.guestCount : 0);
    }, 0);
  };

  const getCompletedRooms = () => {
    return Object.values(dayData.rooms).filter((room) => room.isComplete)
      .length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F30485974eb44483ca6500e16e8280c8a%2F24e24432b83b414993572f938159e658?format=webp&width=800"
                alt="Hilldale Retreat Logo"
                className="h-12 sm:h-16 w-auto flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  Breakfast Planner
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Manage breakfast orders for Hilldale guests
                </p>
                <p className="text-xs sm:text-sm text-primary font-medium mt-1 sm:mt-2">
                  {getCurrentDateDisplay()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 self-start sm:self-auto">
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Day Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="day-toggle" className="text-sm font-medium">
                {formatDateDisplay(selectedDate)}
              </Label>
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="day-toggle"
                  className={`text-sm ${!isToday ? "text-muted-foreground" : ""}`}
                >
                  Today
                </Label>
                <Switch
                  id="day-toggle"
                  checked={!isToday}
                  onCheckedChange={(checked) => setIsToday(!checked)}
                />
                <Label
                  htmlFor="day-toggle"
                  className={`text-sm ${isToday ? "text-muted-foreground" : ""}`}
                >
                  Tomorrow
                </Label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild className="h-9">
                <Link to="/kitchen-summary">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Kitchen Summary
                </Link>
              </Button>
              <WhatsAppShare dayData={dayData} />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {getCompletedRooms()}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Rooms Set
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {getTotalGuests()}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Total Guests
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {ROOMS.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Total Rooms
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Room Cards */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ROOMS.map((room) => {
            const roomData = dayData.rooms[room];
            const status = getRoomStatus(roomData);

            return (
              <Card
                key={room}
                className="hover:shadow-lg hover:bg-accent/50 active:bg-accent active:scale-[0.98] transition-all duration-200 cursor-pointer group min-h-[140px]"
              >
                <Link
                  to={`/room/${room}?date=${selectedDate}`}
                  className="block h-full"
                >
                  <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        Room {room}
                      </div>
                      <Badge
                        variant={status.variant}
                        className="text-xs shrink-0 ml-2"
                      >
                        {status.text}
                      </Badge>
                    </div>

                    <div className="space-y-2 sm:space-y-3 flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span className="font-medium">
                          {roomData.breakfastTime || "Time not set"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>
                          {roomData.guestCount === 0
                            ? "No guests"
                            : `${roomData.guestCount} guests (${roomData.adultCount}A, ${roomData.kidCount}K)`}
                        </span>
                      </div>

                      {roomData.isComplete && roomData.guestCount > 0 && (
                        <div className="pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground">
                            {
                              roomData.guests.filter(
                                (g) => g.type === "English",
                              ).length
                            }{" "}
                            English ���{" "}
                            {
                              roomData.guests.filter(
                                (g) => g.type === "Sri Lankan",
                              ).length
                            }{" "}
                            Sri Lankan
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleClearDay}
            className="h-10 px-6"
          >
            Clear Day
          </Button>
          <Button variant="outline" className="h-10 px-6">
            Duplicate Yesterday
          </Button>
          <Button variant="outline" asChild className="h-10 px-6">
            <Link to="/kitchen-summary">View Kitchen Summary</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
