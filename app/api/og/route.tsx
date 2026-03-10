import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type PersonalityTraits = {
  socialStyle: number;
  emotionalReadiness: number;
  dateStyle: number;
  commitment: number;
  communication: number;
  independence: number;
  career: number;
  flexibility: number;
};

const DEFAULT_PROFILE: PersonalityTraits = {
  socialStyle: 5,
  emotionalReadiness: 5,
  dateStyle: 5,
  commitment: 5,
  communication: 5,
  independence: 5,
  career: 5,
  flexibility: 5,
};

const TRAIT_META: Array<{ key: keyof PersonalityTraits; label: string; color: string }> = [
  { key: "socialStyle", label: "社交", color: "#0ea5e9" },
  { key: "emotionalReadiness", label: "情感", color: "#f43f5e" },
  { key: "dateStyle", label: "约会", color: "#d946ef" },
  { key: "commitment", label: "承诺", color: "#10b981" },
  { key: "communication", label: "沟通", color: "#06b6d4" },
  { key: "independence", label: "独立", color: "#f59e0b" },
  { key: "career", label: "事业", color: "#8b5cf6" },
  { key: "flexibility", label: "适应", color: "#84cc16" },
];

function clampTrait(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.max(0, Math.min(10, num));
}

function parseProfile(raw: string | null): PersonalityTraits {
  if (!raw) return { ...DEFAULT_PROFILE };

  try {
    const data = JSON.parse(raw) as Partial<Record<keyof PersonalityTraits, unknown>>;
    return {
      socialStyle: clampTrait(data.socialStyle),
      emotionalReadiness: clampTrait(data.emotionalReadiness),
      dateStyle: clampTrait(data.dateStyle),
      commitment: clampTrait(data.commitment),
      communication: clampTrait(data.communication),
      independence: clampTrait(data.independence),
      career: clampTrait(data.career),
      flexibility: clampTrait(data.flexibility),
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function getSummary(value: number, label: string) {
  if (value >= 7) return `${label}维度表现很亮眼`;
  if (value >= 4) return `${label}维度整体较均衡`;
  return `${label}维度还有提升空间`;
}

function renderDefaultImage(title: string, description: string) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fff1f5 0%, #fdf2f8 42%, #f5f3ff 100%)",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            background:
              "radial-gradient(circle at 20% 20%, rgba(244,114,182,0.24), transparent 28%), radial-gradient(circle at 80% 24%, rgba(168,85,247,0.18), transparent 26%), radial-gradient(circle at 50% 80%, rgba(251,113,133,0.14), transparent 30%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginBottom: "28px",
            padding: "12px 22px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.76)",
            border: "1px solid rgba(244,114,182,0.24)",
            color: "#db2777",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <span>❤</span>
          <span>DateMatch</span>
        </div>

        <div
          style={{
            position: "relative",
            maxWidth: "920px",
            textAlign: "center",
            fontSize: 82,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.04,
            color: "#111827",
            marginBottom: "24px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            position: "relative",
            maxWidth: "820px",
            textAlign: "center",
            fontSize: 32,
            lineHeight: 1.45,
            color: "#4b5563",
          }}
        >
          {description}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function renderTraitCard(item: { key: keyof PersonalityTraits; label: string; color: string }, profile: PersonalityTraits) {
  const score = profile[item.key];
  const width = `${Math.round((score / 10) * 100)}%`;

  return (
    <div
      key={item.key}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "22px",
        borderRadius: "24px",
        background: "#fffafc",
        border: "1px solid rgba(244,114,182,0.10)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <span style={{ fontSize: 26, fontWeight: 700 }}>{item.label}</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{score.toFixed(1)}</span>
      </div>
      <div style={{ display: "flex", width: "100%", height: "10px", borderRadius: "999px", overflow: "hidden", background: "#f3f4f6", marginBottom: "12px" }}>
        <div style={{ width, height: "100%", borderRadius: "999px", background: item.color }} />
      </div>
      <div style={{ fontSize: 18, lineHeight: 1.5, color: "#6b7280" }}>{getSummary(score, item.label)}</div>
    </div>
  );
}

function renderResultsImage(title: string, description: string, profile: PersonalityTraits) {
  const rows = [
    TRAIT_META.slice(0, 2),
    TRAIT_META.slice(2, 4),
    TRAIT_META.slice(4, 6),
    TRAIT_META.slice(6, 8),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1440px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #fff1f2 0%, #fdf2f8 46%, #eef6ff 100%)",
          padding: "44px",
          color: "#111827",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            borderRadius: "40px",
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(244,114,182,0.15)",
            padding: "44px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              gap: "10px",
              padding: "10px 22px",
              borderRadius: "999px",
              background: "#fdf2f8",
              color: "#db2777",
              fontSize: 22,
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            <span>❤</span>
            <span>DateMatch 恋爱人格档案</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.15, marginBottom: "14px" }}>{title}</div>
            <div style={{ maxWidth: "860px", fontSize: 24, textAlign: "center", lineHeight: 1.6, color: "#4b5563" }}>{description}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "28px" }}>
            {rows.map((row, index) => (
              <div key={`row-${index}`} style={{ display: "flex", gap: "18px" }}>
                {row.map((item) => renderTraitCard(item, profile))}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "20px", marginTop: "auto" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "26px", borderRadius: "28px", background: "#fdf2f8" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#be185d", marginBottom: "12px" }}>关系亮点</div>
              <div style={{ fontSize: 18, lineHeight: 1.7, color: "#831843" }}>真诚表达、关系稳定感和互动节奏感是你的优势，适合建立清晰又自然的亲密连接。</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "26px", borderRadius: "28px", background: "#f5f3ff" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#7c3aed", marginBottom: "12px" }}>关系建议</div>
              <div style={{ fontSize: 18, lineHeight: 1.7, color: "#5b21b6" }}>保留自己的边界，同时把真实需求更早说出来，会让合适的人更快靠近你。</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(244,114,182,0.14)", color: "#9d174d", fontSize: 18 }}>
            <span>DateMatch 2026</span>
            <span>校园专属恋爱人格档案</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1440,
    }
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "default";
    const title = searchParams.get("title") || "DateMatch";
    const description = searchParams.get("description") || "校园人格匹配与同频推荐";

    if (mode === "results") {
      const profile = parseProfile(searchParams.get("profile"));
      return renderResultsImage(title, description, profile);
    }

    return renderDefaultImage(title, description);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    return new Response("Failed to generate image", {
      status: 500,
    });
  }
}
