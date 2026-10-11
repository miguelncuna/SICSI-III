import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Ban,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock3,
    CreditCard,
    Eye,
    FileSearch,
    LockKeyhole,
    Phone,
    RotateCcw,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
    TriangleAlert,
    X,
    XCircle,
} from "lucide-react";

import {
    obterSessao,
    criarSessao,
    guardarSessao,
    registarAccao,
    registarDecisao,
    actualizarEtapa,
    alterarRisco,
    adicionarSinal,
    adicionarTecnica,
    adicionarComportamentoSeguro,
    adicionarComportamentoRisco,
    adicionarInformacaoPartilhada,
    adicionarTransaccao,
    definirPontoCritico,
    marcarRecuperacao,
    calcularResultado,
    obterResumo,
    limparSessao,
} from "./millenniumBimSession";

const vermelho = "#d71920";
const vermelhoEscuro = "#a90f16";
const preto = "#111111";
const cinza = "#f5f5f5";

const transaccoes = [
    {
        id: "TX-01",
        descricao: "Compra electrónica simulada",
        valor: 12000,
    },
    {
        id: "TX-02",
        descricao: "Comércio online simulado",
        valor: 8500,
    },
    {
        id: "TX-03",
        descricao: "Transferência simulada",
        valor: 10000,
    },
    {
        id: "TX-04",
        descricao: "Levantamento simulado",
        valor: 8000,
    },
];

