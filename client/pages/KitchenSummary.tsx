import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Users,
  Calendar,
  Utensils,
  Apple,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  getDayData,
  getToday,
  getTomorrow,
  formatDateDisplay,
} from "@/lib/storage";
import { generateBreakfastSummary } from "@shared/breakfast";
import WhatsAppShare from "@/components/WhatsAppShare";
import {
  checkAndCleanupExpiredData,
  getCurrentDateDisplay,
} from "@/lib/cleanup";
import { useToast } from "@/hooks/use-toast";

export default function KitchenSummary() {
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get("date") || getTomorrow();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [dayData, setDayData] = useState(() => getDayData(selectedDate));
  const [isToday, setIsToday] = useState(selectedDate === getToday());
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
      const currentDate = isToday ? getToday() : getTomorrow();
      setDayData(getDayData(currentDate));

      toast({
        title: "Data cleaned up",
        description: `Cleared ${clearedDates.length} expired breakfast order(s)`,
      });
    }
  }, []);

  const summary = generateBreakfastSummary(dayData);
  const completedRooms = Object.entries(dayData.rooms).filter(
    ([, room]) => room.isComplete && room.guestCount > 0,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-4">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F30485974eb44483ca6500e16e8280c8a%2F24e24432b83b414993572f938159e658?format=webp&width=800"
                  alt="Hilldale Retreat Logo"
                  className="h-12 w-auto"
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <ChefHat className="h-6 w-6" />
                    Kitchen Summary
                  </h1>
                  <p className="text-muted-foreground">
                    {formatDateDisplay(selectedDate)}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    Today: {getCurrentDateDisplay()}
                  </p>
                </div>
              </div>
            </div>

            <WhatsAppShare dayData={dayData} />
          </div>

          {/* Day Toggle */}
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
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
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {summary.totalGuests === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Breakfast Orders
              </h3>
              <p className="text-muted-foreground mb-4">
                No rooms have set their breakfast orders for{" "}
                {formatDateDisplay(selectedDate)}.
              </p>
              <Button asChild>
                <Link to="/">Set Up Rooms</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">
                    {summary.totalGuests}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Guests
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.adults}
                  </div>
                  <div className="text-sm text-muted-foreground">Adults</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.kids}
                  </div>
                  <div className="text-sm text-muted-foreground">Kids</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Utensils className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {summary.englishBreakfasts}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    English BF
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Utensils className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {summary.sriLankanBreakfasts}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sri Lankan BF
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fruit Platters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  Fruit Platters Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {summary.fruitPlatters.fullPlates}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Full Plates
                      <br />
                      <span className="text-xs">(Adults)</span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <div className="text-3xl font-bold text-accent-foreground">
                      {summary.fruitPlatters.halfPlates}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Half Plates
                      <br />
                      <span className="text-xs">(Kids)</span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {summary.fruitPlatters.totalPlates}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Plates
                      <br />
                      <span className="text-xs">(Equivalent)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Slots */}
            {Object.keys(summary.timeSlots).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Breakfast Time Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(summary.timeSlots)
                      .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
                      .map(([time, count]) => (
                        <div
                          key={time}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        >
                          <div className="font-medium">{time}</div>
                          <Badge variant="secondary">{count} guests</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Room Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Room-by-Room Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {completedRooms.map(([roomId, roomData]) => {
                    const englishCount = roomData.guests.filter(
                      (g) => g.type === "English",
                    ).length;
                    const sriLankanCount = roomData.guests.filter(
                      (g) => g.type === "Sri Lankan",
                    ).length;
                    const notesGuests = roomData.guests.filter(
                      (g) => g.note && g.note.trim() !== "",
                    );

                    return (
                      <div
                        key={roomId}
                        className="border border-border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              Room {roomId}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {roomData.breakfastTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {roomData.guestCount} guests (
                                {roomData.adultCount}A, {roomData.kidCount}K)
                              </span>
                            </div>
                          </div>
                          <WhatsAppShare
                            dayData={dayData}
                            roomId={roomId}
                            size="sm"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </WhatsAppShare>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {englishCount}
                            </div>
                            <div className="text-sm text-orange-800">
                              English Breakfast
                            </div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {sriLankanCount}
                            </div>
                            <div className="text-sm text-red-800">
                              Sri Lankan Breakfast
                            </div>
                          </div>
                        </div>

                        {notesGuests.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Special Notes:</h4>
                            <div className="space-y-2">
                              {notesGuests.map((guest, index) => {
                                const guestNumber =
                                  roomData.guests.indexOf(guest) + 1;
                                return (
                                  <div
                                    key={index}
                                    className="text-sm p-2 bg-yellow-50 rounded border-l-4 border-yellow-400"
                                  >
                                    <span className="font-medium">
                                      Guest {guestNumber}:
                                    </span>{" "}
                                    {guest.note}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
