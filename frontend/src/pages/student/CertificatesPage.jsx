import { useEffect, useRef, useState } from "react";
import {
  Award,
  Download,
  Eye,
  ShieldCheck,
  Printer,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { certificateService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function CertificatesPage() {
  const { user } = useAuth();

  const [certificates, setCertificates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selected, setSelected] =
    useState(null);

  const certificateRef = useRef(null);
  const certificateViewportRef = useRef(null);
  const [certificateScale, setCertificateScale] = useState(1);

  const [systemMessage, setSystemMessage] = useState(null);

  useEffect(() => {
    if (!selected) {
      return;
    }

    function atualizarEscalaCertificado() {
      const viewport = certificateViewportRef.current;

      if (!viewport) {
        return;
      }

      const larguraDisponivel = Math.max(
        240,
        viewport.clientWidth - 8
      );

      const escala = Math.min(
        1,
        larguraDisponivel / 1200
      );

      setCertificateScale(escala);
    }

    atualizarEscalaCertificado();

    const observer = new ResizeObserver(
      atualizarEscalaCertificado
    );

    if (certificateViewportRef.current) {
      observer.observe(certificateViewportRef.current);
    }

    window.addEventListener(
      "resize",
      atualizarEscalaCertificado
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "resize",
        atualizarEscalaCertificado
      );
    };
  }, [selected]);

  function showSystemMessage(message, type = "success") {
    setSystemMessage({ message, type });
    window.setTimeout(() => setSystemMessage(null), 4500);
  }

  useEffect(() => {
    certificateService
      .getUserCertificates(user.id)
      .then(setCertificates)
      .finally(() =>
        setLoading(false)
      );
  }, [user.id]);

  async function obterElementoCertificado(
    certificate
  ) {
    /*
     * Quando o certificado já está aberto,
     * utilizamos directamente o elemento visível.
     *
     * Isto evita provocar um novo render através
     * de setSelected() antes da captura.
     */
    const elementoActual =
      certificateRef.current ||
      document.querySelector(
        '[data-sicsi-certificate="true"]'
      );

    if (
      elementoActual &&
      elementoActual.getBoundingClientRect().width > 0 &&
      elementoActual.getBoundingClientRect().height > 0
    ) {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await new Promise((resolve) =>
        requestAnimationFrame(resolve)
      );

      return elementoActual;
    }

    /*
     * Este caminho só é usado quando o botão
     * Baixar é clicado directamente no cartão.
     */
    setSelected(certificate);

    for (
      let tentativa = 0;
      tentativa < 60;
      tentativa++
    ) {
      await new Promise((resolve) =>
        setTimeout(resolve, 100)
      );

      const elemento =
        certificateRef.current ||
        document.querySelector(
          '[data-sicsi-certificate="true"]'
        );

      if (
        elemento &&
        elemento.getBoundingClientRect().width > 0 &&
        elemento.getBoundingClientRect().height > 0
      ) {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }

        return elemento;
      }
    }

    throw new Error(
      "Não foi possível localizar o certificado visual."
    );
  }
  function converterOklchParaRgb(
    valor
  ) {
    const texto =
      String(valor || "");

    /*
     * Converte OKLab/OKLCH para sRGB.
     *
     * O html2canvas 1.4.1 não interpreta
     * directamente estas funções CSS modernas.
     */

    const converterCanalSrgb = (
      canal
    ) => {
      const limitado =
        Math.min(
          1,
          Math.max(
            0,
            canal
          )
        );

      const srgb =
        limitado <= 0.0031308
          ? 12.92 * limitado
          : 1.055 *
              Math.pow(
                limitado,
                1 / 2.4
              ) -
            0.055;

      return Math.round(
        255 * srgb
      );
    };

    const converterAlpha = (
      valorAlpha
    ) => {
      if (
        valorAlpha === undefined
      ) {
        return 1;
      }

      const limpo =
        String(valorAlpha)
          .trim()
          .replace(
            "%",
            ""
          );

      let alpha =
        Number(limpo);

      if (
        String(valorAlpha)
          .includes("%")
      ) {
        alpha =
          alpha / 100;
      }

      if (
        !Number.isFinite(alpha)
      ) {
        return 1;
      }

      return Math.min(
        1,
        Math.max(
          0,
          alpha
        )
      );
    };

    const converterOklab = (
      L,
      a,
      b,
      alpha
    ) => {
      const l_ =
        L +
        0.3963377774 * a +
        0.2158037573 * b;

      const m_ =
        L -
        0.1055613458 * a -
        0.0638541728 * b;

      const s_ =
        L -
        0.0894841775 * a -
        1.2914855480 * b;

      const l =
        l_ * l_ * l_;

      const m =
        m_ * m_ * m_;

      const s =
        s_ * s_ * s_;

      let vermelho =
        4.0767416621 * l -
        3.3077115913 * m +
        0.2309699292 * s;

      let verde =
        -1.2684380046 * l +
        2.6097574011 * m -
        0.3413193965 * s;

      let azul =
        -0.0041960863 * l -
        0.7034186147 * m +
        1.7076147010 * s;

      vermelho =
        converterCanalSrgb(
          vermelho
        );

      verde =
        converterCanalSrgb(
          verde
        );

      azul =
        converterCanalSrgb(
          azul
        );

      if (
        alpha >= 0.999
      ) {
        return `rgb(${vermelho}, ${verde}, ${azul})`;
      }

      return `rgba(${vermelho}, ${verde}, ${azul}, ${alpha})`;
    };

    /*
     * ========================================================
     * OKLAB
     * ========================================================
     */

    const regexOklab =
      /oklab\(\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)(?:\s*\/\s*([^\s]+))?\s*\)/gi;

    let resultado =
      texto.replace(
        regexOklab,
        (
          _match,
          lValor,
          aValor,
          bValor,
          alphaValor
        ) => {

          let L =
            Number(
              String(lValor)
                .replace(
                  "%",
                  ""
                )
                .trim()
            );

          if (
            String(lValor)
              .includes("%")
          ) {
            L =
              L / 100;
          }

          let a =
            Number(
              String(aValor)
                .replace(
                  "%",
                  ""
                )
                .trim()
            );

          let b =
            Number(
              String(bValor)
                .replace(
                  "%",
                  ""
                )
                .trim()
            );

          /*
           * Em OKLab, percentagens de a/b
           * correspondem aproximadamente a
           * ±0.4 no espaço numérico.
           */
          if (
            String(aValor)
              .includes("%")
          ) {
            a =
              a * 0.4 / 100;
          }

          if (
            String(bValor)
              .includes("%")
          ) {
            b =
              b * 0.4 / 100;
          }

          const alpha =
            converterAlpha(
              alphaValor
            );

          if (
            !Number.isFinite(L) ||
            !Number.isFinite(a) ||
            !Number.isFinite(b)
          ) {
            return _match;
          }

          return converterOklab(
            L,
            a,
            b,
            alpha
          );
        }
      );

    /*
     * ========================================================
     * OKLCH
     * ========================================================
     */

    const regexOklch =
      /oklch\(\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)(?:\s*\/\s*([^\s]+))?\s*\)/gi;

    resultado =
      resultado.replace(
        regexOklch,
        (
          _match,
          lValor,
          cValor,
          hValor,
          alphaValor
        ) => {

          let L =
            Number(
              String(lValor)
                .replace(
                  "%",
                  ""
                )
                .trim()
            );

          if (
            String(lValor)
              .includes("%")
          ) {
            L =
              L / 100;
          }

          let C =
            Number(
              String(cValor)
                .replace(
                  "%",
                  ""
                )
                .trim()
            );

          if (
            String(cValor)
              .includes("%")
          ) {
            C =
              C / 100;
          }

          let H =
            Number(
              String(hValor)
                .replace(
                  "deg",
                  ""
                )
                .trim()
            );

          if (
            String(hValor)
              .includes("rad")
          ) {
            H =
              Number(
                String(hValor)
                  .replace(
                    "rad",
                    ""
                  )
                  .trim()
              ) *
              (180 / Math.PI);
          }

          if (
            String(hValor)
              .includes("turn")
          ) {
            H =
              Number(
                String(hValor)
                  .replace(
                    "turn",
                    ""
                  )
                  .trim()
              ) *
              360;
          }

          if (
            !Number.isFinite(L) ||
            !Number.isFinite(C) ||
            !Number.isFinite(H)
          ) {
            return _match;
          }

          const hRad =
            (H * Math.PI) / 180;

          const a =
            C *
            Math.cos(hRad);

          const b =
            C *
            Math.sin(hRad);

          const alpha =
            converterAlpha(
              alphaValor
            );

          return converterOklab(
            L,
            a,
            b,
            alpha
          );
        }
      );

    return resultado;
  }
  function normalizarEstilosParaCaptura(
    original,
    copia
  ) {
    const originalNodes =
      [
        original,
        ...original.querySelectorAll("*"),
      ];

    const copiaNodes =
      [
        copia,
        ...copia.querySelectorAll("*"),
      ];

    for (
      let i = 0;
      i < originalNodes.length;
      i++
    ) {
      const originalNode =
        originalNodes[i];

      const copiaNode =
        copiaNodes[i];

      if (
        !originalNode ||
        !copiaNode ||
        !originalNode.ownerDocument
      ) {
        continue;
      }

      const estilos =
        window.getComputedStyle(
          originalNode
        );

      for (
        let j = 0;
        j < estilos.length;
        j++
      ) {
        const propriedade =
          estilos[j];

        const valor =
          estilos.getPropertyValue(
            propriedade
          );

        if (!valor) {
          continue;
        }

        copiaNode.style.setProperty(
          propriedade,
          converterOklchParaRgb(
            valor
          )
        );
      }

      copiaNode.removeAttribute(
        "class"
      );
    }
  }
  async function gerarPdfDoCertificado(certificate) {

  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const largura = 297;
  const altura = 210;
  const centro = largura / 2;

  const branco = [255, 255, 255];
  const azul = [37, 99, 235];
  const azulEscuro = [15, 23, 42];
  const azulMuitoClaro = [239, 246, 255];
  const verde = [5, 150, 105];
  const verdeEscuro = [22, 101, 52];
  const verdeClaro = [236, 253, 245];
  const cinza = [100, 116, 139];
  const cinzaClaro = [226, 232, 240];

  // ==========================================================
  // FUNÇÕES VECTORIAIS
  // ==========================================================

  function texto(texto, x, y, tamanho, cor, peso = "normal") {
    pdf.setFont("helvetica", peso);
    pdf.setFontSize(tamanho);
    pdf.setTextColor(...cor);

    pdf.text(
      String(texto ?? ""),
      x,
      y,
      { align: "center" }
    );
  }

  function escudo(x, y, escala = 1, cor = branco) {

    pdf.setDrawColor(...cor);
    pdf.setLineWidth(0.8 * escala);

    const p = [
      [0, -6],
      [4.5, -3.8],
      [4.5, 1.5],
      [3.2, 4.5],
      [0, 6],
      [-3.2, 4.5],
      [-4.5, 1.5],
      [-4.5, -3.8],
    ];

    for (let i = 0; i < p.length; i++) {

      const a = p[i];
      const b = p[(i + 1) % p.length];

      pdf.line(
        x + a[0] * escala,
        y + a[1] * escala,
        x + b[0] * escala,
        y + b[1] * escala
      );
    }

    pdf.setLineWidth(0.75 * escala);

    pdf.line(
      x - 2.2 * escala,
      y + 0.2 * escala,
      x - 0.5 * escala,
      y + 2 * escala
    );

    pdf.line(
      x - 0.5 * escala,
      y + 2 * escala,
      x + 3 * escala,
      y - 2 * escala
    );
  }

  // ==========================================================
  // FUNDO
  // ==========================================================

  pdf.setFillColor(...branco);
  pdf.rect(0, 0, largura, altura, "F");

  // Moldura principal
  pdf.setDrawColor(219, 234, 254);
  pdf.setLineWidth(0.7);

  pdf.roundedRect(
    10,
    10,
    277,
    190,
    6,
    6,
    "S"
  );

  // Moldura interna discreta
  pdf.setDrawColor(239, 246, 255);
  pdf.setLineWidth(0.35);

  pdf.roundedRect(
    13,
    13,
    271,
    184,
    4,
    4,
    "S"
  );

  // ==========================================================
  // DETALHES DOS CANTOS
  // ==========================================================

  pdf.setDrawColor(...azul);
  pdf.setLineWidth(0.4);

  pdf.line(22, 22, 34, 22);
  pdf.line(22, 22, 22, 34);

  pdf.line(263, 22, 275, 22);
  pdf.line(275, 22, 275, 34);

  pdf.line(22, 188, 34, 188);
  pdf.line(22, 176, 22, 188);

  pdf.line(263, 188, 275, 188);
  pdf.line(275, 176, 275, 188);

  // ==========================================================
  // ÍCONE PRINCIPAL
  // ==========================================================

  pdf.setFillColor(...azul);
  pdf.circle(centro, 38, 12, "F");

  escudo(
    centro,
    38,
    1.15,
    branco
  );

  // ==========================================================
  // TÍTULO
  // ==========================================================

  texto(
    "CERTIFICADO DE CONCLUSÃO",
    centro,
    57,
    7.5,
    azul,
    "bold"
  );

  const curso =
    certificate?.course_title ||
    certificate?.course_name ||
    certificate?.course ||
    "Fundamentos de Segurança Digital";

  texto(
    curso,
    centro,
    72,
    18,
    azulEscuro,
    "bold"
  );

  texto(
    "Certificamos que",
    centro,
    84,
    9,
    cinza
  );

  const nome =
    certificate?.student_name ||
    certificate?.user_name ||
    certificate?.name ||
    "Estudante";

  texto(
    nome,
    centro,
    96,
    17,
    azulEscuro,
    "bold"
  );

  // Linha
  pdf.setDrawColor(...cinzaClaro);
  pdf.setLineWidth(0.3);

  pdf.line(
    95,
    103,
    202,
    103
  );

  // ==========================================================
  // TEXTO DESCRITIVO
  // ==========================================================

  texto(
    "concluiu com sucesso o curso acima indicado no âmbito da plataforma de",
    centro,
    113,
    8.2,
    cinza
  );

  texto(
    "consciencialização em segurança da informação SICSI III.",
    centro,
    120,
    8.2,
    cinza
  );

  // ==========================================================
  // ESTADO
  // ==========================================================

  pdf.setFillColor(...verdeClaro);
  pdf.setDrawColor(209, 250, 229);
  pdf.setLineWidth(0.35);

  pdf.roundedRect(
    72,
    130,
    153,
    30,
    4,
    4,
    "FD"
  );

  texto(
    "ESTADO DA CERTIFICAÇÃO",
    centro,
    139,
    6.3,
    verde,
    "bold"
  );

  // Ícone do estado
  pdf.setFillColor(...verde);
  pdf.circle(
    111,
    148.5,
    4,
    "F"
  );

  escudo(
    111,
    148.5,
    0.58,
    branco
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...verdeEscuro);

  pdf.text(
    "Formação concluída com sucesso",
    119,
    151.5
  );

  texto(
    "Certificação emitida pelo SICSI III",
    centro,
    156.5,
    7,
    cinza
  );

  // ==========================================================
  // CÓDIGO
  // ==========================================================

  const codigo =
    certificate?.certificate_code ||
    certificate?.code ||
    "SICSI_000000";

  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(...cinzaClaro);
  pdf.setLineWidth(0.35);

  pdf.roundedRect(
    72,
    166,
    153,
    22,
    4,
    4,
    "FD"
  );

  texto(
    "CÓDIGO DE CERTIFICAÇÃO",
    centro,
    174,
    6.3,
    cinza,
    "bold"
  );

  texto(
    codigo,
    centro,
    181,
    8,
    azulEscuro,
    "bold"
  );

  // ==========================================================
  // RODAPÉ
  // ==========================================================

  pdf.setFillColor(...azulMuitoClaro);

  pdf.roundedRect(
    111,
    191,
    75,
    6,
    3,
    3,
    "F"
  );

  pdf.setFillColor(...azul);

  pdf.circle(
    118,
    194,
    1.7,
    "F"
  );

  escudo(
    118,
    194,
    0.25,
    branco
  );

  texto(
    "Certificação emitida pelo SICSI III",
    151,
    195.2,
    6,
    azul,
    "bold"
  );

  return pdf;
}
  async function downloadCertificate(certificate) {

    try {

      showSystemMessage(
        "A preparar o seu certificado...",
        "success"
      );

      const pdf =
        await gerarPdfDoCertificado(
          certificate
        );

      const blob =
        pdf.output("blob");

      if (
        !blob ||
        blob.size < 1000
      ) {
        throw new Error(
          "O PDF não foi gerado correctamente."
        );
      }

      const nomeAluno =
        String(
          certificate?.student_name ||
          user?.name ||
          "UTILIZADOR"
        )
          .trim()
          .replace(
            /[<>:"/\\|?*]+/g,
            "-"
          );

      const nomeFicheiro =
        `CERTIFICADO SICSI III - ${nomeAluno}.pdf`;

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;
      link.download =
        nomeFicheiro;

      link.style.display =
        "none";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            url
          );
        },
        30000
      );

      showSystemMessage(
        "Certificado descarregado com sucesso.",
        "success"
      );

    } catch (error) {

      console.error(
        "Erro no download do certificado:",
        error
      );

      showSystemMessage(
        error?.message ||
        "Não foi possível descarregar o certificado.",
        "error"
      );
    }
  }

  async function printCertificate(certificate) {

    try {

      showSystemMessage(
        "A preparar o certificado...",
        "success"
      );

      const pdf =
        await gerarPdfDoCertificado(
          certificate
        );

      const blob =
        pdf.output("blob");

      const url =
        URL.createObjectURL(
          blob
        );

      const janela =
        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

      if (!janela) {

        URL.revokeObjectURL(
          url
        );

        showSystemMessage(
          "O navegador bloqueou a abertura do certificado.",
          "error"
        );

        return;
      }

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            url
          );
        },
        60000
      );

    } catch (error) {

      console.error(
        "Erro ao abrir certificado:",
        error
      );

      showSystemMessage(
        error?.message ||
        "Não foi possível abrir o certificado.",
        "error"
      );
    }
  }
  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =========================================================
            CABEÇALHO
        ========================================================== */}
        <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                <ShieldCheck size={15} />
                SICSI III · Certificação
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Os meus certificados
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Consulte as suas conquistas académicas, visualize os
                certificados emitidos e descarregue os documentos oficiais.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Award size={22} />
              </div>

              <div>
                <p className="text-2xl font-black text-slate-950">
                  {certificates.length}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  {certificates.length === 1
                    ? "Certificado conquistado"
                    : "Certificados conquistados"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CONTEÚDO
        ========================================================== */}
        {loading ? (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Award size={28} />
            </div>

            <p className="mt-5 font-bold text-slate-900">
              A carregar certificados...
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Estamos a consultar as suas certificações.
            </p>
          </section>
        ) : certificates.length === 0 ? (
          <section className="mt-6 overflow-hidden rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 shadow-sm sm:p-14">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                <Award size={38} />
              </div>

              <p className="mt-6 text-xl font-black text-slate-950">
                Ainda não possui certificados
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Conclua um curso e seja aprovado no teste final para receber
                o seu primeiro certificado SICSI III.
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            {certificates.map((certificate) => (
              <article
                key={certificate.id}
                className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div className="relative min-h-[307px] overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 p-6 text-white sm:p-7">
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[24px] border-white/10" />
                  <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                      <Award size={25} />
                    </div>

                    <div className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ring-1 ring-white/15">
                      Certificado oficial
                    </div>
                  </div>

                  <p className="relative mt-7 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                    SICSI III · Conclusão
                  </p>

                  <h2 className="relative mt-2 max-w-xl text-2xl font-black leading-tight sm:text-3xl">
                    {certificate.course_title}
                  </h2>

                  <div className="relative mt-6 flex flex-wrap items-center gap-2 text-xs text-blue-50">
                    <span className="rounded-full bg-white/10 px-3 py-1.5">
                      Certificação digital
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1.5">
                      Verificação SICSI
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Estado da certificação
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                          <ShieldCheck size={22} />
                        </div>

                        <div>
                          <p className="text-lg font-black text-emerald-700">
                            Concluído com sucesso
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-500">
                            Formação certificada pelo SICSI III
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Código de certificação
                      </p>

                      <p className="mt-3 truncate font-mono text-sm font-black text-slate-800">
                        {certificate.certificate_code}
                      </p>

                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <ShieldCheck size={14} />
                        Certificado emitido
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setSelected(certificate)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                      <Eye size={17} />
                      Ver certificado
                    </button>

                    <button
                      type="button"
                      onClick={() => printCertificate(certificate)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Printer size={17} />
                      Abrir PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadCertificate(certificate)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                    >
                      <Download size={17} />
                      Baixar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {/* =========================================================
          MODAL DO CERTIFICADO
      ========================================================== */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div className="my-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-6 py-5 text-white sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                    <Award size={23} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                      SICSI III
                    </p>
                    <p className="font-black">
                      Certificado de conclusão
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4">
              <div
                ref={certificateViewportRef}
                className="flex w-full justify-center overflow-hidden"
              >
                <div
                  style={{
                    width: `${1200 * certificateScale}px`,
                    height: `${848 * certificateScale}px`,
                  }}
                >
                  <div
                    style={{
                      width: "1200px",
                      height: "848px",
                      transform: `scale(${certificateScale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <div
                      ref={certificateRef}
                      data-sicsi-certificate="true"
                      className="relative overflow-hidden rounded-[1.5rem] border-8 border-double border-blue-100 bg-white px-12 py-14 text-center shadow-xl"
                      style={{
                        width: "1200px",
                        height: "848px",
                      }}
                    >
                      <div className="absolute left-5 top-5 h-10 w-10 border-l-2 border-t-2 border-blue-200" />
                      <div className="absolute right-5 top-5 h-10 w-10 border-r-2 border-t-2 border-blue-200" />
                      <div className="absolute bottom-5 left-5 h-10 w-10 border-b-2 border-l-2 border-blue-200" />
                      <div className="absolute bottom-5 right-5 h-10 w-10 border-b-2 border-r-2 border-blue-200" />

                      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-600/20 ring-8 ring-blue-50">
                        <ShieldCheck size={38} strokeWidth={2.2} />
                      </div>

                      <p className="mt-8 text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">
                        Certificado de conclusão
                      </p>

                      <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black leading-tight text-slate-950">
                        {selected.course_title}
                      </h2>

                      <p className="mt-7 text-sm text-slate-500">
                        Certificamos que
                      </p>

                      <p className="mt-2 text-3xl font-black text-slate-950">
                        {selected.student_name}
                      </p>

                      <div className="mx-auto mt-6 h-px max-w-lg bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

                      <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-500">
                        concluiu com aproveitamento o curso acima indicado no âmbito
                        da plataforma de consciencialização em segurança da
                        informação SICSI III.
                      </p>

                      <div className="mx-auto mt-9 grid max-w-2xl grid-cols-1 gap-4">
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            Estado da certificação
                          </p>

                          <div className="mt-2 flex items-center justify-center text-lg font-black text-emerald-700">
                            <span className="inline-flex items-center justify-center gap-2 leading-none">
                              <ShieldCheck size={20} className="shrink-0" />
                              <span className="leading-none">Formação concluída com sucesso</span>
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            Certificação emitida pelo SICSI III
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Código de certificação
                          </p>

                          <p className="mt-2 whitespace-nowrap overflow-visible font-mono text-xs font-black leading-5 text-slate-700">
                            {selected.certificate_code}
                          </p>
                        </div>
                      </div>

                      <div
                        className="absolute left-1/2 bottom-16 flex h-[34px] w-[245px] -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 px-4 text-center text-xs font-bold leading-4 text-emerald-600"
                        aria-label="Certificação emitida pelo SICSI III"
                      >
                        <ShieldCheck size={16} strokeWidth={2.5} />
                        <span className="block w-full overflow-hidden whitespace-nowrap text-center">
                          Certificação emitida pelo SICSI III
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-5 sm:flex-row sm:justify-end sm:p-6">
              <button
                type="button"
                onClick={() => printCertificate(selected)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Printer size={17} />
                Abrir PDF
              </button>

              <button
                type="button"
                onClick={() => downloadCertificate(selected)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Download size={17} />
                Baixar certificado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}













