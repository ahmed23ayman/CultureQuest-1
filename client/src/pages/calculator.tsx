import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface CalculatorState {
  display: string;
  previousValue: string;
  operation: string | null;
  waitingForOperand: boolean;
  error: string | null;
}

export default function Calculator() {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: '',
    operation: null,
    waitingForOperand: false,
    error: null,
  });

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const showError = (message: string) => {
    setState(prev => ({ ...prev, error: message }));
    setTimeout(() => {
      clearError();
    }, 3000);
  };

  const handleNumber = (num: string) => {
    clearError();
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: num,
          waitingForOperand: false,
        };
      }
      return {
        ...prev,
        display: prev.display === '0' ? num : prev.display + num,
      };
    });
  };

  const handleDecimal = () => {
    clearError();
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: '0.',
          waitingForOperand: false,
        };
      }
      if (prev.display.indexOf('.') === -1) {
        return {
          ...prev,
          display: prev.display + '.',
        };
      }
      return prev;
    });
  };

  const handleClear = () => {
    setState({
      display: '0',
      previousValue: '',
      operation: null,
      waitingForOperand: false,
      error: null,
    });
  };

  const handleDelete = () => {
    clearError();
    setState(prev => {
      if (prev.display.length > 1) {
        return {
          ...prev,
          display: prev.display.slice(0, -1),
        };
      }
      return {
        ...prev,
        display: '0',
      };
    });
  };

  const handlePercentage = () => {
    clearError();
    setState(prev => ({
      ...prev,
      display: (parseFloat(prev.display) / 100).toString(),
    }));
  };

  const handleSquareRoot = () => {
    clearError();
    setState(prev => {
      const value = parseFloat(prev.display);
      if (value < 0) {
        showError('لا يمكن حساب الجذر التربيعي لعدد سالب');
        return prev;
      }
      return {
        ...prev,
        display: Math.sqrt(value).toString(),
        waitingForOperand: true,
      };
    });
  };

  const calculate = (firstOperand: string, secondOperand: string, operation: string): string => {
    const first = parseFloat(firstOperand);
    const second = parseFloat(secondOperand);

    if (isNaN(first) || isNaN(second)) {
      throw new Error('قيم غير صحيحة');
    }

    switch (operation) {
      case '+':
        return (first + second).toString();
      case '-':
        return (first - second).toString();
      case '×':
        return (first * second).toString();
      case '÷':
        if (second === 0) {
          throw new Error('لا يمكن القسمة على صفر');
        }
        return (first / second).toString();
      default:
        throw new Error('عملية غير مدعومة');
    }
  };

  const handleOperation = (nextOperation: string) => {
    clearError();
    setState(prev => {
      if (prev.operation && !prev.waitingForOperand) {
        try {
          const result = calculate(prev.previousValue, prev.display, prev.operation);
          return {
            ...prev,
            display: result,
            previousValue: result,
            operation: nextOperation,
            waitingForOperand: true,
          };
        } catch (error) {
          showError(error instanceof Error ? error.message : 'خطأ في العملية');
          return prev;
        }
      }
      return {
        ...prev,
        previousValue: prev.display,
        operation: nextOperation,
        waitingForOperand: true,
      };
    });
  };

  const handleEquals = () => {
    clearError();
    setState(prev => {
      if (prev.operation && !prev.waitingForOperand) {
        try {
          const result = calculate(prev.previousValue, prev.display, prev.operation);
          return {
            ...prev,
            display: result,
            previousValue: '',
            operation: null,
            waitingForOperand: true,
          };
        } catch (error) {
          showError(error instanceof Error ? error.message : 'خطأ في العملية');
          return prev;
        }
      }
      return prev;
    });
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === '+') {
        handleOperation('+');
      } else if (e.key === '-') {
        handleOperation('-');
      } else if (e.key === '*') {
        handleOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'r' || e.key === 'R') {
        handleSquareRoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getExpressionText = () => {
    if (state.operation && state.previousValue) {
      return `${state.previousValue} ${state.operation}`;
    }
    return '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--calculator-bg)' }}>
      <div className="w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:text-purple-300"
              >
                <Home className="h-4 w-4 mr-2" />
                الرئيسية
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            آلة حاسبة
          </h1>
          <p className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10" style={{ color: 'var(--calculator-text-muted)' }}>
            أحمد أيمن
          </p>
        </div>

        {/* Calculator Container */}
        <div className="calculator-surface rounded-3xl shadow-2xl overflow-hidden" style={{ boxShadow: 'var(--calculator-shadow)' }}>
          {/* Display Screen */}
          <div className="calculator-display p-8 border-b border-white/10">
            {/* Current Expression */}
            <div className="text-right mb-2 h-6">
              <span className="text-sm font-mono" style={{ color: 'var(--calculator-text-muted)' }}>
                {getExpressionText()}
              </span>
            </div>
            
            {/* Main Display */}
            <div className="text-right">
              <input 
                type="text" 
                className="w-full bg-transparent text-5xl font-mono text-right border-none outline-none cursor-default font-bold tracking-wide"
                value={state.display}
                readOnly
                style={{ color: 'var(--calculator-text)', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
              />
            </div>

            {/* Error Message */}
            <div className="text-right mt-2 h-5">
              {state.error && (
                <span className="text-xs font-medium" style={{ color: 'var(--calculator-error)' }}>
                  {state.error}
                </span>
              )}
            </div>
          </div>

          {/* Button Grid */}
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4">
              {/* Row 1: Clear, Delete, Square Root, Division */}
              <button className="calculator-btn secondary-btn" onClick={handleClear}>
                <span className="text-lg">C</span>
              </button>
              
              <button className="calculator-btn secondary-btn" onClick={handleDelete}>
                <span className="text-lg">⌫</span>
              </button>
              
              <button className="calculator-btn secondary-btn" onClick={handleSquareRoot}>
                <span className="text-lg">√</span>
              </button>
              
              <button className="calculator-btn operator-btn" onClick={() => handleOperation('÷')}>
                <span className="text-xl">÷</span>
              </button>

              {/* Row 2: 7, 8, 9, Multiplication */}
              <button className="calculator-btn number-btn" onClick={() => handleNumber('7')}>
                <span className="text-xl">7</span>
              </button>
              
              <button className="calculator-btn number-btn" onClick={() => handleNumber('8')}>
                <span className="text-xl">8</span>
              </button>
              
              <button className="calculator-btn number-btn" onClick={() => handleNumber('9')}>
                <span className="text-xl">9</span>
              </button>
              
              <button className="calculator-btn operator-btn" onClick={() => handleOperation('×')}>
                <span className="text-xl">×</span>
              </button>

              {/* Row 3: 4, 5, 6, Subtraction */}
              <button className="calculator-btn number-btn" onClick={() => handleNumber('4')}>
                <span className="text-xl">4</span>
              </button>
              
              <button className="calculator-btn number-btn" onClick={() => handleNumber('5')}>
                <span className="text-xl">5</span>
              </button>
              
              <button className="calculator-btn number-btn" onClick={() => handleNumber('6')}>
                <span className="text-xl">6</span>
              </button>
              
              <button className="calculator-btn operator-btn" onClick={() => handleOperation('-')}>
                <span className="text-xl">-</span>
              </button>

              {/* Row 4: 1, 2, 3, Addition */}
              <button className="calculator-btn number-btn" onClick={() => handleNumber('1')}>
                <span className="text-xl">1</span>
              </button>
              
              <button className="calculator-btn number-btn" onClick={() => handleNumber('2')}>
                <span className="text-xl">2</span>
              </button>
              
              <button className="calculator-btn number-btn" onClick={() => handleNumber('3')}>
                <span className="text-xl">3</span>
              </button>
              
              <button className="calculator-btn operator-btn" onClick={() => handleOperation('+')}>
                <span className="text-xl">+</span>
              </button>

              {/* Row 5: 0, Decimal, Percentage, Equals */}
              <button className="calculator-btn number-btn" onClick={() => handleNumber('0')}>
                <span className="text-xl">0</span>
              </button>
              
              <button className="calculator-btn number-btn" onClick={handleDecimal}>
                <span className="text-xl">.</span>
              </button>
              
              <button className="calculator-btn secondary-btn" onClick={handlePercentage}>
                <span className="text-lg">%</span>
              </button>
              
              <button className="calculator-btn equals-btn" onClick={handleEquals}>
                <span className="text-xl">=</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs">
          <p className="px-4 py-2 rounded-full bg-gradient-to-r from-gray-500/10 to-gray-600/10 backdrop-blur-sm border border-white/5" style={{ color: 'var(--calculator-text-muted)' }}>
            © 2024 أحمد أيمن - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