function formatarMZN(valor) {
    return new Intl.NumberFormat("pt-MZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(valor) + " MZN";
}

function nivelRisco(risco) {
    if (risco >= 75) {
        return {
            nome: "CRÍTICO",
            classe: "critical",
        };
    }

    if (risco >= 50) {
        return {
            nome: "ELEVADO",
            classe: "high",
        };
    }

    if (risco >= 30) {
        return {
            nome: "MODERADO",
            classe: "medium",
        };
    }

    return {
        nome: "BAIXO",
        classe: "low",
    };
}

function RiskBar({ risco }) {
    const nivel = nivelRisco(risco);

    return (
        <div className="mb-risk-wrapper">
            <div className="mb-risk-top">
                <span>
                    <ShieldAlert size={16} />
                    Risco da sessão
                </span>

                <strong className={`mb-risk-${nivel.classe}`}>
                    {nivel.nome} · {risco}/100
                </strong>
            </div>

            <div className="mb-risk-track">
                <div
                    className={`mb-risk-fill mb-risk-fill-${nivel.classe}`}
                    style={{ width: `${risco}%` }}
                />
            </div>
        </div>
    );
}

function BrandHeader({ sessao, onExit }) {
    return (
        <>
            <header className="mb-header">
                <div className="mb-brand">
                    <div className="mb-logo">
                        <span>m</span>
                    </div>

                    <div>
                        <div className="mb-brand-name">
                            millennium bim
                        </div>

                        <div className="mb-brand-sub">
                            Centro de Segurança
                        </div>
                    </div>
                </div>

                <div className="mb-header-right">
                    <div className="mb-simulation-label">
                        <span />
                        AMBIENTE EDUCATIVO SIMULADO · SICSI
                    </div>

                    <button
                        type="button"
                        className="mb-exit"
                        onClick={onExit}
                    >
                        <X size={16} />
                        Encerrar simulação
                    </button>
                </div>
            </header>

            <div className="mb-session-strip">
                <div>
                    <span>Sessão</span>
                    <strong>OP-CS-{String(sessao.etapaActual).padStart(2, "0")}</strong>
                </div>

                <div>
                    <span>Cartão</span>
                    <strong>•••• 4821</strong>
                </div>

                <div>
                    <span>Estado</span>
                    <strong>
                        {sessao.concluida
                            ? "Analisado"
                            : "Em monitorização"}
                    </strong>
                </div>
            </div>
        </>
    );
}

function NavigationButtons({
    onBack,
    onNext,
    nextLabel = "Continuar",
    backLabel = "Voltar",
    disabled = false,
}) {
    return (
        <div className="mb-navigation">
            {onBack ? (
                <button
                    type="button"
                    className="mb-btn mb-btn-secondary"
                    onClick={onBack}
                >
                    <ArrowLeft size={18} />
                    {backLabel}
                </button>
            ) : (
                <span />
            )}

            <button
                type="button"
                className="mb-btn mb-btn-primary"
                onClick={onNext}
                disabled={disabled}
            >
                {nextLabel}
                <ArrowRight size={18} />
            </button>
        </div>
    );
}

function Briefing({ onStart, onExit }) {
    return (
        <div className="mb-page">
            <div className="mb-hero">
                <div className="mb-hero-copy">
                    <div className="mb-kicker">
                        <LockKeyhole size={16} />
                        CENTRO DE SEGURANÇA
                    </div>

                    <h1>
                        Operação
                        <br />
                        <strong>Cartão Seguro</strong>
                    </h1>

                    <p>
                        Uma tentativa de Engenharia Social está a decorrer.
                        As decisões tomadas nesta sessão terão consequências
                        directas no ambiente simulado.
                    </p>

                    <button
                        type="button"
                        className="mb-btn mb-btn-primary mb-btn-large"
                        onClick={onStart}
                    >
                        Iniciar experiência
                        <ChevronRight size={21} />
                    </button>
                </div>

                <div className="mb-card-visual">
                    <div className="mb-card-top">
                        <span>millennium bim</span>
                        <span>SIMULAÇÃO</span>
                    </div>

                    <div className="mb-chip" />

                    <div className="mb-card-number">
                        •••• &nbsp; •••• &nbsp; •••• &nbsp; 4821
                    </div>

                    <div className="mb-card-bottom">
                        <span>CLIENTE SICSI</span>
                        <span>VALIDADE 12/29</span>
                    </div>
                </div>
            </div>

            <div className="mb-grid mb-grid-three">
                <div className="mb-info-card">
                    <ShieldCheck size={22} />
                    <h3>Protecção</h3>
                    <p>
                        As decisões seguras reduzem o risco de comprometimento.
                    </p>
                </div>

                <div className="mb-info-card">
                    <TriangleAlert size={22} />
                    <h3>Pressão</h3>
                    <p>
                        A urgência e a autoridade serão utilizadas durante a experiência.
                    </p>
                </div>

                <div className="mb-info-card">
                    <FileSearch size={22} />
                    <h3>Análise</h3>
                    <p>
                        Cada acção será registada para produzir o seu relatório final.
                    </p>
                </div>
            </div>

            <div className="mb-warning">
                <AlertTriangle size={19} />
                <div>
                    <strong>Dados exclusivamente fictícios.</strong>
                    <span>
                        Nenhuma informação bancária real é solicitada ou armazenada.
                    </span>
                </div>
            </div>

            <button
                type="button"
                className="mb-link-button"
                onClick={onExit}
            >
                Sair para Simulações
            </button>
        </div>
    );
}

function AlertStage({ sessao, setSessao, goTo }) {
    const [detalhes, setDetalhes] = useState(false);

    const abrirDetalhes = () => {
        const actualizado = registarAccao(sessao, {
            tipo: "visualizacao",
            accao: "abriu_detalhes_alerta",
            descricao: "O utilizador abriu os detalhes do alerta.",
        });

        setSessao(actualizado);
        setDetalhes(true);
    };

    const analisar = () => {
        let actualizado = registarDecisao(sessao, {
            accao: "analisar_alerta",
            classificacao: "segura",
            descricao: "O utilizador analisou o alerta antes de agir.",
        });

        actualizado = adicionarComportamentoSeguro(
            actualizado,
            "Analisou o alerta antes de agir."
        );

        actualizado = alterarRisco(
            actualizado,
            -8,
            "Análise inicial do alerta."
        );

        goTo(3, actualizarEtapa(actualizado, 3));
    };

    return (
        <StageLayout
            step="01"
            title="Alerta de segurança"
            subtitle="Centro de Segurança · Millennium bim"
            icon={<ShieldAlert />}
            sessao={sessao}
        >
            <div className="mb-alert-box">
                <div className="mb-alert-icon">
                    <AlertTriangle />
                </div>

                <div>
                    <span className="mb-small-label">
                        ALERTA · AGORA
                    </span>

                    <h2>Actividade suspeita detectada</h2>

                    <p>
                        Foi detectada uma actividade incomum associada ao
                        cartão terminado em <strong>4821</strong>.
                    </p>
                </div>
            </div>

            <div className="mb-transaction-card">
                <div>
                    <span>Comerciante</span>
                    <strong>GLOBAL ONLINE SHOP</strong>
                </div>

                <div>
                    <span>Localização</span>
                    <strong>Maputo · Moçambique</strong>
                </div>

                <div>
                    <span>Valor</span>
                    <strong>7.850 MZN</strong>
                </div>

                <div>
                    <span>Estado</span>
                    <strong className="mb-status-danger">
                        Em verificação
                    </strong>
                </div>
            </div>

            {detalhes && (
                <div className="mb-reveal">
                    <div className="mb-reveal-title">
                        <Eye size={17} />
                        Dados adicionais
                    </div>

                    <p>
                        Dispositivo: <strong>Android · SIM-CS</strong>
                    </p>

                    <p>
                        Hora registada: <strong>19:42</strong>
                    </p>

                    <p>
                        Método: <strong>Compra electrónica simulada</strong>
                    </p>

                    <p>
                        Este alerta é um elemento controlado da experiência.
                    </p>
                </div>
            )}

            <div className="mb-choice-grid">
                <button
                    type="button"
                    className="mb-choice"
                    onClick={abrirDetalhes}
                >
                    <Eye />
                    <span>
                        <strong>Ver detalhes do alerta</strong>
                        <small>Investigar antes de agir</small>
                    </span>
                    <ChevronRight />
                </button>

                <button
                    type="button"
                    className="mb-choice mb-choice-safe"
                    onClick={analisar}
                >
                    <FileSearch />
                    <span>
                        <strong>Analisar actividade</strong>
                        <small>Começar verificação de segurança</small>
                    </span>
                    <ChevronRight />
                </button>
            </div>
        </StageLayout>
    );
}

function ContactStage({ sessao, setSessao, goTo }) {
    const atender = () => {
        let actualizado = registarDecisao(sessao, {
            accao: "atender_contacto",
            classificacao: "risco",
            descricao: "O utilizador aceitou o contacto recebido.",
        });

        actualizado = adicionarComportamentoRisco(
            actualizado,
            "Aceitou um contacto inesperado."
        );

        actualizado = adicionarSinal(
            actualizado,
            "Contacto inesperado",
            true
        );

        actualizado = adicionarTecnica(
            actualizado,
            "Pretexto"
        );

        actualizado = alterarRisco(
            actualizado,
            15,
            "Contacto inesperado aceite."
        );

        goTo(4, actualizarEtapa(actualizado, 4));
    };

    const ignorar = () => {
        let actualizado = registarDecisao(sessao, {
            accao: "ignorar_contacto",
            classificacao: "segura",
            descricao: "O utilizador não atendeu o contacto.",
        });

        actualizado = adicionarComportamentoSeguro(
            actualizado,
            "Não respondeu imediatamente a um contacto inesperado."
        );

        actualizado = adicionarSinal(
            actualizado,
            "Contacto inesperado",
            true
        );

        actualizado = adicionarTecnica(
            actualizado,
            "Pretexto"
        );

        actualizado = alterarRisco(
            actualizado,
            -12,
            "Contacto suspeito ignorado."
        );

        goTo(5, actualizarEtapa(actualizado, 5));
    };

    const canalOficial = () => {
        let actualizado = registarDecisao(sessao, {
            accao: "usar_canal_oficial",
            classificacao: "muito_segura",
            descricao: "O utilizador decidiu verificar o alerta através de canal independente.",
        });

        actualizado = adicionarComportamentoSeguro(
            actualizado,
            "Escolheu um canal oficial e independente."
        );

        actualizado = adicionarTecnica(
            actualizado,
            "Verificação independente"
        );

        actualizado = alterarRisco(
            actualizado,
            -25,
            "Verificação através de canal independente."
        );

        actualizado = marcarRecuperacao(actualizado);

        goTo(5, actualizarEtapa(actualizado, 5));
    };

    return (
        <StageLayout
            step="02"
            title="Primeiro contacto"
            subtitle="A tentativa de manipulação começou"
            icon={<Phone />}
            sessao={sessao}
        >
            <div className="mb-phone">
                <div className="mb-phone-top">
                    <div className="mb-avatar">SB</div>

                    <div>
                        <span>CHAMADA RECEBIDA</span>
                        <strong>Serviço de Segurança</strong>
                    </div>

                    <Clock3 />
                </div>

                <div className="mb-phone-message">
                    <p>
                        “Boa noite. Estamos a contactar devido à actividade
                        suspeita detectada no seu cartão.”
                    </p>

                    <p>
                        “Precisamos de confirmar a situação para evitar
                        que o cartão seja temporariamente bloqueado.”
                    </p>
                </div>
            </div>

            <div className="mb-section-title">
                <span>Escolha a sua acção</span>
                <small>A decisão será registada na sua sessão.</small>
            </div>

            <div className="mb-choice-grid">
                <button
                    type="button"
                    className="mb-choice"
                    onClick={atender}
                >
                    <Phone />
                    <span>
                        <strong>Atender a chamada</strong>
                        <small>Ouvir o interlocutor</small>
                    </span>
                    <ChevronRight />
                </button>

                <button
                    type="button"
                    className="mb-choice"
                    onClick={ignorar}
                >
                    <Ban />
                    <span>
                        <strong>Ignorar o contacto</strong>
                        <small>Não responder ao contacto</small>
                    </span>
                    <ChevronRight />
                </button>

                <button
                    type="button"
                    className="mb-choice mb-choice-safe"
                    onClick={canalOficial}
                >
                    <ShieldCheck />
                    <span>
                        <strong>Contactar o banco por canal oficial</strong>
                        <small>Confirmar a situação independentemente</small>
                    </span>
                    <ChevronRight />
                </button>
            </div>
        </StageLayout>
    );
}

function TrustStage({ sessao, setSessao, goTo }) {
    const [sinal, setSinal] = useState(null);

    const identificar = (nome) => {
        let actualizado = adicionarSinal(
            sessao,
            nome,
            true
        );

        actualizado = adicionarTecnica(
            actualizado,
            nome === "Urgência"
                ? "Urgência"
                : "Autoridade"
        );

        actualizado = registarAccao(actualizado, {
            tipo: "analise",
            accao: "identificou_sinal",
            sinal: nome,
            descricao: `O utilizador identificou o sinal: ${nome}.`,
        });

        actualizado = adicionarComportamentoSeguro(
            actualizado,
            `Identificou o sinal de ${nome}.`
        );

        actualizado = alterarRisco(
            actualizado,
            -7,
            `Sinal de ${nome} identificado.`
        );

        setSessao(actualizado);
        setSinal(nome);
    };

    const continuar = () => {
        let actualizado = registarDecisao(sessao, {
            accao: "continuar_apos_sinais",
            classificacao: "risco",
            descricao: "O utilizador continuou a interacção depois de observar sinais.",
        });

        actualizado = adicionarComportamentoRisco(
            actualizado,
            "Continuou a interacção perante sinais de alerta."
        );

        actualizado = alterarRisco(
            actualizado,
            12,
            "Interacção mantida após sinais de alerta."
        );

        goTo(5, actualizarEtapa(actualizado, 5));
    };

    const terminar = () => {
        let actualizado = registarDecisao(sessao, {
            accao: "terminar_contacto",
            classificacao: "segura",
            descricao: "O utilizador encerrou a comunicação.",
        });

        actualizado = adicionarComportamentoSeguro(
            actualizado,
            "Interrompeu a comunicação suspeita."
        );

        actualizado = alterarRisco(
            actualizado,
            -20,
            "Contacto suspeito terminado."
        );

        actualizado = marcarRecuperacao(actualizado);

        goTo(6, actualizarEtapa(actualizado, 6));
    };

    return (
        <StageLayout
            step="03"
            title="Construção de confiança"
            subtitle="O interlocutor apresenta-se como autoridade"
            icon={<LockKeyhole />}
            sessao={sessao}
        >
            <div className="mb-conversation">
                <div className="mb-message mb-message-system">
                    <span>SEGURANÇA BANCÁRIA</span>
                    <p>
                        “Detectámos uma compra de 7.850 MZN.
                        Para sua protecção, precisamos confirmar
                        alguns elementos.”
                    </p>
                </div>

                <div className="mb-message mb-message-person">
                    <span>INTERLOCUTOR</span>
                    <p>
                        “Sou responsável pela validação de segurança.
                        Esta chamada precisa de ser concluída rapidamente.”
                    </p>
                </div>
            </div>

            <div className="mb-signal-panel">
                <div className="mb-signal-heading">
                    <div>
                        <span className="mb-small-label">
                            ANÁLISE EM TEMPO REAL
                        </span>

                        <h3>
                            Existem sinais de manipulação?
                        </h3>
                    </div>

                    {sinal && (
                        <span className="mb-detected">
                            <Check size={15} />
                            {sinal} identificado
                        </span>
                    )}
                </div>

                <div className="mb-signal-buttons">
                    <button
                        type="button"
                        onClick={() => identificar("Urgência")}
                        className="mb-signal-button"
                    >
                        <Clock3 />
                        Urgência
                    </button>

                    <button
                        type="button"
                        onClick={() => identificar("Autoridade")}
                        className="mb-signal-button"
                    >
                        <LockKeyhole />
                        Autoridade
                    </button>
                </div>
            </div>

            <div className="mb-choice-grid">
                <button
                    type="button"
                    className="mb-choice"
                    onClick={continuar}
                >
                    <ArrowRight />
                    <span>
                        <strong>Continuar a conversa</strong>
                        <small>Prosseguir com o interlocutor</small>
                    </span>
                    <ChevronRight />
                </button>

                <button
                    type="button"
                    className="mb-choice mb-choice-safe"
                    onClick={terminar}
                >
                    <Ban />
                    <span>
                        <strong>Encerrar contacto</strong>
                        <small>Interromper a comunicação</small>
                    </span>
                    <ChevronRight />
                </button>
            </div>
        </StageLayout>
    );
}

function SuspiciousRequestStage({ sessao, setSessao, goTo }) {
    const [seleccionado, setSeleccionado] = useState(null);

    const escolher = (tipo) => {
        setSeleccionado(tipo);
    };

    const continuar = () => {
        let actualizado;

        if (seleccionado === "nenhuma") {
            actualizado = registarDecisao(sessao, {
                accao: "nao_partilhar_informacao",
                classificacao: "muito_segura",
                descricao: "O utilizador recusou fornecer qualquer informação.",
            });

            actualizado = adicionarComportamentoSeguro(
                actualizado,
                "Recusou partilhar informações de autenticação."
            );

            actualizado = adicionarTecnica(
                actualizado,
                "Pedido de informação"
            );

            actualizado = alterarRisco(
                actualizado,
                -18,
                "Informação não partilhada."
            );

            goTo(6, actualizarEtapa(actualizado, 6));
            return;
        }

        actualizado = registarDecisao(sessao, {
            accao: "aceitar_pedido_informacao",
            classificacao: "risco",
            tipoInformacao: seleccionado,
            descricao: "O utilizador aceitou fornecer uma informação simulada.",
        });

        actualizado = adicionarComportamentoRisco(
            actualizado,
            `Aceitou fornecer: ${seleccionado}.`
        );

        actualizado = adicionarInformacaoPartilhada(
            actualizado,
            {
                tipo: seleccionado,
                ficticia: true,
            }
        );

        actualizado = adicionarTecnica(
            actualizado,
            "Pretexto"
        );

        actualizado = adicionarTecnica(
            actualizado,
            "Pressão psicológica"
        );

        actualizado = alterarRisco(
            actualizado,
            30,
            "Informação sensível simulada disponibilizada."
        );

        goTo(6, actualizarEtapa(actualizado, 6));
    };

    return (
        <StageLayout
            step="04"
            title="Pedido suspeito"
            subtitle="O atacante procura ultrapassar a sua barreira de segurança"
            icon={<CreditCard />}
            sessao={sessao}
        >
            <div className="mb-danger-banner">
                <AlertTriangle />
                <div>
                    <strong>ATENÇÃO</strong>
                    <span>
                        O interlocutor solicitou informação para
                        “validar a identidade”.
                    </span>
                </div>
            </div>

            <div className="mb-request">
                <div className="mb-request-header">
                    <div className="mb-avatar mb-avatar-red">SB</div>

                    <div>
                        <strong>Serviço de Segurança</strong>
                        <span>Pedido de validação</span>
                    </div>
                </div>

                <p>
                    “Para concluir a validação, escolha uma das opções
                    abaixo.”
                </p>

                <div className="mb-request-options">
                    {[
                        "Número completo do cartão",
                        "Código de autenticação fictício",
                        "Informação adicional",
                        "nenhuma",
                    ].map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={`mb-request-option ${
                                seleccionado === item
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() => escolher(item)}
                        >
                            <span>
                                {item === "nenhuma"
                                    ? "Não fornecer informação"
                                    : item}
                            </span>

                            {seleccionado === item && (
                                <CheckCircle2 size={19} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-warning">
                <AlertTriangle size={19} />
                <div>
                    <strong>A simulação não solicita dados reais.</strong>
                    <span>
                        A escolha acima apenas regista o seu comportamento
                        para avaliação.
                    </span>
                </div>
            </div>

            <NavigationButtons
                onBack={() =>
                    goTo(
                        4,
                        actualizarEtapa(sessao, 4)
                    )
                }
                onNext={continuar}
                nextLabel="Confirmar decisão"
                disabled={!seleccionado}
            />
        </StageLayout>
    );
}

function CriticalStage({ sessao, setSessao, goTo }) {
    const [seleccionado, setSeleccionado] = useState(null);

    const decidir = (tipo) => {
        setSeleccionado(tipo);
    };

    const confirmar = () => {
        if (!seleccionado) return;

        let actualizado = sessao;

        if (seleccionado === "seguir") {
            actualizado = registarDecisao(actualizado, {
                accao: "seguir_instrucoes",
                classificacao: "muito_risco",
                descricao: "O utilizador seguiu a instrução apresentada.",
            });

            actualizado = adicionarComportamentoRisco(
                actualizado,
                "Seguiu instruções externas perante pressão."
            );

            actualizado = definirPontoCritico(
                actualizado,
                "Seguiu instruções no momento crítico."
            );

            actualizado = alterarRisco(
                actualizado,
                35,
                "Decisão crítica de seguir instruções."
            );

            actualizado = adicionarTransaccao(
                actualizado,
                transaccoes[0]
            );

            goTo(7, actualizarEtapa(actualizado, 7));
            return;
        }

        if (seleccionado === "verificar") {
            actualizado = registarDecisao(actualizado, {
                accao: "parar_e_verificar",
                classificacao: "segura",
                descricao: "O utilizador interrompeu a pressão e decidiu verificar.",
            });

            actualizado = adicionarComportamentoSeguro(
                actualizado,
                "Parou perante pressão e procurou verificar."
            );

            actualizado = marcarRecuperacao(actualizado);

            actualizado = alterarRisco(
                actualizado,
                -25,
                "Verificação independente no momento crítico."
            );

            goTo(7, actualizarEtapa(actualizado, 7));
            return;
        }

        if (seleccionado === "canal") {
            actualizado = registarDecisao(actualizado, {
                accao: "contactar_canal_oficial",
                classificacao: "muito_segura",
                descricao: "O utilizador utilizou um canal independente.",
            });

            actualizado = adicionarComportamentoSeguro(
                actualizado,
                "Utilizou um canal oficial independente."
            );

            actualizado = marcarRecuperacao(actualizado);

            actualizado = alterarRisco(
                actualizado,
                -35,
                "Canal oficial utilizado."
            );

            goTo(7, actualizarEtapa(actualizado, 7));
            return;
        }

        actualizado = registarDecisao(actualizado, {
            accao: "pedir_identificacao",
            classificacao: "intermedia",
            descricao: "O utilizador pediu identificação ao interlocutor.",
        });

        actualizado = adicionarComportamentoSeguro(
            actualizado,
            "Questionou a identidade do interlocutor."
        );

        actualizado = adicionarTecnica(
            actualizado,
            "Autoridade"
        );

        actualizado = alterarRisco(
            actualizado,
            -5,
            "Identidade do interlocutor questionada."
        );

        goTo(7, actualizarEtapa(actualizado, 7));
    };

    return (
        <StageLayout
            step="05"
            title="Momento crítico"
            subtitle="A pressão aumenta"
            icon={<TriangleAlert />}
            sessao={sessao}
        >
            <div className="mb-countdown">
                <div>
                    <Clock3 />
                    <span>PRESSÃO SIMULADA</span>
                </div>

                <strong>02:00</strong>

                <p>
                    “A validação precisa de ser concluída agora.”
                </p>
            </div>

            <div className="mb-critical-message">
                <div className="mb-message-person">
                    <span>INTERLOCUTOR</span>

                    <p>
                        “Se não concluir a confirmação neste momento,
                        o cartão poderá permanecer bloqueado.”
                    </p>

                    <p>
                        “Escolha uma das opções para continuarmos.”
                    </p>
                </div>
            </div>

            <div className="mb-choice-grid">
                <button
                    type="button"
                    className={`mb-choice ${
                        seleccionado === "seguir"
                            ? "mb-choice-selected-danger"
                            : ""
                    }`}
                    onClick={() => decidir("seguir")}
                >
                    <AlertTriangle />
                    <span>
                        <strong>Seguir as instruções</strong>
                        <small>Resolver rapidamente</small>
                    </span>
                    <ChevronRight />
                </button>

                <button
                    type="button"
                    className={`mb-choice ${
                        seleccionado === "verificar"
                            ? "mb-choice-selected-safe"
                            : ""
                    }`}
                    onClick={() => decidir("verificar")}
                >
                    <FileSearch />
                    <span>
                        <strong>Parar e verificar</strong>
                        <small>Não agir sob pressão</small>
                    </span>
                    <ChevronRight />
                </button>

                <button
                    type="button"
                    className={`mb-choice ${
                        seleccionado === "canal"
                            ? "mb-choice-selected-safe"
                            : ""
                    }`}
                    onClick={() => decidir("canal")}
                >
                    <ShieldCheck />
                    <span>
                        <strong>Contactar o banco por canal oficial</strong>
                        <small>Confirmar independentemente</small>
                    </span>
                    <ChevronRight />
                </button>

                <button
                    type="button"
                    className={`mb-choice ${
                        seleccionado === "identificacao"
                            ? "mb-choice-selected-safe"
                            : ""
                    }`}
                    onClick={() => decidir("identificacao")}
                >
                    <Eye />
                    <span>
                        <strong>Questionar a identificação</strong>
                        <small>Testar a legitimidade do contacto</small>
                    </span>
                    <ChevronRight />
                </button>
            </div>

            <NavigationButtons
                onBack={() =>
                    goTo(
                        6,
                        actualizarEtapa(sessao, 6)
                    )
                }
                onNext={confirmar}
                nextLabel="Executar decisão"
                disabled={!seleccionado}
            />
        </StageLayout>
    );
}

function ConsequenceStage({ sessao, setSessao, goTo }) {
    const resultado = useMemo(() => {
        if (sessao.transaccoesSimuladas?.length) {
            return "danger";
        }

        if (sessao.recuperouControlo) {
            return "safe";
        }

        return "attention";
    }, [sessao]);

    const continuar = () => {
        const actualizado = registarAccao(sessao, {
            tipo: "navegacao",
            accao: "abrir_investigacao",
            descricao: "O utilizador abriu a investigação do incidente.",
        });

        goTo(8, actualizarEtapa(actualizado, 8));
    };

    if (resultado === "danger") {
        const perda = (sessao.transaccoesSimuladas || []).reduce(
            (total, item) => total + item.valor,
            0
        );

        return (
            <StageLayout
                step="06"
                title="Consequência"
                subtitle="A cadeia de fraude avançou"
                icon={<XCircle />}
                sessao={sessao}
            >
                <div className="mb-final-danger">
                    <div className="mb-final-icon">
                        <XCircle size={42} />
                    </div>

                    <span className="mb-final-label">
                        INCIDENTE · CRÍTICO
                    </span>

                    <h2>
                        CARTÃO COMPROMETIDO
                    </h2>

                    <p>
                        A tentativa de Engenharia Social foi bem-sucedida
                        dentro do ambiente simulado.
                    </p>
                </div>

                <div className="mb-financial-impact">
                    <div>
                        <span>PERDA FINANCEIRA SIMULADA</span>
                        <strong>{formatarMZN(perda)}</strong>
                    </div>

                    <div>
                        <span>TRANSACÇÕES FRAUDULENTAS</span>
                        <strong>
                            {sessao.transaccoesSimuladas.length}
                        </strong>
                    </div>

                    <div>
                        <span>NÍVEL DE RISCO</span>
                        <strong>CRÍTICO</strong>
                    </div>
                </div>

                <div className="mb-transaction-list">
                    {sessao.transaccoesSimuladas.map((item) => (
                        <div
                            className="mb-sim-transaction"
                            key={item.id}
                        >
                            <div>
                                <AlertTriangle size={18} />
                                <span>{item.descricao}</span>
                            </div>

                            <strong>
                                -{formatarMZN(item.valor)}
                            </strong>
                        </div>
                    ))}
                </div>

                <div className="mb-consequence-text">
                    <strong>
                        O sistema não foi “quebrado”.
                    </strong>

                    <p>
                        A barreira de segurança foi ultrapassada através
                        de manipulação do utilizador. Esta é uma das
                        características centrais da Engenharia Social.
                    </p>
                </div>

                <NavigationButtons
                    onNext={continuar}
                    nextLabel="Investigar o incidente"
                />
            </StageLayout>
        );
    }

    if (resultado === "safe") {
        return (
            <StageLayout
                step="06"
                title="Consequência"
                subtitle="A tentativa foi interrompida"
                icon={<ShieldCheck />}
                sessao={sessao}
            >
                <div className="mb-final-safe">
                    <div className="mb-final-icon">
                        <ShieldCheck size={42} />
                    </div>

                    <span className="mb-final-label">
                        INCIDENTE · BLOQUEADO
                    </span>

                    <h2>
                        FRAUDE INTERROMPIDA
                    </h2>

                    <p>
                        As suas decisões impediram que a tentativa
                        avançasse para o comprometimento do cartão.
                    </p>
                </div>

                <div className="mb-financial-impact mb-financial-safe">
                    <div>
                        <span>PERDA FINANCEIRA SIMULADA</span>
                        <strong>0 MZN</strong>
                    </div>

                    <div>
                        <span>VALOR POTENCIALMENTE PROTEGIDO</span>
                        <strong>{formatarMZN(sessao.valorEmRisco)}</strong>
                    </div>

                    <div>
                        <span>TRANSACÇÕES EVITADAS</span>
                        <strong>4</strong>
                    </div>
                </div>

                <div className="mb-success-message">
                    <CheckCircle2 size={21} />

                    <p>
                        Você interrompeu a cadeia de manipulação antes
                        de permitir que o atacante avançasse.
                    </p>
                </div>

                <NavigationButtons
                    onNext={continuar}
                    nextLabel="Investigar a sessão"
                />
            </StageLayout>
        );
    }

    return (
        <StageLayout
            step="06"
            title="Consequência"
            subtitle="A sessão permanece sob análise"
            icon={<AlertTriangle />}
            sessao={sessao}
        >
            <div className="mb-final-attention">
                <AlertTriangle size={42} />

                <h2>
                    RISCO AINDA PRESENTE
                </h2>

                <p>
                    A cadeia de Engenharia Social não foi totalmente
                    neutralizada.
                </p>
            </div>

            <NavigationButtons
                onNext={continuar}
                nextLabel="Investigar a sessão"
            />
        </StageLayout>
    );
}

function InvestigationStage({ sessao, setSessao, goTo }) {
    const [seleccionados, setSeleccionados] = useState([]);

    const tecnicas = [
        "Autoridade",
        "Urgência",
        "Pretexto",
        "Pressão psicológica",
        "Confiança",
    ];

    const toggle = (tecnica) => {
        setSeleccionados((actual) =>
            actual.includes(tecnica)
                ? actual.filter((item) => item !== tecnica)
                : [...actual, tecnica]
        );
    };

    const analisar = () => {
        let actualizado = registarDecisao(sessao, {
            accao: "analise_forense",
            classificacao: "educativa",
            descricao: "O utilizador analisou as técnicas utilizadas.",
            tecnicas: seleccionados,
        });

        seleccionados.forEach((tecnica) => {
            actualizado = adicionarTecnica(
                actualizado,
                tecnica
            );
        });

        actualizado = registarAccao(actualizado, {
            tipo: "investigacao",
            accao: "tecnicas_analisadas",
            quantidade: seleccionados.length,
            descricao: "Técnicas analisadas na investigação.",
        });

        goTo(9, actualizarEtapa(actualizado, 9));
    };

    return (
        <StageLayout
            step="07"
            title="Investigação"
            subtitle="Analise a cadeia de manipulação"
            icon={<FileSearch />}
            sessao={sessao}
        >
            <div className="mb-investigation-intro">
                <FileSearch size={27} />

                <div>
                    <h3>
                        Quais técnicas estiveram presentes?
                    </h3>

                    <p>
                        Seleccione as técnicas que identificou durante
                        a experiência.
                    </p>
                </div>
            </div>

            <div className="mb-technique-grid">
                {tecnicas.map((tecnica) => (
                    <button
                        type="button"
                        key={tecnica}
                        className={`mb-technique ${
                            seleccionados.includes(tecnica)
                                ? "selected"
                                : ""
                        }`}
                        onClick={() => toggle(tecnica)}
                    >
                        {seleccionados.includes(tecnica) ? (
                            <CheckCircle2 />
                        ) : (
                            <AlertTriangle />
                        )}

                        <span>{tecnica}</span>
                    </button>
                ))}
            </div>

            <div className="mb-timeline">
                <div className="mb-timeline-title">
                    <Clock3 size={18} />
                    Linha temporal da sua sessão
                </div>

                {(sessao.historico || [])
                    .slice(-8)
                    .map((evento) => (
                        <div
                            className="mb-timeline-item"
                            key={evento.id}
                        >
                            <span>{evento.hora}</span>

                            <div>
                                <strong>
                                    {evento.accao || evento.tipo}
                                </strong>

                                <small>
                                    {evento.descricao || ""}
                                </small>
                            </div>
                        </div>
                    ))}
            </div>

            <NavigationButtons
                onNext={analisar}
                nextLabel="Gerar análise de sessão"
                disabled={seleccionados.length === 0}
            />
        </StageLayout>
    );
}

function FeedbackStage({ sessao, setSessao, onRestart, onExit, onNext }) {
    useEffect(() => {
        if (!sessao.concluida) {
            const resultado = calcularResultado(sessao);
            setSessao(resultado);
        }
    }, []);

    const actual = sessao.concluida
        ? sessao
        : calcularResultado(sessao);

    const resumo = obterResumo(actual);

    const negativo =
        resumo.perda > 0;

    const resultadoSeguro =
        resumo.perda === 0 && resumo.pontuacao >= 80;

    return (
        <StageLayout
            step="08"
            title="Relatório de Resiliência"
            subtitle="Análise personalizada da sua sessão"
            icon={
                resultadoSeguro
                    ? <ShieldCheck />
                    : <ShieldAlert />
            }
            sessao={actual}
        >
            <div
                className={`mb-report-header ${
                    negativo
                        ? "mb-report-danger"
                        : "mb-report-safe"
                }`}
            >
                {negativo ? (
                    <XCircle size={38} />
                ) : (
                    <ShieldCheck size={38} />
                )}

                <div>
                    <span>
                        {negativo
                            ? "RESULTADO CRÍTICO"
                            : "RESULTADO DE SEGURANÇA"}
                    </span>

                    <h2>
                        {negativo
                            ? "O seu cartão foi comprometido na simulação."
                            : "Você impediu o comprometimento do cartão."}
                    </h2>
                </div>
            </div>

            <div className="mb-report-metrics">
                <div>
                    <span>PONTUAÇÃO</span>
                    <strong>
                        {resumo.pontuacao}/100
                    </strong>
                </div>

                <div>
                    <span>RISCO FINAL</span>
                    <strong>
                        {resumo.risco}/100
                    </strong>
                </div>

                <div>
                    <span>PERDA SIMULADA</span>
                    <strong>
                        {formatarMZN(resumo.perda)}
                    </strong>
                </div>

                <div>
                    <span>VALOR PROTEGIDO</span>
                    <strong>
                        {formatarMZN(resumo.valorProtegido)}
                    </strong>
                </div>
            </div>

            {negativo ? (
                <div className="mb-aggressive-feedback">
                    <div className="mb-aggressive-title">
                        <TriangleAlert size={22} />
                        O QUE ACONTECEU
                    </div>

                    <p>
                        A sua sessão permitiu que a cadeia de
                        Engenharia Social avançasse.
                    </p>

                    <p>
                        <strong>
                            Perda financeira simulada:
                        </strong>{" "}
                        {formatarMZN(resumo.perda)}.
                    </p>

                    <p>
                        Foram executadas{" "}
                        <strong>
                            {resumo.transaccoes}
                        </strong>{" "}
                        transacções fraudulentas no ambiente simulado.
                    </p>

                    <p>
                        O ponto crítico ocorreu quando as decisões
                        tomadas permitiram aumentar o nível de acesso
                        do atacante.
                    </p>
                </div>
            ) : (
                <div className="mb-positive-feedback">
                    <div className="mb-positive-title">
                        <ShieldCheck size={22} />
                        FRAUDE BLOQUEADA
                    </div>

                    <p>
                        As suas decisões impediram o avanço da cadeia
                        de Engenharia Social.
                    </p>

                    <p>
                        <strong>
                            Perda financeira simulada:
                        </strong>{" "}
                        0 MZN.
                    </p>

                    <p>
                        <strong>
                            Valor potencialmente protegido:
                        </strong>{" "}
                        {formatarMZN(resumo.valorProtegido)}.
                    </p>
                </div>
            )}

            <div className="mb-report-section">
                <h3>
                    <ShieldCheck size={20} />
                    Comportamentos seguros
                </h3>

                {resumo.comportamentosSeguros > 0 ? (
                    <div className="mb-report-list">
                        {actual.comportamentosSeguros.map(
                            (item, index) => (
                                <div key={`${item}-${index}`}>
                                    <CheckCircle2 size={18} />
                                    <span>{item}</span>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <p className="mb-empty">
                        Nenhum comportamento seguro relevante
                        foi registado.
                    </p>
                )}
            </div>

            <div className="mb-report-section">
                <h3>
                    <TriangleAlert size={20} />
                    Comportamentos de risco
                </h3>

                {resumo.comportamentosRisco > 0 ? (
                    <div className="mb-report-list mb-report-list-danger">
                        {actual.comportamentosRisco.map(
                            (item, index) => (
                                <div key={`${item}-${index}`}>
                                    <XCircle size={18} />
                                    <span>{item}</span>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <p className="mb-empty">
                        Não foram registados comportamentos de risco
                        relevantes.
                    </p>
                )}
            </div>

            <div className="mb-report-section">
                <h3>
                    <FileSearch size={20} />
                    Técnicas identificadas
                </h3>

                <div className="mb-tag-list">
                    {actual.tecnicasIdentificadas.length > 0 ? (
                        actual.tecnicasIdentificadas.map((item) => (
                            <span key={item}>
                                {item}
                            </span>
                        ))
                    ) : (
                        <span>
                            Nenhuma técnica registada.
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-report-section">
                <h3>
                    <Clock3 size={20} />
                    Linha temporal
                </h3>

                <div className="mb-timeline">
                    {(actual.historico || []).map((evento) => (
                        <div
                            className="mb-timeline-item"
                            key={evento.id}
                        >
                            <span>{evento.hora}</span>

                            <div>
                                <strong>
                                    {evento.accao || evento.tipo}
                                </strong>

                                <small>
                                    {evento.descricao || ""}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-report-actions">
                <button
                    type="button"
                    className="mb-btn mb-btn-secondary"
                    onClick={onRestart}
                >
                    <RotateCcw size={18} />
                    Recomeçar simulação
                </button>

                <button
                    type="button"
                    className="mb-btn mb-btn-primary"
                    onClick={onNext}
                >
                    Continuar explorando simulações
                    <ArrowRight size={18} />
                </button>

                <button
                    type="button"
                    className="mb-btn mb-btn-dark"
                    onClick={onExit}
                >
                    <X size={18} />
                    Encerrar simulação
                </button>
            </div>
        </StageLayout>
    );
}

function StageLayout({
    step,
    title,
    subtitle,
    icon,
    sessao,
    children,
}) {
    return (
        <div className="mb-page">
            <div className="mb-progress">
                <div>
                    <span>OPERAÇÃO CARTÃO SEGURO</span>
                    <strong>ETAPA {step}/08</strong>
                </div>

                <div className="mb-progress-track">
                    <div
                        style={{
                            width: `${(Number(step) / 8) * 100}%`,
                        }}
                    />
                </div>
            </div>

            <div className="mb-stage-heading">
                <div className="mb-stage-icon">
                    {icon}
                </div>

                <div>
                    <span>{subtitle}</span>
                    <h1>{title}</h1>
                </div>
            </div>

            <RiskBar risco={sessao.risco} />

            <main className="mb-stage-content">
                {children}
            </main>
        </div>
    );
}

export default function MillenniumBimPage() {
    const navigate = useNavigate();

    const [sessao, setSessao] = useState(() => {
        try {
            return obterSessao();
        } catch {
            return criarSessao();
        }
    });

    const [etapa, setEtapa] = useState(
        () => sessao.etapaActual || 1
    );

    useEffect(() => {
        const estiloId = "sicsi-millennium-bim-styles";

        if (document.getElementById(estiloId)) {
            return;
        }

        const style = document.createElement("style");
        style.id = estiloId;

        style.textContent = `
            * {
                box-sizing: border-box;
            }

            .mb-page {
                min-height: 100vh;
                background:
                    radial-gradient(circle at 80% 10%, rgba(215,25,32,.07), transparent 30%),
                    #f6f6f6;
                color: #111;
                font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                padding-bottom: 70px;
            }

            .mb-header {
                min-height: 76px;
                padding: 0 5%;
                background: #fff;
                border-bottom: 1px solid #e6e6e6;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                position: sticky;
                top: 0;
                z-index: 20;
            }

            .mb-brand {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .mb-logo {
                width: 42px;
                height: 42px;
                border-radius: 50%;
                background: #d71920;
                display: grid;
                place-items: center;
                color: #fff;
                font-weight: 900;
                font-size: 25px;
            }

            .mb-brand-name {
                font-size: 18px;
                font-weight: 800;
                letter-spacing: -.4px;
            }

            .mb-brand-sub {
                font-size: 11px;
                color: #777;
                margin-top: 2px;
            }

            .mb-header-right {
                display: flex;
                align-items: center;
                gap: 18px;
            }

            .mb-simulation-label {
                color: #777;
                font-size: 9px;
                font-weight: 800;
                letter-spacing: .7px;
                display: flex;
                align-items: center;
                gap: 7px;
            }

            .mb-simulation-label span {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #d71920;
                animation: mbPulse 1.8s infinite;
            }

            @keyframes mbPulse {
                0%,100% { opacity: .35; transform: scale(.8); }
                50% { opacity: 1; transform: scale(1.2); }
            }

            .mb-exit {
                border: 0;
                background: transparent;
                color: #555;
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                font-weight: 700;
                font-size: 12px;
            }

            .mb-exit:hover {
                color: #d71920;
            }

            .mb-session-strip {
                background: #171717;
                color: #fff;
                min-height: 48px;
                padding: 0 5%;
                display: flex;
                align-items: center;
                gap: 35px;
            }

            .mb-session-strip div {
                display: flex;
                gap: 7px;
                align-items: center;
            }

            .mb-session-strip span {
                color: #aaa;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: .7px;
            }

            .mb-session-strip strong {
                font-size: 11px;
            }

            .mb-hero {
                max-width: 1180px;
                margin: 0 auto;
                padding: 80px 24px 45px;
                display: grid;
                grid-template-columns: 1fr 420px;
                gap: 70px;
                align-items: center;
            }

            .mb-kicker {
                color: #d71920;
                font-size: 11px;
                font-weight: 900;
                letter-spacing: 1.4px;
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 18px;
            }

            .mb-hero h1 {
                font-size: clamp(42px, 6vw, 72px);
                line-height: .95;
                letter-spacing: -4px;
                margin: 0 0 25px;
                font-weight: 300;
            }

            .mb-hero h1 strong {
                font-weight: 900;
            }

            .mb-hero p {
                max-width: 650px;
                color: #555;
                line-height: 1.7;
                font-size: 16px;
                margin-bottom: 30px;
            }

            .mb-card-visual {
                min-height: 265px;
                padding: 28px;
                border-radius: 22px;
                background:
                    linear-gradient(135deg, #d71920 0%, #b80f17 58%, #7c090e 100%);
                color: #fff;
                box-shadow: 0 35px 70px rgba(0,0,0,.20);
                transform: rotate(3deg);
                position: relative;
                overflow: hidden;
            }

            .mb-card-visual:after {
                content: "";
                position: absolute;
                width: 280px;
                height: 280px;
                border: 1px solid rgba(255,255,255,.18);
                border-radius: 50%;
                right: -110px;
                bottom: -150px;
            }

            .mb-card-top,
            .mb-card-bottom {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: 1px;
            }

            .mb-chip {
                width: 47px;
                height: 35px;
                border-radius: 8px;
                background: linear-gradient(135deg,#e8e8e8,#9f9f9f);
                margin-top: 55px;
                position: relative;
            }

            .mb-chip:after {
                content: "";
                position: absolute;
                inset: 8px;
                border: 1px solid rgba(0,0,0,.25);
                border-radius: 4px;
            }

            .mb-card-number {
                margin: 28px 0;
                font-size: 21px;
                font-weight: 700;
                letter-spacing: 2px;
            }

            .mb-grid {
                max-width: 1180px;
                margin: 0 auto;
                padding: 0 24px;
                display: grid;
                gap: 18px;
            }

            .mb-grid-three {
                grid-template-columns: repeat(3, 1fr);
            }

            .mb-info-card {
                background: #fff;
                padding: 25px;
                border: 1px solid #e8e8e8;
                border-radius: 15px;
            }

            .mb-info-card svg {
                color: #d71920;
            }

            .mb-info-card h3 {
                margin: 18px 0 8px;
                font-size: 17px;
            }

            .mb-info-card p {
                margin: 0;
                color: #666;
                line-height: 1.6;
                font-size: 13px;
            }

            .mb-warning {
                max-width: 1180px;
                margin: 25px auto;
                padding: 15px 20px;
                border: 1px solid #ead7d7;
                background: #fff;
                border-radius: 12px;
                display: flex;
                gap: 12px;
                align-items: flex-start;
                color: #555;
            }

            .mb-warning svg {
                color: #d71920;
                flex: 0 0 auto;
            }

            .mb-warning strong,
            .mb-warning span {
                display: block;
            }

            .mb-warning strong {
                font-size: 12px;
                color: #222;
                margin-bottom: 3px;
            }

            .mb-warning span {
                font-size: 11px;
            }

            .mb-link-button {
                display: block;
                margin: 25px auto;
                background: none;
                border: 0;
                color: #d71920;
                font-weight: 800;
                cursor: pointer;
            }

            .mb-btn {
                border: 0;
                border-radius: 10px;
                padding: 13px 18px;
                font-size: 13px;
                font-weight: 800;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 9px;
                cursor: pointer;
                transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
            }

            .mb-btn:hover:not(:disabled) {
                transform: translateY(-2px);
            }

            .mb-btn:disabled {
                opacity: .4;
                cursor: not-allowed;
            }

            .mb-btn-primary {
                color: #fff;
                background: #d71920;
                box-shadow: 0 10px 25px rgba(215,25,32,.22);
            }

            .mb-btn-primary:hover:not(:disabled) {
                background: #b80f17;
            }

            .mb-btn-secondary {
                background: #fff;
                color: #222;
                border: 1px solid #ddd;
            }

            .mb-btn-dark {
                color: #fff;
                background: #161616;
            }

            .mb-btn-large {
                padding: 16px 22px;
                font-size: 14px;
            }

            .mb-progress {
                max-width: 1120px;
                margin: 0 auto;
                padding: 35px 24px 10px;
            }

            .mb-progress > div:first-child {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .mb-progress span {
                font-size: 9px;
                letter-spacing: 1px;
                font-weight: 900;
                color: #888;
            }

            .mb-progress strong {
                font-size: 10px;
                color: #d71920;
            }

            .mb-progress-track {
                height: 4px;
                background: #e2e2e2;
                overflow: hidden;
                border-radius: 5px;
            }

            .mb-progress-track > div {
                height: 100%;
                background: #d71920;
                transition: width .4s ease;
            }

            .mb-stage-heading {
                max-width: 1120px;
                margin: 30px auto 18px;
                padding: 0 24px;
                display: flex;
                gap: 15px;
                align-items: center;
            }

            .mb-stage-icon {
                width: 52px;
                height: 52px;
                background: #d71920;
                color: #fff;
                border-radius: 14px;
                display: grid;
                place-items: center;
                box-shadow: 0 10px 22px rgba(215,25,32,.2);
            }

            .mb-stage-heading span {
                font-size: 10px;
                font-weight: 800;
                color: #888;
                text-transform: uppercase;
                letter-spacing: .7px;
            }

            .mb-stage-heading h1 {
                margin: 3px 0 0;
                font-size: 32px;
                letter-spacing: -1.3px;
            }

            .mb-risk-wrapper {
                max-width: 1120px;
                margin: 0 auto 25px;
                padding: 0 24px;
            }

            .mb-risk-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 7px;
            }

            .mb-risk-top span {
                display: flex;
                gap: 7px;
                align-items: center;
                font-size: 11px;
                font-weight: 800;
                color: #666;
            }

            .mb-risk-top strong {
                font-size: 10px;
            }

            .mb-risk-low { color: #218739; }
            .mb-risk-medium { color: #9a6900; }
            .mb-risk-high { color: #c45b00; }
            .mb-risk-critical { color: #d71920; }

            .mb-risk-track {
                height: 6px;
                background: #e4e4e4;
                border-radius: 10px;
                overflow: hidden;
            }

            .mb-risk-fill {
                height: 100%;
                transition: width .45s ease;
            }

            .mb-risk-fill-low { background: #2e9946; }
            .mb-risk-fill-medium { background: #d19b17; }
            .mb-risk-fill-high { background: #ed761c; }
            .mb-risk-fill-critical { background: #d71920; }

            .mb-stage-content {
                max-width: 1000px;
                margin: 0 auto;
                padding: 0 24px;
            }

            .mb-alert-box,
            .mb-danger-banner,
            .mb-investigation-intro {
                background: #fff;
                border: 1px solid #e8e8e8;
                border-radius: 17px;
                padding: 25px;
                display: flex;
                gap: 17px;
                align-items: flex-start;
                box-shadow: 0 10px 30px rgba(0,0,0,.035);
            }

            .mb-alert-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: grid;
                place-items: center;
                background: #fff0f0;
                color: #d71920;
                flex: 0 0 auto;
            }

            .mb-small-label {
                font-size: 9px;
                color: #d71920;
                font-weight: 900;
                letter-spacing: 1px;
            }

            .mb-alert-box h2 {
                margin: 6px 0;
                font-size: 23px;
            }

            .mb-alert-box p {
                color: #666;
                line-height: 1.6;
                margin: 0;
            }

            .mb-transaction-card {
                margin: 18px 0;
                background: #fff;
                border: 1px solid #e5e5e5;
                border-radius: 15px;
                display: grid;
                grid-template-columns: 1.5fr 1fr 1fr 1fr;
                overflow: hidden;
            }

            .mb-transaction-card > div {
                padding: 18px;
                border-right: 1px solid #eee;
            }

            .mb-transaction-card span,
            .mb-transaction-card strong {
                display: block;
            }

            .mb-transaction-card span {
                font-size: 9px;
                color: #999;
                text-transform: uppercase;
                margin-bottom: 5px;
            }

            .mb-transaction-card strong {
                font-size: 12px;
            }

            .mb-status-danger {
                color: #d71920;
            }

            .mb-reveal {
                padding: 20px;
                background: #171717;
                color: #fff;
                border-radius: 14px;
                margin: 18px 0;
            }

            .mb-reveal-title {
                display: flex;
                gap: 8px;
                align-items: center;
                color: #fff;
                font-weight: 800;
                margin-bottom: 12px;
            }

            .mb-reveal p {
                font-size: 12px;
                color: #bbb;
                margin: 7px 0;
            }

            .mb-reveal strong {
                color: #fff;
            }

            .mb-choice-grid {
                display: grid;
                gap: 12px;
                margin: 22px 0;
            }

            .mb-choice {
                border: 1px solid #e1e1e1;
                background: #fff;
                padding: 17px;
                border-radius: 13px;
                display: grid;
                grid-template-columns: 30px 1fr 20px;
                gap: 12px;
                align-items: center;
                text-align: left;
                cursor: pointer;
                transition: all .18s ease;
            }

            .mb-choice:hover {
                border-color: #bbb;
                transform: translateX(3px);
                box-shadow: 0 10px 25px rgba(0,0,0,.06);
            }

            .mb-choice > svg:first-child {
                color: #777;
            }

            .mb-choice-safe:hover,
            .mb-choice-selected-safe {
                border-color: #26843d !important;
                background: #f4fff6;
            }

            .mb-choice-selected-danger {
                border-color: #d71920 !important;
                background: #fff4f4;
            }

            .mb-choice strong,
            .mb-choice small {
                display: block;
            }

            .mb-choice strong {
                font-size: 13px;
            }

            .mb-choice small {
                color: #777;
                margin-top: 3px;
                font-size: 11px;
            }

            .mb-section-title {
                margin: 25px 0 8px;
            }

            .mb-section-title span,
            .mb-section-title small {
                display: block;
            }

            .mb-section-title span {
                font-weight: 900;
                font-size: 14px;
            }

            .mb-section-title small {
                color: #777;
                font-size: 11px;
                margin-top: 4px;
            }

            .mb-phone {
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 45px rgba(0,0,0,.08);
            }

            .mb-phone-top {
                background: #171717;
                color: #fff;
                padding: 18px 20px;
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .mb-avatar {
                width: 42px;
                height: 42px;
                border-radius: 50%;
                background: #d71920;
                color: #fff;
                display: grid;
                place-items: center;
                font-size: 11px;
                font-weight: 900;
            }

            .mb-phone-top span,
            .mb-phone-top strong {
                display: block;
            }

            .mb-phone-top span {
                font-size: 8px;
                color: #aaa;
                letter-spacing: .8px;
            }

            .mb-phone-top strong {
                font-size: 13px;
                margin-top: 3px;
            }

            .mb-phone-top svg {
                margin-left: auto;
                color: #d71920;
            }

            .mb-phone-message {
                padding: 24px;
            }

            .mb-phone-message p {
                margin: 0 0 13px;
                line-height: 1.7;
                color: #444;
                font-size: 14px;
            }

            .mb-conversation {
                display: grid;
                gap: 12px;
            }

            .mb-message {
                border-radius: 15px;
                padding: 18px;
                max-width: 720px;
            }

            .mb-message-system {
                background: #fff;
                border: 1px solid #e3e3e3;
            }

            .mb-message-person {
                margin-left: auto;
                background: #171717;
                color: #fff;
            }

            .mb-message span {
                font-size: 8px;
                letter-spacing: 1px;
                font-weight: 900;
                color: #999;
            }

            .mb-message p {
                font-size: 13px;
                line-height: 1.65;
                margin: 8px 0 0;
            }

            .mb-message-person span {
                color: #d71920;
            }

            .mb-signal-panel {
                margin-top: 20px;
                padding: 20px;
                border-radius: 15px;
                background: #fff;
                border: 1px solid #e5e5e5;
            }

            .mb-signal-heading {
                display: flex;
                justify-content: space-between;
                gap: 15px;
                align-items: center;
            }

            .mb-signal-heading h3 {
                margin: 5px 0 0;
            }

            .mb-detected {
                padding: 7px 10px;
                border-radius: 30px;
                background: #eefaf0;
                color: #217a35;
                font-size: 10px;
                font-weight: 800;
                display: flex;
                gap: 5px;
                align-items: center;
            }

            .mb-signal-buttons {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 18px;
            }

            .mb-signal-button {
                border: 1px solid #ddd;
                background: #fafafa;
                padding: 11px 14px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-weight: 700;
                font-size: 11px;
            }

            .mb-signal-button:hover {
                border-color: #d71920;
                color: #d71920;
            }

            .mb-danger-banner {
                background: #fff1f1;
                border-color: #f1c8c8;
            }

            .mb-danger-banner svg {
                color: #d71920;
            }

            .mb-danger-banner strong,
            .mb-danger-banner span {
                display: block;
            }

            .mb-danger-banner strong {
                color: #d71920;
                font-size: 11px;
            }

            .mb-danger-banner span {
                color: #555;
                font-size: 12px;
                margin-top: 4px;
            }

            .mb-request {
                margin-top: 18px;
                background: #fff;
                border: 1px solid #e3e3e3;
                border-radius: 17px;
                padding: 22px;
            }

            .mb-request-header {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .mb-avatar-red {
                background: #171717;
            }

            .mb-request-header strong,
            .mb-request-header span {
                display: block;
            }

            .mb-request-header strong {
                font-size: 13px;
            }

            .mb-request-header span {
                color: #888;
                font-size: 10px;
                margin-top: 3px;
            }

            .mb-request > p {
                color: #555;
                line-height: 1.6;
                font-size: 13px;
            }

            .mb-request-options {
                display: grid;
                gap: 9px;
            }

            .mb-request-option {
                border: 1px solid #e0e0e0;
                background: #fafafa;
                border-radius: 10px;
                padding: 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer;
                text-align: left;
                font-weight: 700;
                font-size: 12px;
            }

            .mb-request-option:hover {
                border-color: #d71920;
            }

            .mb-request-option.selected {
                border-color: #d71920;
                background: #fff3f3;
                color: #d71920;
            }

            .mb-countdown {
                border-radius: 17px;
                padding: 24px;
                background: #171717;
                color: #fff;
                text-align: center;
                box-shadow: 0 18px 45px rgba(0,0,0,.15);
            }

            .mb-countdown div {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                color: #d71920;
                font-size: 9px;
                font-weight: 900;
                letter-spacing: 1px;
            }

            .mb-countdown > strong {
                display: block;
                font-size: 50px;
                letter-spacing: -2px;
                margin: 12px 0;
            }

            .mb-countdown p {
                color: #aaa;
                margin: 0;
                font-size: 12px;
            }

            .mb-critical-message {
                margin-top: 15px;
            }

            .mb-final-danger,
            .mb-final-safe,
            .mb-final-attention {
                border-radius: 20px;
                padding: 38px 30px;
                text-align: center;
            }

            .mb-final-danger {
                background: #171717;
                color: #fff;
            }

            .mb-final-safe {
                background: linear-gradient(145deg,#effbf2,#fff);
                border: 1px solid #ccebd2;
            }

            .mb-final-attention {
                background: #fff8e7;
                border: 1px solid #f0dfad;
            }

            .mb-final-icon {
                width: 75px;
                height: 75px;
                margin: 0 auto 18px;
                border-radius: 50%;
                display: grid;
                place-items: center;
                background: rgba(215,25,32,.12);
                color: #d71920;
            }

            .mb-final-safe .mb-final-icon {
                color: #22863a;
                background: #dff5e3;
            }

            .mb-final-attention svg {
                color: #ad7900;
            }

            .mb-final-label {
                font-size: 9px;
                font-weight: 900;
                letter-spacing: 1.3px;
                color: #d71920;
            }

            .mb-final-safe .mb-final-label {
                color: #22863a;
            }

            .mb-final-danger h2,
            .mb-final-safe h2,
            .mb-final-attention h2 {
                margin: 10px 0;
                font-size: 32px;
                letter-spacing: -1px;
            }

            .mb-final-danger p,
            .mb-final-safe p,
            .mb-final-attention p {
                max-width: 650px;
                margin: auto;
                line-height: 1.7;
                color: #777;
            }

            .mb-final-danger p {
                color: #aaa;
            }

            .mb-financial-impact {
                margin: 18px 0;
                background: #fff;
                border: 1px solid #e4e4e4;
                border-radius: 15px;
                display: grid;
                grid-template-columns: repeat(3,1fr);
                overflow: hidden;
            }

            .mb-financial-impact > div {
                padding: 22px;
                text-align: center;
                border-right: 1px solid #eee;
            }

            .mb-financial-impact span,
            .mb-financial-impact strong {
                display: block;
            }

            .mb-financial-impact span {
                font-size: 8px;
                color: #888;
                letter-spacing: .7px;
            }

            .mb-financial-impact strong {
                font-size: 20px;
                margin-top: 7px;
            }

            .mb-financial-safe strong {
                color: #22863a;
            }

            .mb-transaction-list {
                display: grid;
                gap: 8px;
                margin: 18px 0;
            }

            .mb-sim-transaction {
                background: #fff;
                border: 1px solid #eee;
                padding: 14px 17px;
                border-radius: 11px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .mb-sim-transaction div {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 11px;
            }

            .mb-sim-transaction svg {
                color: #d71920;
            }

            .mb-sim-transaction strong {
                color: #d71920;
                font-size: 12px;
            }

            .mb-consequence-text {
                background: #fff;
                border: 1px solid #eee;
                padding: 20px;
                border-radius: 13px;
                line-height: 1.65;
                color: #555;
            }

            .mb-consequence-text strong {
                color: #d71920;
            }

            .mb-consequence-text p {
                margin-bottom: 0;
                font-size: 12px;
            }

            .mb-success-message {
                margin: 18px 0;
                padding: 18px;
                border-radius: 13px;
                background: #effbf2;
                color: #28763b;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }

            .mb-success-message p {
                margin: 0;
                font-size: 12px;
                line-height: 1.6;
            }

            .mb-investigation-intro {
                align-items: center;
            }

            .mb-investigation-intro svg {
                color: #d71920;
                flex: 0 0 auto;
            }

            .mb-investigation-intro h3 {
                margin: 0 0 4px;
            }

            .mb-investigation-intro p {
                color: #777;
                margin: 0;
                font-size: 12px;
            }

            .mb-technique-grid {
                display: grid;
                grid-template-columns: repeat(2,1fr);
                gap: 10px;
                margin: 18px 0;
            }

            .mb-technique {
                border: 1px solid #ddd;
                background: #fff;
                border-radius: 12px;
                padding: 16px;
                display: flex;
                gap: 10px;
                align-items: center;
                cursor: pointer;
                font-weight: 800;
                font-size: 12px;
                text-align: left;
            }

            .mb-technique svg {
                color: #999;
            }

            .mb-technique.selected {
                border-color: #d71920;
                background: #fff3f3;
                color: #d71920;
            }

            .mb-technique.selected svg {
                color: #d71920;
            }

            .mb-timeline {
                background: #171717;
                color: #fff;
                border-radius: 15px;
                padding: 20px;
                margin: 18px 0;
            }

            .mb-timeline-title {
                display: flex;
                align-items: center;
                gap: 7px;
                color: #fff;
                font-weight: 900;
                font-size: 11px;
                margin-bottom: 15px;
            }

            .mb-timeline-item {
                display: grid;
                grid-template-columns: 65px 1fr;
                gap: 12px;
                padding: 10px 0;
                border-top: 1px solid #2c2c2c;
            }

            .mb-timeline-item > span {
                color: #d71920;
                font-size: 9px;
                font-weight: 900;
            }

            .mb-timeline-item strong,
            .mb-timeline-item small {
                display: block;
            }

            .mb-timeline-item strong {
                font-size: 10px;
            }

            .mb-timeline-item small {
                color: #999;
                font-size: 9px;
                margin-top: 3px;
                line-height: 1.5;
            }

            .mb-report-header {
                padding: 26px;
                border-radius: 17px;
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .mb-report-danger {
                background: #171717;
                color: #fff;
            }

            .mb-report-safe {
                background: #effbf2;
                color: #1d632d;
                border: 1px solid #ccebd2;
            }

            .mb-report-header > svg {
                color: #d71920;
                flex: 0 0 auto;
            }

            .mb-report-safe > svg {
                color: #25813a;
            }

            .mb-report-header span {
                font-size: 9px;
                letter-spacing: 1px;
                font-weight: 900;
            }

            .mb-report-header h2 {
                margin: 5px 0 0;
                font-size: 23px;
                letter-spacing: -.6px;
            }

            .mb-report-metrics {
                display: grid;
                grid-template-columns: repeat(4,1fr);
                margin: 18px 0;
                background: #fff;
                border: 1px solid #e2e2e2;
                border-radius: 15px;
                overflow: hidden;
            }

            .mb-report-metrics div {
                padding: 18px;
                border-right: 1px solid #eee;
            }

            .mb-report-metrics span,
            .mb-report-metrics strong {
                display: block;
            }

            .mb-report-metrics span {
                font-size: 8px;
                color: #888;
                font-weight: 900;
            }

            .mb-report-metrics strong {
                margin-top: 6px;
                font-size: 18px;
            }

            .mb-aggressive-feedback,
            .mb-positive-feedback {
                padding: 22px;
                border-radius: 15px;
                margin: 18px 0;
            }

            .mb-aggressive-feedback {
                background: #fff0f0;
                border: 1px solid #f1c5c5;
            }

            .mb-positive-feedback {
                background: #effbf2;
                border: 1px solid #cbe8d1;
            }

            .mb-aggressive-title,
            .mb-positive-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 11px;
                font-weight: 900;
                letter-spacing: .7px;
            }

            .mb-aggressive-title {
                color: #d71920;
            }

            .mb-positive-title {
                color: #22863a;
            }

            .mb-aggressive-feedback p,
            .mb-positive-feedback p {
                font-size: 12px;
                color: #555;
                line-height: 1.7;
                margin: 10px 0 0;
            }

            .mb-report-section {
                margin-top: 24px;
            }

            .mb-report-section h3 {
                display: flex;
                align-items: center;
                gap: 7px;
                font-size: 14px;
                margin-bottom: 11px;
            }

            .mb-report-section h3 svg {
                color: #d71920;
            }

            .mb-report-list {
                background: #fff;
                border: 1px solid #e2e2e2;
                border-radius: 13px;
                overflow: hidden;
            }

            .mb-report-list > div {
                padding: 12px 15px;
                border-bottom: 1px solid #eee;
                display: flex;
                gap: 8px;
                align-items: flex-start;
                font-size: 11px;
            }

            .mb-report-list > div:last-child {
                border-bottom: 0;
            }

            .mb-report-list svg {
                color: #25813a;
                flex: 0 0 auto;
            }

            .mb-report-list-danger svg {
                color: #d71920;
            }

            .mb-empty {
                color: #888;
                font-size: 11px;
            }

            .mb-tag-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .mb-tag-list span {
                background: #fff;
                border: 1px solid #ddd;
                padding: 8px 11px;
                border-radius: 30px;
                font-size: 10px;
                font-weight: 800;
            }

            .mb-navigation {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                margin: 25px 0;
            }

            .mb-report-actions {
                display: grid;
                grid-template-columns: 1fr 1.4fr 1fr;
                gap: 10px;
                margin-top: 30px;
            }

            @media (max-width: 900px) {
                .mb-hero {
                    grid-template-columns: 1fr;
                    gap: 35px;
                }

                .mb-card-visual {
                    max-width: 450px;
                    width: 100%;
                    margin: auto;
                }

                .mb-grid-three {
                    grid-template-columns: 1fr;
                }

                .mb-transaction-card,
                .mb-financial-impact,
                .mb-report-metrics {
                    grid-template-columns: 1fr 1fr;
                }

                .mb-transaction-card > div:nth-child(2n) {
                    border-right: 0;
                }

                .mb-report-actions {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 650px) {
                .mb-header {
                    padding: 12px 18px;
                }

                .mb-header-right {
                    gap: 7px;
                }

                .mb-simulation-label {
                    display: none;
                }

                .mb-session-strip {
                    padding: 10px 18px;
                    gap: 12px;
                    overflow-x: auto;
                }

                .mb-session-strip div {
                    min-width: max-content;
                }

                .mb-hero {
                    padding: 50px 18px 30px;
                }

                .mb-hero h1 {
                    font-size: 46px;
                    letter-spacing: -2.5px;
                }

                .mb-card-visual {
                    min-height: 220px;
                    padding: 22px;
                }

                .mb-chip {
                    margin-top: 35px;
                }

                .mb-card-number {
                    font-size: 16px;
                }

                .mb-warning,
                .mb-stage-content,
                .mb-progress,
                .mb-stage-heading,
                .mb-risk-wrapper,
                .mb-grid {
                    padding-left: 18px;
                    padding-right: 18px;
                }

                .mb-stage-heading h1 {
                    font-size: 25px;
                }

                .mb-transaction-card,
                .mb-financial-impact,
                .mb-report-metrics,
                .mb-technique-grid {
                    grid-template-columns: 1fr;
                }

                .mb-transaction-card > div,
                .mb-financial-impact > div {
                    border-right: 0;
                    border-bottom: 1px solid #eee;
                }

                .mb-transaction-card > div:last-child,
                .mb-financial-impact > div:last-child {
                    border-bottom: 0;
                }

                .mb-signal-heading {
                    align-items: flex-start;
                    flex-direction: column;
                }

                .mb-navigation {
                    flex-direction: column-reverse;
                }

                .mb-navigation > span {
                    display: none;
                }

                .mb-navigation .mb-btn {
                    width: 100%;
                }

                .mb-report-header {
                    align-items: flex-start;
                }

                .mb-report-header h2 {
                    font-size: 18px;
                }

                .mb-final-danger h2,
                .mb-final-safe h2,
                .mb-final-attention h2 {
                    font-size: 25px;
                }
            }
        `;

        document.head.appendChild(style);

        return () => {
            document.getElementById(estiloId)?.remove();
        };
    }, []);

    const actualizar = (novaSessao) => {
        setSessao(novaSessao);
    };

    const goTo = (novaEtapa, novaSessao) => {
        setSessao(novaSessao);
        setEtapa(novaEtapa);
    };

    const iniciar = () => {
        const nova = criarSessao();

        const registada = registarAccao(nova, {
            tipo: "inicio",
            accao: "iniciar_simulacao",
            descricao: "Simulação Millennium bim iniciada.",
        });

        actualizar(registada);
        setEtapa(2);
    };

    const sair = () => {
        navigate("/student/simulacoes");
    };

    const reiniciar = () => {
        limparSessao();

        const nova = criarSessao();

        const registada = registarAccao(nova, {
            tipo: "reinicio",
            accao: "recomecar_simulacao",
            descricao: "O utilizador reiniciou a simulação.",
        });

        actualizar(registada);
        setEtapa(1);
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const continuarParaProxima = () => {
        navigate(
            "/student/simulacoes/engenharia-social/02"
        );
    };

    const conteudo = (() => {
        switch (etapa) {
            case 1:
                return (
                    <Briefing
                        onStart={iniciar}
                        onExit={sair}
                    />
                );

            case 2:
                return (
                    <AlertStage
                        sessao={sessao}
                        setSessao={actualizar}
                        goTo={goTo}
                    />
                );

            case 3:
                return (
                    <ContactStage
                        sessao={sessao}
                        setSessao={actualizar}
                        goTo={goTo}
                    />
                );

            case 4:
                return (
                    <TrustStage
                        sessao={sessao}
                        setSessao={actualizar}
                        goTo={goTo}
                    />
                );

            case 5:
                return (
                    <SuspiciousRequestStage
                        sessao={sessao}
                        setSessao={actualizar}
                        goTo={goTo}
                    />
                );

            case 6:
                return (
                    <CriticalStage
                        sessao={sessao}
                        setSessao={actualizar}
                        goTo={goTo}
                    />
                );

            case 7:
                return (
                    <ConsequenceStage
                        sessao={sessao}
                        setSessao={actualizar}
                        goTo={goTo}
                    />
                );

            case 8:
                return (
                    <InvestigationStage
                        sessao={sessao}
                        setSessao={actualizar}
                        goTo={goTo}
                    />
                );

            case 9:
                return (
                    <FeedbackStage
                        sessao={sessao}
                        setSessao={actualizar}
                        onRestart={reiniciar}
                        onExit={sair}
                        onNext={continuarParaProxima}
                    />
                );

            default:
                return (
                    <Briefing
                        onStart={iniciar}
                        onExit={sair}
                    />
                );
        }
    })();

    if (etapa === 1) {
        return (
            <>
                <BrandHeader
                    sessao={sessao}
                    onExit={sair}
                />

                {conteudo}
            </>
        );
    }

    return (
        <>
            <BrandHeader
                sessao={sessao}
                onExit={sair}
            />

            {conteudo}
        </>
    );
}
