import { describe, it, expect } from 'vitest';
import { calculateTakeHome } from '../../src/engine/index';
import currentYearData from '../../src/data/currentYear';
import type { CompInputs } from '../../src/engine/types';

describe('calculateTakeHome integration', () => {
  const defaultInputs: CompInputs = {
    baseSalary: 200000,
    bonusPercent: 0,
    rsuAnnual: 0,
    signingBonus: 0,
    filingStatus: 'single',
    state: 'CA',
    contribution401kPercent: 10,
    hsaContribution: 4400,
    healthPremiumMonthly: 0,
    fsaContribution: 0,
    employerMatch401kPercent: 50,
    employerMatch401kUpToPercent: 6,
  };

  it('computes a reasonable take-home for $200k salary, single, CA', () => {
    const output = calculateTakeHome(defaultInputs, currentYearData);

    expect(output.grossTC).toBe(200000);
    // Take-home should be between 50% and 80% of gross for $200k in CA
    expect(output.takeHome).toBeGreaterThan(200000 * 0.50);
    expect(output.takeHome).toBeLessThan(200000 * 0.80);
  });

  it('federal tax is positive for high income', () => {
    const output = calculateTakeHome(defaultInputs, currentYearData);
    expect(output.federalTax).toBeGreaterThan(0);
  });

  it('CA state tax is positive', () => {
    const output = calculateTakeHome(defaultInputs, currentYearData);
    expect(output.stateTax).toBeGreaterThan(0);
  });

  it('TX state tax is zero (no income tax)', () => {
    const texasInputs = { ...defaultInputs, state: 'TX' };
    const output = calculateTakeHome(texasInputs, currentYearData);
    expect(output.stateTax).toBe(0);
  });

  it('WA state tax is zero (no income tax)', () => {
    const waInputs = { ...defaultInputs, state: 'WA' };
    const output = calculateTakeHome(waInputs, currentYearData);
    expect(output.stateTax).toBe(0);
  });

  it('FICA taxes are calculated', () => {
    const output = calculateTakeHome(defaultInputs, currentYearData);
    expect(output.ficaSocialSecurity).toBeGreaterThan(0);
    expect(output.ficaMedicare).toBeGreaterThan(0);
  });

  it('401k contribution is capped at IRS limit', () => {
    // 10% of $200k = $20k, which is below the $24,500 limit
    const output = calculateTakeHome(defaultInputs, currentYearData);
    expect(output.preTaxDeductions.contribution401k).toBe(20000);

    // 20% of $200k = $40k, which exceeds limit — should be capped
    const highContribInputs = { ...defaultInputs, contribution401kPercent: 20 };
    const output2 = calculateTakeHome(highContribInputs, currentYearData);
    expect(output2.preTaxDeductions.contribution401k).toBe(currentYearData.limits.traditional401k);
  });

  it('effective tax rate is reasonable', () => {
    const output = calculateTakeHome(defaultInputs, currentYearData);
    // For $200k single in CA, expect 25-45% effective rate
    expect(output.effectiveTaxRate).toBeGreaterThan(0.20);
    expect(output.effectiveTaxRate).toBeLessThan(0.55);
  });

  it('gross TC equals sum of all components', () => {
    const inputs: CompInputs = {
      ...defaultInputs,
      baseSalary: 150000,
      bonusPercent: 20,
      rsuAnnual: 60000,
      signingBonus: 10000,
    };
    const output = calculateTakeHome(inputs, currentYearData);
    const expectedGross = 150000 + 150000 * 0.20 + 60000 + 10000;
    expect(output.grossTC).toBe(expectedGross);
  });

  it('MFJ has lower tax rate than single for same income', () => {
    const singleOutput = calculateTakeHome(defaultInputs, currentYearData);
    const mfjInputs = { ...defaultInputs, filingStatus: 'marriedFilingJointly' as const };
    const mfjOutput = calculateTakeHome(mfjInputs, currentYearData);
    expect(mfjOutput.federalTax).toBeLessThan(singleOutput.federalTax);
  });
});
