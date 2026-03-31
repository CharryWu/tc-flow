import type { TaxYearData } from './types';

export interface StateTaxResult {
  stateTax: number;
  effectiveRate: number;
}

export function calculateStateTax(
  taxableIncome: number,
  state: string,
  taxData: TaxYearData,
): StateTaxResult {
  const stateData = taxData.state[state];

  if (!stateData || stateData.noIncomeTax || stateData.brackets.length === 0) {
    return { stateTax: 0, effectiveRate: 0 };
  }

  if (taxableIncome <= 0) {
    return { stateTax: 0, effectiveRate: 0 };
  }

  // Apply standard deduction if available
  const deduction = stateData.standardDeduction ?? stateData.personalExemption ?? 0;
  const income = Math.max(0, taxableIncome - deduction);

  let totalTax = 0;

  for (const bracket of stateData.brackets) {
    const bracketMax = bracket.max ?? Infinity;
    if (income <= bracket.min) break;

    const incomeInBracket = Math.min(income, bracketMax) - bracket.min;
    totalTax += incomeInBracket * bracket.rate;
  }

  const effectiveRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;

  return { stateTax: totalTax, effectiveRate };
}
