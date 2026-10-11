import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  Forward,
  Inbox,
  Info,
  Link2,
  Mail,
  Menu,
  MoreHorizontal,
  Paperclip,
  Reply,
  RotateCcw,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  getCurrentSimulation,
  startSimulation,
  transitionSimulation,
} from "./../engine/simulationEngine";

import { completeSimulationSession } from "./../engine/simulationSession";
import { getSimulationEvents } from "./../engine/simulationTelemetry";

const SIMULATION = {
  area: "phishing",
  id: "phishing-01",
  number: 1,
  title: "Email inesperado",
};

const STATES = {
  INBOX: "inbox",
  EMAIL_OPEN: "email_open",
  LEGITIMATE_EMAIL: "legitimate_email",
  SENDER_DETAILS: "sender_details",
  ATTACHMENT_PREVIEW: "attachment_preview",
  LINK_PREVIEW: "link_preview",
  EXTERNAL_SITE: "external_site",
  ACCOUNT_VIEW: "account_view",
  LOGIN: "login",
  SAFE_EXIT_FEEDBACK: "safe_exit_feedback",
  CONSEQUENCE: "consequence",
  SERVICE_UNAVAILABLE: "service_unavailable",
  REPLY: "reply",
  FORWARD: "forward",
  ARCHIVED: "archived",
  DELETED: "deleted",
  COMPLETED: "completed",
};

const INBOX_MESSAGES = [
  {
    id: "academicos-01",
    senderName: "Serviços Académicos",
    senderInitials: "SA",
    senderEmail: "servicos.academicos@sicsi-edu.org",
    recipient: "miguel.ncuna@sicsi.edu",
    replyTo: "atendimento@sicsi-academico-verificacao.org",
    subject: "Actualização necessária dos seus dados académicos",
    date: "14 de Setembro de 2026, 09:17",
    preview:
      "Foi detectada uma inconsistência no seu registo académico. Consulte o documento em anexo para verificar os seus dados.",
    attachment: "Verificacao_Dados_Academicos.pdf",
    attachmentSize: "248 KB",
    link: "https://sicsi-academico-verificacao.org/validar",
    folder: "inbox",
    suspicious: true,
    primary: true,
    body: [
      "Caro estudante,",
      "",
      "Durante uma verificação recente dos registos académicos, foi identificada uma inconsistência associada ao seu perfil.",
      "",
      "Para evitar limitações temporárias no acesso aos serviços académicos, solicitamos a verificação dos seus dados através do documento disponibilizado nesta mensagem.",
      "",
      "A actualização deverá ser efectuada assim que possível.",
      "",
      "Com os melhores cumprimentos,",
      "Serviços Académicos",
      "Gabinete de Gestão Académica",
    ],
  },
  {
    id: "biblioteca-01",
    senderName: "Biblioteca Universitária",
    senderInitials: "BU",
    senderEmail: "biblioteca@sicsi.edu",
    subject: "Devolução de livros — aviso",
    date: "14 de Setembro de 2026, 08:42",
    preview:
      "Recordamos que existem materiais associados ao seu registo que devem ser devolvidos dentro do prazo definido.",
    folder: "inbox",
    body: [
      "Caro estudante,",
      "",
      "Recordamos que existem materiais associados ao seu registo da biblioteca que devem ser devolvidos dentro do prazo definido.",
      "",
      "A consulta do seu estado de empréstimos pode ser realizada directamente no balcão da biblioteca ou através dos canais institucionais habituais.",
      "",
      "Com os melhores cumprimentos,",
      "Biblioteca Universitária",
    ],
    suspicious: false,
    primary: false,
  },
  {
    id: "secretaria-01",
    senderName: "Secretaria Académica",
    senderInitials: "SA",
    senderEmail: "secretaria@sicsi.edu",
    subject: "Calendário académico — actualização",
    date: "13 de Setembro de 2026, 16:08",
    preview:
      "Foi disponibilizada uma actualização do calendário académico para consulta no portal institucional.",
    folder: "inbox",
    body: [
      "Caro estudante,",
      "",
      "Informamos que foi disponibilizada uma actualização do calendário académico.",
      "",
      "A informação pode ser consultada através dos canais institucionais habituais da instituição.",
      "",
      "Com os melhores cumprimentos,",
      "Secretaria Académica",
    ],
    suspicious: false,
    primary: false,
  },
  {
    id: "portal-01",
    senderName: "Portal do Estudante",
    senderInitials: "PE",
    senderEmail: "portal@sicsi.edu",
    subject: "Novo aviso disponível no portal",
    date: "13 de Setembro de 2026, 11:26",
    preview:
      "Existe uma nova comunicação académica disponível na sua área de estudante.",
    folder: "inbox",
    body: [
      "Caro estudante,",
      "",
      "Existe uma nova comunicação académica disponível na sua área de estudante.",
      "",
      "Para consultar informações da sua conta, utilize directamente o portal institucional através do endereço que já utiliza habitualmente.",
      "",
      "Com os melhores cumprimentos,",
      "Portal do Estudante",
    ],
    suspicious: false,
    primary: false,
  },
  {
    id: "docentes-01",
    senderName: "Serviço de Docentes",
    senderInitials: "SD",
    senderEmail: "docentes@sicsi.edu",
    subject: "Informação sobre actividades lectivas",
    date: "12 de Setembro de 2026, 14:51",
    preview:
      "Consulte as informações actualizadas relativas às próximas actividades lectivas.",
    folder: "inbox",
    body: [
      "Caro estudante,",
      "",
      "Partilhamos uma informação actualizada relativa às próximas actividades lectivas.",
      "",
      "Consulte os canais académicos habituais para obter os detalhes completos.",
      "",
      "Com os melhores cumprimentos,",
      "Serviço de Docentes",
    ],
    suspicious: false,
    primary: false,
  },
];

const EMAIL = INBOX_MESSAGES[0];

