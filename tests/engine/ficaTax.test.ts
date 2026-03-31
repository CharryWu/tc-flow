import { describe, it, expect } from 'vitest';
import { calculateFicaTax } from '../../src/engine/ficaTax';
import type { TaxYearData } from '../../src/engine/types';

const mockTaxData: TaxYearData = {
  year: 2026,
  federal: {
    brackets: {
      single: [],
      marriedFilingJointly: [],
      marriedFilingSeparately: [],
      headOfHousehold: [],
    },
    standardDeduction: { single: 15000, marriedFilingJointly: 30000, marriedFilingSeparately: 15000, headOfHousehold: 22500 },
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
      additionalThreshold: {
        single: 200000,
        marriedFilingJointly: 250000,
        marriedFilingSeparately: 125000,
        headOfHousehold: 200000,
      },
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

describe('calculateFicaTax', () => {
  it('calculates SS and Medicare for income below wage base', () => {
    const result = calculateFicaTax(100000, 'single', mockTaxData);
    expect(result.socialSecurity).toBeCloseTo(6200); // 100000 × 6.2%
    expect(result.medicare).toBeCloseTo(1450);       // 100000 × 1.45%
    expect(result.additionalMedicare).toBe(0);
  });

  it('caps Social Security at the wage base', () => {
    // Wages above $160,000 — SS should be capped
    const result = calculateFicaTax(200000, 'single', mockTaxData);
    expect(result.socialSecurity).toBeCloseTo(160000 * 0.062); // capped at wage base
    expect(result.socialSecurity).toBeLessThan(200000 * 0.062);
  });

  it('applies additional Medicare above threshold for single filers', () => {
    // $250,000 wages — additional Medicare on $50,000 above $200,000 threshold
    const result = calculateFicaTax(250000, 'single', mockTaxData);
    expect(result.additionalMedicare).toBeCloseTo(50000 * 0.009);
  });

  it('uses higher threshold for married filing jointly', () => {
    // $240,000 wages — below MFJ threshold of $250,000
    const result = calculateFicaTax(240000, 'marriedFilingJointly', mockTaxData);
    expect(result.additionalMedicare).toBe(0);
  });

  it('additional Medicare is zero when below threshold', () => {
    const result = calculateFicaTax(150000, 'single', mockTaxData);
    expect(result.additionalMedicare).toBe(0);
  });

  it('total is sum of all three components', () => {
    const result = calculateFicaTax(250000, 'single', mockTaxData);
    expect(result.total).toBeCloseTo(result.socialSecurity + result.medicare + result.additionalMedicare);
  });
});
