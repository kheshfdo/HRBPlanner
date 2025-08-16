import { useState } from "react";
import { MessageSquare, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  generateWhatsAppMessage,
  generateRoomWhatsAppMessage,
  shareViaWhatsApp,
  copyToClipboard,
} from "@/lib/whatsapp";
import { DayData } from "@shared/breakfast";

interface WhatsAppShareProps {
  dayData: DayData;
  roomId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export default function WhatsAppShare({
  dayData,
  roomId,
  variant = "outline",
  size = "sm",
  children,
}: WhatsAppShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const message = roomId
    ? generateRoomWhatsAppMessage(dayData, roomId)
    : generateWhatsAppMessage(dayData);

  const handleWhatsAppShare = () => {
    shareViaWhatsApp(message);
    setIsOpen(false);
  };

  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard(message);
    if (success) {
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Message copied successfully!",
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const hasOrders = roomId
    ? dayData.rooms[roomId as keyof typeof dayData.rooms]?.isComplete &&
      dayData.rooms[roomId as keyof typeof dayData.rooms]?.guestCount > 0
    : Object.values(dayData.rooms).some(
        (room) => room.isComplete && room.guestCount > 0,
      );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} disabled={!hasOrders}>
          {children || (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp Share
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Share {roomId ? `Room ${roomId}` : "All Rooms"} via WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Message Preview:
            </label>
            <Textarea
              value={message}
              readOnly
              rows={12}
              className="mt-2 text-sm font-mono"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleWhatsAppShare} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open WhatsApp
            </Button>

            <Button
              variant="outline"
              onClick={handleCopyToClipboard}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {!hasOrders &&
              "No breakfast orders to share. Please set up rooms first."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
