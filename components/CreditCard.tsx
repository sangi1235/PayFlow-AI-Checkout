import React, { useMemo } from 'react';
import { CardState, CardBrand } from '../types';
import { detectCardBrand } from '../utils/cardUtils';
import { CreditCard, Wifi } from 'lucide-react';

interface CreditCardProps {
  card: CardState;
}

export const CreditCardVisual: React.FC<CreditCardProps> = ({ card }) => {
  const brand = useMemo(() => detectCardBrand(card.number), [card.number]);
  
  const isCVC = card.focused === 'cvc';

  const getGradient = (brand: CardBrand) => {
    switch(brand) {
      case 'visa': return 'from-blue-700 via-blue-800 to-blue-900';
      case 'mastercard': return 'from-gray-800 via-gray-900 to-black';
      case 'amex': return 'from-[#006fcf] to-[#004a8f]'; // Specific Amex Blue
      case 'discover': return 'from-orange-500 via-orange-600 to-red-700';
      case 'diners': return 'from-slate-600 to-slate-800';
      default: return 'from-slate-700 to-slate-900';
    }
  };

  const getBrandLogo = (brand: CardBrand) => {
    switch(brand) {
      case 'visa': 
        return <h3 className="text-white italic font-black text-2xl tracking-tighter leading-none pr-1">VISA</h3>;
      case 'mastercard':
        return (
          <div className="flex -space-x-3 opacity-90 relative">
            <div className="w-8 h-8 rounded-full bg-[#eb001b]"></div>
            <div className="w-8 h-8 rounded-full bg-[#f79e1b] mix-blend-screen"></div>
          </div>
        );
      case 'amex':
        return (
            <div className="bg-white/10 backdrop-blur-sm border border-white/40 px-1 rounded-sm">
                 <h3 className="text-white font-bold text-xs tracking-widest text-center leading-tight py-1">AMEX</h3>
            </div>
        );
      case 'discover':
        return <h3 className="text-white font-bold text-lg tracking-wide border-b-2 border-orange-400 pb-0.5">DISCOVER</h3>;
      default:
        return <CreditCard className="text-white/80" size={32} />;
    }
  };

  return (
    <div className="perspective-1000 w-full max-w-[380px] aspect-[1.586/1] mx-auto my-6 sm:my-8 relative cursor-pointer group select-none">
      <div className={`w-full h-full relative transition-all duration-700 transform-style-3d ${isCVC ? 'rotate-y-180' : ''}`}>
        
        {/* Front */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${getGradient(brand)} shadow-2xl p-5 sm:p-6 backface-hidden text-white overflow-hidden border border-white/10 flex flex-col justify-between`}>
          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

          {/* Top Row: Chip & Contactless */}
          <div className="flex justify-between items-start relative z-10">
            <div className="w-11 h-8 sm:w-12 sm:h-9 rounded-md bg-gradient-to-br from-yellow-200/40 via-yellow-400/30 to-yellow-600/40 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
               <div className="w-7 h-4 sm:w-8 sm:h-5 border border-white/20 rounded-[2px] opacity-60"></div>
            </div>
            <Wifi className="rotate-90 opacity-60" size={24} />
          </div>

          {/* Middle Row: Card Number */}
          <div className="relative z-10 mt-1 sm:mt-2">
            <span className={`font-mono text-lg sm:text-2xl tracking-widest drop-shadow-md transition-all duration-300 block w-full text-center sm:text-left ${!card.number ? 'text-white/40' : 'text-white'}`}>
                {card.number || '•••• •••• •••• ••••'}
            </span>
          </div>

          {/* Bottom Row: Name, Expiry, Logo */}
          <div className="flex justify-between items-end relative z-10 gap-2">
            
            {/* Name Section */}
            <div className="flex flex-col flex-1 min-w-0 mr-2">
              <span className="text-[9px] uppercase text-white/60 tracking-wider mb-0.5 whitespace-nowrap">Card Holder</span>
              <span className="font-medium tracking-wide uppercase truncate text-sm sm:text-base text-white/90">
                {card.name || 'YOUR NAME'}
              </span>
            </div>

            {/* Expiry & Logo Group */}
            <div className="flex items-end gap-3 sm:gap-4 shrink-0">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase text-white/60 tracking-wider mb-0.5 whitespace-nowrap">Expires</span>
                    <span className="font-mono text-sm sm:text-base text-white/90">{card.expiry || 'MM/YY'}</span>
                </div>
                <div className="flex items-end pb-0.5 h-full min-w-[32px] justify-end">
                    {getBrandLogo(brand)}
                </div>
            </div>

          </div>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${getGradient(brand)} shadow-2xl backface-hidden rotate-y-180 border border-white/10 overflow-hidden`}>
          <div className="w-full h-10 sm:h-12 bg-black/80 mt-6 relative z-10"></div>
          
          <div className="p-5 sm:p-6 relative z-10">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-white/80 tracking-wider mb-1 mr-1">CVC</span>
              <div className="w-full h-10 bg-white rounded flex items-center justify-end px-3 shadow-inner">
                <span className="font-mono text-gray-800 text-lg tracking-widest">
                  {card.cvc || '•••'}
                </span>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8 flex justify-between items-center opacity-60">
                <div className="text-[8px] text-white/70 max-w-[150px] leading-tight hidden sm:block">
                    This card is property of the issuing bank and must be returned upon request.
                </div>
                <CreditCard size={32} className="text-white ml-auto sm:ml-0" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};