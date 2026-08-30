import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UploadCloud, LayoutDashboard, LogIn, LogOut, User as UserIcon, Lock } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
    const { user, isAuthenticated, logout, openLogin, openRegister } = useAuth();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('upload')}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-lg text-white tracking-tight">Drop<span className="text-indigo-400">Vault</span></span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">v2.0</span>
                        </div>
                        <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Secure & Zero-Exposure File Vault</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'upload'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                    >
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'dashboard'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                    </button>
                </nav>

                {/* User Auth Section */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                                </div>
                                <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">{user?.name}</span>
                            </div>
                            <button
                                onClick={logout}
                                title="Sign out"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={openLogin}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                            >
                                <LogIn className="w-4 h-4 text-slate-400" />
                                <span>Sign In</span>
                            </button>
                            <button
                                onClick={openRegister}
                                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
                            >
                                <span>Get Started</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
