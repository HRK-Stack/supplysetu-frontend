// src/lib/format.ts


const EMPTY = "—";

export function formatPaise(paise: number | null | undefined): string {
  if (paise == null) return EMPTY;

  // Handle negative values (e.g. territory_adjustment, discounts)
  const negative = paise < 0;
  const absPaise = negative ? -paise : paise;

  // Integer arithmetic — never divide floats
  const rupees = Math.trunc(absPaise / 100);  // integer part (Math.trunc, not /100.0)
  const remainder = absPaise % 100;            // fractional paise (0–99)

  const rupeesStr = new Intl.NumberFormat("en-IN").format(rupees);
  const fraction = String(remainder).padStart(2, "0");

  return negative
    ? `-₹${rupeesStr}.${fraction}`
    : `₹${rupeesStr}.${fraction}`;
}

/**
 * Formats a basis-point discount value as a signed percentage string.
 *
 * Basis points: 500 = 5.00%, -200 = -2.00%
 *
 * Uses integer arithmetic: pct / 100 computed as integer parts.
 *
 * Returns EMPTY for null / undefined.
 *
 * Examples:
 *   formatBasisPoints(500)   → "5.00%"
 *   formatBasisPoints(-200)  → "-2.00%"
 *   formatBasisPoints(0)     → "0.00%"
 */
export function formatBasisPoints(bps: number | null | undefined): string {
  if (bps == null) return EMPTY;

  const negative = bps < 0;
  const absBps = negative ? -bps : bps;

  // Integer arithmetic: basis points → percentage
  // 1 bps = 0.01%, so 500 bps = 5.00%
  // absBps / 100 = percentage; split into integer + fractional parts
  const pctWhole = Math.trunc(absBps / 100);
  const pctFrac = absBps % 100; // fractional percentage in hundredths

  const sign = negative ? "-" : "";
  return `${sign}${pctWhole}.${String(pctFrac).padStart(2, "0")}%`;
}

// ─── GST ─────────────────────────────────────────────────────────────────────

/**
 * Formats a GST rate integer as a percentage string.
 *
 * @param rate  Integer percentage: 0, 5, 12, 18, or 28
 *
 * Examples:
 *   formatGstRate(18)  → "18%"
 *   formatGstRate(5)   → "5%"
 *   formatGstRate(0)   → "0%"
 *   formatGstRate(null) → "—"
 */
