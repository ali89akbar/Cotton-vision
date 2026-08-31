import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import './notification.css';

// ─── Icons (inline SVG, no extra deps) ──────────────────────────────────────
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ─── Reducer ─────────────────────────────────────────────────────────────────
const initialState = { modals: [], toasts: [] };
let _modalId = 0;
let _toastId = 0;

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_MODAL':
      return { ...state, modals: [...state.modals, action.payload] };
    case 'REMOVE_MODAL':
      return { ...state, modals: state.modals.filter(m => m.id !== action.payload) };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside NotificationProvider');
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openModal = useCallback((config) => {
    return new Promise((resolve) => {
      const id = ++_modalId;
      const modal = { id, resolve, ...config };
      dispatch({ type: 'ADD_MODAL', payload: modal });
    });
  }, []);

  const alert = useCallback((title, message, options = {}) => {
    return openModal({ variant: 'alert', title, message, ...options });
  }, [openModal]);

  const confirm = useCallback((title, message, options = {}) => {
    return openModal({ variant: 'confirm', title, message, ...options });
  }, [openModal]);

  const info = useCallback((title, message, options = {}) => {
    return openModal({ variant: 'info', title, message, ...options });
  }, [openModal]);

  const closeModal = useCallback((id, result) => {
    const modal = state.modals.find(m => m.id === id);
    if (modal && modal.resolve) modal.resolve(result);
    dispatch({ type: 'REMOVE_MODAL', payload: id });
  }, [state.modals]);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const toast = useCallback((message, variant = 'success', duration = 4000) => {
    const id = ++_toastId;
    dispatch({ type: 'ADD_TOAST', payload: { id, message, variant, duration } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), duration);
  }, []);

  const success = useCallback((msg, dur) => toast(msg, 'success', dur), [toast]);
  const error   = useCallback((msg, dur) => toast(msg, 'error', dur),   [toast]);
  const warning = useCallback((msg, dur) => toast(msg, 'warning', dur), [toast]);

  const value = { alert, confirm, info, closeModal, toast, success, error, warning };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render active modals */}
      {state.modals.map(modal => (
        <ModalOverlay key={modal.id} modal={modal} onClose={closeModal} />
      ))}
      {/* Toast container */}
      <div className="pw-toast-container" aria-live="polite" aria-atomic="true">
        {state.toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dispatch({ type: 'REMOVE_TOAST', payload: t.id })} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// ─── Modal Overlay ───────────────────────────────────────────────────────────
const ModalOverlay = ({ modal, onClose }) => {
  const { id, variant, title, message, confirmText, cancelText, dangerConfirm } = modal;
  const overlayRef = useRef(null);
  const dialogRef  = useRef(null);

  // Focus trap + ESC key
  useEffect(() => {
    const el = dialogRef.current;
    if (el) {
      const focusable = el.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      first && first.focus();

      const trapFocus = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last && last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first && first.focus(); }
        }
        if (e.key === 'Escape') onClose(id, false);
      };
      document.addEventListener('keydown', trapFocus);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', trapFocus);
        document.body.style.overflow = '';
      };
    }
  }, [id, onClose]);

  const handleBackdrop = (e) => {
    if (e.target === overlayRef.current) onClose(id, false);
  };

  const accentColor =
    variant === 'confirm' ? (dangerConfirm ? 'var(--pw-danger)' : 'var(--pw-primary)') :
    variant === 'info'    ? 'var(--pw-info)' :
    'var(--pw-primary)';

  const iconNode =
    variant === 'confirm' ? (dangerConfirm ? <IconAlert /> : <IconInfo />) :
    variant === 'info'    ? <IconInfo /> :
    <IconInfo />;

  return (
    <div className="pw-modal-overlay" ref={overlayRef} onClick={handleBackdrop} role="presentation">
      <div
        className="pw-modal-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`pw-modal-title-${id}`}
        style={{ '--accent': accentColor }}
      >
        <div className="pw-modal-icon-ring" style={{ background: accentColor + '1a', color: accentColor }}>
          {iconNode}
        </div>

        <h2 id={`pw-modal-title-${id}`} className="pw-modal-title">{title}</h2>
        {message && <p className="pw-modal-message">{message}</p>}

        <div className="pw-modal-actions">
          {variant === 'confirm' ? (
            <>
              <button
                className="pw-btn pw-btn-secondary"
                onClick={() => onClose(id, false)}
              >
                {cancelText || 'Cancel'}
              </button>
              <button
                className={`pw-btn pw-btn-primary ${dangerConfirm ? 'pw-btn-danger' : ''}`}
                onClick={() => onClose(id, true)}
              >
                {confirmText || 'Confirm'}
              </button>
            </>
          ) : (
            <button
              className="pw-btn pw-btn-primary"
              onClick={() => onClose(id, true)}
              style={{ background: accentColor }}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Toast Item ──────────────────────────────────────────────────────────────
const TOAST_ICON = { success: <IconCheck />, error: <IconX />, warning: <IconAlert />, info: <IconInfo /> };
const TOAST_CLASS = {
  success: 'pw-toast-success',
  error:   'pw-toast-error',
  warning: 'pw-toast-warning',
  info:    'pw-toast-info',
};

const ToastItem = ({ toast: t, onDismiss }) => {
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    // Trigger entrance animation on mount
    const raf = requestAnimationFrame(() => setVisible(true));
    // Schedule exit animation before auto-remove
    const exitTimer = setTimeout(() => setVisible(false), t.duration - 300);
    return () => { cancelAnimationFrame(raf); clearTimeout(exitTimer); };
  }, [t.duration]);

  return (
    <div
      className={`pw-toast ${TOAST_CLASS[t.variant] || TOAST_CLASS.info} ${visible ? 'pw-toast-visible' : ''}`}
      role="alert"
    >
      <span className="pw-toast-icon">{TOAST_ICON[t.variant]}</span>
      <span className="pw-toast-text">{t.message}</span>
      <button className="pw-toast-close" onClick={onDismiss} aria-label="Dismiss notification">&times;</button>
    </div>
  );
};
