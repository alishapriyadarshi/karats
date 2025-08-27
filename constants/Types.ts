// constants/types.ts
export type MetalSymbol = 'XAU' | 'XAG' | 'XPT' | 'XPD';
export const METAL_SYMBOLS: MetalSymbol[] = ['XAU', 'XAG', 'XPT', 'XPD'];

export interface MetalApiResponse {
  timestamp: number;
  metal: MetalSymbol | string;
  currency: string;
  exchange?: string;
  symbol?: string;
  prev_close_price?: number;
  open_price?: number;
  low_price?: number;
  high_price?: number;
  open_time?: number;
  price: number;
  ch?: number;
  chp?: number;
  ask?: number;
  bid?: number;
  price_gram_24k?: number;
  price_gram_22k?: number;
  price_gram_21k?: number;
  price_gram_20k?: number;
  price_gram_18k?: number;
  price_gram_16k?: number;
  price_gram_14k?: number;
  price_gram_10k?: number;
}

export const METAL_NAMES: Record<MetalSymbol, string> = {
    XAU: 'Gold',
    XAG: 'Silver',
    XPT: 'Platinum',
    XPD: 'Palladium',
  };

export interface MetalModel {
  id: string;                // xau/xag/xpt/xpd
  symbol: MetalSymbol;
  name: string;              // Gold/Silver/Platinum/Palladium
  price: number;
  prev_close: number | null;
  open_price: number | null;
  low: number | null;
  high: number | null;
  bid: number | null;
  ask: number | null;
  ch: number | null;         // absolute change
  chp: number | null;        // percentage change
  grams: Record<string, number | null>; // 24k, 22k, ...
  time: string;              // formatted local time
  rawTimestamp: number | null;
}