import React, { useEffect, useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';

interface GeminiReceiptProps {
  cart: CartItem[];
  total: number;
  cardLast4: string;
}

export const GeminiReceipt: React.FC<GeminiReceiptProps> = ({ cart, total, cardLast4 }) => {
  const [receipt, setReceipt] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateReceipt = async () => {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            setReceipt("Thank you for your purchase! (AI Receipt unavailable - Missing API Key)");
            setLoading(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const itemsList = cart.map(i => `${i.quantity}x ${i.name} ($${i.price})`).join(', ');
        const prompt = `
          Generate a creative, slightly witty, and professional digital receipt for a purchase.
          Items: ${itemsList}.
          Total: $${total.toFixed(2)}.
          Card ending in: ${cardLast4}.
          
          The output should be a friendly message confirming the order, followed by a short amusing "prediction" or "usage tip" for the items purchased.
          Keep it under 100 words. Format as plain text.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        setReceipt(response.text || "Receipt generated.");
      } catch (error) {
        console.error("Gemini Error:", error);
        setReceipt("Thank you for your purchase! Your order has been confirmed.");
      } finally {
        setLoading(false);
      }
    };

    generateReceipt();
  }, [cart, total, cardLast4]);

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mt-6 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={100} className="text-indigo-600" />
        </div>
        
        <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
                <Sparkles size={16} />
            </div>
            <h3 className="font-semibold text-indigo-900">Smart Receipt</h3>
        </div>

        {loading ? (
            <div className="flex items-center gap-3 text-indigo-600">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm font-medium">Generating personalized receipt...</span>
            </div>
        ) : (
            <div className="prose prose-indigo prose-sm text-indigo-800">
                <p className="whitespace-pre-wrap leading-relaxed">{receipt}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                    <CheckCircle2 size={12} />
                    Verified Transaction
                </div>
            </div>
        )}
    </div>
  );
};