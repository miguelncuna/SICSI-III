import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe,
  Mail,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { simulationService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SIMULATION_ID = "phishing-04";

const EMAIL = {
  sender: "Documentos",
  senderEmail: "documento@partilha-arquivo.example",
  subject: "Miguel, enviaram-lhe um documento",
  message:
    "Um documento foi partilhado consigo. Abra o ficheiro para consultar o conteúdo.",
  linkText: "Ver documento",
  linkTarget: "https://partilha-arquivo.example/documento",
};

const INSPECTION_DATA = {
  sender: {
    title: "Detalhes do remetente",
    items: [
      ["Nome apresentado", "Documentos"],
      ["Endereço", "documento@partilha-arquivo.example"],
      ["Domínio", "partilha-arquivo.example"],
      ["Tipo de conta", "Conta externa"],
    ],
  },
  link: {
    title: "Destino da ligação",
    items: [
      ["Destino apresentado", "partilha-arquivo.example/documento"],
      ["Ligação segura", "Não verificada"],
      ["Origem", "Mensagem inesperada"],
      ["Contexto", "Nenhuma partilha previamente confirmada"],
    ],
  },
};

function BrowserFrame({ children, url }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate text-xs text-slate-500">{url}</span>
        </div>
      </div>

      {children}
    </div>
  );
}

function InspectionPanel({ data, onClose }) {
  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
            <Search className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-bold text-blue-950">
              {data.title}
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-800">
              A inspecção permite analisar informação adicional sem abrir
              o conteúdo do documento.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-100"
          aria-label="Fechar inspecção"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {data.items.map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-blue-100 bg-white px-3 py-2.5"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-1 break-words text-xs font-semibold text-slate-700">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ kind, onContinue }) {
  const safe = kind === "safe";

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
          safe
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-600"
        }`}
      >
        {safe ? (
          <CheckCircle2 className="h-7 w-7" />
        ) : (
          <AlertTriangle className="h-7 w-7" />
        )}
      </div>

      <div className="mt-5 text-center">
        <p
          className={`text-xs font-bold uppercase tracking-[0.16em] ${
            safe ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {safe ? "Decisão segura" : "Decisão de risco"}
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          {safe
            ? "O documento foi tratado como uma comunicação suspeita."
            : "O documento foi aberto sem uma verificação suficiente."}
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          {safe
            ? "Antes de abrir um documento inesperado, é importante confirmar quem o enviou, por que motivo foi enviado e se o destino corresponde ao serviço esperado."
            : "Num cenário real, abrir um documento ou seguir uma ligação sem verificar a origem pode expor o utilizador a páginas fraudulentas, malware ou pedidos posteriores de credenciais."}
        </p>
      </div>

      <div
        className={`mt-6 rounded-xl border p-4 ${
          safe
            ? "border-emerald-100 bg-emerald-50"
            : "border-red-100 bg-red-50"
        }`}
      >
        <div className="flex items-start gap-3">
          {safe ? (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          )}

          <p className="text-sm leading-6 text-slate-700">
            {safe
              ? "Boa prática: confirme a partilha através de um canal conhecido ou aceda directamente ao serviço oficial, em vez de confiar apenas na ligação recebida."
              : "Boa prática: uma mensagem inesperada deve ser analisada antes de abrir documentos, ligações ou introduzir informação."}
          </p>
        </div>
      </div>

      <div className="mt-7 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          Próxima simulação
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Phishing04Page() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [inspection, setInspection] = useState(null);
  const [decision, setDecision] = useState(null);

  useEffect(() => {
    let active = true;

    simulationService
      .get(SIMULATION_ID)
      .then((data) => {
        if (active) {
          setSimulation(data);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.message ||
              "Não foi possível carregar a simulação."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function recordAction(
    action,
    stepId,
    interactionType,
    metadata = {}
  ) {
    if (busy) return false;

    setBusy(true);
    setError("");

    try {
      await simulationService.evaluate(
        SIMULATION_ID,
        action,
        user?.id,
        stepId,
        interactionType,
        metadata
      );

      return true;
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Não foi possível registar esta interacção."
      );
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function inspectSender() {
    const ok = await recordAction(
      "inspect_sender",
      "step_01",
      "inspect_sender",
      {
        surface: "email",
        target: "sender",
      }
    );

    if (ok) {
      setInspection("sender");
    }
  }

  async function inspectLink() {
    const ok = await recordAction(
      "inspect_url",
      "step_01",
      "inspect_url",
      {
        surface: "email",
        target: "document_link",
        url: EMAIL.linkTarget,
      }
    );

    if (ok) {
      setInspection("link");
    }
  }

  async function reportMessage() {
    const ok = await recordAction(
      "report",
      "step_01",
      "report",
      {
        surface: "email",
        reason: "unexpected_document_share",
      }
    );

    if (ok) {
      setDecision("safe");
    }
  }

  async function openDocument() {
    const ok = await recordAction(
      "open_link",
      "step_01",
      "link",
      {
        target: "document",
        url: EMAIL.linkTarget,
      }
    );

    if (ok) {
      setDecision("danger");
    }
  }

  async function continueSimulation() {
    await recordAction(
      "finish",
      "step_02",
      "finish",
      {
        completed: true,
        next_simulation: "phishing-05",
      }
    );

    navigate("/student/simulacoes/phishing-05");
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">
            A preparar a experiência...
          </p>
        </div>
      </div>
    );
  }

  if (error && !simulation) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h2 className="font-bold text-red-900">
                Não foi possível carregar a simulação
              </h2>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (decision) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ResultCard
          kind={decision}
          onContinue={continueSimulation}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/student/simulacoes")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Simulações
        </button>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
              Phishing · 04/05
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              Médio
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {simulation?.title || "Documento partilhado consigo"}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Uma mensagem aparenta ter partilhado um documento consigo.
            Analise a comunicação antes de decidir o que fazer.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
            04
          </span>
          <span>de</span>
          <span>05</span>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <BrowserFrame url="https://correio.academico.example/caixa-de-entrada">
        <div className="p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Mail className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">
                Caixa de correio
              </p>
              <p className="text-[10px] text-slate-400">
                1 mensagem nova
              </p>
            </div>
          </div>

          <div className="max-w-4xl">
            <div className="border-b border-slate-100 pb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Assunto
              </p>

              <h2 className="mt-2 text-lg font-bold text-slate-900">
                {EMAIL.subject}
              </h2>

              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Mail className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {EMAIL.sender}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {EMAIL.senderEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-6">
              <p className="text-sm leading-7 text-slate-600">
                {EMAIL.message}
              </p>

              <div className="mt-5 flex max-w-2xl items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="rounded-lg bg-white p-2.5 text-blue-600 shadow-sm">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Documento partilhado
                  </p>
                  <p className="mt-1 truncate text-xs font-bold text-slate-700">
                    Documento partilhado consigo
                  </p>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={openDocument}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ver documento
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={inspectSender}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                >
                  <Search className="h-3.5 w-3.5" />
                  Inspeccionar remetente
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={inspectLink}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Inspeccionar destino
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={reportMessage}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Denunciar mensagem
                </button>
              </div>

              {inspection && (
                <InspectionPanel
                  data={INSPECTION_DATA[inspection]}
                  onClose={() => setInspection(null)}
                />
              )}
            </div>
          </div>
        </div>
      </BrowserFrame>

      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <Search className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-xs leading-5 text-blue-800">
            <strong>Objectivo da experiência:</strong> aprender a
            verificar a origem de um documento inesperado antes de
            confiar no conteúdo ou seguir o destino apresentado.
          </p>
        </div>
      </div>
    </div>
  );
}