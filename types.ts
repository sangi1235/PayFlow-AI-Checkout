export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

export interface CardState {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  focused: 'number' | 'name' | 'expiry' | 'cvc' | null;
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unknown';

export interface PaymentStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  receiptData?: string;
}