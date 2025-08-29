// hooks/mock.ts
import { METAL_SYMBOLS, METAL_NAMES, MetalApiResponse, MetalModel, MetalSymbol } from '../constants/Types';
import { formatDateTime } from '../constants/Format';

const CURRENCY = 'USD';
const BASE: Record<MetalSymbol, number> = { XAU: 2385.7, XAG: 29.85, XPT: 975.25, XPD: 1015.4 };

function rnd(min: number, max: number) { return Math.random() * (max - min) + min; }

export function mockApiResponse(symbol: MetalSymbol): MetalApiResponse {
  const now = Math.floor(Date.now() / 1000);
  const base = BASE[symbol];
  const chp = Number((rnd(-1.5, 1.5)).toFixed(2));
  const price = Number((base * (1 + chp / 100)).toFixed(3));
  const prev_close_price = Number(base.toFixed(3));
  const open_price = prev_close_price;
  const low_price = Number((Math.min(price, prev_close_price) * 0.993).toFixed(3));
  const high_price = Number((Math.max(price, prev_close_price) * 1.007).toFixed(3));
  const bid = Number((price * 0.98).toFixed(3));
  const ask = Number((price * 1.02).toFixed(3));
  const g24 = Number((price / 31.1035).toFixed(4));
  const step = g24 * 0.085;

  return {
    timestamp: now, metal: symbol, currency: CURRENCY, price,
    prev_close_price, open_price, low_price, high_price,
    ch: Number((price - prev_close_price).toFixed(3)), chp,
    ask, bid,
    price_gram_24k: g24,
    price_gram_22k: +(g24 - step).toFixed(4),
    price_gram_21k: +(g24 - step * 1.25).toFixed(4),
    price_gram_20k: +(g24 - step * 1.5).toFixed(4),
    price_gram_18k: +(g24 - step * 2).toFixed(4),
    price_gram_16k: +(g24 - step * 2.5).toFixed(4),
    price_gram_14k: +(g24 - step * 3).toFixed(4),
    price_gram_10k: +(g24 - step * 4).toFixed(4),
  };
}

export function toModel(symbol: MetalSymbol, data: MetalApiResponse): MetalModel {
  return {
    id: symbol.toLowerCase(),
    symbol,
    name: METAL_NAMES[symbol],
    price: Number(data.price ?? 0),
    prev_close: data.prev_close_price ?? null,
    open_price: data.open_price ?? null,
    low: data.low_price ?? null,
    high: data.high_price ?? null,
    bid: data.bid ?? null,
    ask: data.ask ?? null,
    ch: data.ch ?? null,
    chp: data.chp ?? null,
    grams: {
      '24k': data.price_gram_24k ?? null,
      '22k': data.price_gram_22k ?? null,
      '21k': data.price_gram_21k ?? null,
      '20k': data.price_gram_20k ?? null,
      '18k': data.price_gram_18k ?? null,
      '16k': data.price_gram_16k ?? null,
      '14k': data.price_gram_14k ?? null,
      '10k': data.price_gram_10k ?? null,
    },
    time: formatDateTime(data.timestamp),
    rawTimestamp: data.timestamp ?? null,
  };
}

export async function mockAllModels(): Promise<MetalModel[]> {
  const list = METAL_SYMBOLS.map((s) => toModel(s, mockApiResponse(s)));
  list.sort((a, b) => METAL_SYMBOLS.indexOf(a.symbol) - METAL_SYMBOLS.indexOf(b.symbol));
  return list;
}