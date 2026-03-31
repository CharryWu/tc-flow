import type { FilingStatus, TaxYearData } from './types';

export interface FicaTaxResult {
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  total: number;
}

export function calculateFicaTax(
  wages: number,
  filingStatus: FilingStatus,
  taxData: TaxYearData,
): FicaTaxResult {
  const { socialSecurity, medicare } = taxData.fica;

  // Social Security is capped at the wage base
  const ssWages = Math.min(wages, socialSecurity.wageBase);
  const socialSecurityTax = ssWages * socialSecurity.rate;

  // Medicare — no cap
  const medicareTax = wages * medicare.rate;

  // Additional Medicare applies above the threshold
  const additionalThreshold = medicare.additionalThreshold[filingStatus];
  const additionalMedicareTax =
    wages > additionalThreshold
      ? (wages - additionalThreshold) * medicare.additionalRate
      : 0;

  return {
    socialSecurity: socialSecurityTax,
    medicare: medicareTax,
    additionalMedicare: additionalMedicareTax,
    total: socialSecurityTax + medicareTax + additionalMedicareTax,
  };
}
