export type NowFn = () => Date;

let clock: NowFn = () => new Date();

export function setClock(fn: NowFn): void {
  clock = fn;
}

export function now(): Date {
  return clock();
}

export function resetClock(): void {
  clock = () => new Date();
}

export function formatTimeHHMM(d: Date): string {
  return d.toISOString().slice(11, 16);
}

export function isWithinQuietHours(
  quietStart: string,
  quietEnd: string,
  currentTime: string,
): boolean {
  if (quietStart <= quietEnd) {
    return currentTime >= quietStart && currentTime < quietEnd;
  }
  return currentTime >= quietStart || currentTime < quietEnd;
}
