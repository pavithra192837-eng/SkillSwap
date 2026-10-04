// All scheduled session times are stored as UTC in MySQL DATETIME fields.
// The browser sends an ISO-8601 timestamp with its local timezone offset.

const ISO_WITH_TIMEZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

function parseSessionDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value || '').trim();
  if (!raw || !ISO_WITH_TIMEZONE.test(raw)) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toMysqlUtc(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join('-') + ' ' + [
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
  ].join(':');
}

function validateFutureSessionTime(value, minimumLeadMs = 30 * 1000) {
  const date = parseSessionDate(value);
  if (!date) {
    return { date: null, message: 'Invalid session date/time. Send an ISO date with a timezone.' };
  }
  if (date.getTime() < Date.now() + minimumLeadMs) {
    return { date: null, message: 'Choose a future date and time for the session.' };
  }
  return { date, message: null };
}

module.exports = {
  parseSessionDate,
  toMysqlUtc,
  validateFutureSessionTime,
};
