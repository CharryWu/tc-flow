import { describe, it, expect } from 'vitest';
import { calculateFederalTax } from '../../src/engine/federalTax';
import type { TaxYearData } from '../../src/engine/types';

const mockTaxData: TaxYearData = {
  year: 2026,
  federal: {
    brackets: {
      single: [
        { min: 0,      max: 10000,  rate: 0.10 },
        { min: 10000,  max: 40000,  rate: 0.20 },
        { min: 40000,  max: null,   rate: 0.30 },
      ],
      marriedFilingJointly: [
        { min: 0,      max: 20000,  rate: 0.10 },
        { min: 20000,  max: 80000,  rate: 0.20 },
        { min: 80000,  max: null,   rate: 0.30 },
      ],
      marriedFilingSeparately: [
        { min: 0,      max: 10000,  rate: 0.10 },
        { min: 10000,  max: 40000,  rate: 0.20 },
        { min: 40000,  max: null,   rate: 0.30 },
      ],
      headOfHousehold: [
        { min: 0,      max: 15000,  rate: 0.10 },
        { min: 15000,  max: 50000,  rate: 0.20 },
        { min: 50000,  max: null,   rate: 0.30 },
      ],
    },
    standardDeduction: {
      single: 15000,
      marriedFilingJointly: 30000,
      marriedFilingSeparately: 15000,
      headOfHousehold: 22500,
    },
    amt: {
      exemption: { single: 85000, marriedFilingJointly: 130000, marriedFilingSeparately: 65000, headOfHousehold: 85000 },
      phaseout: { single: 600000, marriedFilingJointly: 1200000, marriedFilingSeparately: 600000, headOfHousehold: 600000 },
    },
  },
  fica: {
    socialSecurity: { rate: 0.062, wageBase: 160000 },
    medicare: {
      rate: 0.0145,
      additionalRate: 0.009,
      additionalThreshold: { single: 200000, marriedFilingJointly: 250000, marriedFilingSeparately: 125000, headOfHousehold: 200000 },
    },
  },
  limits: {
    traditional401k: 23000,
    traditional401kCatchup50: 7500,
    hsaSelf: 4000,
    hsaFamily: 8000,
    fsa: 3000,
    esppAnnual: 25000,
    iraContribution: 7000,
    iraCatchup50: 1000,
  },
  state: {},
};

describe('calculateFederalTax', () => {
  it('returns zero for zero income', () => {
    const result = calculateFederalTax(0, 'single', mockTaxData);
    expect(result.federalTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.marginalRate).toBe(0);
  });

  it('correctly taxes income entirely in the first bracket', () => {
    // $5,000 is entirely in the 10% bracket
    const result = calculateFederalTax(5000, 'single', mockTaxData);
    expect(result.federalTax).toBeCloseTo(500);
    expect(result.effectiveRate).toBeCloseTo(0.10);
    expect(result.marginalRate).toBe(0.10);
  });

  it('correctly taxes income spanning two brackets', () => {
    // $10,000 in first bracket (10%) + $5,000 in second bracket (20%)
    // = 1,000 + 1,000 = $2,000
    const result = calculateFederalTax(15000, 'single', mockTaxData);
    expect(result.federalTax).toBeCloseTo(2000);
    expect(result.marginalRate).toBe(0.20);
  });

  it('correctly taxes income spanning all three brackets', () => {
    // $10,000 × 10% = $1,000
    // $30,000 × 20% = $6,000
    // $10,000 × 30% = $3,000
    // Total = $10,000
    const result = calculateFederalTax(50000, 'single', mockTaxData);
    expect(result.federalTax).toBeCloseTo(10000);
    expect(result.marginalRate).toBe(0.30);
  });

  it('uses correct brackets for married filing jointly', () => {
    // $20,000 in first bracket → $2,000 (10%)
    const result = calculateFederalTax(20000, 'marriedFilingJointly', mockTaxData);
    expect(result.federalTax).toBeCloseTo(2000);
    expect(result.marginalRate).toBe(0.10);
  });

  it('bracket breakdown has correct cumulative values', () => {
    const result = calculateFederalTax(50000, 'single', mockTaxData);
    expect(result.bracketBreakdown).toHaveLength(3);
    expect(result.bracketBreakdown[0].cumulativeTax).toBeCloseTo(1000);
    expect(result.bracketBreakdown[1].cumulativeTax).toBeCloseTo(7000);
    expect(result.bracketBreakdown[2].cumulativeTax).toBeCloseTo(10000);
  });

  it('effective rate is less than marginal rate for progressive tax', () => {
    const result = calculateFederalTax(80000, 'single', mockTaxData);
    expect(result.effectiveRate).toBeLessThan(result.marginalRate);
  });
});
