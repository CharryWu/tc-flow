import { useCompStore } from '../../store/useCompStore';
import { formatCurrency } from '../../utils/formatCurrency';

export function DeductionInputs() {
  const { inputs, taxData, setInput } = useCompStore();
  const limits = taxData.limits;

  const contrib401k = Math.min(
    inputs.baseSalary * (inputs.contribution401kPercent / 100),
    limits.traditional401k,
  );
  const isCapped = contrib401k >= limits.traditional401k;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Pre-Tax Deductions</h3>

      <div className="space-y-3">
        <label className="block">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-400">401(k) Contribution</span>
            {isCapped && (
              <span className="text-xs text-amber-400">Capped at {formatCurrency(limits.traditional401k)}</span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              value={inputs.contribution401kPercent}
              onChange={(e) => setInput('contribution401kPercent', Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              min={0}
              max={100}
              step={1}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">{formatCurrency(contrib401k)}/yr</span>
        </label>

        <label className="block">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-400">Employer Match</span>
            <span className="text-xs text-slate-500">(% up to %)</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={inputs.employerMatch401kPercent}
                onChange={(e) => setInput('employerMatch401kPercent', Number(e.target.value))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                min={0}
                max={100}
                step={1}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
            </div>
            <span className="text-slate-500 self-center text-xs">match up to</span>
            <div className="relative flex-1">
              <input
                type="number"
                value={inputs.employerMatch401kUpToPercent}
                onChange={(e) => setInput('employerMatch401kUpToPercent', Number(e.target.value))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                min={0}
                max={100}
                step={1}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
            </div>
          </div>
        </label>

        <label className="block">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-400">HSA Contribution</span>
            <span className="text-xs text-slate-500">Limit: {formatCurrency(limits.hsaSelf)}</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={inputs.hsaContribution}
              onChange={(e) => setInput('hsaContribution', Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              min={0}
              max={limits.hsaFamily}
              step={100}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs text-slate-400 mb-1 block">Health Premium (Monthly)</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={inputs.healthPremiumMonthly}
              onChange={(e) => setInput('healthPremiumMonthly', Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              min={0}
              step={50}
            />
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {formatCurrency(inputs.healthPremiumMonthly * 12)}/yr
          </span>
        </label>
      </div>
    </div>
  );
}
