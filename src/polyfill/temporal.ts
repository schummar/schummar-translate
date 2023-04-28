export type TemporalLike = Instant | ZonedDateTimeLike;

export type Instant = {
  readonly epochMilliseconds: number;
};

export type ZonedDateTimeLike = {
  era?: string | undefined;
  eraYear?: number | undefined;
  year?: number;
  month?: number;
  monthCode?: string;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  microsecond?: number;
  nanosecond?: number;
  offset?: string;
  timeZone?: TimeZoneLike;
  //   calendar?: CalendarLike;
};

export type TimeZoneProtocol = { timeZone?: never };
export type TimeZoneLike = TimeZoneProtocol | string | { timeZone: TimeZoneProtocol | string };

export type CalendarProtocol = { calendar?: never };
export type CalendarLike = CalendarProtocol | string | { calendar: CalendarProtocol | string };

export type DurationLike = {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
  microseconds?: number;
  nanoseconds?: number;
};
