import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { useState } from 'react';

export const QRCodeModal = ({ url, title, onClose, onCopy }) => {
    const [copied, setCopied] = useState(false);

    if (!url) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        if (onCopy) onCopy();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-slate-700/60 shadow-2xl text-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <QrCode className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-white mb-1">Mobile QR Share</h3>
                <p className="text-xs text-slate-400 mb-6 truncate px-2">{title || 'Scan to download file'}</p>

                <div className="p-4 bg-white rounded-xl inline-block shadow-inner mb-6">
                    <QRCodeSVG value={url} size={180} level="M" />
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-emerald-300" />
                                <span>Link Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span>Copy Share Link</span>
                            </>
                        )}
                    </button>

                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Direct Link</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;
