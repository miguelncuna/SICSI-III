import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  FileArchive,
  FileText,
  Globe2,
  Inbox,
  LoaderCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  UserRound,
} from "lucide-react";
import { simulationService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SIMULATION_ID = "phishing-04";

const EMAIL = {
  sender: "Documentos",
  senderEmail: "documento@partilha-arquivo.example",
  subject: "Miguel, enviaram-lhe um documento",
  date: "Hoje, 09:14",
  message:
    "Um documento foi partilhado consigo. Abra o ficheiro para consultar o conteúdo.",
  documentName: "Documento_Miguel.pdf",
  linkTarget: "https://partilha-arquivo.example/documento",
};

function BrowserBar({ url }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-slate-400">
          <ArrowLeft className="h-4 w-4" />
          <ArrowRight className="h-4 w-4 opacity-40" />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5">
          <Globe2 className="h-4 w-4 shrink-0 text-slate-400" />

          <span className="truncate text-xs font-medium text-slate-600">
            {url}
          </span>
        </div>

        <MoreHorizontal className="h-5 w-5 shrink-0 text-slate-400" />
      </div>
    </div>
  );
}

function AppHeader() {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          <FileArchive className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-black text-slate-950">
            Partilha de documentos
          </p>

          <p className="text-[11px] text-slate-400">
            Área de documentos
          </p>
        </div>
      </div>

      <div className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 sm:block">
        Documentos
      </div>
    </div>
  );
}

