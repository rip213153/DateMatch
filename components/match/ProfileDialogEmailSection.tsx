"use client";

import { Mail } from "lucide-react";

interface ProfileDialogEmailSectionProps {
  checkingEmailAccess: boolean;
  emailUnlocked: boolean;
  email?: string;
}

export function ProfileDialogEmailSection({
  checkingEmailAccess,
  emailUnlocked,
  email,
}: ProfileDialogEmailSectionProps) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-700">
        <Mail className="h-4 w-4 text-pink-500" />
        <span className="font-medium">Email</span>
      </div>
      <div className="mt-2 break-all text-sm text-gray-600">
        {checkingEmailAccess ? (
          "Checking whether the email can be shown..."
        ) : emailUnlocked ? (
          email || "Not provided"
        ) : (
          <div className="space-y-1">
            <div>The email only appears after both of you have sent at least one message.</div>
            <div className="text-xs text-gray-400">Email is used for login and stays hidden by default.</div>
          </div>
        )}
      </div>
    </div>
  );
}
