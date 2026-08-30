import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { UploadZone } from './components/UploadZone';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { QRCodeModal } from './components/QRCodeModal';
import { Toast } from './components/Toast';

function AppContent() {
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'dashboard'
    const [toast, setToast] = useState(null);
    const [qrModalData, setQrModalData] = useState(null); // { url, title }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const openQRModal = (url, title) => {
        setQrModalData({ url, title });
    };

    const closeQRModal = () => {
        setQrModalData(null);
    };

    return (
        <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Global Navbar */}
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Application Area */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
                {activeTab === 'upload' ? (
                    <UploadZone 
                        showToast={showToast} 
                        openQRModal={openQRModal}
                        onUploadSuccess={() => {}}
                    />
                ) : (
                    <Dashboard 
                        showToast={showToast} 
                        openQRModal={openQRModal} 
                    />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>© {new Date().getFullYear()} DropVault. Secure Zero-Exposure File Sharing.</p>
                    <p className="flex items-center gap-2">
                        <span>Protected Storage</span>
                        <span>•</span>
                        <span>SHA-256 Hashing</span>
                        <span>•</span>
                        <span>Self-Destruct Triggers</span>
                    </p>
                </div>
            </footer>

            {/* Global Modals & Notifications */}
            <AuthModal showToast={showToast} />
            
            {qrModalData && (
                <QRCodeModal
                    url={qrModalData.url}
                    title={qrModalData.title}
                    onClose={closeQRModal}
                    onCopy={() => showToast('Share link copied!', 'success')}
                />
            )}

            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
