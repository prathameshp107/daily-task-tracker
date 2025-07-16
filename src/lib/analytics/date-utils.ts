/**
 * Utility functions for date calculations in analytics
 */

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getWorkingDaysInMonth(month: number, year: number): number {
  let count = 0;
  const daysInMonth = getDaysInMonth(month, year);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    // 0 is Sunday, 6 is Saturday
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      count++;
    }
  }
  
  return count;
}

export function getCurrentMonthAndYear() {
  const now = new Date();
  return {
    month: now.getMonth(),
    monthName: now.toLocaleString('default', { month: 'long' }),
    year: now.getFullYear()
  };
}

export function getMonthName(monthIndex: number): string {
  return new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });
}

/**
 * Get an array of the last N months with their names and year
 */
export function getLastNMonths(count: number): Array<{month: number, monthName: string, year: number}> {
  const result = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      month: date.getMonth(),
      monthName: getMonthName(date.getMonth()),
      year: date.getFullYear()
    });
  }
  
  return result.reverse(); // Return in chronological order
}
