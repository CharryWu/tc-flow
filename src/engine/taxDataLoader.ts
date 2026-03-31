import type { TaxYearData } from './types';
import currentYearData from '../data/currentYear';

const cache = new Map<number, TaxYearData>();
cache.set(currentYearData.year, currentYearData);

export async function loadTaxYear(year: number): Promise<TaxYearData> {
  if (cache.has(year)) return cache.get(year)!;

  const resp = await fetch(`${import.meta.env.BASE_URL}tax-data/${year}.json`);
  if (!resp.ok) throw new Error(`Tax data for ${year} not available`);

  const data: TaxYearData = await resp.json() as TaxYearData;
  cache.set(year, data);
  return data;
}

export function getCurrentYearData(): TaxYearData {
  return currentYearData;
}
