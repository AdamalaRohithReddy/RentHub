import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, CheckCheck, Trash2, ArrowLeft, RefreshCw, 
  ShoppingBag, RotateCcw, AlertTriangle, CheckCircle2, 
  XCircle, AlertCircle, ArrowRight, Sparkles, Filter 
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Notifications = ({ 
  onNavigateToHome, 
  onNavigateToOrdersTab,
  onNavigateToReturnInspect 
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'RENTAL' | 'RETURNS'
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getNotifications();
      if (res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setActionFeedback({ type: 'success', message: 'Notification marked as read.' });
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) {
      console.error('Error marking as read:', err);
      setActionFeedback({ type: 'error', message: 'Failed to mark notification as read.' });
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setActionFeedback({ type: 'success', message: 'All notifications marked as read.' });
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) {
      console.error('Error marking all as read:', err);
      setActionFeedback({ type: 'error', message: 'Failed to mark all notifications as read.' });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setActionFeedback({ type: 'info', message: 'Notification removed.' });
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setActionFeedback({ type: 'error', message: 'Failed to delete notification.' });
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }

    if (item.type === 'ORDER_REQUEST' || item.type === 'RETURN_REQUEST') {
      if (onNavigateToOrdersTab) onNavigateToOrdersTab('requests-received');
    } else if (item.type === 'RETURN_INSPECTION_PENDING' && item.orderId && onNavigateToReturnInspect) {
      onNavigateToReturnInspect(item.orderId);
    } else {
      if (onNavigateToOrdersTab) onNavigateToOrdersTab('my-requests');
    }
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case 'ORDER_REQUEST':
        return {
          icon: <ShoppingBag className="w-5 h-5 text-blue-400" />,
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
          badge: 'Rental Request',
          actionText: 'View Request ➔',
        };
      case 'ORDER_ACCEPTED':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
          badge: 'Accepted',
          actionText: 'View Order ➔',
        };
      case 'ORDER_REJECTED':
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          bg: 'bg-red-500/10 border-red-500/20 text-red-300',
          badge: 'Rejected',
          actionText: 'View Details ➔',
        };
      case 'ORDER_CANCELLED':
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
          badge: 'Cancelled',
          actionText: 'View Status ➔',
        };
      case 'RETURN_REQUEST':
        return {
          icon: <RotateCcw className="w-5 h-5 text-purple-400" />,
          bg: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
          badge: 'Return Request',
          actionText: 'Inspect Return ➔',
        };
      case 'RETURN_CONFIRMED':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-teal-400" />,
          bg: 'bg-teal-500/10 border-teal-500/20 text-teal-300',
          badge: 'Returned',
          actionText: 'View History ➔',
        };
      case 'DAMAGE_REPORTED':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
          badge: 'Damage Alert',
          actionText: 'View Damage Report ➔',
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-brand-400" />,
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          badge: 'Alert',
          actionText: 'View Details ➔',
        };
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'UNREAD') return !item.isRead;
    if (filter === 'RENTAL') return item.type && item.type.startsWith('ORDER_');
    if (filter === 'RETURNS') return item.type && (item.type.includes('RETURN') || item.type.includes('DAMAGE'));
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onNavigateToHome}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition-all mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-brand-500 text-white font-mono font-bold px-2 py-0.5 rounded-full shadow-glow">
                  {unreadCount} new
                </span>
              )}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time updates on incoming rental requests, order confirmations, cancellations, and return inspections.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll || isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
              title="Mark all notifications as read"
            >
              <CheckCheck className={`w-4 h-4 text-brand-400 ${isMarkingAll ? 'animate-spin' : ''}`} />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            onClick={fetchNotifications}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Toast Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 animate-fade-in ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
            : actionFeedback.type === 'error'
            ? 'bg-red-500/10 border border-red-500/30 text-red-300'
            : 'bg-slate-900 border border-slate-800 text-slate-300'
        }`}>
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : actionFeedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { id: 'ALL', label: 'All Alerts', count: notifications.length },
          { id: 'UNREAD', label: 'Unread', count: unreadCount },
          { id: 'RENTAL', label: 'Rental Orders', count: notifications.filter(n => n.type && n.type.startsWith('ORDER_')).length },
          { id: 'RETURNS', label: 'Returns & Damage', count: notifications.filter(n => n.type && (n.type.includes('RETURN') || n.type.includes('DAMAGE'))).length },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              filter === item.id
                ? 'bg-brand-500 text-white shadow-glow'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <span>{item.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              filter === item.id ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading notifications...</p>
          <p className="text-xs text-slate-500">Syncing alerts with MySQL database...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-3xl border border-red-500/30 bg-red-500/5 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Error Loading Notifications</h3>
          <p className="text-xs text-red-300 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-red-400 text-white text-xs font-semibold transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {filter === 'UNREAD' ? 'You’re all caught up!' : 'No notifications yet'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {filter === 'UNREAD' 
                ? 'All notifications have been read. Switch to "All Alerts" to view previous history.' 
                : 'You will receive notifications here whenever customers request your tools, or when your rental orders are accepted or returned.'}
            </p>
          </div>
          <button
            onClick={onNavigateToHome}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-glow"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => {
            const config = getTypeConfig(item.type);
            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  !item.isRead
                    ? 'bg-slate-900/90 border-brand-500/40 shadow-glow/10 hover:border-brand-500'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                {/* Unread Indicator Bar / Dot */}
                {!item.isRead && (
                  <span className="absolute top-4 left-2 w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                )}

                {/* Type Icon */}
                <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${config.bg}`}>
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.bg}`}>
                        {config.badge}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="text-[9px] bg-brand-500/20 text-brand-300 border border-brand-500/30 font-bold px-1.5 py-0.2 rounded uppercase">
                          New
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatTimestamp(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.message}
                  </p>

                  {/* Related Order Context Pill */}
                  {item.orderId && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 font-mono text-slate-300">
                        Order #{item.orderId}
                      </span>
                      {item.resourceName && (
                        <span className="text-slate-400">
                          Item: <strong className="text-slate-200">{item.resourceName}</strong>
                        </span>
                      )}
                      {item.requestedQuantity && (
                        <span className="text-slate-500">
                          (Qty: {item.requestedQuantity})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-brand-400 group-hover:text-brand-300 font-semibold flex items-center gap-1">
                      <span>{config.actionText}</span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-slate-400 hover:text-white text-[11px] transition-all"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5 text-brand-400" />
                          <span className="hidden sm:inline">Mark Read</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-500 hover:text-red-400 text-xs transition-all"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
