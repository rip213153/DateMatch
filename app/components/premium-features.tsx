"use client";

// import { useState } from "react";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PremiumFeatures() {
  // const [showPayment, setShowPayment] = useState(false)

  const handleUpgrade = () => {
    // Implement payment logic here
    console.log("Upgrade to premium");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-4">
          <Sparkles className="w-4 h-4 mr-2" />
          Unlock Premium Features
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Premium ($2.99)</DialogTitle>
          <DialogDescription>
            Get access to exclusive features and deeper insights!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4" />
            <span>Detailed AI-generated dating advice</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4" />
            <span>Unlock additional savage questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4" />
            <span>Compare results with friends</span>
          </div>
          <Button onClick={handleUpgrade} className="w-full">
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
