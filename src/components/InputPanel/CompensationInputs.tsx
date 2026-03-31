import { useCompStore } from '../../store/useCompStore';
import { formatCurrency } from '../../utils/formatCurrency';

export function CompensationInputs() {
  const { inputs, setInput } = useCompStore();

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Compensation</h3>

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs text-slate-400 mb-1 block">Base Salary</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={inputs.baseSalary}
              onChange={(e) => setInput('baseSalary', Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              min={0}
              step={1000}
            />
          </div>
          <span className="text-xs text-slate-500 mt-1 block">{formatCurrency(inputs.baseSalary)}/yr</span>
        </label>

        <label className="block">
          <span className="text-xs text-slate-400 mb-1 block">Annual Bonus</span>
          <div className="relative">
            <input
              type="number"
              value={inputs.bonusPercent}
              onChange={(e) => setInput('bonusPercent', Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              min={0}
              max={200}
              step={1}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {formatCurrency(inputs.baseSalary * inputs.bonusPercent / 100)} bonus
          </span>
        </label>

        <label className="block">
          <span className="text-xs text-slate-400 mb-1 block">RSU / Stock (Annual Vest)</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={inputs.rsuAnnual}
              onChange={(e) => setInput('rsuAnnual', Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              min={0}
              step={5000}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs text-slate-400 mb-1 block">Signing Bonus</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={inputs.signingBonus}
              onChange={(e) => setInput('signingBonus', Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              min={0}
              step={5000}
            />
          </div>
        </label>
      </div>
    </div>
  );
}
