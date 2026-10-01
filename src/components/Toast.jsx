import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const Ctx = createContext();

const MAX_TOASTS = 3;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const show = useCallback((msg, typeOrOptions = 'info', maybeOptions = {}) => {
    const isOptionsObj = typeof typeOrOptions === 'object' && typeOrOptions !== null;
    const options = isOptionsObj ? typeOrOptions : (maybeOptions || {});
    const type = (typeof typeOrOptions === 'string' && typeOrOptions)
      ? typeOrOptions
      : (options.type || 'info');
    const duration = typeof options.duration === 'number' ? options.duration : 2800;
    const action = options.action;

    const id = Date.now() + Math.random();

    setToasts(p => {
      const next = [...p, { id, msg, type, action }];

      if (next.length > MAX_TOASTS) {
        const removed = next.slice(0, next.length - MAX_TOASTS);

        removed.forEach(t => {
          const timer = timersRef.current.get(t.id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(t.id);
          }
        });

        return next.slice(-MAX_TOASTS);
      }

      return next;
    });

    const timer = setTimeout(() => {
      timersRef.current.delete(id);
      setToasts(p => p.filter(t => t.id !== id));
    }, duration);

    timersRef.current.set(id, timer);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            {t.msg}
            {t.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  try {
                    t.action.onClick?.();
                  } finally {
                    dismiss(t.id);
                  }
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);