import type { CompInputs, TaxYearData, EngineOutput } from './types';
import { calculateFederalTax } from './federalTax';
import { calculateFicaTax } from './ficaTax';
import { calculateStateTax } from './stateTax';
import { calculateDeductions } from './deductions';

export function calculateTakeHome(
  inputs: CompInputs,
  taxData: TaxYearData,
): EngineOutput {
  const bonus = inputs.baseSalary * (inputs.bonusPercent / 100);
  const grossTC = inputs.baseSalary + bonus + inputs.rsuAnnual + inputs.signingBonus;

  // Pre-tax deductions reduce federal/state taxable income
  const deductions = calculateDeductions(inputs, taxData);

  // Standard deduction
  const standardDeduction = taxData.federal.standardDeduction[inputs.filingStatus];

  // FICA is on wages (base + bonus, not RSU for simplicity)
  const ficaWages = inputs.baseSalary + bonus;

  // Federal taxable income: gross wages - pre-tax deductions - standard deduction
  // RSU and signing bonus are ordinary income too
  const grossIncome = grossTC;
  const preTaxReducedIncome = grossIncome - deductions.total;
  const taxableIncome = Math.max(0, preTaxReducedIncome - standardDeduction);

  const federalResult = calculateFederalTax(taxableIncome, inputs.filingStatus, taxData);
  const ficaResult = calculateFicaTax(ficaWages, inputs.filingStatus, taxData);
  const stateResult = calculateStateTax(taxableIncome, inputs.state, taxData);

  const totalTax =
    federalResult.federalTax +
    stateResult.stateTax +
    ficaResult.socialSecurity +
    ficaResult.medicare +
    ficaResult.additionalMedicare;

  const effectiveTaxRate = grossTC > 0 ? totalTax / grossTC : 0;

  const takeHome = grossTC - deductions.total - totalTax;

  return {
    grossTC,
    baseSalary: inputs.baseSalary,
    bonus,
    rsuAnnual: inputs.rsuAnnual,
    signingBonus: inputs.signingBonus,
    preTaxDeductions: {
      contribution401k: deductions.contribution401k,
      employerMatch401k: deductions.employerMatch401k,
      hsa: deductions.hsa,
      fsa: deductions.fsa,
      healthPremiums: deductions.healthPremiums,
      total: deductions.total,
    },
    taxableIncome,
    federalTax: federalResult.federalTax,
    federalEffectiveRate: federalResult.effectiveRate,
    federalMarginalRate: federalResult.marginalRate,
    federalBracketBreakdown: federalResult.bracketBreakdown,
    stateTax: stateResult.stateTax,
    stateEffectiveRate: stateResult.effectiveRate,
    ficaSocialSecurity: ficaResult.socialSecurity,
    ficaMedicare: ficaResult.medicare,
    ficaAdditionalMedicare: ficaResult.additionalMedicare,
    totalTax,
    effectiveTaxRate,
    takeHome,
  };
}