function InboxView({
  detailsOpen,
  onDetails,
  onOpen,
  onReport,
  busy,
}) {
  return (
    <div className="min-h-[650px] bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Inbox className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-black text-slate-950">
              Caixa de entrada
            </p>

            <p className="text-[11px] text-slate-400">
              1 mensagem nova
            </p>
          </div>
        </div>

        <Search className="h-5 w-5 text-slate-400" />
      </div>

      <div className="p-4 sm:p-6">
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <UserRound className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {EMAIL.sender}
                    </p>

                    <p className="mt-0.5 break-all text-xs text-slate-500">
                      {EMAIL.senderEmail}
                    </p>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400">
                    {EMAIL.date}
                  </span>
                </div>

                <div className="mt-5">
                  <h1 className="text-xl font-black tracking-tight text-slate-950">
                    {EMAIL.subject}
                  </h1>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {EMAIL.message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {detailsOpen && (
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Remetente
                  </p>

                  <p className="mt-1 break-all text-xs font-bold text-slate-700">
                    {EMAIL.senderEmail}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Destino
                  </p>

                  <p className="mt-1 break-all text-xs font-bold text-slate-700">
                    {EMAIL.linkTarget}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <Paperclip className="h-4 w-4 text-slate-400" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-700">
                  {EMAIL.documentName}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Documento partilhado
                </p>
              </div>

              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onDetails}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {detailsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}

              {detailsOpen ? "Ocultar detalhes" : "Ver detalhes"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onReport}
                disabled={busy}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                Denunciar
              </button>

              <button
                type="button"
                onClick={onOpen}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                Abrir documento
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentLanding({ onContinue, busy }) {
  return (
    <div className="min-h-[650px] bg-gradient-to-b from-slate-50 to-white">
      <BrowserBar url={EMAIL.linkTarget} />
      <AppHeader />

      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FileText className="h-8 w-8" />
          </div>

          <p className="mt-7 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Documento partilhado
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {EMAIL.documentName}
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            O documento foi disponibilizado através da plataforma de partilha.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                Formato
              </p>

              <p className="mt-1 text-xs font-bold text-slate-700">
                PDF
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                Partilhado
              </p>

              <p className="mt-1 text-xs font-bold text-slate-700">
                Hoje
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                Estado
              </p>

              <p className="mt-1 text-xs font-bold text-slate-700">
                Disponível
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            disabled={busy}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentViewer({ onDownload, busy }) {
  return (
    <div className="min-h-[650px] bg-slate-100">
      <BrowserBar url={`${EMAIL.linkTarget}/visualizar`} />
      <AppHeader />

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <div className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-sm font-black text-slate-950">
                {EMAIL.documentName}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Visualização do documento
              </p>
            </div>

            <button
              type="button"
              onClick={onDownload}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Descarregar
            </button>
          </div>

          <div className="bg-slate-200 p-5 sm:p-10">
            <div className="mx-auto min-h-[430px] max-w-2xl rounded-lg bg-white p-8 shadow-xl sm:p-12">
              <div className="border-b border-slate-200 pb-7">
                <div className="h-5 w-48 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
              </div>

              <div className="mt-8 space-y-4">
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-[92%] rounded bg-slate-100" />
                <div className="h-3 w-[86%] rounded bg-slate-100" />

                <div className="my-8 rounded-xl border border-slate-200 p-5">
                  <div className="h-3 w-40 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-[90%] rounded bg-slate-100" />
                </div>

                <div className="h-3 w-[80%] rounded bg-slate-100" />
                <div className="h-3 w-[73%] rounded bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessingView({ url, title, message, final = false }) {
  return (
    <div className="min-h-[650px] bg-gradient-to-b from-slate-50 to-white">
      <BrowserBar url={url} />
      <AppHeader />

      <div className="flex min-h-[540px] items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-900/5 sm:p-10">
          {final ? (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
          )}

          <p className="mt-7 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Partilha de documentos
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {title}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

function FinalNavigation({ onNext }) {
  return (
    <div className="border-t border-slate-200 bg-white px-5 py-5">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-800">
            Experiência terminada
          </p>

          <p className="mt-1 text-xs text-slate-500">
            O percurso desta experiência foi registado.
          </p>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
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

  const [screen, setScreen] = useState("inbox");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [finalStepId, setFinalStepId] = useState("step_04");

  const pathRef = useRef([]);
  const sequenceRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function record(
    action,
    stepId,
    interactionType,
    nextScreen,
    metadata = {}
  ) {
    if (busy) return false;

    setBusy(true);
    setError("");

    const sequence = sequenceRef.current + 1;

    sequenceRef.current = sequence;

    const event = {
      sequence,
      action,
      step_id: stepId,
      from_screen: screen,
      to_screen: nextScreen,
      at: new Date().toISOString(),
      ...metadata,
    };

    try {
      await simulationService.evaluate(
        SIMULATION_ID,
        action,
        user?.id,
        stepId,
        interactionType,
        {
          simulation: SIMULATION_ID,
          screen,
          next_screen: nextScreen,
          sequence,
          path_length: pathRef.current.length + 1,
          client_time: event.at,
          path: [...pathRef.current, event],
          ...metadata,
        }
      );

      pathRef.current = [...pathRef.current, event];

      return true;
    } catch (err) {
      setError(
        err?.message ||
          "Não foi possível registar esta interacção."
      );

      return false;
    } finally {
      if (mountedRef.current) {
        setBusy(false);
      }
    }
  }

  async function inspectDetails() {
    const action = detailsOpen
      ? "close_sender_details"
      : "inspect_sender";

    const ok = await record(
      action,
      "step_01",
      "inspect",
      "inbox",
      {
        element: "sender_details",
        sender: EMAIL.senderEmail,
        destination: EMAIL.linkTarget,
        details_open: !detailsOpen,
      }
    );

    if (ok) {
      setDetailsOpen((value) => !value);
    }
  }

  async function openDocument() {
    const ok = await record(
      "open_link",
      "step_01",
      "link",
      "document-landing",
      {
        element: "open_document",
        destination: EMAIL.linkTarget,
      }
    );

    if (ok) {
      setScreen("document-landing");
    }
  }

  async function reportEmail() {
    const ok = await record(
      "report",
      "step_01",
      "report",
      "report-processing",
      {
        element: "report_message",
      }
    );

    if (!ok) return;

    setFinalStepId("step_05");
    setScreen("report-processing");

    window.setTimeout(() => {
      if (!mountedRef.current) return;

      setScreen("report-confirmed");

      window.setTimeout(() => {
        if (!mountedRef.current) return;
        setFinished(true);
      }, 1500);
    }, 1600);
  }

  async function continueDocument() {
    const ok = await record(
      "continue_document",
      "step_02",
      "continue",
      "document-viewer",
      {
        element: "continue_document",
      }
    );

    if (ok) {
      setScreen("document-viewer");
    }
  }

  async function downloadDocument() {
    const ok = await record(
      "download_document",
      "step_03",
      "download",
      "document-processing",
      {
        element: "download_document",
        file_name: EMAIL.documentName,
      }
    );

    if (!ok) return;

    setFinalStepId("step_04");
    setScreen("document-processing");

    window.setTimeout(() => {
      if (!mountedRef.current) return;

      setScreen("document-final");

      window.setTimeout(() => {
        if (!mountedRef.current) return;
        setFinished(true);
      }, 1700);
    }, 1900);
  }

  async function finishAndNext() {
    const ok = await record(
      "finish",
      finalStepId,
      "finish",
      "phishing-05",
      {
        element: "next_simulation",
        final_step: finalStepId,
      }
    );

    if (ok) {
      navigate("/student/simulacoes/phishing-05");
    }
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ProcessingView
          final
          url="https://partilha-arquivo.example/processamento"
          title="Processo concluído"
          message="O percurso desta experiência terminou."
        />

        <FinalNavigation onNext={finishAndNext} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
              Phishing · 04 de 05
            </p>

            <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              Documento partilhado consigo
            </h1>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 sm:flex">
            <Clock3 className="h-4 w-4" />
            Experiência em curso
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {screen === "inbox" && (
          <InboxView
            detailsOpen={detailsOpen}
            onDetails={inspectDetails}
            onOpen={openDocument}
            onReport={reportEmail}
            busy={busy}
          />
        )}

        {screen === "document-landing" && (
          <DocumentLanding
            onContinue={continueDocument}
            busy={busy}
          />
        )}

        {screen === "document-viewer" && (
          <DocumentViewer
            onDownload={downloadDocument}
            busy={busy}
          />
        )}

        {screen === "report-processing" && (
          <ProcessingView
            url="https://partilha-arquivo.example/processamento"
            title="A processar o pedido"
            message="O pedido está a ser encaminhado para o serviço responsável."
          />
        )}

        {screen === "report-confirmed" && (
          <ProcessingView
            final
            url="https://partilha-arquivo.example/estado"
            title="Pedido recebido"
            message="O pedido foi registado pelo serviço de mensagens."
          />
        )}

        {screen === "document-processing" && (
          <ProcessingView
            url="https://partilha-arquivo.example/processamento"
            title="A preparar o documento"
            message="O pedido associado ao documento está a ser processado."
          />
        )}

        {screen === "document-final" && (
          <ProcessingView
            final
            url="https://partilha-arquivo.example/documento/estado"
            title="Documento processado"
            message="O processo associado ao documento terminou."
          />
        )}
      </div>
    </div>
  );
}