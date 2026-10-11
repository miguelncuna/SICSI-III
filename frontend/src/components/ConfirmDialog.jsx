import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  open,
  title = "Confirmar ação",
  message = "Tem a certeza de que deseja continuar?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  destructive = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/40"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                destructive
                  ? "bg-red-500/10 text-red-400"
                  : "bg-blue-500/10 text-blue-400",
              ].join(" ")}
            >
              <AlertTriangle size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                {title}
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                {message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={[
              "rounded-xl px-4 py-3 text-sm font-semibold text-white transition",
              destructive
                ? "bg-red-600 hover:bg-red-500"
                : "bg-blue-600 hover:bg-blue-500",
            ].join(" ")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}