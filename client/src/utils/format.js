export const formatCurrency = (value, currency = 'NGN') => {
  const symbols = { NGN: '₦', USD: '$', GBP: '£' };
  const num = Number(value) || 0;
  return `${symbols[currency] || '₦'}${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (value) => Number(value || 0).toLocaleString('en-NG');

export const formatDate = (date, opts = {}) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', ...opts });
};

export const formatDateTime = (date) => {
  const d = new Date(date);
  return `${formatDate(d)}, ${d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'y', secs: 31536000 }, { label: 'mo', secs: 2592000 },
    { label: 'd', secs: 86400 }, { label: 'h', secs: 3600 },
    { label: 'm', secs: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count}${i.label} ago`;
  }
  return 'just now';
};

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();

export const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
