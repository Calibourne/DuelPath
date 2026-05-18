import { Component, ReactNode } from 'react';
import { Sidebar } from './components/Sidebar';
import { CardGrid } from './components/MainContent';
import { NewRunWizard } from './components/NewRunWizard';
import { CardDetail } from './components/CardDetail';
import { FormatProvider } from './context/FormatContext';
import { RunProvider, useRun } from './context/RunContext';
import { UIProvider } from './context/UIContext';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-20 bg-red-950 text-red-200 h-screen overflow-auto">
          <h1 className="text-4xl font-black mb-4 uppercase italic">Critical Failure</h1>
          <pre className="bg-black/40 p-6 border border-red-500/50 rounded-none font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em]">Attempt Reboot</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const { view } = useRun();

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      <Sidebar />
      <CardDetail />
      <main className="flex-1 flex flex-col min-w-0 bg-background/50 overflow-hidden text-text">
        {view === 'compendium' && <CardGrid />}
        {view === 'starter-selection' && <NewRunWizard />}
        {view === 'run-hub' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="inline-block px-4 py-1 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4">Run Initialization Successful</div>
              <h2 className="text-7xl font-black italic tracking-tighter text-white">RUN ACTIVE</h2>
              <p className="text-text-muted uppercase font-bold tracking-[0.3em] max-w-md mx-auto leading-loose text-xs text-center">Your starter deck has been synchronized. Deck progression and match mechanics coming in Stage 4.</p>
              <div className="pt-8 flex gap-4 justify-center text-center">
                <button onClick={() => window.location.reload()} className="px-10 py-4 border-2 border-primary text-primary font-black uppercase text-[11px] tracking-[0.2em] hover:bg-primary hover:text-black transition-all">Terminate Run</button>
                <button onClick={() => console.log('Viewing Deck...')} className="px-10 py-4 bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] hover:bg-primary transition-all">View Deck</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <FormatProvider>
        <UIProvider>
          <RunProvider>
            <AppContent />
          </RunProvider>
        </UIProvider>
      </FormatProvider>
    </ErrorBoundary>
  );
}

export default App;
