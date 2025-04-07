const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const getLastNMonths = (n = 12, locale = 'en-US') => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  }).reverse();
};

export const getDaysBetween = (start, end = new Date()) => {
  return ((end - start) / MS_PER_DAY).toFixed(1);
};