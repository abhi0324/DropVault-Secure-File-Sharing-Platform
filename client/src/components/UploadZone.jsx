import React, { useState, useRef } from 'react';
import { uploadFile } from '../service/api';
import { useAuth } from '../context/AuthContext';
import { 
    UploadCloud, 
    File, 
    Shield, 
    KeyRound, 
    Flame, 
    Clock, 
    Eye, 
    EyeOff, 
    Copy, 
    Check, 
    QrCode, 
    X, 
    Layers, 
    Lock, 
    Download, 
    Info, 
    Sparkles 
} from 'lucide-react';

export const UploadZone = ({ showToast, onUploadSuccess, openQRModal }) => {
    const { isAuthenticated, openRegister } = useAuth();

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copiedId, setCopiedId] = useState(null);

    // Advanced Security Settings
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [expiresInDays, setExpiresInDays] = useState('7');
    const [maxDownloads, setMaxDownloads] = useState('');
    const [burnAfterReading, setBurnAfterReading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const fileInputRef = useRef(null);
    const MAX_SIZE_MB = 25;

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileSelect = (e) => {
        const incoming = Array.from(e.target.files || []);
        processFiles(incoming);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const incoming = Array.from(e.dataTransfer.files || []);
        processFiles(incoming);
    };

    const processFiles = (newFiles) => {
        const validList = [];
        for (const file of newFiles) {
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                showToast(`File "${file.name}" exceeds ${MAX_SIZE_MB}MB limit`, 'error');
                continue;
            }
            validList.push(file);
        }

        if (validList.length + selectedFiles.length > 10) {
            showToast('You can upload a maximum of 10 files at once', 'warning');
            setSelectedFiles((prev) => [...prev, ...validList.slice(0, 10 - prev.length)]);
        } else {
            setSelectedFiles((prev) => [...prev, ...validList]);
        }
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        setProgress(0);

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('file', file);
        });

        if (password) formData.append('password', password);
        if (expiresInDays) formData.append('expiresInDays', expiresInDays);
        if (maxDownloads) formData.append('maxDownloads', maxDownloads);
        if (burnAfterReading) formData.append('burnAfterReading', 'true');

        try {
            const response = await uploadFile(formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
                    setProgress(percentCompleted);
                }
            });

            setUploadedFiles(response.files || []);
            setSelectedFiles([]);
            setPassword('');
            setMaxDownloads('');
            setBurnAfterReading(false);
            showToast(`Successfully uploaded ${response.count} file(s)!`, 'success');

            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            showToast(error.response?.data?.msg || 'Failed to upload files. Please try again.', 'error');
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    const copyToClipboard = (url, id) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        showToast('Download link copied to clipboard!', 'success');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Hero Section */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Protected with SHA-256 / AES Grade Security</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Fast & Encrypted <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">File Sharing</span>
                </h1>
                <p className="text-sm text-slate-400">
                    Upload your sensitive files with password protection, self-destruct timers, and single-use download limits.
                </p>
            </div>

            {/* Main Upload Box */}
            <div className="max-w-2xl mx-auto bg-slate-900/80 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
                {/* Drag and drop dropzone */}
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 bg-slate-950/40 hover:bg-indigo-950/10"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        className="hidden"
                    />

                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600/10 group-hover:bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 group-hover:scale-105 transition-all">
                        <UploadCloud className="w-8 h-8" />
                    </div>

                    <h3 className="text-base font-semibold text-white mb-1">
                        Click or drag & drop files here
                    </h3>
                    <p className="text-xs text-slate-400">
                        Supports documents, images, archives & media up to <span className="text-slate-200 font-medium">{MAX_SIZE_MB}MB</span> each
                    </p>
                </div>

                {/* Selected Files Preview List */}
                {selectedFiles.length > 0 && (
                    <div className="mt-6 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                            <span>Selected Files ({selectedFiles.length})</span>
                            <button
                                onClick={() => setSelectedFiles([])}
                                className="text-rose-400 hover:underline"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                            <File className="w-4 h-4" />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-slate-200 font-medium truncate">{file.name}</p>
                                            <p className="text-slate-500 text-[11px]">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeSelectedFile(index)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Advanced Security Controls Drawer */}
                <div className="mt-6 pt-5 border-t border-slate-800">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-indigo-400" />
                            <span>Security & Expiration Options</span>
                        </div>
                        <span className="text-[11px] text-indigo-400 font-medium">
                            {showAdvanced ? 'Hide Options ▲' : 'Configure Security ▼'}
                        </span>
                    </button>

                    {showAdvanced && (
                        <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                            {/* Password Protection */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Password Protection (Optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Set access password for recipient"
                                        className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Expiry Time */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Expiration Window</span>
                                    </label>
                                    <select
                                        value={expiresInDays}
                                        onChange={(e) => setExpiresInDays(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="1">1 Day</option>
                                        <option value="3">3 Days</option>
                                        <option value="7">7 Days (Default)</option>
                                        <option value="30">30 Days</option>
                                        <option value="">Never Expire</option>
                                    </select>
                                </div>

                                {/* Download Limit */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Max Downloads</span>
                                    </label>
                                    <select
                                        value={maxDownloads}
                                        disabled={burnAfterReading}
                                        onChange={(e) => setMaxDownloads(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                                    >
                                        <option value="">Unlimited</option>
                                        <option value="1">1 Download Limit</option>
                                        <option value="5">5 Downloads</option>
                                        <option value="10">10 Downloads</option>
                                        <option value="50">50 Downloads</option>
                                    </select>
                                </div>
                            </div>

                            {/* Burn After Reading Toggle */}
                            <div className="pt-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-200">Self-Destruct (Burn After Reading)</p>
                                        <p className="text-[11px] text-slate-400">File is permanently deleted immediately after first download.</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={burnAfterReading}
                                    onChange={(e) => {
                                        setBurnAfterReading(e.target.checked);
                                        if (e.target.checked) setMaxDownloads('1');
                                    }}
                                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload Action Button */}
                <div className="mt-6">
                    {isUploading ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400 font-medium">
                                <span>Uploading securely...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={selectedFiles.length === 0}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload {selectedFiles.length > 0 ? `(${selectedFiles.length} files)` : 'Files'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Uploaded Files Ready Links */}
            {uploadedFiles.length > 0 && (
                <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 mb-4 text-emerald-400">
                        <Check className="w-5 h-5" />
                        <h3 className="font-bold text-sm text-white">Files Ready for Secure Sharing!</h3>
                    </div>

                    <div className="space-y-3">
                        {uploadedFiles.map((file) => (
                            <div
                                key={file.id}
                                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div className="truncate">
                                    <p className="text-xs font-semibold text-slate-100 truncate">{file.name}</p>
                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                        <span>{formatFileSize(file.size)}</span>
                                        {file.burnAfterReading && (
                                            <span className="text-rose-400 font-medium">🔥 Burn after reading</span>
                                        )}
                                        {file.hasPassword && (
                                            <span className="text-amber-400 font-medium">🔒 Password protected</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => copyToClipboard(file.path, file.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md"
                                    >
                                        {copiedId === file.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedId === file.id ? 'Copied' : 'Copy Link'}</span>
                                    </button>

                                    <button
                                        onClick={() => openQRModal(file.path, file.name)}
                                        title="QR Code for mobile"
                                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                    >
                                        <QrCode className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Guest Banner Prompt */}
            {!isAuthenticated && (
                <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                        <p className="text-xs text-slate-300">
                            Want to <span className="text-white font-semibold">revoke links</span>, see <span className="text-white font-semibold">download statistics</span>, and manage your vault?
                        </p>
                    </div>
                    <button
                        onClick={openRegister}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-md"
                    >
                        Sign Up Free
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
