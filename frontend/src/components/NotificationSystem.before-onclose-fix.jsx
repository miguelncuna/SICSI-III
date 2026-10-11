import { useEffect, useState } from "react";
import { useNotification } from "../context/NotificationContext";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

const TIPOS = {
  success: {
    icon: CheckCircle2,
    title: "Sucesso",
  },
  error: {
    icon: XCircle,
    title: "Erro",
  },
  warning: {
    icon: AlertTriangle,
    title: "Atenção",
  },
  info: {
    icon: Info,
    title: "Informação",
  },
};

export default function NotificationSystem() {
  const {
    notification,
    hideNotification,
  } = useNotification();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);

      setTimeout(() => {
        hideNotification();
      }, 200);
    }, notification.duration ?? 5000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification || !visible) {
    return null;
  }

  const tipo = TIPOS[notification.type] || TIPOS.info;
  const Icon = tipo.icon;

  return (
    <div
      className="fixed right-4 top-4 z-[9999] w-[calc(100%-2rem)] max-w-md"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="mt-0.5 shrink-0">
          <Icon size={21} className="text-sky-400" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">
            {notification.title || tipo.title}
          </p>

          {notification.message && (
            <p className="mt-1 text-sm leading-5 text-slate-300">
              {notification.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setVisible(false);

            setTimeout(() => {
              hideNotification();
            }, 200);
          }}
          className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Fechar notificação"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}


