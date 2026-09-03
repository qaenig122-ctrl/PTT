import { AppNotification } from '../types';

type NotificationSubscriber = (notifications: AppNotification[], activeToast: AppNotification | null) => void;

class NotificationService {
  private notifications: AppNotification[] = [];
  private toastQueue: AppNotification[] = [];
  private currentToast: AppNotification | null = null;
  private subscribers: Set<NotificationSubscriber> = new Set();
  private toastTimer: number | null = null;

  constructor() {
    // Initial sample notifications with alerts and completed test runs
    this.notifications = [
      {
        id: 'notif-alert-1',
        type: 'fail',
        title: '🚨 Elevated Error Rate Alert',
        message: 'Spike Test #126: Real-time error rate rose to 12.8% on /api/orders (limit: 2.0%).',
        timestamp: '10:46 AM',
        read: false,
        runId: 'RUN-126',
        projectName: 'Office API Performance Testing',
        testType: 'Spike Test',
        rating: 'CRITICAL',
        score: 41
      },
      {
        id: 'notif-alert-2',
        type: 'warning',
        title: '⚠️ SLA Latency Warning',
        message: 'Stress Test #127: P95 latency reached 2,400ms on /api/users (target: 800ms).',
        timestamp: '10:42 AM',
        read: false,
        runId: 'RUN-127',
        projectName: 'Office API Performance Testing',
        testType: 'Stress Test',
        rating: 'WARNING',
        score: 68
      },
      {
        id: 'notif-complete-1',
        type: 'complete',
        title: '🟢 Test Completed',
        message: 'Load Test #128 for "Office API Performance Testing" finished. Score: 94/100 (GOOD).',
        timestamp: '10:30 AM',
        read: true,
        runId: 'RUN-128',
        projectName: 'Office API Performance Testing',
        testType: 'Load Test',
        rating: 'GOOD',
        score: 94
      },
      {
        id: 'notif-init',
        type: 'info',
        title: '⚡ Engine & Database Ready',
        message: 'SQLite database and k6, Locust, and Artillery engines initialized.',
        timestamp: '10:15 AM',
        read: true,
        runId: 'RUN-128',
        projectName: 'Office API Performance Testing',
        testType: 'Load Test'
      }
    ];
  }

  public subscribe(cb: NotificationSubscriber): () => void {
    this.subscribers.add(cb);
    cb(this.notifications, this.currentToast);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private emit() {
    this.subscribers.forEach(cb => {
      try {
        cb([...this.notifications], this.currentToast ? { ...this.currentToast } : null);
      } catch (err) {
        console.error('Notification subscriber error:', err);
      }
    });
  }

  public push(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const item: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      read: false
    };

    this.notifications = [item, ...this.notifications];
    this.toastQueue.push(item);
    this.processQueue();
    this.emit();
    return item;
  }

  private processQueue() {
    if (this.currentToast || this.toastQueue.length === 0) {
      return;
    }

    this.currentToast = this.toastQueue.shift() || null;
    this.emit();

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    // Display each notification for 4.5 seconds before showing the next in queue
    this.toastTimer = window.setTimeout(() => {
      this.currentToast = null;
      this.emit();
      // Brief pause between toasts
      setTimeout(() => {
        this.processQueue();
      }, 400);
    }, 4500);
  }

  public dismissToast() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.currentToast = null;
    this.emit();
    setTimeout(() => {
      this.processQueue();
    }, 300);
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.emit();
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.emit();
  }

  public clearAll() {
    this.notifications = [];
    this.toastQueue = [];
    this.currentToast = null;
    this.emit();
  }

  public getNotifications(): AppNotification[] {
    return this.notifications;
  }
}

export const notificationService = new NotificationService();
