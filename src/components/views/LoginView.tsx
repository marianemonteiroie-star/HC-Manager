import React, { useState } from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Lock, Activity, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LoginView() {
  const { login } = useMaintenance();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (digit: string) => {
    setError(false);
    if (passkey.length < 4) {
      setPasskey((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setError(false);
    setPasskey((prev) => prev.slice(0, -1));
  };

  const checkPasskey = (currentPasskey: string) => {
    if (currentPasskey === '4321') {
      login('Administrator');
    } else if (currentPasskey === '0000') {
      login('Operator');
    } else {
      setError(true);
      setPasskey('');
    }
  };

  React.useEffect(() => {
    if (passkey.length === 4) {
      checkPasskey(passkey);
    }
  }, [passkey]);

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20 mb-4 animate-in zoom-in duration-500">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-text-primary-dark uppercase">
            Perfusion <span className="text-brand">HC</span>
          </h1>
          <p className="text-text-muted text-sm mt-2">Enter Passkey to Access</p>
        </div>

        <Card className="border-border dark:border-border-dark shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full transition-all duration-300",
                    i < passkey.length 
                      ? "bg-brand scale-110" 
                      : "bg-neutral-200 dark:bg-neutral-800",
                    error && "bg-rose-500 animate-pulse"
                  )}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center text-rose-500 text-xs font-semibold uppercase tracking-wider mb-4 animate-in fade-in zoom-in slide-in-from-bottom-2">
                <AlertCircle className="w-4 h-4 mr-1" />
                Invalid Passkey
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="h-14 rounded-2xl text-xl font-medium bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors border border-neutral-100 dark:border-neutral-800 border-b-4 active:border-b active:translate-y-[3px]"
                >
                  {num}
                </button>
              ))}
              <div className="col-span-1 border border-transparent"></div> {/* Empty space */}
              <button
                onClick={() => handleKeyPress('0')}
                className="col-span-1 h-14 rounded-2xl text-xl font-medium bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors border border-neutral-100 dark:border-neutral-800 border-b-4 active:border-b active:translate-y-[3px]"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="col-span-1 h-14 rounded-2xl text-[13px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors border border-rose-100 dark:border-rose-900/50 border-b-4 active:border-b active:translate-y-[3px] flex items-center justify-center"
              >
                DEL
              </button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
