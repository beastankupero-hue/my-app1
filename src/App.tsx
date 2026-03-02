import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { QuickAddModal } from './components/QuickAddModal';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { FocusMode } from './pages/FocusMode';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          setQuickAddOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setQuickAddOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onQuickAdd={() => setQuickAddOpen(true)} />;
      case 'tasks':
        return <Tasks />;
      case 'focus':
        return <FocusMode />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onQuickAdd={() => setQuickAddOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAdded={() => {
          if (currentPage === 'dashboard' || currentPage === 'tasks') {
            window.location.reload();
          }
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;