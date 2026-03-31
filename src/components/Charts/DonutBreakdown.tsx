import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCompStore } from '../../store/useCompStore';
import { formatCurrency, formatPercent } from '../../utils/formatCurrency';

const COLORS = {
  takeHome: '#22c55e',
  federal: '#ef4444',
  state: '#f97316',
  fica: '#f59e0b',
  deductions: '#3b82f6',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { pct: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-white">{item.name}</div>
      <div className="text-slate-300">{formatCurrency(item.value)}</div>
      <div className="text-slate-400">{formatPercent(item.payload.pct)}</div>
    </div>
  );
}

export function DonutBreakdown() {
  const { output } = useCompStore();

  if (!output) return null;

  const grossTC = output.grossTC;
  const ficaTotal = output.ficaSocialSecurity + output.ficaMedicare + output.ficaAdditionalMedicare;

  const data = [
    { name: 'Take-Home', value: Math.max(0, output.takeHome), color: COLORS.takeHome, pct: output.takeHome / grossTC },
    { name: 'Federal Tax', value: output.federalTax, color: COLORS.federal, pct: output.federalTax / grossTC },
    { name: 'State Tax', value: output.stateTax, color: COLORS.state, pct: output.stateTax / grossTC },
    { name: 'FICA', value: ficaTotal, color: COLORS.fica, pct: ficaTotal / grossTC },
    { name: 'Pre-Tax Deductions', value: output.preTaxDeductions.total, color: COLORS.deductions, pct: output.preTaxDeductions.total / grossTC },
  ].filter((d) => d.value > 0);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Breakdown</h3>
      <div className="flex-1" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
              iconSize={8}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
