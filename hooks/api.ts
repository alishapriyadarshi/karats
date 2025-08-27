import { formatDateTime } from '../constants/Format';
import { METAL_NAMES, METAL_SYMBOLS, MetalApiResponse, MetalModel, MetalSymbol } from '../constants/Types';

const BASE = 'https://www.goldapi.io/api';
const CURRENCY = 'USD';
const USE_MOCK = false; // switch to true if no API key

const mockFor = (symbol: MetalSymbol): MetalApiResponse => ({
  timestamp: Math.floor(Date.now() / 1000),
  metal: symbol,
  currency: CURRENCY,
  price: 3385.705,
  prev_close_price: 3365.945,
  open_price: 3365.945,
  low_price: 3351.415,
  high_price: 3389.475,
  ch: 19.76,
  chp: 0.59,
  ask: 3385.89,
  bid: 3385.5,
  price_gram_24k: 108.8529,
  price_gram_22k: 99.7819,
  price_gram_21k: 95.2463,
  price_gram_20k: 90.7108,
  price_gram_18k: 81.6397,
  price_gram_16k: 72.5686,
  price_gram_14k: 63.4976,
  price_gram_10k: 45.3554,
});

export async function fetchMetal(symbol: MetalSymbol, apiKey?: string): Promise<MetalModel> {
  let data: MetalApiResponse;

  if (USE_MOCK || !apiKey) {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
    data = mockFor(symbol);
  } else {
    const res = await fetch(`${BASE}/${symbol}/${CURRENCY}`, {
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || `Failed ${symbol}`);
    data = json as MetalApiResponse;
  }

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

export async function fetchAllMetals(apiKey?: string) {
  const results = await Promise.allSettled(METAL_SYMBOLS.map((s) => fetchMetal(s, apiKey)));

  const ok: MetalModel[] = [];
  const failed: MetalSymbol[] = [];

  results.forEach((r, idx) => {
    const sym = METAL_SYMBOLS[idx];
    if (r.status === 'fulfilled') ok.push(r.value);
    else failed.push(sym);
  });

  ok.sort((a, b) => METAL_SYMBOLS.indexOf(a.symbol) - METAL_SYMBOLS.indexOf(b.symbol));
  return { ok, failed };
}