import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Lock, Eye, EyeOff, ArrowRight, Delete, AlertCircle } from 'lucide-react';
import FooterCopyright from './FooterCopyright';

interface AdminPinLockProps {
  onUnlock: () => void;
}

const CORRECT_PIN = '123458';

export default function AdminPinLock({ onUnlock }: AdminPinLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === CORRECT_PIN) {
      localStorage.setItem('asado_admin_auth', 'true');
      sessionStorage.setItem('asado_admin_auth', 'true');
      setError(null);
      onUnlock();
    } else {
      setIsShaking(true);
      setError('Incorrect security PIN. Please try again.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 600);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length >= 6) return;
    setError(null);
    const nextPin = pin + digit;
    setPin(nextPin);
    if (nextPin.length === 6) {
      setTimeout(() => verifyPin(nextPin), 100);
    }
  };

  const handleBackspace = () => {
    setError(null);
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(null);
    setPin('');
  };

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (pin.length === 6) {
          verifyPin(pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl uppercase tracking-tight text-white leading-tight">
              Asado Admin
            </h1>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 block">
              Management Portal
            </span>
          </div>
        </div>

        {/* Security Card */}
        <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-amber-400 mb-4">
            <Lock className="w-5 h-5" />
          </div>

          <h2 className="text-lg font-bold text-white mb-1 text-center">Admin Access Required</h2>
          <p className="text-xs text-neutral-400 text-center mb-6">
            Please enter your 6-digit security PIN to unlock the management dashboard.
          </p>

          {/* PIN Indicators */}
          <div 
            className={`flex items-center justify-center gap-3 mb-4 transition-transform ${
              isShaking ? 'animate-shake' : ''
            }`}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const hasDigit = pin.length > index;
              const digitVal = pin[index];
              return (
                <div
                  key={index}
                  className={`w-11 h-12 rounded-xl border flex items-center justify-center text-lg font-mono font-bold transition-all duration-200 ${
                    hasDigit
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/20 scale-105'
                      : 'border-neutral-700/80 bg-neutral-950/60 text-neutral-600'
                  }`}
                >
                  {hasDigit ? (showPin ? digitVal : '•') : ''}
                </div>
              );
            })}
          </div>

          {/* Show / Hide PIN Toggle */}
          <div className="flex items-center justify-between w-full px-2 mb-4">
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPin ? 'Hide PIN' : 'Show PIN'}</span>
            </button>
            {pin.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/60 px-3 py-2 rounded-xl w-full mb-4 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px] mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigitPress(digit)}
                className="h-13 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700 active:bg-amber-500 active:text-neutral-950 text-white font-semibold text-xl border border-neutral-700/60 transition-all flex items-center justify-center shadow-xs cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-13 rounded-2xl bg-neutral-800/40 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider border border-neutral-800 transition-all flex items-center justify-center cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigitPress('0')}
              className="h-13 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700 active:bg-amber-500 active:text-neutral-950 text-white font-semibold text-xl border border-neutral-700/60 transition-all flex items-center justify-center shadow-xs cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-13 rounded-2xl bg-neutral-800/40 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-all flex items-center justify-center cursor-pointer"
              title="Delete last digit"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => verifyPin(pin)}
            disabled={pin.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20"
          >
            <span>Unlock Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Back Link to Customer Website */}
        <Link
          to="/"
          className="mt-6 text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1 py-1"
        >
          <span>&larr; Return to Customer Website</span>
        </Link>

        {/* Footer Copyright */}
        <div className="mt-8 pt-4 border-t border-neutral-800 text-center">
          <FooterCopyright className="text-neutral-500 text-xs" />
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
