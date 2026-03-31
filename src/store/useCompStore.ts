import { create } from 'zustand';
import type { CompInputs, TaxYearData, EngineOutput } from '../engine/types';
import { calculateTakeHome } from '../engine/index';
import { getCurrentYearData } from '../engine/taxDataLoader';

interface CompStore {
  inputs: CompInputs;
  taxData: TaxYearData;
  selectedYear: number;
  output: EngineOutput | null;
  setInput: <K extends keyof CompInputs>(key: K, value: CompInputs[K]) => void;
  setTaxData: (data: TaxYearData) => void;
  setSelectedYear: (year: number) => void;
}

const defaultTaxData = getCurrentYearData();

const defaultInputs: CompInputs = {
  baseSalary: 200000,
  bonusPercent: 10,
  rsuAnnual: 50000,
  signingBonus: 0,
  filingStatus: 'single',
  state: 'CA',
  contribution401kPercent: 10,
  hsaContribution: 4400,
  healthPremiumMonthly: 300,
  fsaContribution: 0,
  employerMatch401kPercent: 50,
  employerMatch401kUpToPercent: 6,
};

function compute(inputs: CompInputs, taxData: TaxYearData): EngineOutput {
  return calculateTakeHome(inputs, taxData);
}

export const useCompStore = create<CompStore>((set, get) => ({
  inputs: defaultInputs,
  taxData: defaultTaxData,
  selectedYear: defaultTaxData.year,
  output: compute(defaultInputs, defaultTaxData),

  setInput: (key, value) => {
    const newInputs = { ...get().inputs, [key]: value };
    set({
      inputs: newInputs,
      output: compute(newInputs, get().taxData),
    });
  },

  setTaxData: (data) => {
    set({
      taxData: data,
      selectedYear: data.year,
      output: compute(get().inputs, data),
    });
  },

  setSelectedYear: (year) => {
    set({ selectedYear: year });
  },
}));
