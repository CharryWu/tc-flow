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
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center animate-toast-in">
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

        <div className="px-5 py-4 border-t border-slate-800 text-[10px] leading-relaxed text-slate-600 text-center space-y-2">
          <a
            href="https://github.com/CharryWu/tc-flow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View source
          </a>
          <p>
            This tool provides estimates only and does not constitute tax, legal, or financial advice. Results may not reflect your actual tax liability. Consult a qualified tax professional before making financial decisions. By using this tool you agree that no data leaves your browser. We make no warranties of accuracy or completeness.
          </p>
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
