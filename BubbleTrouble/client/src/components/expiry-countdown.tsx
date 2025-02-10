
import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";

export default function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = differenceInSeconds(new Date(expiresAt), new Date());
      if (seconds <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
      } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="text-sm text-muted-foreground">
      {timeLeft}
    </div>
  );
}
