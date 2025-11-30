import { CardBrand } from '../types';

export const detectCardBrand = (number: string): CardBrand => {
  const cleanNumber = number.replace(/\D/g, '');
  if (cleanNumber.match(/^4/)) return 'visa';
  if (cleanNumber.match(/^5[1-5]/)) return 'mastercard';
  if (cleanNumber.match(/^3[47]/)) return 'amex';
  if (cleanNumber.match(/^6(?:011|5)/)) return 'discover';
  if (cleanNumber.match(/^3(?:0[0-5]|[68])/)) return 'diners';
  if (cleanNumber.match(/^(?:2131|1800|35)/)) return 'jcb';
  return 'unknown';
};

export const getCardLength = (brand: CardBrand): number => {
  switch(brand) {
    case 'amex': return 15;
    case 'diners': return 14;
    default: return 16;
  }
};

export const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const brand = detectCardBrand(v);

  // Amex: 4-6-5
  if (brand === 'amex') {
    const parts = [v.substring(0, 4), v.substring(4, 10), v.substring(10, 15)];
    return parts.filter(Boolean).join(' ').trim();
  }

  // Diners: 4-6-4
  if (brand === 'diners') {
    const parts = [v.substring(0, 4), v.substring(4, 10), v.substring(10, 14)];
    return parts.filter(Boolean).join(' ').trim();
  }
  
  // Others: 4-4-4-4
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.substring(i, i + 4));
  }
  return parts.join(' ').trim();
};

export const formatExpiry = (value: string): string => {
  const clean = value.replace(/\D/g, '');
  
  if (clean.length >= 2) {
    return `${clean.substring(0, 2)} / ${clean.substring(2, 4)}`;
  }
  return clean;
};

export const luhnCheck = (val: string): boolean => {
  let checksum = 0;
  let j = 1;

  for (let i = val.length - 1; i >= 0; i--) {
    let calc = 0;
    calc = Number(val.charAt(i)) * j;

    if (calc > 9) {
      checksum = checksum + 1;
      calc = calc - 10;
    }
    checksum = checksum + calc;
    if (j === 1) {
      j = 2;
    } else {
      j = 1;
    }
  }
  return (checksum % 10) === 0;
};

export const isValidExpiry = (expiry: string): boolean => {
  const [monthStr, yearStr] = expiry.split(' / ');
  if (!monthStr || !yearStr || yearStr.length < 2) return false;
  
  const month = parseInt(monthStr, 10);
  const year = parseInt(`20${yearStr}`, 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (month < 1 || month > 12) return false;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
};