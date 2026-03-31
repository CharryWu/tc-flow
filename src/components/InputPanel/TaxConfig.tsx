import { useCompStore } from '../../store/useCompStore';
import { loadTaxYear } from '../../engine/taxDataLoader';
import type { FilingStatus } from '../../engine/types';

const FILING_STATUSES: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'marriedFilingJointly', label: 'Married Filing Jointly' },
  { value: 'marriedFilingSeparately', label: 'Married Filing Separately' },
  { value: 'headOfHousehold', label: 'Head of Household' },
];

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'D.C.' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

const AVAILABLE_YEARS = [2024, 2025, 2026];

export function TaxConfig() {
  const { inputs, selectedYear, setInput, setTaxData } = useCompStore();

  const handleYearChange = async (year: number) => {
    try {
      const data = await loadTaxYear(year);
      setTaxData(data);
    } catch (err) {
      console.error('Failed to load tax year data:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tax Configuration</h3>

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs text-slate-400 mb-1 block">Tax Year</span>
          <select
            value={selectedYear}
            onChange={(e) => void handleYearChange(Number(e.target.value))}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none"
          >
            {AVAILABLE_YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-slate-400 mb-1 block">Filing Status</span>
          <select
            value={inputs.filingStatus}
            onChange={(e) => setInput('filingStatus', e.target.value as FilingStatus)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none"
          >
            {FILING_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-slate-400 mb-1 block">State</span>
          <select
            value={inputs.state}
            onChange={(e) => setInput('state', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none"
          >
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
