import * as Sentry from "@sentry/react";

export const FEEDBACK_SIGNAL_CODE = "USER_FEEDBACK_SIGNAL";

export type FeedbackCategoryId = "bug" | "content" | "idea" | "ui" | "other";

export interface FeedbackCategory {
  id: FeedbackCategoryId;
  labelRu: string;
  emoji: string;
}

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  { id: "bug", labelRu: "Баг / ошибка", emoji: "🐞" },
  { id: "content", labelRu: "Неверный контент (перевод, опечатки)", emoji: "📚" },
  { id: "idea", labelRu: "Идея / улучшение", emoji: "💡" },
  { id: "ui", labelRu: "Интерфейс / вёрстка", emoji: "🎨" },
  { id: "other", labelRu: "Другое", emoji: "✍️" },
];

export function getFeedbackCategory(id: FeedbackCategoryId): FeedbackCategory {
  return FEEDBACK_CATEGORIES.find((c) => c.id === id) ?? FEEDBACK_CATEGORIES[FEEDBACK_CATEGORIES.length - 1];
}

interface FeedbackSignalDetails {
  category: FeedbackCategoryId;
  sectionKey: string;
  route: string;
}

export class UserFeedbackSignal extends Error {
  readonly code = FEEDBACK_SIGNAL_CODE;
  readonly category: FeedbackCategoryId;
  readonly section: string;
  readonly route: string;

  constructor(message: string, details: FeedbackSignalDetails) {
    super(message);
    this.name = "UserFeedbackSignal";
    this.category = details.category;
    this.section = details.sectionKey;
    this.route = details.route;
  }
}

export interface SendFeedbackParams {
  category: FeedbackCategoryId;
  message: string;
  sectionKey: string;
  sectionLabel: string;
  route: string;
  item?: string;
  contactEmail?: string;
  userId?: string;
  userEmail?: string;
}

export async function sendFeedback(params: SendFeedbackParams): Promise<string | null> {
  const {
    category,
    message,
    sectionKey,
    sectionLabel,
    route,
    item,
    contactEmail,
    userId,
    userEmail,
  } = params;

  const cat = getFeedbackCategory(category);
  const trimmed = message.trim();

  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn("[feedback] Sentry DSN не задан — отзыв не отправлен:", { category, route, message: trimmed });
    return null;
  }

  const eventId = Sentry.withScope((scope) => {
    scope.setLevel("error");
    scope.setTag("feedback", "true");
    scope.setTag("feedback_category", category);
    scope.setTag("feedback_section", sectionKey);
    scope.setTag("feedback_route", route);
    scope.setFingerprint(["user-feedback", category, sectionKey]);
    scope.setContext("feedback", {
      message: trimmed,
      category,
      categoryLabel: cat.labelRu,
      section: sectionLabel,
      sectionKey,
      route,
      item: item ?? null,
      contactEmail: contactEmail || null,
      userId: userId ?? null,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });

    const id = userId || userEmail || contactEmail;
    if (id) {
      scope.setUser({ id: userId, email: userEmail || contactEmail });
    }

    const title = `[ОТЗЫВ/${cat.labelRu}] ${trimmed.slice(0, 140)}`;
    return Sentry.captureException(new UserFeedbackSignal(title, { category, sectionKey, route }));
  });

  try {
    await Sentry.flush(2000);
  } catch {
    // ignore
  }

  return eventId ?? null;
}

export function openFeedbackPanel(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("feedback:open"));
}