export function formatGstRate(rate: number | null | undefined): string {
  if (rate == null) return EMPTY;
  return `${rate}%`;
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/**
 * Parses a date value into a Date object.
 * Returns null if the input is null / undefined / invalid.
 */
function toDate(date: string | Date | null | undefined): Date | null {
  if (date == null) return null;

  const d = date instanceof Date ? date : new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats an ISO date string or Date object to a locale-aware string.
 * Uses "en-IN" locale with full date options.
 *
 * Returns EMPTY for null / undefined / invalid dates.
 *
 * Examples:
 *   formatDate("2024-01-15T10:30:00Z")  → "15 January 2024 at 10:30 am"  (locale-dependent)
 *   formatDate(new Date(...))            → locale string
 *   formatDate(null)                     → "—"
 */
export function formatDate(date: string | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return EMPTY;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Formats an ISO date string or Date object to "DD MMM YYYY" format.
 *
 * Returns EMPTY for null / undefined / invalid dates.
 *
 * Examples:
 *   formatDateShort("2024-01-15T10:30:00Z")  → "15 Jan 2024"
 *   formatDateShort("2024-12-31")             → "31 Dec 2024"
 *   formatDateShort(null)                      → "—"
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return EMPTY;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Formats an ISO date string or Date object to "YYYY-MM-DD" format.
 * Useful for date inputs and API query params.
 *
 * Returns EMPTY for null / undefined / invalid dates.
 *
 * Examples:
 *   formatDateIso("2024-01-15T10:30:00Z")  → "2024-01-15"
 */
export function formatDateIso(date: string | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return EMPTY;

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns a human-readable countdown string for a future expiry date.
 *
 * Used to show validity countdowns on quotes, schemes, etc.
 *
 * Returns "Expired" if the date is in the past.
 * Returns EMPTY for null / undefined / invalid dates.
 *
 * Examples:
 *   formatExpiresIn("2024-02-01T00:00:00Z")  → "in 3 days"  (relative to now)
 *   formatExpiresIn(<past date>)              → "Expired"
 */
export function formatExpiresIn(date: string | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return EMPTY;

  const nowMs = Date.now();
  const diffMs = d.getTime() - nowMs;

  if (diffMs <= 0) return "Expired";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 1) return `in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  if (diffHours >= 1) return `in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  if (diffMinutes >= 1) return `in ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"}`;
  return "expiring soon";
}

// ─── Phone ────────────────────────────────────────────────────────────────────

/**
 * Formats a 10-digit Indian mobile number as "+91 XXXXX XXXXX".
 *
 * Strips any existing country code prefix (+91 or 91) and non-digit characters
 * before formatting.
 *
 * Returns EMPTY for null / undefined.
 * Returns the raw string unchanged if it doesn't match the expected 10-digit pattern
 * (rather than throwing) — handles legacy/invalid data gracefully.
 *
 * Examples:
 *   formatPhone("9876543210")     → "+91 98765 43210"
 *   formatPhone("+919876543210")  → "+91 98765 43210"
 *   formatPhone("919876543210")   → "+91 98765 43210"
 *   formatPhone(null)             → "—"
 *   formatPhone("invalid")        → "invalid"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (phone == null) return EMPTY;

  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // Strip country code prefix if present (91 prefix on a 12-digit string)
  if (digits.length >= 12 && digits.startsWith("91")) {
    digits = digits.slice(-10);
  }

  if (digits.length !== 10) {
    // Cannot normalise — return as-is (handles extensions, landlines, etc.)
    return phone;
  }

  // Format as "+91 XXXXX XXXXX"
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

// ─── GSTIN ────────────────────────────────────────────────────────────────────

/**
 * Formats a GSTIN for display, uppercasing it and adding a space
 * after the state code for readability: "29ABCDE1234F1Z5" → "29 ABCDE1234F1Z5"
 *
 * Returns EMPTY for null / undefined / empty string.
 *
 * Examples:
 *   formatGstin("29abcde1234f1z5")  → "29 ABCDE1234F1Z5"
 *   formatGstin(null)               → "—"
 */
export function formatGstin(gstin: string | null | undefined): string {
  if (!gstin) return EMPTY;
  const upper = gstin.toUpperCase().trim();
  if (upper.length !== 15) return upper; // non-standard — display raw
  return `${upper.slice(0, 2)} ${upper.slice(2)}`;
}

// ─── HSN Code ─────────────────────────────────────────────────────────────────

/**
 * Formats an HSN code for display.
 * Adds spacing for 8-digit codes: "73063010" → "7306 3010"
 * 4 and 6 digit codes are returned as-is.
 *
 * Returns EMPTY for null / undefined / empty string.
 */
export function formatHsnCode(hsn: string | null | undefined): string {
  if (!hsn || !hsn.trim()) return EMPTY;
  const trimmed = hsn.trim();
  if (trimmed.length === 8) {
    return `${trimmed.slice(0, 4)} ${trimmed.slice(4)}`;
  }
  return trimmed;
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

/**
 * Formats a plain integer with Indian number grouping (lakhs/crores).
 *
 * Returns EMPTY for null / undefined.
 *
 * Examples:
 *   formatNumber(150000)  → "1,50,000"
 *   formatNumber(50)      → "50"
 */
export function formatNumber(n: number | null | undefined): string {
  if (n == null) return EMPTY;
  return new Intl.NumberFormat("en-IN").format(n);
}

/**
 * Formats a quantity with its unit string.
 *
 * Examples:
 *   formatQuantity(50, "PCS")  → "50 PCS"
 *   formatQuantity(1, "KG")   → "1 KG"
 */
export function formatQuantity(
  quantity: number | null | undefined,
  unit: string | null | undefined,
): string {
  if (quantity == null) return EMPTY;
  if (!unit) return formatNumber(quantity);
  return `${formatNumber(quantity)} ${unit}`;
}
