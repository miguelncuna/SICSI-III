import { createContext, useCallback, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback(
    ({
      type = "info",
      title,
      message,
      duration = 5000,
    }) => {
      setNotification({
        id: Date.now(),
        type,
        title,
        message,
        duration,
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const value = useMemo(
    () => ({
      notification,
      showNotification,
      hideNotification,
    }),
    [notification, showNotification, hideNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification deve ser utilizado dentro de NotificationProvider."
    );
  }

  return context;
}
