import { useState, useEffect } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Users,
  Plus,
  Minus,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getDayData, saveDayData, formatDateDisplay } from "@/lib/storage";
import {
  Room as RoomType,
  RoomData,
  Guest,
  BreakfastType,
  GuestType,
} from "@shared/breakfast";
import WhatsAppShare from "@/components/WhatsAppShare";

export default function Room() {
  const { roomId } = useParams<{ roomId: RoomType }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const date = searchParams.get("date") || "";
  const [dayData, setDayData] = useState(() => getDayData(date));
  const [roomData, setRoomData] = useState<RoomData>(dayData.rooms[roomId!]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [originalRoomData, setOriginalRoomData] = useState<RoomData>(
    dayData.rooms[roomId!],
  );

  useEffect(() => {
    if (roomId) {
      const currentRoomData = dayData.rooms[roomId];
      setRoomData(currentRoomData);
      setOriginalRoomData(currentRoomData);
      setHasUnsavedChanges(false);
    }
  }, [dayData, roomId]);

  const hasDataChanged = (
    newData: RoomData,
    originalData: RoomData,
  ): boolean => {
    return (
      newData.breakfastTime !== originalData.breakfastTime ||
      newData.guestCount !== originalData.guestCount ||
      newData.adultCount !== originalData.adultCount ||
      newData.kidCount !== originalData.kidCount ||
      JSON.stringify(newData.guests) !== JSON.stringify(originalData.guests)
    );
  };

  const updateRoomData = (updates: Partial<RoomData>) => {
    if (!roomId) return;

    const newRoomData = { ...roomData, ...updates };

    // Check if data has changed from original
    const hasChanged = hasDataChanged(newRoomData, originalRoomData);
    setHasUnsavedChanges(hasChanged);

    // Update local state but don't save to storage yet
    setRoomData(newRoomData);
  };

  const saveChanges = () => {
    if (!roomId) return;

    const newDayData = {
      ...dayData,
      rooms: {
        ...dayData.rooms,
        [roomId]: roomData,
      },
    };

    setDayData(newDayData);
    saveDayData(newDayData);
    setOriginalRoomData(roomData);
    setHasUnsavedChanges(false);
  };

  const discardChanges = () => {
    setRoomData(originalRoomData);
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    navigate(-1);
  };

  const handleNavigation = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      navigate(-1);
    }
  };

  const handleSaveAndExit = () => {
    saveChanges();
    setShowUnsavedDialog(false);
    navigate(-1);
  };

  const clearRoom = () => {
    if (!roomId) return;

    const clearedRoomData = {
      room: roomId,
      breakfastTime: "07:30",
      guestCount: 0,
      adultCount: 0,
      kidCount: 0,
      guests: [],
      isComplete: false,
    };

    // Save cleared data immediately
    const newDayData = {
      ...dayData,
      rooms: {
        ...dayData.rooms,
        [roomId]: clearedRoomData,
      },
    };

    saveDayData(newDayData);
    setDayData(newDayData);
    setRoomData(clearedRoomData);
    setOriginalRoomData(clearedRoomData);
    setHasUnsavedChanges(false);
  };

  const handleClearRoom = () => {
    setShowClearDialog(true);
  };

  const confirmClearRoom = () => {
    clearRoom();
    setShowClearDialog(false);
  };

  const updateGuestCount = (total: number, adults: number, kids: number) => {
    const currentGuests = roomData.guests.slice(0, total);
    const newGuests = [...currentGuests];

    // Add new guests if needed
    for (let i = currentGuests.length; i < total; i++) {
      newGuests.push({
        id: `guest-${i + 1}`,
        type: "English",
        guestType: "Adult",
        note: "",
      });
    }

    // Auto-assign guest types based on counts
    for (let i = 0; i < adults && i < newGuests.length; i++) {
      newGuests[i].guestType = "Adult";
    }
    for (let i = adults; i < newGuests.length; i++) {
      newGuests[i].guestType = "Kid";
      // Default kids to English breakfast
      newGuests[i].type = "English";
    }

    updateRoomData({
      guestCount: total,
      adultCount: adults,
      kidCount: kids,
      guests: newGuests,
      isComplete: total > 0 && roomData.breakfastTime !== undefined,
    });
  };

  const updateGuest = (index: number, updates: Partial<Guest>) => {
    const newGuests = [...roomData.guests];
    newGuests[index] = { ...newGuests[index], ...updates };

    updateRoomData({
      guests: newGuests,
    });
  };

  const applyToAllGuests = (
    field: "type" | "guestType",
    value: BreakfastType | GuestType,
  ) => {
    const newGuests = roomData.guests.map((guest) => ({
      ...guest,
      [field]: value,
    }));

    updateRoomData({
      guests: newGuests,
    });
  };

  const copyFromPreviousGuest = (index: number) => {
    if (index > 0) {
      const previousGuest = roomData.guests[index - 1];
      updateGuest(index, {
        type: previousGuest.type,
        guestType: previousGuest.guestType,
        note: previousGuest.note,
      });
    }
  };

  const validateAndSave = () => {
    const isValid = roomData.guestCount > 0 && roomData.breakfastTime;
    const finalRoomData = {
      ...roomData,
      isComplete: isValid,
    };

    if (!roomId) return;

    // Save to storage
    const newDayData = {
      ...dayData,
      rooms: {
        ...dayData.rooms,
        [roomId]: finalRoomData,
      },
    };

    saveDayData(newDayData);
    setHasUnsavedChanges(false);

    if (isValid) {
      navigate(-1);
    }
  };

  if (!roomId) {
    return <div>Room not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigation}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F30485974eb44483ca6500e16e8280c8a%2F24e24432b83b414993572f938159e658?format=webp&width=800"
                alt="Hilldale Retreat Logo"
                className="h-10 sm:h-12 w-auto flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Room {roomId}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {formatDateDisplay(date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Breakfast Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Breakfast Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="time"
                value={roomData.breakfastTime || "07:30"}
                onChange={(e) =>
                  updateRoomData({ breakfastTime: e.target.value })
                }
                className="w-40"
              />
              <Badge variant={roomData.breakfastTime ? "default" : "secondary"}>
                {roomData.breakfastTime ? "Set" : "Not Set"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Guest Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Count (Max 18)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Total Guests</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newTotal = Math.max(0, roomData.guestCount - 1);
                      // Remove kids first, then adults
                      const newKids = Math.max(0, roomData.kidCount - 1);
                      const newAdults = newTotal - newKids;
                      updateGuestCount(
                        newTotal,
                        Math.max(0, newAdults),
                        newKids,
                      );
                    }}
                    disabled={roomData.guestCount <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">
                    {roomData.guestCount}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newTotal = Math.min(18, roomData.guestCount + 1);
                      // Auto-add to adults first
                      const newAdults = Math.min(
                        newTotal,
                        roomData.adultCount + 1,
                      );
                      const newKids = newTotal - newAdults;
                      updateGuestCount(newTotal, newAdults, newKids);
                    }}
                    disabled={roomData.guestCount >= 18}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Adults</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newAdults = Math.max(0, roomData.adultCount - 1);
                      const newKids = roomData.guestCount - newAdults;
                      updateGuestCount(roomData.guestCount, newAdults, newKids);
                    }}
                    disabled={roomData.adultCount <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">
                    {roomData.adultCount}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newAdults = Math.min(
                        roomData.guestCount,
                        roomData.adultCount + 1,
                      );
                      const newKids = roomData.guestCount - newAdults;
                      updateGuestCount(roomData.guestCount, newAdults, newKids);
                    }}
                    disabled={roomData.adultCount >= roomData.guestCount}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Kids</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-12 text-center font-bold text-lg">
                    {roomData.kidCount}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    (Auto-calculated)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Fill Tools */}
            {roomData.guestCount > 0 && (
              <div className="space-y-2">
                <Label>Quick Fill Tools</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyToAllGuests("type", "English")}
                  >
                    All English
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyToAllGuests("type", "Sri Lankan")}
                  >
                    All Sri Lankan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyToAllGuests("guestType", "Adult")}
                  >
                    All Adults
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest Details */}
        {roomData.guestCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Guest Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roomData.guests.map((guest, index) => (
                <div
                  key={guest.id}
                  className="p-4 border border-border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Guest {index + 1}</h4>
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyFromPreviousGuest(index)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Previous
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Breakfast Type</Label>
                      <Select
                        value={guest.type}
                        onValueChange={(value: BreakfastType) =>
                          updateGuest(index, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Sri Lankan">Sri Lankan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Guest Type</Label>
                      <Select
                        value={guest.guestType}
                        onValueChange={(value: GuestType) =>
                          updateGuest(index, { guestType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Adult">Adult</SelectItem>
                          <SelectItem value="Kid">Kid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Notes (Allergies/Preferences)</Label>
                    <Textarea
                      placeholder="Any special dietary requirements..."
                      value={guest.note || ""}
                      onChange={(e) =>
                        updateGuest(index, { note: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <WhatsAppShare
              dayData={dayData}
              roomId={roomId}
              variant="outline"
            />
            <Button
              variant="destructive"
              onClick={handleClearRoom}
              className="h-10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Clear Room</span>
              <span className="xs:hidden">Clear</span>
            </Button>
          </div>

          <div className="flex gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleNavigation}
              className="h-10 flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              onClick={validateAndSave}
              disabled={roomData.guestCount === 0 || !roomData.breakfastTime}
              className="h-10 flex-1 sm:flex-initial"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Room
            </Button>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to Room {roomId}. Would you like to save
              these changes before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={discardChanges}>
              Don't Save
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndExit}>
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Room Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Room {roomId}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all breakfast data for Room{" "}
              {roomId}? This will reset the breakfast time, guest count, and all
              guest details. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearRoom}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
