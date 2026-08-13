/**
 * Shared time-math for chamber scheduling: converting "HH:mm" chamber hours
 * into a patient capacity and, given a serial number, an estimated arrival
 * time. Used by both ChambersService (to preview capacity) and
 * AppointmentsService (to assign serial numbers at booking time) so the two
 * modules can't drift out of sync on how this is computed.
 */

export function timeToMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** How many patients fit between start_time and end_time at avg_minutes_per_patient each. */
export function computeCapacity(
  startTime: string,
  endTime: string,
  avgMinutesPerPatient: number,
): number {
  const windowMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
  return Math.max(0, Math.floor(windowMinutes / avgMinutesPerPatient));
}

/** Estimated arrival time ("HH:mm") for the given 1-indexed serial number. */
export function estimatedTimeForSerial(
  startTime: string,
  avgMinutesPerPatient: number,
  serialNumber: number,
): string {
  return minutesToTime(
    timeToMinutes(startTime) + (serialNumber - 1) * avgMinutesPerPatient,
  );
}
