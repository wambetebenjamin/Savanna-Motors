const kesFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-KE");

export const formatKes = (value: number) => kesFormatter.format(Math.round(value));

export const formatKesShort = (value: number) => `KES ${numberFormatter.format(Math.round(value))}`;

export const formatNumber = (value: number) => numberFormatter.format(Math.round(value));

export const formatMileage = (km?: number) =>
  typeof km === "number" ? `${numberFormatter.format(km)} km` : "0 km";

export const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-KE", { dateStyle: "long" }).format(new Date(iso));

/**
 * Standard amortising loan payment. Used by the (client-only) financing calculator
 * and by the monthly estimate shown on every listing.
 */
export function monthlyInstallment(
  principal: number,
  annualRatePercent: number,
  months: number,
): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}
