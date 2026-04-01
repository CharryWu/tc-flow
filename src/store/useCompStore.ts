import { create } from 'zustand';
import type { CompInputs, TaxYearData, EngineOutput } from '../engine/types';
import { calculateTakeHome } from '../engine/index';
import { getCurrentYearData } from '../engine/taxDataLoader';
import { StorageAPI } from '../utils/storageApi';

interface CompStore {
  inputs: CompInputs;
  taxData: TaxYearData;
  selectedYear: number;
  output: EngineOutput | null;
  restoredFromStorage: boolean;
  setInput: <K extends keyof CompInputs>(key: K, value: CompInputs[K]) => void;
  setTaxData: (data: TaxYearData) => void;
  setSelectedYear: (year: number) => void;
  resetInputs: () => void;
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

// Try to restore from localStorage
const savedInputs = StorageAPI.load();
const initialInputs = savedInputs ?? defaultInputs;

export const useCompStore = create<CompStore>((set, get) => ({
  inputs: initialInputs,
  taxData: defaultTaxData,
  selectedYear: defaultTaxData.year,
  output: compute(initialInputs, defaultTaxData),
  restoredFromStorage: savedInputs !== null,

  setInput: (key, value) => {
    const newInputs = { ...get().inputs, [key]: value };
    StorageAPI.save(newInputs);
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

  resetInputs: () => {
    StorageAPI.clear();
    set({
      inputs: defaultInputs,
      output: compute(defaultInputs, get().taxData),
      restoredFromStorage: false,
    });
  },
}));

// Save on unload
window.addEventListener('beforeunload', () => {
  StorageAPI.save(useCompStore.getState().inputs);
});
