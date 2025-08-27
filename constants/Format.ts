// constants/format.ts
export const titleCase = (s: string) =>
    s.toLowerCase().replace(/^\w/, c => c.toUpperCase());
  
  export const formatMoney = (n: number | null | undefined, currency = 'USD') => {
    if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n); }
    catch { return `$${n.toFixed(2)}`; }
  };
  
  export const formatPercent = (n: number | null | undefined) =>
    typeof n === 'number' && Number.isFinite(n) ? `${n.toFixed(2)}%` : '—';
  
  export const formatDateTime = (tsSeconds?: number) =>
    tsSeconds ? new Date(tsSeconds * 1000).toLocaleString() : new Date().toLocaleString();