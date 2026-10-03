export interface BusinessHoursRecord {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isOpen: boolean;
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  openTime2?: string | null;
  closeTime2?: string | null;
}

/**
 * Calculates current time in Asia/Kolkata (IST: UTC + 5:30)
 */
export function getIndiaCurrentTime(): { dayOfWeek: number; currentTimeMinutes: number; timeString: string } {
  const now = new Date();
  // Format into Asia/Kolkata timezone
  const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const istDate = new Date(istString);

  const dayOfWeek = istDate.getDay(); // 0-6
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const currentTimeMinutes = hours * 60 + minutes;
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return { dayOfWeek, currentTimeMinutes, timeString };
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function isStoreCurrentlyOpen(
  isStoreOpenManual: boolean,
  hoursList?: BusinessHoursRecord[]
): { isOpen: boolean; reason: string } {
  // Manual override takes precedence if false
  if (!isStoreOpenManual) {
    return { isOpen: false, reason: 'Temporarily closed by store owner.' };
  }

  if (!hoursList || hoursList.length === 0) {
    // If no schedule configured, fallback to manual status
    return { isOpen: true, reason: 'Open according to standard schedule.' };
  }

  const { dayOfWeek, currentTimeMinutes } = getIndiaCurrentTime();
  const todaySchedule = hoursList.find((h) => h.dayOfWeek === dayOfWeek);

  if (!todaySchedule || !todaySchedule.isOpen) {
    return { isOpen: false, reason: 'Closed today.' };
  }

  // Check shift 1
  const start1 = parseTimeToMinutes(todaySchedule.openTime);
  const end1 = parseTimeToMinutes(todaySchedule.closeTime);

  const inShift1 = currentTimeMinutes >= start1 && currentTimeMinutes <= end1;

  // Check split shift 2 if configured
  let inShift2 = false;
  if (todaySchedule.openTime2 && todaySchedule.closeTime2) {
    const start2 = parseTimeToMinutes(todaySchedule.openTime2);
    const end2 = parseTimeToMinutes(todaySchedule.closeTime2);
    inShift2 = currentTimeMinutes >= start2 && currentTimeMinutes <= end2;
  }

  if (inShift1 || inShift2) {
    return { isOpen: true, reason: 'Currently open.' };
  }

  return { isOpen: false, reason: `Closed right now. Open hours: ${todaySchedule.openTime} - ${todaySchedule.closeTime}` };
}
