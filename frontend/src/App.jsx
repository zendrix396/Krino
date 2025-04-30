import { useEffect } from 'react';
import LoanPredictionForm from './components/LoanPredictionForm';

function App() {
  useEffect(() => {
    document.body.classList.add('bg-black');
    
    return () => {
      document.body.classList.remove('bg-black');
    };
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 relative text-white overflow-hidden">
      {/* Main content */}
      <div className="relative z-20">
        <LoanPredictionForm />
      </div>
    </div>
  );
}

export default App;
