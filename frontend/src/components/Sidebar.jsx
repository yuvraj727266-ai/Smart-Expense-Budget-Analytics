import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  WalletCards,
  Tags,
  LineChart,
  Lightbulb,
  FileSpreadsheet,
  BookOpen,
  Code2,
  Settings,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ReceiptText },
  { name: 'Budgets', path: '/budgets', icon: WalletCards },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Analytics', path: '/analytics', icon: LineChart },
  { name: 'Smart Insights', path: '/insights', icon: Lightbulb },
  { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
  { name: 'Project Docs', path: '/docs', icon: BookOpen },
  { name: 'Educational Code', path: '/educational', icon: Code2 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay with blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a0f1d] text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800/80 shadow-2xl`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950/40">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5 font-display">
                SmartExpense
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1 dark-scrollbar">
          <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Finance & Tracking
          </div>
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-0.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-sm" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="px-3 pt-5 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Data Science & Analytics
          </div>
          {navItems.slice(4, 7).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-0.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-sm" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="px-3 pt-5 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Syllabus & System
          </div>
          {navItems.slice(7).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-0.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-sm" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#070b14]/70 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-200 font-semibold text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Python 3.14 + Flask
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Pandas · NumPy · SQLite</div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