function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}m ${remaining}s`;
}

function createInitialSession() {
  const session = startSimulation({
    area: SIMULATION.area,
    simulationId: SIMULATION.id,
    simulationNumber: SIMULATION.number,
    initialState: STATES.INBOX,
    forceNew: true,
  });

  transitionSimulation({
    action: "simulation_started",
    nextState: STATES.INBOX,
    interactionType: "lifecycle",
    metadata: {
      title: SIMULATION.title,
    },
  });

  return getCurrentSimulation() || session;
}

function IconButton({
  label,
  onClick,
  children,
  disabled = false,
  danger = false,
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
        disabled
          ? "cursor-not-allowed text-slate-300"
          : danger
            ? "text-slate-500 hover:bg-red-50 hover:text-red-600"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function SidebarButton({
  icon,
  label,
  active = false,
  onClick,
  count,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
        active
          ? "bg-blue-50 font-semibold text-blue-700"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count ? (
        <span className="shrink-0 text-xs font-semibold text-slate-400">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function MailRow({ message, selected, onClick, onStar, starred }) {
  return (
    <div
      className={`flex w-full min-w-0 items-stretch border-b border-slate-200 transition ${
        selected ? "bg-blue-50/70" : "bg-white hover:bg-slate-50"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="min-w-0 flex-1 px-3 py-4 text-left sm:px-5"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {message.senderInitials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="truncate text-sm font-semibold text-slate-900">
                {message.senderName}
              </p>

              <span className="shrink-0 text-xs text-slate-400">
                {message.date}
              </span>
            </div>

            <p className="mt-1 truncate text-sm font-medium text-slate-800">
              {message.subject}
            </p>

            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
              {message.preview}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              {message.attachment && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <Paperclip size={13} />
                    {message.attachment}
                  </span>

                  <span>•</span>
                </>
              )}

              <span>Caixa de entrada</span>

              {message.suspicious && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-amber-600">
                    Requer atenção
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </button>

      <button
        type="button"
        aria-label={`Marcar mensagem de ${message.senderName} como importante`}
        title="Marcar como importante"
        onClick={onStar}
        className={`flex w-11 shrink-0 items-start justify-center pt-5 transition ${
          starred ? "text-amber-500" : "text-slate-300 hover:text-amber-500"
        }`}
      >
        <Star size={18} fill={starred ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
function BrowserHeader({
  onBack,
  title,
  url,
  onClose,
}) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-3 py-2 sm:px-5">
        <IconButton label="Voltar" onClick={onBack}>
          <ArrowLeft size={17} />
        </IconButton>

        <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="truncate text-xs font-medium text-slate-700">
            {title}
          </p>
          <p className="truncate text-[11px] text-slate-400">{url}</p>
        </div>

        <IconButton label="Fechar ambiente" onClick={onClose}>
          <X size={17} />
        </IconButton>
      </div>
    </div>
  );
}

export default function Phishing01Page() {
  const navigate = useNavigate();

  const [session, setSession] = useState(createInitialSession);
  const [state, setState] = useState(
    () => getCurrentSimulation()?.current_state || STATES.INBOX
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedLegitimateMessage, setSelectedLegitimateMessage] = useState(null);
  const [starredMessageIds, setStarredMessageIds] = useState([]);
  const [archivedMessageIds, setArchivedMessageIds] = useState([]);
  const [deletedMessageIds, setDeletedMessageIds] = useState([]);
  const [unreadMessageIds, setUnreadMessageIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [forwardText, setForwardText] = useState("");
  const [forwardRecipient, setForwardRecipient] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPasswordEntered, setLoginPasswordEntered] = useState(false);
  const [lastAction, setLastAction] = useState(null);


  useEffect(() => {
    const startedAt = session?.started_at
      ? new Date(session.started_at).getTime()
      : Date.now();

    const updateElapsed = () => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
      );
    };

    updateElapsed();

    const interval = window.setInterval(updateElapsed, 1000);

    return () => window.clearInterval(interval);
  }, [session?.started_at]);

  function track({
    action,
    nextState = null,
    interactionType = "interaction",
    metadata = {},
  }) {
    const result = transitionSimulation({
      action,
      nextState,
      interactionType,
      metadata,
    });

    if (result.session) {
      setSession(result.session);
    }

    if (nextState) {
      setState(nextState);

      const mailStates = [
        STATES.INBOX,
        STATES.EMAIL_OPEN,
        STATES.LEGITIMATE_EMAIL,
        STATES.SENDER_DETAILS,
        STATES.ATTACHMENT_PREVIEW,
        STATES.LINK_PREVIEW,
        STATES.ARCHIVED,
        STATES.DELETED,
      ];

      if (!mailStates.includes(nextState)) {
        setMenuOpen(false);
        setMobileSidebarOpen(false);
      }
    }

    setLastAction(action);

    return result;
  }

  function navigateState(nextState, action, metadata = {}) {
    track({
      action,
      nextState,
      interactionType: "navigation",
      metadata,
    });
  }
  function getPhishingJourneyEvents() {
    const currentSession = getCurrentSimulation();

    if (!currentSession?.session_id) {
      return [];
    }

    return getSimulationEvents().filter(
      (event) => event.session_id === currentSession.session_id
    );
  }

  function getPhishingFeedbackSnapshot() {
    const events = getPhishingJourneyEvents();
    const actions = events.map((event) => event.action);

    const hasCredentialSubmission = actions.includes("submit_credentials");
    const hasSafeExit = actions.includes("leave_authentication");

    const openedEmail = actions.includes("open_email");
    const inspectedSender = actions.includes("inspect_sender_details");
    const openedAttachment = actions.includes("open_attachment");
    const downloadedAttachment = actions.includes("download_attachment");
    const openedLink = actions.includes("open_link_preview");
    const openedExternalSite = actions.includes("open_external_site");
    const viewedAccount = actions.includes("consult_account");

    const suspiciousSignals = [
      {
        label: "Domínio incompatível",
        detail:
          "A mensagem utiliza um domínio diferente do domínio institucional esperado para serviços académicos.",
      },
      {
        label: "Reply-To diferente",
        detail:
          "O endereço utilizado para resposta não corresponde ao remetente apresentado.",
      },
      {
        label: "Urgência artificial",
        detail:
          "A mensagem cria pressão ao mencionar possíveis limitações no acesso aos serviços académicos.",
      },
      {
        label: "Pedido de verificação de dados",
        detail:
          "O utilizador é incentivado a validar dados através de um conteúdo fornecido pela própria mensagem.",
      },
      {
        label: "Ligação externa",
        detail:
          "A ligação aponta para sicsi-academico-verificacao.org em vez de um domínio institucional esperado.",
      },
      {
        label: "Contexto académico usado como isco",
        detail:
          "O atacante utiliza uma situação académica plausível para reduzir a desconfiança.",
      },
    ];

    const attackerTechniques = [
      "Impersonação institucional",
      "Exploração da urgência",
      "Engenharia social contextual",
      "Redireccionamento para domínio externo",
      "Indução à autenticação",
      "Tentativa de captura de credenciais",
    ];

    const decisions = [];

    if (openedEmail) {
      decisions.push("Abriu a mensagem suspeita.");
    }

    if (inspectedSender) {
      decisions.push("Inspeccionou os detalhes do remetente.");
    } else {
      decisions.push("Não foi registada uma inspecção detalhada do remetente.");
    }

    if (openedAttachment) {
      decisions.push("Abriu o documento apresentado na mensagem.");
    }

    if (downloadedAttachment) {
      decisions.push("Descarregou o documento anexado.");
    }

    if (openedLink) {
      decisions.push("Abriu a pré-visualização da ligação.");
    }

    if (openedExternalSite) {
      decisions.push("Prosseguiu para o ambiente externo apresentado pela mensagem.");
    }

    if (viewedAccount) {
      decisions.push("Consultou o ambiente de conta apresentado na experiência.");
    }

    if (hasCredentialSubmission) {
      decisions.push("Submeteu dados de autenticação no ambiente simulado.");
    }

    if (hasSafeExit) {
      decisions.push("Saiu da autenticação antes de submeter credenciais.");
    }

    const negativeOutcome = hasCredentialSubmission;

    const valueAtRisk = 38500;
    const valueProtected = negativeOutcome ? 0 : valueAtRisk;
    const simulatedLoss = negativeOutcome ? valueAtRisk : 0;

    return {
      events,
      actions,
      openedEmail,
      inspectedSender,
      openedAttachment,
      downloadedAttachment,
      openedLink,
      openedExternalSite,
      viewedAccount,
      hasCredentialSubmission,
      hasSafeExit,
      negativeOutcome,
      valueAtRisk,
      valueProtected,
      simulatedLoss,
      decisions,
      suspiciousSignals,
      attackerTechniques,
    };
  }

