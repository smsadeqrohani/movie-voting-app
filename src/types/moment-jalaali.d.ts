declare module 'moment-jalaali' {
  import { Moment } from 'moment';
  
  interface MomentJalaali extends Moment {
    jYear(): number;
    jMonth(): number;
    jDate(): number;
    jDayOfYear(): number;
    jWeek(): number;
    jWeekYear(): number;
    jYear(y: number): MomentJalaali;
    jMonth(m: number): MomentJalaali;
    jDate(d: number): MomentJalaali;
    jDayOfYear(d: number): MomentJalaali;
    jWeek(w: number): MomentJalaali;
    jWeekYear(y: number): MomentJalaali;
    startOf(jUnit: string): MomentJalaali;
    endOf(jUnit: string): MomentJalaali;
    jIsLeapYear(): boolean;
    jDaysInMonth(): number;
    jWeekday(): number;
    jWeekday(d: number): MomentJalaali;
    jIsSame(m: MomentJalaali | Moment, jUnit?: string): boolean;
    jIsBefore(m: MomentJalaali | Moment, jUnit?: string): boolean;
    jIsAfter(m: MomentJalaali | Moment, jUnit?: string): boolean;
    jIsSameOrBefore(m: MomentJalaali | Moment, jUnit?: string): boolean;
    jIsSameOrAfter(m: MomentJalaali | Moment, jUnit?: string): boolean;
    jIsBetween(m1: MomentJalaali | Moment, m2: MomentJalaali | Moment, jUnit?: string, inclusivity?: string): boolean;
    jAdd(amount: number, jUnit: string): MomentJalaali;
    jSubtract(amount: number, jUnit: string): MomentJalaali;
    jDiff(m: MomentJalaali | Moment, jUnit?: string, precise?: boolean): number;
    jFromNow(withoutSuffix?: boolean): string;
    jToNow(withoutSuffix?: boolean): string;
    jFrom(m: MomentJalaali | Moment, withoutSuffix?: boolean): string;
    jTo(m: MomentJalaali | Moment, withoutSuffix?: boolean): string;
    jCalendar(): string;
    jCalendar(reference?: MomentJalaali | Moment): string;
    jFormat(format?: string): string;
    jUtcOffset(): number;
    jUtcOffset(offset: number | string, keepLocalTime?: boolean): MomentJalaali;
    jUtcOffset(offset: number | string, keepLocalTime?: boolean, keepMinutes?: boolean): MomentJalaali;
    jUtc(): MomentJalaali;
    jLocal(): MomentJalaali;
    jParseZone(): MomentJalaali;
    jHasAlignedHourOffset(other?: MomentJalaali | Moment): boolean;
    jIsDST(): boolean;
    jIsLocal(): boolean;
    jIsUtcOffset(): boolean;
    jIsUtc(): boolean;
    jIsValid(): boolean;
    jInvalidAt(): number;
    jCreationData(): any;
    jDefaultFormat: string;
    jDefaultFormatUtc: string;
    jSuppressDeprecationWarnings: boolean;
    jDeprecationHandler: ((name: string) => void) | null;
    jNormalizeUnits(unit: string): string;
    jInvalid(): MomentJalaali;
    jUnix(timestamp: number): MomentJalaali;
  }
  
  function momentJalaali(): MomentJalaali;
  function momentJalaali(inp?: any, format?: string | string[], language?: string, strict?: boolean): MomentJalaali;
  function momentJalaali(inp?: any, format?: string | string[], strict?: boolean): MomentJalaali;
  function momentJalaali(inp?: any, format?: string | string[], language?: string): MomentJalaali;
  function momentJalaali(inp?: any, format?: string | string[]): MomentJalaali;
  function momentJalaali(inp?: any, language?: string, strict?: boolean): MomentJalaali;
  function momentJalaali(inp?: any, language?: string): MomentJalaali;
  function momentJalaali(inp?: any, strict?: boolean): MomentJalaali;
  function momentJalaali(inp?: any): MomentJalaali;
  
  namespace momentJalaali {
    function utc(): MomentJalaali;
    function utc(inp?: any, format?: string | string[], language?: string, strict?: boolean): MomentJalaali;
    function utc(inp?: any, format?: string | string[], strict?: boolean): MomentJalaali;
    function utc(inp?: any, format?: string | string[], language?: string): MomentJalaali;
    function utc(inp?: any, format?: string | string[]): MomentJalaali;
    function utc(inp?: any, language?: string, strict?: boolean): MomentJalaali;
    function utc(inp?: any, language?: string): MomentJalaali;
    function utc(inp?: any, strict?: boolean): MomentJalaali;
    function utc(inp?: any): MomentJalaali;
    
    function parseZone(inp?: any, format?: string | string[], language?: string, strict?: boolean): MomentJalaali;
    function parseZone(inp?: any, format?: string | string[], strict?: boolean): MomentJalaali;
    function parseZone(inp?: any, format?: string | string[], language?: string): MomentJalaali;
    function parseZone(inp?: any, format?: string | string[]): MomentJalaali;
    function parseZone(inp?: any, language?: string, strict?: boolean): MomentJalaali;
    function parseZone(inp?: any, language?: string): MomentJalaali;
    function parseZone(inp?: any, strict?: boolean): MomentJalaali;
    function parseZone(inp?: any): MomentJalaali;
    
    function isDate(m: any): m is Date;
    function isMoment(m: any): m is MomentJalaali;
    function isDuration(d: any): boolean;
    function locale(language?: string): string;
    function locale(language?: string[]): string;
    function locale(language?: string, definition?: any): string;
    function locales(): string[];
    function months(): string[];
    function monthsShort(): string[];
    function weekdays(): string[];
    function weekdaysShort(): string[];
    function weekdaysMin(): string[];
    function min(...moments: (MomentJalaali | Moment)[]): MomentJalaali;
    function max(...moments: (MomentJalaali | Moment)[]): MomentJalaali;
    function normalizeUnits(unit: string): string;
    function invalid(flags?: any): MomentJalaali;
    function duration(inp?: any, unit?: string): any;
    function relativeTimeThreshold(threshold: string, limit: number): number | boolean;
    function relativeTimeRounding(fn: (num: number) => number): boolean;
    function relativeTimeRounding(): (num: number) => number;
    function calendarFormat(m: MomentJalaali | Moment, now: MomentJalaali | Moment): string;
    function parseTwoDigitYear(input: string): number;
    
    const prototype: MomentJalaali;
    const defaultFormat: string;
    const defaultFormatUtc: string;
    const suppressDeprecationWarnings: boolean;
    const deprecationHandler: ((name: string) => void) | null;
  }
  
  export = momentJalaali;
}
