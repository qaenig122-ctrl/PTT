import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Menu,
  Moon,
  Sun,
  User,
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Trash2,
  ExternalLink,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Layers,
  X,
  Eye,
  Maximize2
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { TestRun, AppNotification } from '../types';
import { notificationService } from '../lib/notificationService';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeRun: TestRun | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNewTestClick: () => void;
  onOpenSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapseSidebar?: () => void;
  onSelectRunId?: (runId: string, tab?: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  activeRun,
  isDarkMode,
  onToggleTheme,
  onNewTestClick,
  onOpenSidebar,
  isSidebarCollapsed = false,
  onToggleCollapseSidebar,
  onSelectRunId
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAllNotifsModal, setShowAllNotifsModal] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifFilter, setNotifFilter] = useState<'all' | 'alerts' | 'runs'>('all');
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = notificationService.subscribe((list) => {
      setNotifications(list);
    });
    return unsub;
  }, []);

  // Close dropdown on click outside, safely ignoring unmounted elements or internal clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      // If target was unmounted (e.g. state change on filter pill), do not close
      if (!target || !(target as HTMLElement).isConnected) return;

      if (
        showNotifications &&
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
      if (
        showUserMenu &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showNotifications || showUserMenu) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 50);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [showNotifications, showUserMenu]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'alerts') return n.type === 'warning' || n.type === 'fail';
    if (notifFilter === 'runs') return n.type === 'start' || n.type === 'complete';
    return true;
  });

  const handleNotificationClick = (item: AppNotification) => {
    notificationService.markAsRead(item.id);
    if (item.runId && onSelectRunId) {
      if (item.type === 'start') {
        onSelectRunId(item.runId, 'live');
      } else if (item.title.toLowerCase().includes('report') || item.title.toLowerCase().includes('zip')) {
        onSelectRunId(item.runId, 'reports');
      } else {
        onSelectRunId(item.runId, 'results');
      }
    } else if (item.title.toLowerCase().includes('report') || item.title.toLowerCase().includes('zip')) {
      onSelectTab('reports');
    } else if (item.title.toLowerCase().includes('live') || item.type === 'start') {
      onSelectTab('live');
    } else {
      onSelectTab('results');
    }
    setShowNotifications(false);
  };

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'overview': return 'Overview Dashboard';
      case 'tests': return 'Performance Test Builder';
      case 'live': return 'Live Test Monitoring';
      case 'results': return 'Test Results & Metrics';
      case 'reports': return 'EAII Performance Report';
      case 'history': return 'Test History & Benchmarks';
      case 'settings': return 'Observability & Engine Settings';
    }
  };

  const renderNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
      case 'fail':
        return <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />;
      case 'start':
        return <Play className="w-4 h-4 text-blue-500 flex-shrink-0 fill-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />;
    }
  };

  return (
    <header 
      id="eaii-header"
      className="relative h-16 bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-[#081225] dark:via-[#0d1117] dark:to-[#081225] border-b border-blue-200 dark:border-blue-950 px-4 sm:px-6 flex items-center justify-between z-40 flex-shrink-0"
    >
      <div className="flex items-center gap-2 mr-2">
        {/* Mobile Menu Open */}
        <button 
          onClick={onOpenSidebar} 
          aria-label="Open Mobile Menu"
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5"/>
        </button>

        {/* Desktop Sidebar Toggle Button */}
        {onToggleCollapseSidebar && (
          <button
            onClick={onToggleCollapseSidebar}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Left Title & Status */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="EAII PTT Logo" 
            className="w-9 h-9 rounded-lg object-cover shadow-xs border border-slate-200 dark:border-slate-700/80 hidden sm:block"
          />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none truncate max-w-[200px] sm:max-w-none">
              {getTabTitle(currentTab)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden md:block">
              System performance testing • live observability • executive reporting
            </p>
          </div>
        </div>

        {activeRun && activeRun.status === 'RUNNING' && (
          <button
            onClick={() => onSelectTab('live')}
            className="flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Running: {activeRun.name} ({activeRun.rps} RPS)</span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick New Test Button */}
        <button
          id="btn-quick-new-test"
          onClick={onNewTestClick}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>New Project Test</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={onToggleTheme}
          title="Toggle Light/Dark Theme"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            id="btn-notifications"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications((prev) => !prev);
              setShowUserMenu(false);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="System Observability & Benchmark Alerts"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative border border-slate-200 dark:border-slate-800"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-[#081225]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-[440px] max-w-[440px] bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Notifications &amp; Alerts
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {unreadCount} unread • {notifications.length} total
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setShowAllNotifsModal(true);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer transition-colors"
                    title="Expand into full modal view"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => notificationService.markAllAsRead()}
                      className="px-2 py-1 rounded-md text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer transition-colors"
                      title="Mark all as read"
                    >
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => notificationService.clearAll()}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer transition-colors"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="px-3 py-2 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    notifFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('alerts')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    notifFilter === 'alerts'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Alerts ({notifications.filter((n) => n.type === 'warning' || n.type === 'fail').length})
                </button>
                <button
                  onClick={() => setNotifFilter('runs')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    notifFilter === 'runs'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Tests ({notifications.filter((n) => n.type === 'start' || n.type === 'complete').length})
                </button>
              </div>

              {/* Notification Items List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto max-h-[380px]">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2 opacity-50" />
                    <p className="text-xs font-semibold">No notifications in this category</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      New test events and SLA alerts will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-start gap-3 cursor-pointer group ${
                        !item.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="mt-0.5">{renderNotifIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold truncate ${
                              !item.read
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.projectName && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {item.projectName}
                              </span>
                            )}
                            {item.testType && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                                {item.testType}
                              </span>
                            )}
                            {item.score !== undefined && (
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                Score: {item.score.toFixed(0)}/100
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                            {item.type === 'start'
                              ? 'Live Monitor →'
                              : item.title.toLowerCase().includes('report') || item.title.toLowerCase().includes('zip')
                              ? 'View Report →'
                              : 'View Details →'}
                          </span>
                        </div>
                      </div>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1"></span>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 px-3">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    setShowAllNotifsModal(true);
                  }}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View All System Alerts ({notifications.length})</span>
                </button>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onSelectTab('history');
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:underline cursor-pointer"
                >
                  Full History →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User / Admin Avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="btn-admin-profile"
            onClick={(e) => {
              e.stopPropagation();
              setShowUserMenu((prev) => !prev);
              setShowNotifications(false);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">Admin</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Administrator</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs"
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white">Admin Session</p>
                <p className="text-[11px] text-slate-400">admin@eaii.internal</p>
              </div>
              <button 
                onClick={() => { setShowUserMenu(false); onSelectTab('settings'); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                Observability Settings
              </button>
              <button 
                onClick={() => { setShowUserMenu(false); onSelectTab('live'); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-between"
              >
                <span>Open Locust Live View</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* All Notifications & Alerts Modal */}
      {showAllNotifsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">All System Observability &amp; SLA Alerts</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{notifications.length} total event logs • Real-time stream active</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllNotifsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter and bulk actions bar */}
            <div className="px-4 py-2.5 bg-slate-50/40 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    notifFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('alerts')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    notifFilter === 'alerts'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Alerts &amp; Warnings ({notifications.filter((n) => n.type === 'warning' || n.type === 'fail').length})
                </button>
                <button
                  onClick={() => setNotifFilter('runs')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    notifFilter === 'runs'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Test Runs ({notifications.filter((n) => n.type === 'start' || n.type === 'complete').length})
                </button>
              </div>

              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={() => notificationService.markAllAsRead()}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Mark All Read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => notificationService.clearAll()}
                    className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No events found in this category</p>
                  <p className="text-xs text-slate-500 mt-1">Benchmark alerts, threshold breaches, and milestones will appear here in real-time.</p>
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setShowAllNotifsModal(false);
                      handleNotificationClick(item);
                    }}
                    className={`p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-start gap-3.5 cursor-pointer ${
                      !item.read ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                    }`}
                  >
                    <div className="mt-0.5">{renderNotifIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.projectName && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {item.projectName}
                            </span>
                          )}
                          {item.testType && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                              {item.testType}
                            </span>
                          )}
                          {item.score !== undefined && (
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                              Score: {item.score.toFixed(0)}/100
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                          {item.type === 'start' ? 'Open Live Monitor →' : 'Inspect Run Details →'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAllNotifsModal(false)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
