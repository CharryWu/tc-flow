import { useCompStore } from '../store/useCompStore';
import { formatCurrency, formatPercent } from '../utils/formatCurrency';

export function TaxBracketTable() {
  const { taxData, inputs, output } = useCompStore();

  const brackets = taxData.federal.brackets[inputs.filingStatus];
  const taxableIncome = output?.taxableIncome ?? 0;

  // Find the active bracket index
  const activeBracketIndex = brackets.findIndex((b) => {
    const max = b.max ?? Infinity;
    return taxableIncome > b.min && taxableIncome <= max;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Federal Tax Brackets — {taxData.year}
        </h3>
        <span className="text-xs text-slate-400">
          Taxable income: {formatCurrency(taxableIncome)}
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-2 text-slate-400 font-medium">Income Range</th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">Rate</th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">Tax in Bracket</th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">Cumulative Tax</th>
            </tr>
          </thead>
          <tbody>
            {output?.federalBracketBreakdown.map((row, i) => {
              const isActive = i === activeBracketIndex;
              return (
                <tr
                  key={i}
                  className={`border-b border-white/5 transition-colors ${
                    isActive
                      ? 'bg-indigo-500/20 border-indigo-500/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <td className="px-4 py-2 text-slate-300 tabular-nums">
                    {isActive && (
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-2 align-middle" />
                    )}
                    {formatCurrency(row.min)}
                    {' – '}
                    {row.max !== null ? formatCurrency(row.max) : '∞'}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    <span className={`font-semibold ${isActive ? 'text-indigo-300' : 'text-slate-300'}`}>
                      {formatPercent(row.rate, 0)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-slate-300 tabular-nums">
                    {formatCurrency(row.taxInBracket)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-300 tabular-nums">
                    {formatCurrency(row.cumulativeTax)}
                  </td>
                </tr>
              );
            })}
            {output && (
              <tr className="bg-white/5 font-semibold">
                <td className="px-4 py-2 text-slate-300" colSpan={2}>
                  Total Federal Tax
                </td>
                <td className="px-4 py-2 text-right text-red-400 tabular-nums" colSpan={2}>
                  {formatCurrency(output.federalTax)} ({formatPercent(output.federalEffectiveRate)})
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span>
          Standard deduction:{' '}
          <span className="text-slate-400">
            {formatCurrency(taxData.federal.standardDeduction[inputs.filingStatus])}
          </span>
        </span>
        <span>
          Marginal rate:{' '}
          <span className="text-indigo-400 font-semibold">
            {formatPercent(output?.federalMarginalRate ?? 0, 0)}
          </span>
        </span>
        <span>
          Effective rate:{' '}
          <span className="text-slate-400">
            {formatPercent(output?.federalEffectiveRate ?? 0)}
          </span>
        </span>
      </div>
    </div>
  );
}
