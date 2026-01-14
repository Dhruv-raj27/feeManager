/**
 * Format date to IST timezone in 24-hour format
 * @param date - Date string or Date object
 * @returns Formatted date string in IST (DD/MM/YYYY, HH:mm:ss)
 */
export function formatToIST(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}
