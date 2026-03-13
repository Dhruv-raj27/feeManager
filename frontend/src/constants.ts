/**
 * Shared constants for the Fee Management System.
 * These ensure frontend and backend use the same allowed values.
 */

export const CLASS_STANDARDS = [
  "Prep",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
] as const;

export type ClassStandard = (typeof CLASS_STANDARDS)[number];

export const GENDERS = ["Male", "Female"] as const;
export type Gender = (typeof GENDERS)[number];

export const PAYMENT_MODES = [
  "Cash",
  "UPI",
  "RTGS",
  "NEFT",
  "Cheque",
  "DD",
] as const;

export type PaymentMode = (typeof PAYMENT_MODES)[number];

/**
 * Payment modes that require a reference/transaction ID.
 */
export const PAYMENT_MODES_WITH_REFERENCE: PaymentMode[] = [
  "UPI",
  "RTGS",
  "NEFT",
];

/**
 * Payment modes that require an instrument number (cheque/DD number).
 */
export const PAYMENT_MODES_WITH_INSTRUMENT: PaymentMode[] = [
  "Cheque",
  "DD",
];

/**
 * Payment modes that require a bank name.
 */
export const PAYMENT_MODES_WITH_BANK: PaymentMode[] = [
  "RTGS",
  "NEFT",
  "Cheque",
  "DD",
];

/** Academic session regex: must be YYYY-YYYY format e.g. 2025-2026 */
export const SESSION_REGEX = /^\d{4}-\d{4}$/;

/** Validate academic session: YYYY-YYYY where second year = first + 1 */
export function isValidSession(session: string): boolean {
  if (!SESSION_REGEX.test(session)) return false;
  const [startStr, endStr] = session.split("-");
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);
  return end === start + 1 && start >= 2000 && start <= 2100;
}

/** Phone number regex: 10 digit Indian mobile */
export const PHONE_REGEX = /^[6-9]\d{9}$/;

/** Name regex: only letters, spaces, dots, hyphens — min 2 chars */
export const NAME_REGEX = /^[A-Za-z\s.\-']{2,100}$/;
