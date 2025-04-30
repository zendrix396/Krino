import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SpotlightCard from './SpotlightCard';
import GradientText from './GradientText';
import loanPredictionService from '../services/api';

const LoanPredictionForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const resultRef = useRef(null);
  const [formData, setFormData] = useState({
    person_age: 27,
    person_income: 50000,
    person_home_ownership: 'RENT',
    person_emp_length: 5.0,
    loan_intent: 'PERSONAL',
    loan_grade: 'C',
    loan_amnt: 15000,
    loan_int_rate: 12.5,
    loan_percent_income: 0.3,
    cb_person_default_on_file: 'N',
    cb_person_cred_hist_length: 4
  });

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();

    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Scroll to result when it becomes available
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      await loanPredictionService.checkApiStatus();
      setServerStatus('online');
    } catch (error) {
      console.error('Server connection failed:', error);
      setServerStatus('offline');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert number inputs
    if (['person_age', 'person_income', 'loan_amnt', 'cb_person_cred_hist_length'].includes(name)) {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else if (['person_emp_length', 'loan_int_rate', 'loan_percent_income'].includes(name)) {
      setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If server is offline, prompt user to retry
    if (serverStatus === 'offline') {
      // Instead of confirm, show a temporary message
      setResult({
        error: true,
        message: 'Trying to connect to server...'
      });
      
      await checkServerStatus();
      if (serverStatus !== 'online') {
        setResult({
          error: true,
          message: 'Server is currently unreachable. Please ensure the API service is running.'
        });
        return;
      }
    }
    
    setIsLoading(true);
    setResult(null);

    try {
      // First, try to get API status
      try {
        await loanPredictionService.checkApiStatus();
      } catch (error) {
        // If API is down, try to train model anyway in case it comes back up
        console.warn('API check failed, will try prediction anyway');
      }

      // Make prediction
      const predictionResult = await loanPredictionService.predictLoanDefault(formData);
      setResult(predictionResult);
      setServerStatus('online');
    } catch (error) {
      console.error('Error predicting loan status:', error);
      
      let errorMessage = 'An error occurred during prediction.';
      
      // Show more specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to the server. The API service might be temporarily unavailable.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Server request timed out. The server might be overloaded.';
      } else if (error.message.includes('API Error')) {
        errorMessage = `Server error: ${error.message}`;
      }
      
      setResult({
        error: true,
        message: errorMessage
      });
      setServerStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate button states based on form values
  const isHighRisk = formData.loan_int_rate > 15 || 
                     formData.loan_percent_income > 0.5 || 
                     (formData.cb_person_default_on_file === 'Y' && formData.loan_grade > 'C');

  return (
    <SpotlightCard 
      className="w-full max-w-4xl mx-auto p-6 md:p-8"
      spotlightColor="rgba(0, 229, 255, 0.15)"
      auroraColors={["#3A29FF", "#FF94B4", "#FF3232"]}
    >
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={3}
            className="text-3xl md:text-4xl lg:text-5xl font-bold"
          >
            CredSetu
          </GradientText>
        </h1>
        <p className="text-blue-100/70 mt-4 mb-2">AI-powered loan default prediction</p>
        
        {/* Server status indicator */}
        <div className="flex items-center justify-center mt-2">
          <div 
            className={`h-2 w-2 rounded-full mr-2 ${
              serverStatus === 'online' 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse' 
                : serverStatus === 'offline' 
                  ? 'bg-gradient-to-r from-red-400 to-red-600 animate-pulse' 
                  : 'bg-gradient-to-r from-yellow-300 to-amber-500 animate-pulse'
            }`}
          />
          <span className="text-xs text-blue-100/60 tracking-wide">
            {serverStatus === 'online' ? 'Server online' : 
             serverStatus === 'offline' ? 'Server offline' : 'Checking server status...'}
          </span>
          {serverStatus === 'offline' && (
            <button 
              onClick={checkServerStatus}
              className="ml-2 text-xs underline text-blue-300/80 hover:text-blue-300"
              type="button"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-200">Personal Information</h2>
            
            <div>
              <label className="block text-blue-100 text-sm mb-1">Age</label>
              <input 
                type="number" 
                name="person_age"
                value={formData.person_age}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            
            <div>
              <label className="block text-blue-100 text-sm mb-1">Annual Income</label>
              <input 
                type="number"
                name="person_income"
                value={formData.person_income}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            
            <div>
              <label className="block text-blue-100 text-sm mb-1">Home Ownership</label>
              <select 
                name="person_home_ownership"
                value={formData.person_home_ownership}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              >
                <option value="RENT">Rent</option>
                <option value="MORTGAGE">Mortgage</option>
                <option value="OWN">Own</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-100 text-sm mb-1">Employment Length (years)</label>
              <input 
                type="number" 
                step="0.1"
                name="person_emp_length"
                value={formData.person_emp_length}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-blue-100 text-sm mb-1">Has Defaulted Before</label>
              <select 
                name="cb_person_default_on_file"
                value={formData.cb_person_default_on_file}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-100 text-sm mb-1">Credit History Length (years)</label>
              <input 
                type="number"
                name="cb_person_cred_hist_length"
                value={formData.cb_person_cred_hist_length}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
          </div>

          {/* Loan Details Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-200">Loan Details</h2>
            
            <div>
              <label className="block text-blue-100 text-sm mb-1">Loan Intent</label>
              <select 
                name="loan_intent"
                value={formData.loan_intent}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              >
                <option value="PERSONAL">Personal</option>
                <option value="EDUCATION">Education</option>
                <option value="MEDICAL">Medical</option>
                <option value="VENTURE">Venture</option>
                <option value="HOMEIMPROVEMENT">Home Improvement</option>
                <option value="DEBTCONSOLIDATION">Debt Consolidation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-blue-100 text-sm mb-1">Loan Grade</label>
              <select 
                name="loan_grade"
                value={formData.loan_grade}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              >
                <option value="A">A - Excellent</option>
                <option value="B">B - Good</option>
                <option value="C">C - Fair</option>
                <option value="D">D - Poor</option>
                <option value="E">E - Bad</option>
                <option value="F">F - Very Bad</option>
                <option value="G">G - Terrible</option>
              </select>
            </div>
            
            <div>
              <label className="block text-blue-100 text-sm mb-1">Loan Amount</label>
              <input 
                type="number"
                name="loan_amnt"
                value={formData.loan_amnt}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            
            <div>
              <label className="block text-blue-100 text-sm mb-1">Interest Rate (%)</label>
              <input 
                type="number" 
                step="0.01"
                name="loan_int_rate"
                value={formData.loan_int_rate}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            
            <div>
              <label className="block text-blue-100 text-sm mb-1">Loan Percent Income</label>
              <input 
                type="number" 
                step="0.01"
                min="0" 
                max="1"
                name="loan_percent_income"
                value={formData.loan_percent_income}
                onChange={handleInputChange}
                className="w-full bg-black/30 text-white border border-blue-500/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
              <p className="text-xs text-blue-200/70 mt-1">Ratio of loan amount to annual income (0-1)</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <motion.button
            type="submit"
            className={`w-full py-3 px-4 rounded-md font-bold text-white 
              ${isHighRisk 
                ? 'bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-size-200 animate-gradient' 
                : 'bg-gradient-to-r from-blue-500 via-teal-400 to-blue-500 bg-size-200 animate-gradient'} 
              transition-all duration-300 ease-in-out`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || serverStatus === 'checking'}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : serverStatus === 'offline' ? (
              "Connect & Predict"
            ) : (
              "Predict Loan Status"
            )}
          </motion.button>
        </div>
      </form>

      {/* Results Section */}
      {result && (
        <motion.div 
          ref={resultRef}
          className="mt-10 border border-blue-500/30 rounded-lg p-6 bg-black/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa"]}
            className="text-xl font-bold mb-4"
          >
            Prediction Result
          </GradientText>
          
          {result.error ? (
            <div className="text-red-400">{result.message}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                <span className="text-blue-100">Loan Status:</span>
                <span className={`font-bold text-lg ${
                  result.loan_status === 'Default' 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-300 to-red-400 bg-size-200 animate-gradient' 
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-300 to-green-400 bg-size-200 animate-gradient'
                }`}>
                  {result.loan_status}
                </span>
              </div>
              <div className="flex flex-col p-3 bg-black/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-100">Default Probability:</span>
                  <span className="font-mono font-bold">{(result.default_probability * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getColorForProbability(result.default_probability)}`}
                    style={{ 
                      width: `${result.default_probability * 100}%`,
                      transition: 'width 1s ease-out' 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="p-3 bg-black/30 rounded-lg">
                <p className="text-white/80 text-sm">
                  {result.loan_status === 'Default' 
                    ? `This loan has a high probability (${(result.default_probability * 100).toFixed(1)}%) of defaulting based on the provided information. Consider additional verification or collateral.`
                    : `This loan has a low probability (${(result.default_probability * 100).toFixed(1)}%) of defaulting based on the provided information.`
                  }
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </SpotlightCard>
  );
};

function getColorForProbability(probability) {
  if (probability < 0.3) return 'bg-gradient-to-r from-green-500 to-green-400';
  if (probability < 0.6) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
  return 'bg-gradient-to-r from-red-600 to-red-500';
}

export default LoanPredictionForm; 