import { useEffect, useState } from 'react';
import { CompensationInputs } from './components/InputPanel/CompensationInputs';
import { DeductionInputs } from './components/InputPanel/DeductionInputs';
import { TaxConfig } from './components/InputPanel/TaxConfig';
import { SankeyFlow } from './components/Charts/SankeyFlow';
import { DonutBreakdown } from './components/Charts/DonutBreakdown';
import { SummaryCards } from './components/SummaryCards';
import { TaxBracketTable } from './components/TaxBracketTable';
import { useCompStore } from './store/useCompStore';

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
      <div className="bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
        {message}
        <button onClick={onClose} className="ml-2 hover:text-emerald-200 transition-colors">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const PRIVACY_DISMISSED_KEY = 'tc-flow:privacy-dismissed';

function PrivacyNotice({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-slate-800/90 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center justify-center gap-4">
        {/* Offline globe icon — globe with diagonal strikethrough */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0 text-slate-400">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3c-2.5 3-4 6.5-4 9s1.5 6 4 9" />
          <path d="M12 3c2.5 3 4 6.5 4 9s-1.5 6-4 9" />
          <path d="M3.5 9h17" />
          <path d="M3.5 15h17" />
          {/* Diagonal strikethrough */}
          <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-sm text-slate-300">
          <strong className="text-slate-200">Your privacy matters.</strong>{' '}
          All data stays in your browser's localStorage. No data is ever transmitted to any server.
        </span>
        <button
          onClick={onClose}
          className="shrink-0 text-slate-400 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-700"
          aria-label="Dismiss privacy notice"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { resetInputs, restoredFromStorage } = useCompStore();
  const [showToast, setShowToast] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(() => {
    try { return !localStorage.getItem(PRIVACY_DISMISSED_KEY); } catch { return true; }
  });

  useEffect(() => {
    if (restoredFromStorage) {
      setShowToast(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {showPrivacy && (
        <PrivacyNotice onClose={() => {
          setShowPrivacy(false);
          try { localStorage.setItem(PRIVACY_DISMISSED_KEY, '1'); } catch {}
        }} />
      )}
      {showToast && (
        <Toast
          message="Restored your last session from browser storage"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Left sidebar */}
      <aside className="md:w-[360px] md:min-w-[360px] bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                TC
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">TC Flow</h1>
            </div>
            <button
              onClick={resetInputs}
              className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-md transition-colors"
              title="Reset all inputs to defaults"
            >
              Reset
            </button>
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
    </div>
  );
}
