import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  const styles = {
    success: 'bg-[#17191c] text-white border-[#333]',
    error: 'bg-[#5d2a1a] text-[#fbe1d1] border-[#7d3a24]',
    info: 'bg-[#17191c] text-white border-[#333]'
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#fbe1d1] shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-[#fbe1d1] shrink-0" />,
    info: <Info className="w-4 h-4 text-[#fbe1d1] shrink-0" />
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full border shadow-xl text-xs font-medium max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200 ${styles[type]}`}>
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

