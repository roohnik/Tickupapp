// This file contains utility functions for date manipulation and formatting.

/**
 * Converts an ISO date string to a Persian (Jalali) date string.
 * @param isoDate The date string in ISO format.
 * @returns A formatted Persian date string (e.g., "۱ فروردین ۱۴۰۳").
 */
export const toPersianDate = (isoDate: string | undefined): string => {
    if (!isoDate) return '';
    try {
        const date = new Date(isoDate);
        // Using standard toLocaleDateString. The browser will handle the timezone conversion
        // correctly, especially if the ISO string is stored as UTC midnight (e.g., '2023-10-26T00:00:00.000Z').
        return date.toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC' // Interpret the date in UTC to avoid day-off errors
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return '';
    }
}

/**
 * Converts an ISO date string or Date object to DD/MM/YYYY format.
 * @param dateInput The date string in ISO format or a Date object.
 * @returns A formatted date string (e.g., "12/07/2025").
 */
export const toDDMMYYYY = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return '';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        // Using UTC methods to avoid timezone shifts affecting the date parts.
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        console.error("Error formatting date to DD/MM/YYYY:", e);
        return '';
    }
}


/**
 * Generates an array of Date objects for a given month and year for a Saturday-first calendar.
 * Includes null placeholders for days outside the month to align weeks correctly.
 * @param year The full year (e.g., 2024).
 * @param month The month index (0-11).
 * @returns An array of Date objects or nulls representing the calendar grid.
 */
export const getMonthDays = (year: number, month: number): (Date | null)[] => {
    const date = new Date(year, month, 1);
    const days: (Date | null)[] = [];
    
    // In Persian calendar, Saturday is the first day of the week.
    // JS `getDay()`: Sunday=0, Monday=1, ..., Saturday=6.
    // We want padding: 0 for Sat, 1 for Sun, 2 for Mon, etc.
    const firstDayOfWeek = date.getDay();
    const paddingDays = (firstDayOfWeek + 1) % 7;


    // Add empty cells for days before the first day of the month
    for (let i = 0; i < paddingDays; i++) {
        days.push(null);
    }
    
    // Add all days of the month
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

/**
 * Gets an array of 7 Date objects for the week containing the given date.
 * The week starts on Saturday.
 * @param date A date within the desired week.
 * @returns An array of 7 Date objects, from Saturday to Friday.
 */
export const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    // getDay(): Sun=0, ... Sat=6. We want Sat to be the start.
    const dayOfWeek = startOfWeek.getDay(); 
    const diff = (dayOfWeek + 1) % 7; // For Sat(6): (6+1)%7=0. For Sun(0): (0+1)%7=1.
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        week.push(day);
    }
    return week;
};

/**
 * Gets the start of the week (Saturday) for a given date.
 * @param date The date to find the start of the week for.
 * @returns A Date object set to the beginning of that Saturday.
 */
export const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay(); // Sunday - 0, ... Saturday - 6
    const diff = (day + 1) % 7; // Saturday: (6+1)%7=0, Sunday: (0+1)%7=1
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Gets the start of the quarter for a given date.
 * @param date The date to find the start of the quarter for.
 * @returns A Date object set to the beginning of the first day of the quarter.
 */
export const getStartOfQuarter = (date: Date): Date => {
    const d = new Date(date);
    const quarter = Math.floor(d.getMonth() / 3);
    const firstMonthOfQuarter = quarter * 3;
    d.setMonth(firstMonthOfQuarter, 1);
    d.setHours(0, 0, 0, 0);
    return d;
};
