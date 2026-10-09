import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, RefreshCw, Sparkles, Clock, AlertCircle, ShoppingBag } from 'lucide-react';
import { api } from '../api/client';

export const NotificationBell = ({ onNavigateToOrdersTab, onNavigateToNotifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.getUnreadCount();
      if (res.data) {
        setUnreadCount(res.data.count || 0);
      }
    } catch (err) {
      // ignore
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.data) {
        setNotifications(res.data);
      }
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    setIsOpen(false);

    if (onNavigateToOrdersTab) {
      if (item.type === 'ORDER_REQUEST' || item.type === 'RETURN_REQUEST') {
        onNavigateToOrdersTab('requests-received');
      } else {
        onNavigateToOrdersTab('my-requests');
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Badge */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-slate-300 hover:text-white transition-all shadow-sm flex items-center justify-center"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-black font-mono flex items-center justify-center px-1 shadow-glow animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl z-50 overflow-hidden animate-slide-up">
          
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full font-mono">
                  {unreadCount} new
                </span>
              )}
            </div>

            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/80 scrollbar-thin">
            {isLoading ? (
              <div className="p-8 text-center space-y-2">
                <RefreshCw className="w-5 h-5 text-brand-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">No notifications yet</p>
                <p className="text-[11px] text-slate-500">You will receive updates when someone requests or updates an order.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 hover:bg-slate-900/80 cursor-pointer transition-colors flex items-start gap-3 ${
                    !item.isRead ? 'bg-brand-500/5' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.type === 'ORDER_REQUEST'
                      ? 'bg-amber-500/20 text-amber-400'
                      : item.type === 'ORDER_ACCEPTED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {item.type === 'ORDER_REQUEST' ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : item.type === 'ORDER_ACCEPTED' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">{item.message}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">
                        {item.type === 'ORDER_REQUEST' ? '👉 Click to view request' : '👉 Click to view my orders'}
                      </span>
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="text-[10px] text-slate-400 hover:text-brand-400 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-3 text-xs">
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigateToNotifications) {
                    onNavigateToNotifications();
                  } else if (onNavigateToOrdersTab) {
                    onNavigateToOrdersTab('my-requests');
                  }
                }}
                className="text-brand-400 hover:text-brand-300 font-semibold"
              >
                View all notifications ➔
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigateToOrdersTab) onNavigateToOrdersTab('my-requests');
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                My Orders
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
