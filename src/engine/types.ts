export type FilingStatus =
  | 'single'
  | 'marriedFilingJointly'
  | 'marriedFilingSeparately'
  | 'headOfHousehold';

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface TaxYearData {
  year: number;
  federal: {
    brackets: Record<FilingStatus, TaxBracket[]>;
    standardDeduction: Record<FilingStatus, number>;
    amt: {
      exemption: Record<FilingStatus, number>;
      phaseout: Record<FilingStatus, number>;
    };
  };
  fica: {
    socialSecurity: { rate: number; wageBase: number };
    medicare: {
      rate: number;
      additionalRate: number;
      additionalThreshold: Record<FilingStatus, number>;
    };
  };
  state: Record<string, {
    brackets: TaxBracket[];
    standardDeduction?: number;
    personalExemption?: number;
    noIncomeTax?: boolean;
  }>;
  limits: {
    traditional401k: number;
    traditional401kCatchup50: number;
    traditional401kCatchup60_63?: number;
    hsaSelf: number;
    hsaFamily: number;
    fsa: number;
    esppAnnual: number;
    iraContribution: number;
    iraCatchup50: number;
  };
}

export interface CompInputs {
  baseSalary: number;
  bonusPercent: number;
  rsuAnnual: number;
  signingBonus: number;
  filingStatus: FilingStatus;
  state: string;
  contribution401kPercent: number;
  hsaContribution: number;
  healthPremiumMonthly: number;
  fsaContribution: number;
  employerMatch401kPercent: number;
  employerMatch401kUpToPercent: number;
}

export interface BracketBreakdownItem {
  min: number;
  max: number | null;
  rate: number;
  taxableIncome: number;
  taxInBracket: number;
  cumulativeTax: number;
}

export interface EngineOutput {
  grossTC: number;
  baseSalary: number;
  bonus: number;
  rsuAnnual: number;
  signingBonus: number;
  preTaxDeductions: {
    contribution401k: number;
    employerMatch401k: number;
    hsa: number;
    fsa: number;
    healthPremiums: number;
    total: number;
  };
  taxableIncome: number;
  federalTax: number;
  federalEffectiveRate: number;
  federalMarginalRate: number;
  federalBracketBreakdown: BracketBreakdownItem[];
  stateTax: number;
  stateEffectiveRate: number;
  ficaSocialSecurity: number;
  ficaMedicare: number;
  ficaAdditionalMedicare: number;
  totalTax: number;
  effectiveTaxRate: number;
  takeHome: number;
}

export interface SankeyNodeData {
  id: string;
  name: string;
  color?: string;
}

export interface SankeyLinkData {
  source: string;
  target: string;
  value: number;
}
