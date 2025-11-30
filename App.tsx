import React, { useState, useRef } from 'react';
import { ShoppingBag, ShieldCheck, Lock, AlertCircle, Check, ArrowRight, CreditCard, RefreshCw } from 'lucide-react';
import { CreditCardVisual } from './components/CreditCard';
import { GeminiReceipt } from './components/GeminiReceipt';
import { CardState, CartItem, PaymentStatus } from './types';
import * as CardUtils from './utils/cardUtils';

const SAMPLE_CART: CartItem[] = [
  { id: '1', name: 'Premium Pro Plan', price: 199.00, quantity: 1, description: 'Annual Subscription' },
  { id: '2', name: 'Setup Fee', price: 29.00, quantity: 1, description: 'One-time fee' },
];

export default function App() {
  const [card, setCard] = useState<CardState>({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
    focused: null
  });

  const [errors, setErrors] = useState<Partial<CardState>>({});
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' });

  // Refs for auto-focus
  const numberInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const expiryInputRef = useRef<HTMLInputElement>(null);
  const cvcInputRef = useRef<HTMLInputElement>(null);

  const totalAmount = SAMPLE_CART.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = CardUtils.formatCardNumber(value);
      
      // Auto-advance to Name if number is complete
      const cleanNum = formattedValue.replace(/\D/g, '');
      const brand = CardUtils.detectCardBrand(cleanNum);
      const maxLen = CardUtils.getCardLength(brand);
      
      if (cleanNum.length === maxLen) {
        nameInputRef.current?.focus();
      }

    } else if (name === 'expiry') {
      formattedValue = CardUtils.formatExpiry(value);
      // Auto-focus CVC if expiry is complete (MM / YY -> length 7)
      if (formattedValue.length === 7) {
        cvcInputRef.current?.focus();
      }
    } else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'name') {
      formattedValue = value.toUpperCase();
    }

    // Clear specific field error immediately on change
    if (errors[name as keyof CardState]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    setCard(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setCard(prev => ({ ...prev, focused: e.target.name as any }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setCard(prev => ({ ...prev, focused: null }));
    validateField(e.target.name);
  };

  const validateField = (name: string) => {
    let error = '';
    const cleanNumber = card.number.replace(/\D/g, '');

    switch (name) {
      case 'number':
        if (cleanNumber.length < 13 || !CardUtils.luhnCheck(cleanNumber)) {
          error = 'Invalid card number';
        }
        break;
      case 'expiry':
        if (!CardUtils.isValidExpiry(card.expiry)) {
          error = 'Invalid date';
        }
        break;
      case 'cvc':
        if (card.cvc.length < 3) {
          error = 'Invalid CVC';
        }
        break;
      case 'name':
        if (card.name.trim().length < 3) {
          error = 'Name required';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const validateAll = () => {
    const isNumValid = validateField('number');
    const isExpValid = validateField('expiry');
    const isCvcValid = validateField('cvc');
    const isNameValid = validateField('name');
    return isNumValid && isExpValid && isCvcValid && isNameValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setPaymentStatus({ status: 'processing' });

    // Simulate backend processing
    setTimeout(() => {
      // Deterministic Success/Failure based on Card Name or specific test numbers
      // If name contains "DECLINE" or ends with "0002" (Stripe test decline), fail it.
      const isTestDecline = card.name.includes('DECLINE') || card.number.replace(/\D/g, '').endsWith('0002');

      if (!isTestDecline) {
        setPaymentStatus({ status: 'success' });
      } else {
        setPaymentStatus({ 
          status: 'error', 
          message: 'Transaction declined by issuer. Please try a different card.' 
        });
      }
    }, 1500);
  };

  const resetForm = () => {
    setCard({ number: '', name: '', expiry: '', cvc: '', focused: null });
    setPaymentStatus({ status: 'idle' });
    setErrors({});
  };

  const fillTestCard = (type: 'visa' | 'mastercard' | 'amex' | 'decline') => {
    let data: Partial<CardState> = {};
    switch(type) {
      case 'visa':
        data = { number: '4242 4242 4242 4242', name: 'JENNY ROSEN', expiry: '12 / 28', cvc: '123' };
        break;
      case 'mastercard':
        data = { number: '5555 5555 5555 4444', name: 'JOHN SMITH', expiry: '05 / 30', cvc: '456' };
        break;
      case 'amex':
        data = { number: '3782 822463 10005', name: 'JANE DOE', expiry: '01 / 29', cvc: '1234' };
        break;
      case 'decline':
        data = { number: '4000 0000 0000 0002', name: 'CARD DECLINE', expiry: '12 / 25', cvc: '123' };
        break;
    }
    setCard(prev => ({ ...prev, ...data, focused: null }));
    setErrors({});
  };

  if (paymentStatus.status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Check className="text-green-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-8">Your transaction ID is #TRX-{Math.floor(Math.random() * 1000000)}</p>
          
          <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500 font-medium">Amount Paid</span>
                <span className="font-bold text-gray-900 text-lg">${totalAmount.toFixed(2)}</span>
             </div>
             <div className="h-px bg-gray-200 w-full mb-3"></div>
             <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Payment Method</span>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900">•••• {card.number.slice(-4)}</span>
                </div>
             </div>
          </div>

          <GeminiReceipt cart={SAMPLE_CART} total={totalAmount} cardLast4={card.number.slice(-4)} />

          <button 
            onClick={resetForm}
            className="w-full mt-8 bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <ArrowRight size={18} />
            Start New Transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">
      {/* Left Panel: Summary */}
      <div className="lg:w-5/12 bg-white p-6 lg:p-12 border-r border-gray-100 flex flex-col order-2 lg:order-1 shadow-sm lg:shadow-none z-10">
        <div className="mb-8 hidden lg:block">
            <div className="flex items-center gap-2 text-primary font-bold text-xl mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                    <ShieldCheck size={18} />
                </div>
                PayFlow
            </div>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase ml-10">Secure Checkout</p>
        </div>
        
        <div className="flex-1">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Order Summary</h2>
          <div className="space-y-6">
            {SAMPLE_CART.map((item) => (
              <div key={item.id} className="flex justify-between group">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-500 transition-all duration-300">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{item.name}</h3>
                    <p className="text-xs lg:text-sm text-gray-500">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 text-sm lg:text-base">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="my-8 h-px bg-gray-100"></div>
          
          <div className="space-y-3">
             <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-sm text-gray-500">
                <span>Tax (0%)</span>
                <span>$0.00</span>
             </div>
             <div className="flex justify-between text-xl font-bold text-gray-900 mt-4 pt-4 border-t border-gray-100 border-dashed">
                <span>Total due</span>
                <span>${totalAmount.toFixed(2)}</span>
             </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs text-gray-500 leading-relaxed flex gap-3 items-start">
            <Lock className="shrink-0 text-gray-400 mt-0.5" size={14} />
            <p>Your payment information is encrypted and processed securely using industry-standard 256-bit encryption. We do not store your full credit card details.</p>
        </div>
      </div>

      {/* Right Panel: Payment Form */}
      <div className="lg:w-7/12 p-4 sm:p-8 lg:p-12 flex flex-col justify-center order-1 lg:order-2 overflow-y-auto bg-slate-50/50">
        <div className="max-w-xl mx-auto w-full">
            
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Payment Details</h1>
                <p className="text-gray-500 mt-2 text-sm lg:text-base">Complete your purchase by providing your payment details.</p>
            </div>

            <CreditCardVisual card={card} />

            {/* Quick Test Card Buttons */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                <button onClick={() => fillTestCard('visa')} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full transition-colors border border-indigo-200">
                    Test Visa
                </button>
                <button onClick={() => fillTestCard('mastercard')} className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold rounded-full transition-colors border border-orange-200">
                    Test MC
                </button>
                <button onClick={() => fillTestCard('amex')} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-full transition-colors border border-blue-200">
                    Test Amex
                </button>
                <button onClick={() => fillTestCard('decline')} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-full transition-colors border border-red-200">
                    Test Decline
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <label htmlFor="cc-number" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Card Number</label>
                    <div className="relative group">
                        <input
                            ref={numberInputRef}
                            id="cc-number"
                            type="text"
                            name="number"
                            autoComplete="cc-number"
                            value={card.number}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            maxLength={23}
                            placeholder="0000 0000 0000 0000"
                            aria-invalid={!!errors.number}
                            className={`w-full bg-gray-50 border ${errors.number ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'} rounded-xl px-4 py-3.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none transition-all font-mono tracking-wide`}
                        />
                        <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 opacity-0">
                           {card.number && !errors.number && <Check size={20} className="text-green-500" />}
                           {errors.number && <AlertCircle size={20} className="text-red-500" />}
                        </div>
                    </div>
                    {errors.number && <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.number}</p>}
                </div>

                <div>
                    <label htmlFor="cc-name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Card Holder Name</label>
                    <input
                        ref={nameInputRef}
                        id="cc-name"
                        type="text"
                        name="name"
                        autoComplete="cc-name"
                        value={card.name}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="e.g. JOHN DOE"
                        aria-invalid={!!errors.name}
                        className={`w-full bg-gray-50 border ${errors.name ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'} rounded-xl px-4 py-3.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none transition-all uppercase tracking-wide`}
                    />
                    {errors.name && <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.name}</p>}
                </div>

                <div className="flex gap-4 sm:gap-6">
                    <div className="w-1/2">
                        <label htmlFor="cc-exp" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Expiration</label>
                        <input
                            ref={expiryInputRef}
                            id="cc-exp"
                            type="text"
                            name="expiry"
                            autoComplete="cc-exp"
                            value={card.expiry}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            maxLength={7}
                            placeholder="MM / YY"
                            aria-invalid={!!errors.expiry}
                            className={`w-full bg-gray-50 border ${errors.expiry ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'} rounded-xl px-4 py-3.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none transition-all font-mono text-center tracking-wider`}
                        />
                        {errors.expiry && <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.expiry}</p>}
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="cc-csc" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">CVC / CVV</label>
                        <div className="relative">
                            <input
                                ref={cvcInputRef}
                                id="cc-csc"
                                type="text"
                                name="cvc"
                                autoComplete="cc-csc"
                                value={card.cvc}
                                onChange={handleInputChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                maxLength={4}
                                placeholder="123"
                                aria-invalid={!!errors.cvc}
                                className={`w-full bg-gray-50 border ${errors.cvc ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'} rounded-xl px-4 py-3.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none transition-all font-mono text-center tracking-wider`}
                            />
                             <div className="absolute right-3 top-3.5 text-gray-400 cursor-help hover:text-primary transition-colors" title="Security code on the back of your card">
                                <ShieldCheck size={20} />
                            </div>
                        </div>
                        {errors.cvc && <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.cvc}</p>}
                    </div>
                </div>

                {paymentStatus.status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-fade-in shadow-sm" role="alert">
                        <AlertCircle size={20} className="shrink-0" />
                        <span className="text-sm font-medium">{paymentStatus.message}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={paymentStatus.status === 'processing'}
                    className="w-full bg-primary hover:bg-primaryDark text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                    {paymentStatus.status === 'processing' ? (
                         <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                         </>
                    ) : (
                        `Pay $${totalAmount.toFixed(2)}`
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}