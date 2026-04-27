export function parseAccessTtlToSeconds(accessTtl: string): number {
  const ttlValue = accessTtl.trim().toLowerCase();
  if (/^\d+$/.test(ttlValue)) {
    return Number(ttlValue);
  }

  const matched = ttlValue.match(/^(\d+)(s|m|h|d)$/);
  if (!matched) {
    return 15 * 60;
  }

  const amount = Number(matched[1]);
  const unit = matched[2];
  switch (unit) {
    case "s":
      return amount;
    case "m":
      return amount * 60;
    case "h":
      return amount * 60 * 60;
    case "d":
      return amount * 24 * 60 * 60;
    default:
      return 15 * 60;
  }
}
