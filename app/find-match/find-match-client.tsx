"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FindMatchContent() {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-purple-100 py-12 px-4">
      <motion.div
        className="absolute top-4 left-4 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="text-pink-500 h-6 w-6" />
          <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
            DateMatch
          </span>
        </Link>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8"
        >
          {/* Your existing form JSX */}
          {/* ... */}
        </motion.div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
              Profile Submitted! 💝
            </DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 text-center space-y-4"
          >
            <p className="text-lg text-gray-700">
              Thanks for submitting your profile! We're excited to help you find
              your perfect match.
            </p>
            <p className="text-gray-600">
              We'll be in touch soon with potential matches that align with your
              personality and preferences.
            </p>
            <div className="flex justify-center pt-4">
              <Heart className="text-pink-500 h-8 w-8 animate-pulse" />
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
