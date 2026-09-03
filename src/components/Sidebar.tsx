import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Radio,
  FileCheck,
  FileText,
  History,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export type NavTab = 
  | 'overview'
  | 'tests'
  | 'live'
  | 'results'
  | 'reports'
  | 'history'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isTestRunning: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isTestRunning,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'tests' as NavTab, label: 'Tests', icon: Layers },
    { 
      id: 'live' as NavTab, 
      label: 'Live Monitoring', 
      icon: Radio,
      badge: isTestRunning ? 'LIVE' : undefined,
      badgeColor: 'bg-indigo-500 animate-pulse text-white'
    },
    { id: 'results' as NavTab, label: 'Results', icon: FileCheck },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'history' as NavTab, label: 'History', icon: History },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside 
        id="eaii-sidebar"
        className={`fixed lg:relative inset-y-0 left-0 z-40 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 bg-white ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } dark:bg-[#0d1117] text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 select-none transition-all duration-200 ease-in-out`}
      >
        {/* Brand Header with Toggle Icon */}
        <div className={`p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src="/logo.png" 
              alt="EAII PTT Logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-md shadow-indigo-500/20 border border-slate-200 dark:border-slate-700/60 flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight leading-none">EAII</h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    PTT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-0.5 truncate">
                  Performance Testing Tool
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Unhide Toggle Icon */}
          <div className="flex items-center gap-1">
            <button
              id="sidebar-toggle-btn"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Sidebar (Unhide)' : 'Collapse Sidebar (Hide)'}
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => { onSelectTab(item.id); onClose?.(); }}
                title={item.label}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-sm font-medium transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                    item.badge === 'LIVE' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Floating tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                    {item.badge && ` (${item.badge})`}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Unhide / Expand Banner when Collapsed */}
        {isCollapsed && (
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Engine & Server Status (Expanded Mode) */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
            <div className="bg-white dark:bg-slate-950/80 rounded-lg p-2.5 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">Observability Stack</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Ready
                </span>
              </div>
              <div className="space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">k6 &amp; Locust</span>
                </div>
                <div className="flex justify-between">
                  <span>Reports:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">HTML &amp; ZIP</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2 px-1">
              <span>EAII v1.0.0</span>
              <button
                onClick={onToggleCollapse}
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>Collapse</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
