const CHAVE_SESSAO = "sicsi_millennium_bim_session";

const ESTADO_INICIAL = {
    simulacao: "Operação Cartão Seguro",
    iniciadaEm: null,
    ultimaActualizacao: null,
    concluidaEm: null,

    etapaActual: 1,

    decisoes: [],
    historico: [],

    sinaisIdentificados: [],
    sinaisIgnorados: [],

    tecnicasIdentificadas: [],

    comportamentosSeguros: [],
    comportamentosRisco: [],

    informacoesPartilhadas: [],

    risco: 20,

    valorEmRisco: 38500,
    valorProtegido: 0,

    transaccoesSimuladas: [],

    pontuacao: 0,

    resultado: null,

    pontoCritico: null,

    recuperouControlo: false,

    concluida: false,
};

function clonarEstadoInicial() {
    return JSON.parse(JSON.stringify(ESTADO_INICIAL));
}

export function criarSessao() {
    const agora = new Date().toISOString();

    const sessao = {
        ...clonarEstadoInicial(),
        iniciadaEm: agora,
        ultimaActualizacao: agora,
    };

    guardarSessao(sessao);

    return sessao;
}

export function obterSessao() {
    try {
        const dados = sessionStorage.getItem(CHAVE_SESSAO);

        if (!dados) {
            return criarSessao();
        }

        return JSON.parse(dados);
    } catch {
        return criarSessao();
    }
}

export function guardarSessao(sessao) {
    const actualizada = {
        ...sessao,
        ultimaActualizacao: new Date().toISOString(),
    };

    sessionStorage.setItem(
        CHAVE_SESSAO,
        JSON.stringify(actualizada)
    );

    return actualizada;
}

export function limparSessao() {
    sessionStorage.removeItem(CHAVE_SESSAO);
}

export function registarAccao(sessao, accao) {
    const agora = new Date();

    const evento = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: agora.toISOString(),
        hora: agora.toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }),
        etapa: sessao.etapaActual,
        ...accao,
    };

    return guardarSessao({
        ...sessao,
        historico: [
            ...(sessao.historico || []),
            evento,
        ],
    });
}

export function registarDecisao(sessao, decisao) {
    return guardarSessao({
        ...sessao,

        decisoes: [
            ...(sessao.decisoes || []),
            {
                ...decisao,
                timestamp: new Date().toISOString(),
                etapa: sessao.etapaActual,
            },
        ],

        historico: [
            ...(sessao.historico || []),
            {
                id: `${Date.now()}-decisao`,
                timestamp: new Date().toISOString(),
                hora: new Date().toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
                etapa: sessao.etapaActual,
                tipo: "decisao",
                ...decisao,
            },
        ],
    });
}

export function actualizarEtapa(sessao, etapa) {
    return guardarSessao({
        ...sessao,
        etapaActual: etapa,
    });
}

export function alterarRisco(sessao, valor, motivo = "") {
    const novoRisco = Math.max(
        0,
        Math.min(100, sessao.risco + valor)
    );

    const historico = [
        ...(sessao.historico || []),
        {
            id: `${Date.now()}-risco`,
            timestamp: new Date().toISOString(),
            hora: new Date().toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
            etapa: sessao.etapaActual,
            tipo: "risco",
            variacao: valor,
            riscoAnterior: sessao.risco,
            riscoNovo: novoRisco,
            motivo,
        },
    ];

    return guardarSessao({
        ...sessao,
        risco: novoRisco,
        historico,
    });
}

export function adicionarSinal(sessao, sinal, identificado = true) {
    if (identificado) {
        if (sessao.sinaisIdentificados.includes(sinal)) {
            return sessao;
        }

        return guardarSessao({
            ...sessao,
            sinaisIdentificados: [
                ...sessao.sinaisIdentificados,
                sinal,
            ],
        });
    }

    if (sessao.sinaisIgnorados.includes(sinal)) {
        return sessao;
    }

    return guardarSessao({
        ...sessao,
        sinaisIgnorados: [
            ...sessao.sinaisIgnorados,
            sinal,
        ],
    });
}

