import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RESULT_QR_TARGET = "http://39.107.110.145:3000/";
const RESULT_QR_IMAGE = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=16&data=${encodeURIComponent(RESULT_QR_TARGET)}`;
const RESULT_QR_HINT = "扫码查看完整档案并进入 DateMatch";

type QuizMode = "romance" | "friendship";
type TraitVersion = "legacy" | "v2";

type TraitMetaItem = {
  key: string;
  label: string;
  color: string;
};

type OgFontDefinition = {
  name: "Noto Sans SC";
  data: ArrayBuffer;
  style: "normal";
  weight: 400 | 700;
};

let ogFontsPromise: Promise<OgFontDefinition[]> | null = null;
let ogFontsOrigin: string | null = null;

const ROMANCE_DEFAULT_PROFILE = {
  socialStyle: 5,
  emotionalReadiness: 5,
  dateStyle: 5,
  commitment: 5,
  communication: 5,
  independence: 5,
  career: 5,
  flexibility: 5,
};

const FRIENDSHIP_DEFAULT_PROFILE = {
  socialEnergy: 5,
  maintenance: 5,
  boundaries: 5,
  spontaneity: 5,
  empathy: 5,
  reliability: 5,
  depth: 5,
  openness: 5,
};

const ROMANCE_DEFAULT_PROFILE_V2 = {
  approachPace: 5,
  reassuranceNeed: 5,
  boundaryAutonomy: 5,
  emotionalExpression: 5,
  conflictEngagement: 5,
  futureOrientation: 5,
  jealousyRegulation: 5,
  stabilityPreference: 5,
};

const FRIENDSHIP_DEFAULT_PROFILE_V2 = {
  connectionFrequency: 5,
  emotionalHolding: 5,
  boundaryClarity: 5,
  repairInitiative: 5,
  dependability: 5,
  differenceOpenness: 5,
  comparisonTolerance: 5,
  lowPressureCompanionship: 5,
};

const ROMANCE_TRAIT_META: TraitMetaItem[] = [
  { key: "socialStyle", label: "社交", color: "#0ea5e9" },
  { key: "emotionalReadiness", label: "情感", color: "#f43f5e" },
  { key: "dateStyle", label: "约会", color: "#d946ef" },
  { key: "commitment", label: "承诺", color: "#10b981" },
  { key: "communication", label: "沟通", color: "#06b6d4" },
  { key: "independence", label: "独立", color: "#f59e0b" },
  { key: "career", label: "事业", color: "#8b5cf6" },
  { key: "flexibility", label: "适应", color: "#84cc16" },
];

const FRIENDSHIP_TRAIT_META: TraitMetaItem[] = [
  { key: "socialEnergy", label: "电量", color: "#0ea5e9" },
  { key: "maintenance", label: "维护", color: "#f43f5e" },
  { key: "boundaries", label: "边界", color: "#10b981" },
  { key: "spontaneity", label: "随性", color: "#f59e0b" },
  { key: "empathy", label: "共情", color: "#d946ef" },
  { key: "reliability", label: "靠谱", color: "#06b6d4" },
  { key: "depth", label: "深聊", color: "#8b5cf6" },
  { key: "openness", label: "包容", color: "#84cc16" },
];

const ROMANCE_TRAIT_META_V2: TraitMetaItem[] = [
  { key: "approachPace", label: "接近", color: "#0ea5e9" },
  { key: "reassuranceNeed", label: "确认", color: "#f43f5e" },
  { key: "boundaryAutonomy", label: "边界", color: "#10b981" },
  { key: "emotionalExpression", label: "表达", color: "#d946ef" },
  { key: "conflictEngagement", label: "修复", color: "#06b6d4" },
  { key: "futureOrientation", label: "未来", color: "#8b5cf6" },
  { key: "jealousyRegulation", label: "调节", color: "#f59e0b" },
  { key: "stabilityPreference", label: "稳定", color: "#84cc16" },
];

const FRIENDSHIP_TRAIT_META_V2: TraitMetaItem[] = [
  { key: "connectionFrequency", label: "联结", color: "#0ea5e9" },
  { key: "emotionalHolding", label: "承接", color: "#f43f5e" },
  { key: "boundaryClarity", label: "边界", color: "#10b981" },
  { key: "repairInitiative", label: "修复", color: "#d946ef" },
  { key: "dependability", label: "靠谱", color: "#06b6d4" },
  { key: "differenceOpenness", label: "差异", color: "#8b5cf6" },
  { key: "comparisonTolerance", label: "比较", color: "#f59e0b" },
  { key: "lowPressureCompanionship", label: "低压", color: "#84cc16" },
];

function clampTrait(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.max(0, Math.min(10, num));
}

function parseRawProfile(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function detectProfileVersion(raw: Record<string, unknown> | null, quizMode: QuizMode): TraitVersion {
  if (!raw) return "legacy";

  const legacyKeys = quizMode === "friendship" ? Object.keys(FRIENDSHIP_DEFAULT_PROFILE) : Object.keys(ROMANCE_DEFAULT_PROFILE);
  const v2Keys = quizMode === "friendship" ? Object.keys(FRIENDSHIP_DEFAULT_PROFILE_V2) : Object.keys(ROMANCE_DEFAULT_PROFILE_V2);

  const legacyHits = legacyKeys.filter((key) => key in raw).length;
  const v2Hits = v2Keys.filter((key) => key in raw).length;

  return v2Hits > legacyHits ? "v2" : "legacy";
}

function parseProfile(raw: Record<string, unknown> | null, defaults: Record<string, number>) {
  return Object.keys(defaults).reduce((acc, key) => {
    acc[key] = clampTrait(raw?.[key]);
    return acc;
  }, {} as Record<string, number>);
}

function getSummary(value: number, label: string) {
  if (value >= 7) return `${label}维度表现很亮眼`;
  if (value >= 4) return `${label}维度整体较均衡`;
  return `${label}维度还有提升空间`;
}

async function fetchOgFont(url: URL) {
  const response = await fetch(url, { cache: "force-cache" });

  if (!response.ok) {
    throw new Error(`Failed to load OG font: ${url.pathname}`);
  }

  return response.arrayBuffer();
}

async function getOgFonts(requestUrl: string) {
  const origin = new URL(requestUrl).origin;

  if (!ogFontsPromise || ogFontsOrigin !== origin) {
    ogFontsOrigin = origin;
    ogFontsPromise = Promise.all([
      fetchOgFont(new URL("/og-fonts/NotoSansSC-Regular.otf", requestUrl)),
      fetchOgFont(new URL("/og-fonts/NotoSansSC-Bold.otf", requestUrl)),
    ])
      .then(([regular, bold]) => [
        {
          name: "Noto Sans SC" as const,
          data: regular,
          style: "normal" as const,
          weight: 400 as const,
        },
        {
          name: "Noto Sans SC" as const,
          data: bold,
          style: "normal" as const,
          weight: 700 as const,
        },
      ])
      .catch((error) => {
        ogFontsPromise = null;
        ogFontsOrigin = null;
        throw error;
      });
  }

  return ogFontsPromise;
}

async function renderDefaultImage(title: string, description: string, fonts: OgFontDefinition[]) {
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
          fontFamily: '"Noto Sans SC"',
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
      fonts,
    },
  );
}

function renderTraitCard(item: TraitMetaItem, profile: Record<string, number>) {
  const score = profile[item.key] ?? 5;
  const width = `${Math.round((score / 10) * 100)}%`;

  return (
    <div
      key={item.key}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "18px",
        borderRadius: "22px",
        background: "#fffafc",
        border: "1px solid rgba(244,114,182,0.10)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: 24, fontWeight: 700 }}>{item.label}</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{score.toFixed(1)}</span>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "10px",
          borderRadius: "999px",
          overflow: "hidden",
          background: "#f3f4f6",
          marginBottom: "10px",
        }}
      >
        <div style={{ width, height: "100%", borderRadius: "999px", background: item.color }} />
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.4, color: "#6b7280" }}>{getSummary(score, item.label)}</div>
    </div>
  );
}

async function renderResultsImage(
  title: string,
  description: string,
  profile: Record<string, number>,
  traitMeta: TraitMetaItem[],
  badgeText: string,
  footerText: string,
  highlightTitle: string,
  highlightBody: string,
  adviceTitle: string,
  adviceBody: string,
  fonts: OgFontDefinition[],
) {
  const rows = [traitMeta.slice(0, 2), traitMeta.slice(2, 4), traitMeta.slice(4, 6), traitMeta.slice(6, 8)];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1440px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "linear-gradient(135deg, #fff1f2 0%, #fdf2f8 46%, #eef6ff 100%)",
          padding: "36px",
          color: "#111827",
          fontFamily: '"Noto Sans SC"',
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
            padding: "34px",
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
              marginBottom: "18px",
            }}
          >
            <span>❤</span>
            <span>{badgeText}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.12, marginBottom: "10px" }}>{title}</div>
            <div style={{ maxWidth: "840px", fontSize: 22, textAlign: "center", lineHeight: 1.5, color: "#4b5563" }}>{description}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
            {rows.map((row, index) => (
              <div key={`row-${index}`} style={{ display: "flex", gap: "14px" }}>
                {row.map((item) => renderTraitCard(item, profile))}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "14px", marginTop: "auto" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px", borderRadius: "24px", background: "#fdf2f8" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#be185d", marginBottom: "10px" }}>{highlightTitle}</div>
              <div style={{ fontSize: 16, lineHeight: 1.55, color: "#831843" }}>{highlightBody}</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px", borderRadius: "24px", background: "#f5f3ff" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#7c3aed", marginBottom: "10px" }}>{adviceTitle}</div>
              <div style={{ fontSize: 16, lineHeight: 1.55, color: "#5b21b6" }}>{adviceBody}</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(244,114,182,0.14)",
              color: "#9d174d",
              fontSize: 16,
            }}
          >
            <span>DateMatch 2026</span>
            <span>{footerText}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "14px 20px",
            borderRadius: "26px",
            background: "rgba(255,255,255,0.82)",
            border: "1px solid rgba(244,114,182,0.14)",
            boxShadow: "0 18px 48px rgba(219,39,119,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#be185d", marginBottom: "4px" }}>{RESULT_QR_HINT}</div>
            <div style={{ fontSize: 14, lineHeight: 1.4, color: "#6b7280" }}>
              扫码可回到首页，查看完整档案与后续匹配入口
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: "4px" }}>{RESULT_QR_TARGET}</div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
              borderRadius: "20px",
              background: "#ffffff",
              boxShadow: "0 12px 32px rgba(219,39,119,0.08)",
            }}
          >
            <img
              src={RESULT_QR_IMAGE}
              alt="DateMatch QR code"
              width="96"
              height="96"
              style={{ display: "block", borderRadius: "8px", background: "#ffffff" }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1440,
      fonts,
    },
  );
}

function getResultAssets(quizMode: QuizMode, version: TraitVersion) {
  if (quizMode === "friendship") {
    if (version === "v2") {
      return {
        defaults: FRIENDSHIP_DEFAULT_PROFILE_V2,
        traitMeta: FRIENDSHIP_TRAIT_META_V2,
        badgeText: "DateMatch 友情风格档案",
        footerText: "校园专属友情风格档案",
        highlightTitle: "关系亮点",
        highlightBody: "你更在意怎样被陪伴、怎样维持边界，以及一段友情在你这里怎样才算真正还在。",
        adviceTitle: "相处建议",
        adviceBody: "寻找那种既能给到在场、也能给到空间的人，你会更容易进入稳定又舒服的朋友关系。",
      };
    }

    return {
      defaults: FRIENDSHIP_DEFAULT_PROFILE,
      traitMeta: FRIENDSHIP_TRAIT_META,
      badgeText: "DateMatch 搭子人格档案",
      footerText: "校园专属友情人格档案",
      highlightTitle: "友情亮点",
      highlightBody: "你的社交节奏、边界感和陪伴方式会决定谁更容易和你成为长期同频的朋友。",
      adviceTitle: "相处建议",
      adviceBody: "优先寻找能尊重你节奏、也愿意认真回应的人，友情会更轻松也更长久。",
    };
  }

  if (version === "v2") {
    return {
      defaults: ROMANCE_DEFAULT_PROFILE_V2,
      traitMeta: ROMANCE_TRAIT_META_V2,
      badgeText: "DateMatch 关系风格档案",
      footerText: "校园专属关系风格档案",
      highlightTitle: "关系亮点",
      highlightBody: "你在关系里更在意节奏、安全感、亲近方式和长期方向，而不只是当下有没有火花。",
      adviceTitle: "关系建议",
      adviceBody: "保留自己的节奏，也更早表达真实需要，适合你的人会更容易走进你的关系里。",
    };
  }

  return {
    defaults: ROMANCE_DEFAULT_PROFILE,
    traitMeta: ROMANCE_TRAIT_META,
    badgeText: "DateMatch 恋爱人格档案",
    footerText: "校园专属恋爱人格档案",
    highlightTitle: "关系亮点",
    highlightBody: "真诚表达、关系稳定感和互动节奏感是你的优势，适合建立清晰又自然的亲密连接。",
    adviceTitle: "关系建议",
    adviceBody: "保留自己的边界，同时把真实需求更早说出来，会让合适的人更快靠近你。",
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "default";
    const quizMode: QuizMode = searchParams.get("quizMode") === "friendship" ? "friendship" : "romance";
    const title = searchParams.get("title") || "DateMatch";
    const description = searchParams.get("description") || "校园人格匹配与同频推荐";
    const fonts = await getOgFonts(req.url);

    if (mode === "results") {
      const rawProfile = parseRawProfile(searchParams.get("profile"));
      const version = detectProfileVersion(rawProfile, quizMode);
      const assets = getResultAssets(quizMode, version);
      const profile = parseProfile(rawProfile, assets.defaults);

      return await renderResultsImage(
        title,
        description,
        profile,
        assets.traitMeta,
        assets.badgeText,
        assets.footerText,
        assets.highlightTitle,
        assets.highlightBody,
        assets.adviceTitle,
        assets.adviceBody,
        fonts,
      );
    }

    return await renderDefaultImage(title, description, fonts);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    return new Response("Failed to generate image", {
      status: 500,
    });
  }
}
