import type { FilingStatus, TaxYearData, BracketBreakdownItem } from './types';

export interface FederalTaxResult {
  federalTax: number;
  effectiveRate: number;
  marginalRate: number;
  bracketBreakdown: BracketBreakdownItem[];
}

export function calculateFederalTax(
  taxableIncome: number,
  filingStatus: FilingStatus,
  taxData: TaxYearData,
): FederalTaxResult {
  if (taxableIncome <= 0) {
    return { federalTax: 0, effectiveRate: 0, marginalRate: 0, bracketBreakdown: [] };
  }

  const brackets = taxData.federal.brackets[filingStatus];
  let totalTax = 0;
  let cumulativeTax = 0;
  let marginalRate = brackets[0]?.rate ?? 0;
  const breakdown: BracketBreakdownItem[] = [];

  for (const bracket of brackets) {
    const bracketMax = bracket.max ?? Infinity;
    if (taxableIncome <= bracket.min) break;

    const incomeInBracket = Math.min(taxableIncome, bracketMax) - bracket.min;
    const taxInBracket = incomeInBracket * bracket.rate;
    cumulativeTax += taxInBracket;
    totalTax += taxInBracket;

    breakdown.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      taxableIncome: incomeInBracket,
      taxInBracket,
      cumulativeTax,
    });

    if (taxableIncome > bracket.min) {
      marginalRate = bracket.rate;
    }
  }

  const effectiveRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;

  return {
    federalTax: totalTax,
    effectiveRate,
    marginalRate,
    bracketBreakdown: breakdown,
  };
}
