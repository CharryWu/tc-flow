import { CompensationInputs } from './components/InputPanel/CompensationInputs';
import { DeductionInputs } from './components/InputPanel/DeductionInputs';
import { TaxConfig } from './components/InputPanel/TaxConfig';
import { SankeyFlow } from './components/Charts/SankeyFlow';
import { DonutBreakdown } from './components/Charts/DonutBreakdown';
import { SummaryCards } from './components/SummaryCards';
import { TaxBracketTable } from './components/TaxBracketTable';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Left sidebar */}
      <aside className="md:w-[360px] md:min-w-[360px] bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              TC
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">TC Flow</h1>
          </div>
          <p className="text-xs text-slate-500">See where every dollar of your TC goes</p>
        </div>

        {/* Inputs */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          <CompensationInputs />
          <div className="border-t border-slate-800" />
          <DeductionInputs />
          <div className="border-t border-slate-800" />
          <TaxConfig />
        </div>

        <div className="px-5 py-4 border-t border-slate-800 text-xs text-slate-600 text-center">
          All calculations are estimates. Consult a tax professional.
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-8">
          {/* Summary KPI cards */}
          <SummaryCards />

          {/* Sankey hero */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-200">Money Flow</h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">Hover for details</span>
            </div>
            <SankeyFlow />
          </section>

          {/* Donut */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5" style={{ minHeight: 300 }}>
            <DonutBreakdown />
          </section>

          {/* Tax bracket table */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <TaxBracketTable />
          </section>
        </div>
      </main>
    </div>
  );
}
