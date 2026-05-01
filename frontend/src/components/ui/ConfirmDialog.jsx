import { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false });
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const confirm = useCallback((options) => {
    return new Promise(resolve => {
      setState({
        open: true,
        ...options,
        resolve
      });
    });
  }, []);

  const handleClose = (result) => {
    if (state.resolve) state.resolve(result);
    setState({ open: false });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in-up"
          onClick={() => handleClose(false)}>
          <div onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 card-floating relative">
            <button
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                state.danger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              }`}>
                <FiAlertTriangle size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                  {state.title || (isUrdu ? 'تصدیق کریں' : 'Are you sure?')}
                </h3>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                  {state.message}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6 justify-end">
              <button
                onClick={() => handleClose(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition"
              >
                {state.cancelText || (isUrdu ? 'منسوخ' : 'Cancel')}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`px-5 py-2.5 text-white rounded-xl font-semibold text-sm transition ${
                  state.danger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {state.confirmText || (isUrdu ? 'جی ہاں' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
