"use client";

interface ProfileDialogConfirmationNoticeProps {
  title: string;
  description: string;
}

export function ProfileDialogConfirmationNotice({
  title,
  description,
}: ProfileDialogConfirmationNoticeProps) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
      <div className="text-sm font-semibold text-emerald-800">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-emerald-700">{description}</div>
    </div>
  );
}
