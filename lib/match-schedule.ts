const DAY_MS = 24 * 60 * 60 * 1000;
const SCHEDULE_OFFSET_MS = 8 * 60 * 60 * 1000;

export const MATCH_DAY = 5;
export const MATCH_HOUR = 18;
export const MATCH_MINUTE = 0;
export const DISPLAY_DAYS = 5;

export type MatchSchedulePhase = "before_release" | "display_window" | "between_windows";

export type MatchScheduleState = {
  now: number;
  releaseAt: number;
  displayEndAt: number;
  nextReleaseAt: number;
  countdownTargetAt: number;
  isInDisplayWindow: boolean;
  phase: MatchSchedulePhase;
};

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function getEligibleReleaseAt(now: Date = new Date()): number {
  const schedule = getMatchSchedule(now);
  return schedule.isInDisplayWindow ? schedule.nextReleaseAt : schedule.releaseAt;
}

export function isOptedOutForRound(optOutUntil: number | string | Date | null | undefined, now: Date = new Date()): boolean {
  if (optOutUntil === null || optOutUntil === undefined) {
    return false;
  }

  const timestamp =
    optOutUntil instanceof Date
      ? optOutUntil.getTime()
      : typeof optOutUntil === "number"
        ? optOutUntil
        : new Date(optOutUntil).getTime();

  return Number.isFinite(timestamp) && timestamp > now.getTime();
}

function toScheduleClock(date: Date): Date {
  return new Date(date.getTime() + SCHEDULE_OFFSET_MS);
}

function fromScheduleClock(date: Date): Date {
  return new Date(date.getTime() - SCHEDULE_OFFSET_MS);
}

function getReleaseForWeek(now: Date, weekOffset: number): number {
  const scheduleNow = toScheduleClock(now);
  const release = new Date(
    Date.UTC(
      scheduleNow.getUTCFullYear(),
      scheduleNow.getUTCMonth(),
      scheduleNow.getUTCDate(),
      MATCH_HOUR,
      MATCH_MINUTE,
      0,
      0
    )
  );

  const daysSinceMatchDay = (scheduleNow.getUTCDay() - MATCH_DAY + 7) % 7;
  release.setUTCDate(release.getUTCDate() - daysSinceMatchDay + weekOffset * 7);

  return fromScheduleClock(release).getTime();
}

export function getMatchSchedule(now: Date = new Date()): MatchScheduleState {
  const nowTime = now.getTime();
  const thisWeekRelease = getReleaseForWeek(now, 0);
  const previousRelease = thisWeekRelease - 7 * DAY_MS;
  const nextRelease = thisWeekRelease + 7 * DAY_MS;
  const previousDisplayEnd = previousRelease + DISPLAY_DAYS * DAY_MS;
  const thisDisplayEnd = thisWeekRelease + DISPLAY_DAYS * DAY_MS;

  if (nowTime < thisWeekRelease) {
    if (nowTime < previousDisplayEnd) {
      return {
        now: nowTime,
        releaseAt: previousRelease,
        displayEndAt: previousDisplayEnd,
        nextReleaseAt: thisWeekRelease,
        countdownTargetAt: previousDisplayEnd,
        isInDisplayWindow: true,
        phase: "display_window",
      };
    }

    return {
      now: nowTime,
      releaseAt: thisWeekRelease,
      displayEndAt: thisWeekRelease + DISPLAY_DAYS * DAY_MS,
      nextReleaseAt: thisWeekRelease,
      countdownTargetAt: thisWeekRelease,
      isInDisplayWindow: false,
      phase: "before_release",
    };
  }

  if (nowTime < thisDisplayEnd) {
    return {
      now: nowTime,
      releaseAt: thisWeekRelease,
      displayEndAt: thisDisplayEnd,
      nextReleaseAt: nextRelease,
      countdownTargetAt: thisDisplayEnd,
      isInDisplayWindow: true,
      phase: "display_window",
    };
  }

  return {
    now: nowTime,
    releaseAt: nextRelease,
    displayEndAt: nextRelease + DISPLAY_DAYS * DAY_MS,
    nextReleaseAt: nextRelease,
    countdownTargetAt: nextRelease,
    isInDisplayWindow: false,
    phase: "between_windows",
  };
}

export function getCountdownParts(targetAt: number, now: Date = new Date()): CountdownParts {
  const diffMs = Math.max(0, targetAt - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    days: Math.floor(totalSeconds / (24 * 60 * 60)),
    hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
    minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
    seconds: totalSeconds % 60,
  };
}