function openEmail() {
    track({
      action: "open_email",
      nextState: STATES.EMAIL_OPEN,
      interactionType: "message",
      metadata: {
        sender: EMAIL.senderEmail,
        subject: EMAIL.subject,
      },
    });
  }

  function openSenderDetails() {
    navigateState(STATES.SENDER_DETAILS, "inspect_sender_details");
  }

  function openAttachment() {
    navigateState(STATES.ATTACHMENT_PREVIEW, "open_attachment", {
      file_name: EMAIL.attachment,
      file_size: EMAIL.attachmentSize,
    });
  }

  function downloadAttachment() {
    track({
      action: "download_attachment",
      nextState: STATES.ATTACHMENT_PREVIEW,
      interactionType: "download",
      metadata: {
        file_name: EMAIL.attachment,
        file_size: EMAIL.attachmentSize,
        download_completed: true,
      },
    });
  }

  function openLinkPreview() {
    navigateState(STATES.LINK_PREVIEW, "open_link_preview", {
      destination: EMAIL.link,
    });
  }

  function openExternalSite() {
    navigateState(STATES.EXTERNAL_SITE, "open_external_site", {
      destination_domain: "sicsi-academico-verificacao.org",
    });
  }

  function consultAccount() {
    navigateState(STATES.ACCOUNT_VIEW, "consult_account", {
      destination: "academic-account",
      consequence: "account_information_displayed",
    });
  }

  function continueToLogin() {
    navigateState(STATES.LOGIN, "continue_to_authentication", {
      destination: "academic-login",
    });
  }

  function leaveExternalSite() {
    navigateState(STATES.LINK_PREVIEW, "leave_external_site");
  }

  function returnToExternalSite() {
    navigateState(STATES.EXTERNAL_SITE, "return_to_external_site");
  }

  function submitLogin() {
    track({
      action: "submit_credentials",
      nextState: STATES.SERVICE_UNAVAILABLE,
      interactionType: "credentials",
      metadata: {
        email: loginEmail.trim() || "[NOT_PROVIDED]",
        email_entered: Boolean(loginEmail.trim()),
        password_entered: loginPasswordEntered,
        password_content: "[NOT_STORED]",
        submission_completed: true,
        simulated_result: "service_temporarily_unavailable",
        report_relevant: true,
        safe: false,
        decision_label: "ATAQUE BEM-SUCEDIDO",
        feedback:
          "As suas credenciais foram comprometidas no cenário. A página de autenticação fazia parte da cadeia de ataque. Ao seleccionar enviar, a informação introduzida passou a ser considerada capturada para efeitos desta experiência.",
        simulation_id: "phishing-01",
      },
    });
  }

  function leaveLogin() {
    navigateState(
      STATES.SAFE_EXIT_FEEDBACK,
      "leave_authentication",
      {
        authentication_completed: false,
        credentials_submitted: false,
        decision: "left_without_submitting",
        report_relevant: true,
        safe: true,
        decision_label: "ATAQUE BLOQUEADO",
        feedback:
          "A sua decisão interrompeu o ataque antes da entrega das credenciais. O atacante tentou levá-lo a autenticar-se num ambiente falso apresentado como serviço académico.",
        simulation_id: "phishing-01",
      }
    );
  }


  function retryService() {
  track({
    action: "retry_unavailable_service",
    nextState: STATES.EMAIL_OPEN,
    interactionType: "navigation",
    metadata: {
      retry_requested: true,
      destination: "initial_email",
    },
  });
}
function returnFromUnavailableService() {
    track({
      action: "return_from_unavailable_service",
      nextState: null,
      interactionType: "navigation",
      metadata: {
        returned_to: "simulation_hub",
        destination: "/student/simulacoes",
      },
    });

    navigate("/student/simulacoes");
  }
function finishSafeExitAndNext() {
    track({
      action: "complete_simulation",
      nextState: null,
      interactionType: "lifecycle",
      metadata: {
        elapsed_seconds: elapsedSeconds,
        elapsed: formatDuration(elapsedSeconds * 1000),
        completion_point: "safe_exit_feedback",
        authentication_completed: false,
        credentials_submitted: false,
      },
    });

    const completed = completeSimulationSession();

    if (completed) {
      setSession(completed);
    }


    track({
      action: "continue_to_simulation_02",
      nextState: null,
      interactionType: "navigation",
      metadata: {
        destination: "/student/simulacoes/phishing/02",
        previous_decision: "left_without_submitting_credentials",
      },
    });

    navigate("/student/simulacoes/phishing/02");
  }

  function submitReply() {
    track({
      action: "send_reply",
      nextState: STATES.EMAIL_OPEN,
      interactionType: "communication",
      metadata: {
        content_entered: Boolean(replyText.trim()),
        content_length: replyText.length,
      },
    });

    setReplyText("");
  }

  function submitForward() {
    track({
      action: "send_forward",
      nextState: STATES.EMAIL_OPEN,
      interactionType: "communication",
      metadata: {
        recipient_entered: Boolean(forwardRecipient.trim()),
        content_entered: Boolean(forwardText.trim()),
        content_length: forwardText.length,
      },
    });

    setForwardRecipient("");
    setForwardText("");
  }

  function archiveEmail() {
    navigateState(STATES.ARCHIVED, "archive_email", {
      folder: "archive",
    });
  }

  function deleteEmail() {
    navigateState(STATES.DELETED, "delete_email", {
      folder: "trash",
    });
  }

  function restoreEmail() {
    navigateState(STATES.EMAIL_OPEN, "restore_email", {
      restored_from: "trash",
    });
  }

  function changeFolder(folder) {
    setActiveFolder(folder);
    setMobileSidebarOpen(false);

    track({
      action: "open_folder",
      nextState: state,
      interactionType: "navigation",
      metadata: {
        folder,
      },
    });
  }

  function performSearch(event) {
    event.preventDefault();

    track({
      action: "search_mail",
      nextState: state,
      interactionType: "search",
      metadata: {
        query_entered: Boolean(searchText.trim()),
        query_length: searchText.length,
      },
    });
  }

  function toggleMenu() {
    const nextValue = !menuOpen;
    setMenuOpen(nextValue);

    track({
      action: nextValue ? "open_more_menu" : "close_more_menu",
      nextState: state,
      interactionType: "menu",
    });
  }


  function toggleStar(messageId = EMAIL.id) {
    setStarredMessageIds((current) => {
      const exists = current.includes(messageId);

      return exists
        ? current.filter((id) => id !== messageId)
        : [...current, messageId];
    });

    track({
      action: "toggle_star",
      nextState: state,
      interactionType: "message",
      metadata: {
        message_id: messageId,
        starred: !starredMessageIds.includes(messageId),
      },
    });

    setLastAction({
      type: "star_toggled",
      messageId,
      starred: !starredMessageIds.includes(messageId),
    });
  }

  function markUnread() {
    track({
      action: "mark_as_unread",
      nextState: STATES.EMAIL_OPEN,
      interactionType: "message",
    });
  }

  function reportMessage() {
    track({
      action: "report_message",
      nextState: STATES.EMAIL_OPEN,
      interactionType: "security",
      metadata: {
        report_submitted: true,
      },
    });

    setMenuOpen(false);
  }

  function openReply() {
    navigateState(STATES.REPLY, "open_reply_composer");
  }

  function openForward() {
    navigateState(STATES.FORWARD, "open_forward_composer");
  }

  function concludeAndNext() {
    if (session?.completed || state === STATES.COMPLETED) {
      navigate("/student/simulacoes/phishing/02");
      return;
    }

    track({
      action: "complete_simulation",
      nextState: null,
      interactionType: "lifecycle",
      metadata: {
        elapsed_seconds: elapsedSeconds,
        elapsed: formatDuration(elapsedSeconds * 1000),
        completion_point: "simulation_footer",
      },
    });

    const completed = completeSimulationSession();

    if (completed) {
      setSession(completed);
    }


    track({
      action: "continue_to_simulation_02",
      nextState: null,
      interactionType: "navigation",
      metadata: {
        destination: "/student/simulacoes/phishing/02",
      },
    });

    navigate("/student/simulacoes/phishing/02");
  }

