import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiAccount, mdiAlertCircle, mdiLoading } from '@mdi/js';
import { supabase } from '../lib/supabase';

interface EmployeeLoginProps {
  onLoginSuccess: (employeeId: string, userName: string) => void;
}

export default function EmployeeLogin({ onLoginSuccess }: EmployeeLoginProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    setInput(value);
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
        setError('Please enter your employee ID');
        return;
    }

    // Format with EID prefix
    const employeeId = `EID${input}`;
    setIsLoading(true);
    setError('');

    try {
        // Check if user exists in database
        const { data, error: queryError } = await supabase
        .from('users')
        .select('employee_id, name')
        .eq('employee_id', employeeId)
        .returns<{ employee_id: string; name: string }[]>()
        .single();

        if (queryError || !data) {
        setError('Employee ID not found. Please check your ID or contact your administrator.');
        setIsLoading(false);
        return;
        }

        // Store in localStorage
        localStorage.setItem('employee_id', data.employee_id);
        localStorage.setItem('employee_name', data.name);

        // Success!
        onLoginSuccess(data.employee_id, data.name);
    } catch (err) {
        console.error('Login error:', err);
        setError('Connection error. Please check your internet connection and try again.');
        setIsLoading(false);
    }
    };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#b55609] to-[#d67a2e] flex items-center justify-center shadow-lg">
            <Icon path={mdiAccount} size={2} className="text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Banquet Power Simulator
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Enter your employee ID to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Field */}
          <div>
            <label htmlFor="employee-id" className="block text-sm font-medium text-gray-300 mb-2">
              Employee ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg font-medium">EID</span>
              </div>
              <input
                id="employee-id"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={input}
                onChange={handleInputChange}
                placeholder="123456"
                disabled={isLoading}
                className="w-full pl-16 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#b55609] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                autoComplete="off"
                autoFocus
              />
            </div>
            {input && (
              <p className="mt-2 text-sm text-gray-400">
                Full ID: <span className="text-white font-medium">EID{input}</span>
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <Icon path={mdiAlertCircle} size={0.9} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-full py-4 bg-gradient-to-r from-[#b55609] to-[#d67a2e] text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Icon path={mdiLoading} size={1} className="animate-spin" />
                Verifying...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an employee ID?<br />
          Contact your administrator to get registered.
        </p>
      </div>
    </div>
  );
}