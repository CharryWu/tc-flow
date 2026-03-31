import { useCompStore } from '../store/useCompStore';
import { formatCurrency, formatPercent } from '../utils/formatCurrency';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function KpiCard({ label, value, sub, accent = 'text-white' }: KpiCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}

export function SummaryCards() {
  const { output } = useCompStore();

  if (!output) return null;

  const ficaTotal = output.ficaSocialSecurity + output.ficaMedicare + output.ficaAdditionalMedicare;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KpiCard
        label="Gross TC"
        value={formatCurrency(output.grossTC)}
        sub={`Base ${formatCurrency(output.baseSalary)} + more`}
        accent="text-indigo-400"
      />
      <KpiCard
        label="Take-Home"
        value={formatCurrency(Math.max(0, output.takeHome))}
        sub={`${formatPercent(Math.max(0, output.takeHome) / output.grossTC)} of gross`}
        accent="text-emerald-400"
      />
      <KpiCard
        label="Effective Tax Rate"
        value={formatPercent(output.effectiveTaxRate)}
        sub={`Marginal: ${formatPercent(output.federalMarginalRate)}`}
        accent="text-red-400"
      />
      <KpiCard
        label="Total Taxes"
        value={formatCurrency(output.totalTax)}
        sub={`Fed ${formatCurrency(output.federalTax)} · FICA ${formatCurrency(ficaTotal)}`}
        accent="text-orange-400"
      />
    </div>
  );
}
