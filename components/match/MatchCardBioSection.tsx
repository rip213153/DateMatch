"use client";

interface MatchCardBioSectionProps {
  bio?: string;
}

export function MatchCardBioSection({ bio }: MatchCardBioSectionProps) {
  if (bio) {
    return (
      <div className="mb-6 rounded-xl border border-pink-100 bg-pink-50/50 p-4">
        <div className="mb-1 text-xs font-bold text-pink-700">自我介绍</div>
        <div className="text-xs leading-relaxed text-pink-600">{bio}</div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
      <div className="mb-1 text-xs font-bold text-gray-600">自我介绍</div>
      <div className="text-xs italic text-gray-500">对方还没填写自我介绍</div>
    </div>
  );
}
