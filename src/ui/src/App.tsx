import { Sidebar } from './components/Sidebar';
import { CardGrid } from './components/MainContent';
import { StarterSelection } from './components/StarterSelection';
import { FormatProvider } from './context/FormatContext';
import { RunProvider, useRun } from './context/RunContext';

const AppContent = () => {
  const { view, activeRun } = useRun();

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-background/50 overflow-hidden">
        {view === 'compendium' && <CardGrid />}
        {view === 'starter-selection' && <StarterSelection />}
        {view === 'run-hub' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6">
              <h2 className="text-5xl font-black italic tracking-tighter text-primary">RUN ACTIVE</h2>
              <p className="text-text-muted uppercase font-bold tracking-[0.3em]">Deck progression mechanics coming in Stage 4</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-3 border border-primary text-primary font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-black transition-all"
              >
                ABANDON RUN
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <FormatProvider>
      <RunProvider>
        <AppContent />
      </RunProvider>
    </FormatProvider>
  );
}

export default App;
