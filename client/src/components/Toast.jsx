import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
    if (!toast) return null;

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />
    };

    const borders = {
        success: 'border-emerald-500/30 bg-slate-900/95 text-slate-100',
        error: 'border-rose-500/30 bg-slate-900/95 text-slate-100',
        warning: 'border-amber-500/30 bg-slate-900/95 text-slate-100',
        info: 'border-indigo-500/30 bg-slate-900/95 text-slate-100'
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl ${borders[toast.type || 'info']} min-w-[280px] max-w-md`}>
                {icons[toast.type || 'info']}
                <p className="text-sm font-medium flex-1">{toast.message}</p>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Toast;
