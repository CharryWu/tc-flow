import type { CompInputs, TaxYearData } from './types';

export interface DeductionsResult {
  contribution401k: number;
  employerMatch401k: number;
  hsa: number;
  fsa: number;
  healthPremiums: number;
  total: number;
}

export function calculateDeductions(
  inputs: CompInputs,
  taxData: TaxYearData,
): DeductionsResult {
  const { limits } = taxData;

  // 401(k) employee contribution — capped at IRS limit
  const requested401k = inputs.baseSalary * (inputs.contribution401kPercent / 100);
  const contribution401k = Math.min(requested401k, limits.traditional401k);

  // Employer match: e.g., 50% match up to 6% of salary
  const matchableContribution = Math.min(
    inputs.baseSalary * (inputs.employerMatch401kUpToPercent / 100),
    contribution401k,
  );
  const employerMatch401k = matchableContribution * (inputs.employerMatch401kPercent / 100);

  // HSA — capped at IRS limit (using self-only limit by default)
  const hsa = Math.min(inputs.hsaContribution, limits.hsaSelf);

  // FSA — capped at IRS limit
  const fsa = Math.min(inputs.fsaContribution, limits.fsa);

  // Health premiums — annual (12 × monthly)
  const healthPremiums = inputs.healthPremiumMonthly * 12;

  const total = contribution401k + hsa + fsa + healthPremiums;

  return {
    contribution401k,
    employerMatch401k,
    hsa,
    fsa,
    healthPremiums,
    total,
  };
}
