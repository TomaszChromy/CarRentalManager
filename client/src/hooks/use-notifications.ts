import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Nowa rezerwacja",
      message: "BMW X3 została zarezerwowana przez Jana Kowalskiego",
      type: "info",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      action: {
        label: "Zobacz szczegóły",
        onClick: () => console.log("Navigate to reservation details"),
      },
    },
    {
      id: "2",
      title: "Serwis zakończony",
      message: "Toyota Yaris (WAW-001) gotowa do wynajmu",
      type: "success",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
    },
    {
      id: "3",
      title: "Przypomnienie o serwisie",
      message: "Volkswagen Golf wymaga przeglądu za 7 dni",
      type: "warning",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
    },
  ]);

  const { toast } = useToast();

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === "error" ? "destructive" : "default",
    });

    return newNotification.id;
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Business logic notifications
  const notifyNewReservation = useCallback((customerName: string, carName: string) => {
    return addNotification({
      title: "Nowa rezerwacja",
      message: `${carName} została zarezerwowana przez ${customerName}`,
      type: "info",
      action: {
        label: "Zobacz szczegóły",
        onClick: () => console.log("Navigate to reservation"),
      },
    });
  }, [addNotification]);

  const notifyServiceCompleted = useCallback((carName: string, plateNumber: string) => {
    return addNotification({
      title: "Serwis zakończony",
      message: `${carName} (${plateNumber}) gotowy do wynajmu`,
      type: "success",
    });
  }, [addNotification]);

  const notifyServiceReminder = useCallback((carName: string, daysUntilService: number) => {
    return addNotification({
      title: "Przypomnienie o serwisie",
      message: `${carName} wymaga przeglądu za ${daysUntilService} dni`,
      type: "warning",
    });
  }, [addNotification]);

  const notifyReservationCancelled = useCallback((customerName: string, carName: string) => {
    return addNotification({
      title: "Rezerwacja anulowana",
      message: `Rezerwacja ${carName} przez ${customerName} została anulowana`,
      type: "warning",
    });
  }, [addNotification]);

  const notifyPaymentReceived = useCallback((amount: string, customerName: string) => {
    return addNotification({
      title: "Płatność otrzymana",
      message: `Otrzymano płatność ${amount} zł od ${customerName}`,
      type: "success",
    });
  }, [addNotification]);

  const notifyLowAvailability = useCallback((availableCars: number, totalCars: number) => {
    const percentage = Math.round((availableCars / totalCars) * 100);
    return addNotification({
      title: "Niska dostępność floty",
      message: `Tylko ${percentage}% pojazdów jest dostępnych (${availableCars}/${totalCars})`,
      type: "warning",
    });
  }, [addNotification]);

  const notifySystemMaintenance = useCallback((startTime: Date, duration: string) => {
    return addNotification({
      title: "Planowana konserwacja systemu",
      message: `System będzie niedostępny ${startTime.toLocaleDateString('pl-PL')} przez ${duration}`,
      type: "info",
    });
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    // Business logic helpers
    notifyNewReservation,
    notifyServiceCompleted,
    notifyServiceReminder,
    notifyReservationCancelled,
    notifyPaymentReceived,
    notifyLowAvailability,
    notifySystemMaintenance,
  };
}

export default useNotifications;
