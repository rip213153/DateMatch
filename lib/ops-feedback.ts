export type FeedbackLogStatus = "received" | "sent" | "failed";

export type OpsFeedbackItem = {
  id: string;
  submittedAt: string;
  source: string;
  nickname: string;
  content: string;
  status: FeedbackLogStatus;
  emailId: string | null;
  error: string | null;
};

export type OpsFeedbackSourceStat = {
  source: string;
  count: number;
};

export type OpsFeedbackFilter = {
  status?: string;
  source?: string;
  query?: string;
};

export function normalizeOpsFeedbackFilter(filter: OpsFeedbackFilter): Required<OpsFeedbackFilter> {
  const status = (filter.status ?? "").trim().toLowerCase();
  const source = (filter.source ?? "").trim().toLowerCase();
  const query = (filter.query ?? "").trim().toLowerCase();

  return {
    status: status === "all" ? "" : status,
    source,
    query,
  };
}

export function filterOpsFeedbackItems(items: OpsFeedbackItem[], filter: OpsFeedbackFilter) {
  const normalized = normalizeOpsFeedbackFilter(filter);

  return items.filter((item) => {
    const matchesStatus = !normalized.status || item.status === normalized.status;
    const matchesSource = !normalized.source || item.source.toLowerCase().includes(normalized.source);
    const matchesQuery =
      !normalized.query ||
      item.nickname.toLowerCase().includes(normalized.query) ||
      item.content.toLowerCase().includes(normalized.query) ||
      item.source.toLowerCase().includes(normalized.query);

    return matchesStatus && matchesSource && matchesQuery;
  });
}
