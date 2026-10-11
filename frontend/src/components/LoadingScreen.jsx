import { ShieldCheck } from "lucide-react";

export default function LoadingScreen({
  label = "A carregar SICSI...",
  fullScreen = true,
}) {
  return (
    <div
      className={[
        "flex items-center justify-center bg-slate-950 text-white",
        fullScreen ? "min-h-screen" : "min-h-[280px]",
      ].join(" ")}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-500/10" />

          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 shadow-lg shadow-blue-950/30">
            <ShieldCheck
              size={27}
              className="text-blue-400"
              strokeWidth={1.8}
            />
          </div>
        </div>

        <p className="mt-5 text-sm font-semibold text-slate-200">
          {label}
        </p>

        <div className="mt-3 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" />
        </div>
      </div>
    </div>
  );
}