function goToSimulationHub() {
    track({
      action: "exit_to_simulations",
      nextState: state,
      interactionType: "navigation",
    });

    navigate("/student/simulacoes");
  }

  function renderInbox() {
    const folderTitle =
      activeFolder === "archive"
        ? "Arquivo"
        : activeFolder === "trash"
          ? "Lixo"
          : activeFolder === "starred"
            ? "Com estrela"
            : "Caixa de entrada";

    function abrirMensagem(message) {
      setMobileSidebarOpen(false);
      setMenuOpen(false);
      if (message.primary) {
        openEmail();
        return;
      }

      setSelectedLegitimateMessage(message);

      track({
        action: "open_legitimate_message",
        nextState: STATES.LEGITIMATE_EMAIL,
        interactionType: "message",
        metadata: {
          messageId: message.id,
          sender: message.senderName,
          senderEmail: message.senderEmail,
          subject: message.subject,
          suspicious: false,
        },
      });

      setState(STATES.LEGITIMATE_EMAIL);
    }

    function marcarMensagem(message) {
      track({
        action: "star_message",
        nextState: STATES.INBOX,
        interactionType: "navigation",
        metadata: {
          messageId: message.id,
          sender: message.senderName,
        },
      });

      toggleStar(message.id);
    }

    return (
      <div className="min-w-0 flex-1 bg-white">
        <div className="border-b border-slate-200 px-3 py-3 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                {folderTitle}
              </p>

              <h2 className="mt-1 truncate text-lg font-bold text-slate-900">
                {activeFolder === "inbox"
                  ? "Mensagens recentes"
                  : folderTitle}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {INBOX_MESSAGES.length} mensagens disponíveis para análise
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <IconButton
                label="Actualizar caixa de correio"
                onClick={() => {
                  track({
                    action: "refresh_mailbox",
                    nextState: STATES.INBOX,
                    interactionType: "navigation",
                    metadata: {
                      messagesVisible: INBOX_MESSAGES.length,
                    },
                  });
                }}
              >
                <RotateCcw size={17} />
              </IconButton>

              <IconButton
                label="Pesquisar mensagens"
                onClick={() => {
                  document.getElementById("simulation-search")?.focus();

                  track({
                    action: "focus_search",
                    nextState: STATES.INBOX,
                    interactionType: "search",
                    metadata: {
                      messagesAvailable: INBOX_MESSAGES.length,
                    },
                  });
                }}
              >
                <Search size={17} />
              </IconButton>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 sm:px-5">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Mail size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-900">
                  Caixa de entrada
                </p>
                <p className="truncate text-xs text-blue-700">
                  Analise o remetente, o assunto e o conteúdo antes de interagir.
                </p>
              </div>
            </div>

            <span className="hidden shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-blue-700 sm:inline-flex">
              {INBOX_MESSAGES.length} mensagens
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {INBOX_MESSAGES.map((message) => (
              <MailRow
                key={message.id}
                message={message}
                selected={false}
                onClick={() => abrirMensagem(message)}
                onStar={() => marcarMensagem(message)}
                starred={starredMessageIds.includes(message.id)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  function renderEmail() {
    return (
      <div className="min-w-0 flex-1 bg-white">
        <div className="flex min-w-0 items-center gap-1 border-b border-slate-200 px-2 py-2 sm:px-4">
          <IconButton
            label="Voltar à caixa de entrada"
            onClick={() =>
              navigateState(STATES.INBOX, "back_to_inbox")
            }
          >
            <ArrowLeft size={17} />
          </IconButton>

          <div className="mx-1 min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              Mensagem
            </p>
          </div>

          <IconButton label="Arquivar mensagem" onClick={archiveEmail}>
            <Archive size={17} />
          </IconButton>

          <IconButton
            label="Eliminar mensagem"
            danger
            onClick={deleteEmail}
          >
            <Trash2 size={17} />
          </IconButton>

          <IconButton label="Mais opções" onClick={toggleMenu}>
            <MoreHorizontal size={18} />
          </IconButton>
        </div>

        {menuOpen ? (
          <div className="relative z-20 border-b border-slate-200 bg-white px-3 py-2 shadow-sm sm:px-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={markUnread}
                className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                Marcar como não lida
              </button>

              <button
                type="button"
                onClick={reportMessage}
                className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                Denunciar mensagem
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openSenderDetails();
                }}
                className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                Ver detalhes do remetente
              </button>
            </div>
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-4xl px-3 py-5 sm:px-6 sm:py-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-5 sm:px-7">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {EMAIL.senderInitials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <button
                      type="button"
                      onClick={openSenderDetails}
                      className="min-w-0 truncate text-left text-sm font-bold text-slate-900 hover:text-blue-700"
                    >
                      {EMAIL.senderName}
                    </button>

                    <span className="shrink-0 text-xs text-slate-400">
                      {EMAIL.date}
                    </span>
                  </div>

                  <p className="mt-1 break-all text-xs text-slate-500">
                    {EMAIL.senderEmail}
                  </p>

                  <button
                    type="button"
                    onClick={openSenderDetails}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Ver detalhes
                    <ChevronDown size={13} />
                  </button>
                </div>

                <IconButton label="Marcar com estrela" onClick={toggleStar}>
                  <Star size={18} />
                </IconButton>
              </div>

              <h1 className="mt-6 break-words text-xl font-bold leading-7  sm:text-2xl text-blue-700">
                {EMAIL.subject}
              </h1>
            </div>

            <div className="px-4 py-6 sm:px-7 sm:py-8">
              <div className="space-y-4 text-sm leading-7 text-slate-700">
                {EMAIL.body.map((paragraph, index) =>
                  paragraph ? (
                    <p key={`${paragraph}-${index}`}>{paragraph}</p>
                  ) : (
                    <div key={`space-${index}`} className="h-1" />
                  )
                )}
              </div>

              <div className="mt-7 overflow-hidden rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={openAttachment}
                  className="flex w-full min-w-0 items-center gap-3 p-4 text-left transition hover:bg-slate-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <FileText size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {EMAIL.attachment}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Documento PDF · {EMAIL.attachmentSize}
                    </p>
                  </div>

                  <ArrowRight className="shrink-0 text-slate-400" size={17} />
                </button>

                <div className="border-t border-slate-200 px-4 py-3">
                  <button
                    type="button"
                    onClick={downloadAttachment}
                    className="inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <Download size={16} />
                    <span className="truncate">Descarregar documento</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-start gap-3">
                  <Link2 className="mt-0.5 shrink-0 text-blue-600" size={18} />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Área de confirmação académica
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {EMAIL.link}
                    </p>

                    <button
                      type="button"
                      onClick={openLinkPreview}
                      className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <span className="truncate">
                        Abrir ligação de confirmação
                      </span>
                      <ExternalLink size={15} className="shrink-0" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-2 border-t border-slate-200 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={openReply}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Reply size={17} />
                  Responder
                </button>

                <button
                  type="button"
                  onClick={openForward}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Forward size={17} />
                  Encaminhar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSenderDetails() {
    return (
      <div className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
          <button
            type="button"
            onClick={() =>
              navigateState(STATES.EMAIL_OPEN, "close_sender_details")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Voltar à mensagem
          </button>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {EMAIL.senderInitials}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {EMAIL.senderName}
                  </h2>
                  <p className="break-all text-sm text-slate-500">
                    {EMAIL.senderEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Destinatário
                </p>
                <p className="mt-1 break-all text-sm text-slate-700">
                  {EMAIL.recipient}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Responder para
                </p>
                <p className="mt-1 break-all text-sm text-slate-700">
                  {EMAIL.replyTo}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Assunto
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {EMAIL.subject}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <Info size={18} className="mt-0.5 shrink-0 text-slate-500" />
                  <p className="text-sm leading-6 text-slate-600">
                    Os detalhes técnicos da mensagem estão disponíveis neste
                    ambiente como parte da experiência.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigateState(
                    STATES.EMAIL_OPEN,
                    "return_from_sender_details"
                  )
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Voltar à mensagem
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAttachmentPreview() {
    return (
      <div className="min-w-0 flex-1 bg-slate-100">
        <div className="mx-auto w-full max-w-4xl px-3 py-5 sm:px-6 sm:py-8">
          <button
            type="button"
            onClick={() =>
              navigateState(
                STATES.EMAIL_OPEN,
                "close_attachment_preview"
              )
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Voltar à mensagem
          </button>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <FileText size={23} />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {EMAIL.attachment}
                  </h2>
                  <p className="text-sm text-slate-500">
                    PDF · {EMAIL.attachmentSize}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={downloadAttachment}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download size={16} />
                Descarregar
              </button>
            </div>

            <div className="p-4 sm:p-8">
              <div className="mx-auto min-h-[420px] max-w-2xl rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-inner sm:p-8">
                <div className="border-b border-slate-200 pb-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Documento académico
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    Verificação de dados
                  </h3>
                </div>

                <div className="mt-7 space-y-4 text-sm leading-7 text-slate-600">
                  <p>
                    O presente documento solicita a verificação de dados
                    associados ao perfil académico.
                  </p>
                  <p>
                    Para consultar o procedimento de validação, utilize a área
                    indicada na mensagem recebida.
                  </p>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-400">
                      Referência do documento
                    </p>
                    <p className="mt-1 font-mono text-sm text-slate-700">
                      SICSI-ACADEMICO-2026
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderLinkPreview() {
    return (
      <div className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
          <button
            type="button"
            onClick={() =>
              navigateState(STATES.EMAIL_OPEN, "close_link_preview")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Voltar à mensagem
          </button>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Navegação
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Área de verificação académica
              </h2>
            </div>

            <div className="p-5 sm:p-8">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Endereço
                </p>
                <p className="mt-2 break-all font-mono text-sm text-slate-700">
                  {EMAIL.link}
                </p>
              </div>

              <p className="mt-6 text-sm leading-6 text-slate-600">
                A ligação está preparada para abrir um ambiente externo
                simulado. O endereço completo permanece visível antes de
                prosseguir.
              </p>

              <button
                type="button"
                onClick={openExternalSite}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 sm:w-auto"
              >
                Abrir ambiente
                <ExternalLink size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderExternalSite() {
    return (
      <div className="min-w-0 flex-1 bg-slate-100">
        <BrowserHeader
          title="Portal Académico"
          url="https://sicsi-academico-verificacao.org/validar"
          onBack={leaveExternalSite}
          onClose={leaveExternalSite}
        />

        <div className="mx-auto w-full max-w-4xl px-3 py-5 sm:px-6 sm:py-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-blue-50 px-5 py-6 sm:px-8">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 shrink-0 text-blue-700" size={22} />

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                    Portal Académico
                  </p>
                  <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                    Confirmação de dados académicos
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Foi localizada uma solicitação de confirmação associada ao
                    seu perfil académico.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={consultAccount}
                  className="group rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Inbox size={20} />
                    </div>
                    <ArrowRight
                      size={17}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                    />
                  </div>

                  <h2 className="mt-5 font-bold text-slate-900">
                    Consultar conta
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Consultar informação disponível sobre a sua conta
                    académica.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={continueToLogin}
                  className="group rounded-2xl border border-blue-200 bg-blue-50/50 p-5 text-left transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <ArrowRight size={20} />
                    </div>
                    <ArrowRight
                      size={17}
                      className="text-blue-300 transition group-hover:translate-x-1 group-hover:text-blue-700"
                    />
                  </div>

                  <h2 className="mt-5 font-bold text-slate-900">
                    Continuar
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Prosseguir para a etapa seguinte da confirmação.
                  </p>
                </button>
              </div>

              <button
                type="button"
                onClick={leaveExternalSite}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Sair deste ambiente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAccountView() {
    return (
      <div className="min-w-0 flex-1 bg-slate-100">
        <BrowserHeader
          title="Conta académica"
          url="https://sicsi-academico-verificacao.org/conta"
          onBack={returnToExternalSite}
          onClose={returnToExternalSite}
        />

        <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Conta académica
              </p>
              <h1 className="mt-2 text-xl font-bold text-slate-900">
                Informação do perfil
              </h1>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-400">Estado da conta</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Verificação pendente
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-400">Última actualização</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  14 de Setembro de 2026
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  A consulta da conta terminou nesta vista do ambiente
                  simulado. Pode regressar ao acesso anterior ou avançar para
                  a etapa de autenticação.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={returnToExternalSite}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={continueToLogin}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Continuar
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderLogin() {
    return (
      <div className="min-w-0 flex-1 bg-slate-100">
        <BrowserHeader
          title="Autenticação"
          url="https://sicsi-academico-verificacao.org/validar/login"
          onBack={returnToExternalSite}
          onClose={returnToExternalSite}
        />

        <div className="mx-auto w-full max-w-lg px-3 py-5 sm:px-6 sm:py-10">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 text-center sm:p-7">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Shield size={22} />
              </div>

              <h1 className="mt-4 text-xl font-bold text-slate-900">
                Aceder ao Portal do Estudante
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Utilize os dados associados à sua conta académica para
                continuar.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitLogin();
              }}
              className="space-y-5 p-5 sm:p-7"
            >
              <div>
                <label
                  htmlFor="academic-email"
                  className="text-sm font-semibold text-slate-700"
                >
                  E-mail institucional
                </label>

                <input
                  id="academic-email"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => {
                    setLoginEmail(event.target.value);

                    track({
                      action: "enter_email",
                      nextState: STATES.LOGIN,
                      interactionType: "form",
                      metadata: {
                        field: "email",
                        entered: Boolean(event.target.value),
                      },
                    });
                  }}
                  placeholder="nome@instituicao.edu"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="academic-password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Palavra-passe
                </label>

                <input
                  id="academic-password"
                  type="password"
                  autoComplete="off"
                  onChange={(event) => {
                    setLoginPasswordEntered(Boolean(event.target.value));

                    track({
                      action: "enter_password",
                      nextState: STATES.LOGIN,
                      interactionType: "credentials",
                      metadata: {
                        field: "password",
                        entered: Boolean(event.target.value),
                        password_content: "[NOT_STORED]",
                      },
                    });
                  }}
                  placeholder="Introduza a palavra-passe"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  O conteúdo da palavra-passe nunca é guardado pela
                  simulação.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={leaveLogin}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft size={16} />
                  Sair
                </button>

                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Continuar
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  function renderSafeExitFeedback() {
    const feedback = getPhishingFeedbackSnapshot();

    return (
      <div className="min-w-0 flex-1 bg-slate-50">

        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">

          <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">

            <div className="bg-emerald-600 px-5 py-8 text-white sm:px-8">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <Shield size={28} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                    Feedback da Simulação 01
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    ATAQUE BLOQUEADO
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50">
                    A sua decisão interrompeu o ataque antes da entrega das
                    credenciais. O atacante tentou levá-lo a autenticar-se
                    num ambiente falso apresentado como serviço académico.
                  </p>

                </div>

              </div>

            </div>

            <div className="space-y-5 p-5 sm:p-8">

              <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Credenciais
                  </p>

                  <p className="mt-2 text-xl font-black text-emerald-950">
                    NÃO ENTREGUES
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    Nenhum conjunto de autenticação foi submetido.
                  </p>

                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Conta académica
                  </p>

                  <p className="mt-2 text-xl font-black text-emerald-950">
                    PROTEGIDA
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    A autenticação não foi concluída.
                  </p>

                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Dados académicos
                  </p>

                  <p className="mt-2 text-xl font-black text-emerald-950">
                    PROTEGIDOS
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    O acesso simulado não foi concluído.
                  </p>

                </div>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">

                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                  O que o atacante tentou fazer
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-700">
                  A mensagem utilizou uma identidade académica aparentemente
                  legítima, criou urgência e conduziu-o para uma página de
                  autenticação. O objectivo era obter informação que pudesse
                  ser utilizada para aceder à sua conta.
                </p>

              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">

                <p className="text-sm font-black text-emerald-950">
                  O que ficou protegido
                </p>

                <div className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">

                  <p>✓ A palavra-passe não foi submetida.</p>
                  <p>✓ A autenticação foi interrompida.</p>
                  <p>✓ Nenhum acesso simulado à conta foi criado.</p>
                  <p>✓ Os dados académicos permaneceram protegidos.</p>
                  <p>✓ O atacante não recebeu um conjunto de credenciais.</p>

                </div>

              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">

                <div className="flex items-start gap-3">

                  <Info
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>

                    <p className="text-sm font-black text-blue-950">
                      A decisão que bloqueou o ataque
                    </p>

                    <p className="mt-2 text-sm leading-7 text-blue-900">
                      {feedback.hasSafeExit
                        ? "Saiu da autenticação antes de submeter as credenciais. Esse foi o ponto decisivo que interrompeu a cadeia de ataque."
                        : "A sessão terminou sem uma submissão de credenciais. O ponto crítico foi não concluir a autenticação."}
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">

                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                  O que deve ficar consigo
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Uma mensagem pode parecer institucional e, ainda assim,
                  conduzi-lo para um ambiente falso. Quando houver pedido de
                  autenticação através de uma ligação inesperada, confirme o
                  domínio e entre directamente no portal oficial.
                </p>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={finishSafeExitAndNext}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  Próxima simulação
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/student/simulacoes")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Voltar às simulações
                </button>

              </div>

              <p className="text-center text-[11px] text-slate-400">
                SICSI · Simulação 01 · Feedback educativo
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }  function renderServiceUnavailable() {
    const occurrenceTime = new Date().toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const feedback = getPhishingFeedbackSnapshot();

    return (
      <div className="min-w-0 flex-1 bg-[#f5f7fa]">

        <div className="border-b border-slate-200 bg-white">

          <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
                <Shield size={17} />
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-bold text-slate-900">
                  Portal Académico
                </p>

                <p className="truncate text-[11px] text-slate-400">
                  Sistema Integrado de Serviços Académicos
                </p>

              </div>

            </div>

            <div className="hidden items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 sm:flex">

              <div className="h-2 w-2 rounded-full bg-amber-500" />

              <span className="text-xs font-semibold text-amber-700">
                Processamento interrompido
              </span>

            </div>

          </div>

        </div>

        <div className="border-b border-slate-200 bg-white">

          <div className="mx-auto w-full max-w-5xl px-4 py-2 sm:px-6">

            <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400">

              <span>Portal</span>
              <span>/</span>
              <span>Validação de dados</span>
              <span>/</span>

              <span className="font-medium text-slate-500">
                Estado da operação
              </span>

            </div>

          </div>

        </div>

        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="px-5 py-8 sm:px-10 sm:py-10">

              <div className="mx-auto max-w-2xl">

                <div className="flex flex-col items-center text-center">

                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-amber-50 bg-amber-100 text-amber-600">
                    <Info size={31} />
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5">

                    <span className="font-mono text-xs font-bold text-amber-700">
                      HTTP 503
                    </span>

                    <span className="h-1 w-1 rounded-full bg-amber-400" />

                    <span className="text-xs font-semibold text-blue-700">
                      Serviço indisponível
                    </span>

                  </div>

                  <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Serviço temporariamente indisponível
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                    A operação de validação não pôde ser concluída neste
                    momento. O serviço académico devolveu uma resposta
                    temporária de indisponibilidade.
                  </p>

                </div>

                <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">

                  <div className="flex items-start gap-3">

                    <Shield
                      size={20}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>

                      <p className="text-sm font-black text-red-950">
                        Pare aqui e analise o que aconteceu.
                      </p>

                      <p className="mt-2 text-sm leading-6 text-red-900">
                        Esta página faz parte do cenário. A mensagem
                        conduziu-o até à autenticação e, depois da submissão,
                        apresentou uma falha de serviço para tornar a situação
                        mais plausível.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="mt-6 grid overflow-hidden rounded-xl border border-slate-200 sm:grid-cols-3">

                  <div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r">

                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Código
                    </p>

                    <p className="mt-1 font-mono text-sm font-bold text-slate-700">
                      503
                    </p>

                  </div>

                  <div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r">

                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Referência
                    </p>

                    <p className="mt-1 break-all font-mono text-sm font-bold text-slate-700">
                      ACA-503-2026-0914
                    </p>

                  </div>

                  <div className="p-4">

                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Ocorrência
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {occurrenceTime}
                    </p>

                  </div>

                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">

                  <p className="text-sm font-semibold text-slate-800">
                    Estado da autenticação
                  </p>

                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">

                    <p>
                      ✓ A tentativa de autenticação foi registada no cenário.
                    </p>

                    <p>
                      ✓ O conteúdo da palavra-passe não foi armazenado pelo SICSI.
                    </p>

                    <p>
                      ⚠ Para efeitos educativos, a credencial é considerada
                      comprometida neste ponto da simulação.
                    </p>

                  </div>

                </div>

                <div className="mt-8 flex flex-col gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      track({
                        action: "view_attack_consequence",
                        nextState: STATES.CONSEQUENCE,
                        interactionType: "security",
                        metadata: {
                          credentials_submitted:
                            feedback.hasCredentialSubmission,
                          educational_feedback_requested: true,
                        },
                      });
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
                  >
                    Ver o que aconteceu
                    <ArrowRight size={17} />
                  </button>

                  <div className="flex flex-col gap-3 sm:flex-row">

                    <button
                      type="button"
                      onClick={retryService}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      <RotateCcw size={17} />
                      Tentar novamente
                    </button>

                    <button
                      type="button"
                      onClick={returnFromUnavailableService}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      <ArrowLeft size={17} />
                      Voltar ao portal
                    </button>

                  </div>

                </div>

                <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
                  Ambiente educativo SICSI · Nenhuma conta real foi afectada
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }  function renderConsequence() {
    const feedback = getPhishingFeedbackSnapshot();

    const credentialEvent = feedback.events.find(
      (event) => event.action === "submit_credentials"
    );

    const emailPartilhado =
      credentialEvent?.metadata?.email &&
      credentialEvent.metadata.email !== "[NOT_PROVIDED]"
        ? credentialEvent.metadata.email
        : "Não fornecido";

    const passwordWasEntered =
      credentialEvent?.metadata?.password_entered === true;

    return (
      <div className="min-w-0 flex-1 bg-slate-50 text-slate-900">

        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

            <div className="border-b border-blue-100 bg-blue-50 px-5 py-8 sm:px-8">

              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Feedback da Simulação 01
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-blue-700 sm:text-4xl">
                ATAQUE BEM-SUCEDIDO
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                <strong>CENÁRIO SIMULADO.</strong> A submissão das
                credenciais permitiu que a cadeia de phishing chegasse ao seu
                objectivo: obter informação de autenticação.
              </p>

            </div>

            <div className="space-y-5 p-5 sm:p-8">

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">

                <p className="text-lg font-black text-slate-950">
                  As suas credenciais foram comprometidas no cenário.
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-700">
                  A página de autenticação fazia parte da cadeia de ataque.
                  Ao seleccionar enviar, a informação introduzida passou a
                  ser considerada capturada para efeitos desta experiência.
                </p>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    Email partilhado
                  </p>

                  <p className="mt-2 break-all text-base font-bold text-slate-900">
                    {emailPartilhado}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Este foi o endereço introduzido durante a simulação.
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    Palavra-passe
                  </p>

                  <p className="mt-2 text-base font-bold text-slate-900">
                    {passwordWasEntered
                      ? "Foi preenchida"
                      : "Não foi preenchida"}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    O conteúdo da palavra-passe nunca é mostrado nem
                    armazenado pelo SICSI.
                  </p>

                </div>

              </div>

              <div className="rounded-2xl border border-red-800 bg-slate-950 p-5 sm:p-6">

                <p className="text-sm font-black text-red-600">
                  O que poderia acontecer a seguir
                </p>

                <div className="mt-4 space-y-2 text-sm leading-6 text-slate-700">

                  <p className="text-red-600">
                    ⚠ Tentativa de autenticação na conta académica com a
                    credencial capturada.
                  </p>

                  <p className="text-red-600">
                    ⚠ Tentativa de reutilização da mesma credencial noutros
                    serviços.
                  </p>

                  <p className="text-red-600">
                    ⚠ Acesso a informação académica disponível através da
                    conta.
                  </p>

                  <p className="text-red-600">
                    ⚠ Alteração indevida de informações ou definições da
                    conta, dependendo das permissões disponíveis.
                  </p>

                  <p className="text-red-600">
                    ⚠ Utilização da identidade digital comprometida para
                    novas tentativas de fraude.
                  </p>

                </div>

              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">

                <p className="text-sm font-black text-amber-900">
                  Onde o ataque ganhou
                </p>

                <p className="mt-3 text-sm leading-7 text-amber-900">
                  Primeiro, a mensagem criou uma situação académica
                  plausível. Depois utilizou urgência, uma ligação externa e
                  uma página de autenticação. O momento decisivo foi quando
                  as credenciais foram submetidas.
                </p>

              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">

                <p className="text-sm font-black text-emerald-800">
                  Como teria bloqueado o ataque
                </p>

                <p className="mt-3 text-sm leading-7 text-emerald-900">
                  Bastava parar antes de enviar as credenciais. Fechar a
                  página, verificar o domínio ou entrar directamente no
                  portal académico oficial teria interrompido a cadeia.
                </p>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">

                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                  Técnicas utilizadas
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  {feedback.attackerTechniques.map((technique) => (
                    <span
                      key={technique}
                      className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                    >
                      {technique}
                    </span>
                  ))}

                </div>

              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                <p className="text-xs leading-5 text-red-800">
                  <strong>Importante:</strong> este é um cenário educativo.
                  Nenhuma conta académica real foi comprometida, nenhuma
                  palavra-passe real é apresentada e nenhuma tentativa real
                  de acesso foi realizada.
                </p>

              </div>

              <button
                type="button"
                onClick={concludeAndNext}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                Entendi a consequência · Próxima simulação
                <ArrowRight size={17} />
              </button>

              <p className="text-center text-[11px] leading-5 text-slate-400">
                SICSI · Simulação 01 · Feedback educativo
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }  function renderComposer(type) {
    const isReply = type === "reply";
    const value = isReply ? replyText : forwardText;
    const setValue = isReply ? setReplyText : setForwardText;

    return (
      <div className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
          <button
            type="button"
            onClick={() =>
              navigateState(STATES.EMAIL_OPEN, "cancel_composer")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Voltar à mensagem
          </button>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                {isReply ? (
                  <Reply className="text-blue-600" size={19} />
                ) : (
                  <Forward className="text-blue-600" size={19} />
                )}

                <h1 className="text-lg font-bold text-slate-900">
                  {isReply ? "Responder" : "Encaminhar mensagem"}
                </h1>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              {!isReply ? (
                <div>
                  <label
                    htmlFor="forward-recipient"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Destinatário
                  </label>

                  <input
                    id="forward-recipient"
                    type="email"
                    value={forwardRecipient}
                    onChange={(event) => setForwardRecipient(event.target.value)}
                    placeholder="destinatario@exemplo.org"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="composer-message"
                  className="text-sm font-semibold text-slate-700"
                >
                  Mensagem
                </label>

                <textarea
                  id="composer-message"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  rows={7}
                  placeholder="Escreva a sua mensagem..."
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    navigateState(
                      STATES.EMAIL_OPEN,
                      "cancel_composer"
                    )
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={isReply ? submitReply : submitForward}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Send size={16} />
                  {isReply ? "Enviar resposta" : "Encaminhar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderArchived() {
    return (
      <div className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-2xl px-3 py-10 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Archive size={24} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Mensagem arquivada
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              A mensagem foi movida para o arquivo. A experiência continua
              activa e pode regressar à mensagem sempre que necessário.
            </p>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() =>
                  navigateState(STATES.EMAIL_OPEN, "open_archived_email")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Abrir mensagem
              </button>

              <button
                type="button"
                onClick={goToSimulationHub}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Sair da simulação
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDeleted() {
    return (
      <div className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-2xl px-3 py-10 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={24} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Mensagem movida para o lixo
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              A mensagem foi movida para o lixo. Pode restaurá-la ou continuar
              a partir desta área.
            </p>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={restoreEmail}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                Restaurar mensagem
              </button>

              <button
                type="button"
                onClick={goToSimulationHub}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Sair da simulação
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderCompleted() {
    return (
      <div className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-2xl px-3 py-10 sm:px-6 sm:py-14">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Check size={30} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Simulação concluída
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Email inesperado
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
              A experiência foi concluída e a sua jornada foi registada.
            </p>

            <div className="mt-7 rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">Tempo na experiência</p>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {formatDuration(elapsedSeconds * 1000)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/student/simulacoes/phishing/02")}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
            >
              Próxima simulação
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderLegitimateEmail() {
    if (!selectedLegitimateMessage) {
      return (
        <div className="min-w-0 flex-1 bg-white">
          <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-10">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">
                Mensagem não disponível
              </p>

              <button
                type="button"
                onClick={() => setState(STATES.INBOX)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <ArrowLeft size={16} />
                Voltar à caixa de entrada
              </button>
            </div>
          </div>
        </div>
      );
    }

    const message = selectedLegitimateMessage;

    function voltarParaInbox() {
      track({
        action: "return_to_inbox_from_legitimate_message",
        nextState: STATES.INBOX,
        interactionType: "navigation",
        metadata: {
          messageId: message.id,
          sender: message.senderName,
          subject: message.subject,
        },
      });

      setSelectedLegitimateMessage(null);
      setState(STATES.INBOX);
    }

    function verDetalhesRemetente() {
      track({
        action: "view_legitimate_sender_details",
        nextState: STATES.LEGITIMATE_EMAIL,
        interactionType: "inspection",
        metadata: {
          messageId: message.id,
          sender: message.senderName,
          senderEmail: message.senderEmail,
        },
      });
    }

    function marcarComoAnalisada() {
      track({
        action: "analyse_legitimate_message",
        nextState: STATES.LEGITIMATE_EMAIL,
        interactionType: "analysis",
        metadata: {
          messageId: message.id,
          sender: message.senderName,
          suspicious: false,
        },
      });

      setLastAction({
        type: "legitimate_message_analysed",
        messageId: message.id,
      });
    }

    return (
      <div className="min-w-0 flex-1 bg-white">
        <div className="border-b border-slate-200 px-3 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={voltarParaInbox}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft size={17} />
              Caixa de entrada
            </button>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
              Mensagem legítima
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {message.senderInitials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-base font-bold text-slate-900">
                      {message.senderName}
                    </h1>

                    <span className="text-xs text-slate-400">
                      {message.date}
                    </span>
                  </div>

                  <p className="mt-1 break-all text-xs text-slate-500">
                    {message.senderEmail}
                  </p>
                </div>
              </div>

              <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
                {message.subject}
              </h2>
            </div>

            <div className="px-5 py-6 sm:px-7">
              <div className="max-w-3xl space-y-4 text-sm leading-7 text-slate-700">
                {(message.body || []).map((paragraph, index) =>
                  paragraph ? (
                    <p key={`${message.id}-body-${index}`}>{paragraph}</p>
                  ) : (
                    <div key={`${message.id}-space-${index}`} className="h-1" />
                  )
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={verDetalhesRemetente}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Info size={17} />
                  Ver detalhes do remetente
                </button>

                <button
                  type="button"
                  onClick={marcarComoAnalisada}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <ShieldCheck size={17} />
                  Marcar como analisada
                </button>
              </div>

              {lastAction?.type === "legitimate_message_analysed" &&
              lastAction?.messageId === message.id ? (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div>
                      <p className="text-sm font-bold text-emerald-900">
                        Mensagem analisada
                      </p>
                      <p className="mt-1 text-xs leading-5 text-emerald-800">
                        Esta mensagem foi identificada como uma comunicação
                        institucional sem sinais de phishing.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Ambiente educativo SICSI
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  A análise de mensagens legítimas faz parte da simulação para
                  ajudar a distinguir comunicações normais de tentativas de
                  engenharia social e phishing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  function renderMainContent() {
    switch (state) {
      case STATES.EMAIL_OPEN:
        return renderEmail();

      case STATES.LEGITIMATE_EMAIL:
        return renderLegitimateEmail();

      case STATES.SENDER_DETAILS:
        return renderSenderDetails();

      case STATES.ATTACHMENT_PREVIEW:
        return renderAttachmentPreview();

      case STATES.LINK_PREVIEW:
        return renderLinkPreview();

      case STATES.EXTERNAL_SITE:
        return renderExternalSite();

      case STATES.ACCOUNT_VIEW:
        return renderAccountView();

      case STATES.LOGIN:
        return renderLogin();
      case STATES.SAFE_EXIT_FEEDBACK:
        return renderSafeExitFeedback();


      case STATES.CONSEQUENCE:
        return renderConsequence();

      case STATES.SERVICE_UNAVAILABLE:
        return renderServiceUnavailable();

      case STATES.REPLY:
        return renderComposer("reply");

      case STATES.FORWARD:
        return renderComposer("forward");

      case STATES.ARCHIVED:
        return renderArchived();

      case STATES.DELETED:
        return renderDeleted();

      case STATES.COMPLETED:
        return renderCompleted();

      case STATES.INBOX:
      default:
        return renderInbox();
    }
  }

  const showMailNavigation = [
    STATES.INBOX,
    STATES.EMAIL_OPEN,
    STATES.LEGITIMATE_EMAIL,
    STATES.SENDER_DETAILS,
    STATES.ATTACHMENT_PREVIEW,
    STATES.LINK_PREVIEW,
    STATES.ARCHIVED,
    STATES.DELETED,
  ].includes(state);

  return (
    <div className="min-h-screen min-w-0 bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex min-h-16 min-w-0 items-center gap-2 px-3 sm:px-5">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen((value) => !value)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menu"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button
            type="button"
            onClick={goToSimulationHub}
            className="flex min-w-0 shrink-0 items-center gap-2 rounded-xl px-2 py-2 hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Mail size={18} />
            </div>

            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-sm font-bold text-slate-900">
                SICSI Mail
              </p>
              <p className="truncate text-[11px] text-slate-400">
                Ambiente simulado
              </p>
            </div>
          </button>

          {showMailNavigation ? (
            <form
              onSubmit={performSearch}
              className="mx-1 flex min-w-0 flex-1 items-center sm:mx-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3">
                <Search className="shrink-0 text-slate-400" size={17} />

                <input
                  id="simulation-search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Pesquisar mensagens"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </form>
          ) : (
            <div className="min-w-0 flex-1" />
          )}

          <div className="flex shrink-0 items-center gap-1">
            <div className="hidden items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 sm:flex">
              <Shield size={15} className="text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">
                Simulação 01
              </span>
            </div>

            <IconButton
              label="Sair para Simulações"
              onClick={goToSimulationHub}
            >
              <ArrowRight size={18} />
            </IconButton>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1600px] min-w-0">
        {showMailNavigation ? (
          <>
            <aside
              className={`fixed inset-y-16 left-0 z-30 w-72 border-r border-slate-200 bg-white p-4 shadow-xl transition-transform lg:static lg:block lg:w-64 lg:translate-x-0 lg:shadow-none ${
                mobileSidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between lg:hidden">
                <p className="text-sm font-bold text-slate-900">
                  Navegação
                </p>

                <IconButton
                  label="Fechar menu"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <X size={18} />
                </IconButton>
              </div>

              <button
                type="button"
                onClick={() => changeFolder("inbox")}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                <Mail size={17} />
                Nova visualização
              </button>

              <nav className="mt-5 space-y-1">
                <SidebarButton
                  icon={<Inbox size={18} />}
                  label="Caixa de entrada"
                  active={activeFolder === "inbox"}
                  count="1"
                  onClick={() => {
                    changeFolder("inbox");
                    navigateState(STATES.INBOX, "open_inbox");
                  }}
                />

                <SidebarButton
                  icon={<Star size={18} />}
                  label="Com estrela"
                  active={activeFolder === "starred"}
                  onClick={() => changeFolder("starred")}
                />

                <SidebarButton
                  icon={<Archive size={18} />}
                  label="Arquivo"
                  active={activeFolder === "archive"}
                  onClick={() => changeFolder("archive")}
                />

                <SidebarButton
                  icon={<Trash2 size={18} />}
                  label="Lixo"
                  active={activeFolder === "trash"}
                  onClick={() => changeFolder("trash")}
                />
              </nav>

              <div className="mt-7 border-t border-slate-200 pt-5">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Experiência
                </p>

                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Tempo
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {formatDuration(elapsedSeconds * 1000)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Eventos
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {session?.sequence || 0}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={goToSimulationHub}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Voltar a Simulações
              </button>
            </aside>

            {mobileSidebarOpen && showMailNavigation ? (
              <button
                type="button"
                aria-label="Fechar menu lateral"
                onClick={() => {
                  setMobileSidebarOpen(false);
                  setMenuOpen(false);
                }}
                className="fixed inset-0 top-16 z-20 bg-slate-900/20 lg:hidden"
              />
            ) : null}
          </>
        ) : null}

        {renderMainContent()}
      </div>

      {state !== STATES.COMPLETED &&
      state !== STATES.CONSEQUENCE &&
      state !== STATES.SERVICE_UNAVAILABLE &&
      state !== STATES.SERVICE_UNAVAILABLE &&
      state !== STATES.LOGIN &&
      state !== STATES.EXTERNAL_SITE &&
      state !== STATES.ACCOUNT_VIEW ? (
        <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-5">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
                Simulação 01 · {SIMULATION.title}
              </p>
              <p className="truncate text-xs text-slate-500">
                Explore o ambiente como faria normalmente.
              </p>
            </div>

            <button
              type="button"
              onClick={concludeAndNext}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
            >
              Concluir simulação
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

