export function adicionarTecnica(sessao, tecnica) {
    if (sessao.tecnicasIdentificadas.includes(tecnica)) {
        return sessao;
    }

    return guardarSessao({
        ...sessao,
        tecnicasIdentificadas: [
            ...sessao.tecnicasIdentificadas,
            tecnica,
        ],
    });
}

export function adicionarComportamentoSeguro(sessao, comportamento) {
    return guardarSessao({
        ...sessao,
        comportamentosSeguros: [
            ...(sessao.comportamentosSeguros || []),
            comportamento,
        ],
    });
}

export function adicionarComportamentoRisco(sessao, comportamento) {
    return guardarSessao({
        ...sessao,
        comportamentosRisco: [
            ...(sessao.comportamentosRisco || []),
            comportamento,
        ],
    });
}

export function adicionarInformacaoPartilhada(sessao, informacao) {
    return guardarSessao({
        ...sessao,
        informacoesPartilhadas: [
            ...(sessao.informacoesPartilhadas || []),
            informacao,
        ],
    });
}

export function adicionarTransaccao(sessao, transaccao) {
    return guardarSessao({
        ...sessao,
        transaccoesSimuladas: [
            ...(sessao.transaccoesSimuladas || []),
            transaccao,
        ],
    });
}

export function definirPontoCritico(sessao, ponto) {
    return guardarSessao({
        ...sessao,
        pontoCritico: ponto,
    });
}

export function marcarRecuperacao(sessao) {
    return guardarSessao({
        ...sessao,
        recuperouControlo: true,
    });
}

export function calcularResultado(sessao) {
    const decisoes = sessao.decisoes || [];
    const seguras = sessao.comportamentosSeguros || [];
    const riscos = sessao.comportamentosRisco || [];
    const transaccoes = sessao.transaccoesSimuladas || [];

    const pontuacaoBase = 50;

    const pontuacao =
        pontuacaoBase +
        seguras.length * 9 -
        riscos.length * 12 -
        transaccoes.length * 8 +
        (sessao.recuperouControlo ? 15 : 0);

    const pontuacaoFinal = Math.max(
        0,
        Math.min(100, pontuacao)
    );

    const perda = transaccoes.reduce(
        (total, transaccao) => total + (transaccao.valor || 0),
        0
    );

    const protegido = Math.max(
        0,
        sessao.valorEmRisco - perda
    );

    let resultado = "ATENÇÃO";

    if (perda === 0 && pontuacaoFinal >= 80) {
        resultado = "PROTEÇÃO TOTAL";
    } else if (perda === 0) {
        resultado = "FRAUDE INTERROMPIDA";
    } else if (perda < sessao.valorEmRisco) {
        resultado = "COMPROMETIMENTO PARCIAL";
    } else {
        resultado = "CARTÃO COMPROMETIDO";
    }

    return guardarSessao({
        ...sessao,

        pontuacao: pontuacaoFinal,

        valorProtegido: protegido,

        resultado,

        concluida: true,

        concluidaEm: new Date().toISOString(),
    });
}

export function obterResumo(sessao) {
    const transaccoes = sessao.transaccoesSimuladas || [];

    const perda = transaccoes.reduce(
        (total, item) => total + (item.valor || 0),
        0
    );

    return {
        pontuacao: sessao.pontuacao || 0,

        resultado: sessao.resultado || "NÃO CONCLUÍDO",

        risco: sessao.risco || 0,

        valorEmRisco: sessao.valorEmRisco || 0,

        perda,

        valorProtegido: Math.max(
            0,
            (sessao.valorEmRisco || 0) - perda
        ),

        decisoes: (sessao.decisoes || []).length,

        comportamentosSeguros:
            (sessao.comportamentosSeguros || []).length,

        comportamentosRisco:
            (sessao.comportamentosRisco || []).length,

        sinaisIdentificados:
            (sessao.sinaisIdentificados || []).length,

        tecnicasIdentificadas:
            (sessao.tecnicasIdentificadas || []).length,

        transaccoes:
            transaccoes.length,

        historico:
            sessao.historico || [],
    };
}

export { CHAVE_SESSAO };
