import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const NotificationContext = createContext(null);

const METODOS_MUTACAO = new Set([
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

const ROTAS_API = [
  "/api/",
  "localhost:3000",
  "localhost:5000",
  "localhost:8000",
];

function eApi(url) {
  const valor = String(url || "").toLowerCase();

  return ROTAS_API.some((rota) =>
    valor.includes(rota.toLowerCase())
  );
}

function nomeMetodo(method) {
  return String(method || "GET").toUpperCase();
}

function mensagemSucessoMetodo(method) {
  const metodo = nomeMetodo(method);

  if (metodo === "POST") {
    return {
      title: "Operação concluída",
      message: "A operação foi realizada com sucesso.",
    };
  }

  if (metodo === "PUT" || metodo === "PATCH") {
    return {
      title: "Alteração concluída",
      message: "Os dados foram actualizados com sucesso.",
    };
  }

  if (metodo === "DELETE") {
    return {
      title: "Operação concluída",
      message: "O registo foi removido com sucesso.",
    };
  }

  return {
    title: "Operação concluída",
    message: "A operação foi realizada com sucesso.",
  };
}

function mensagemErroMetodo(method) {
  const metodo = nomeMetodo(method);

  if (metodo === "POST") {
    return {
      title: "Operação não concluída",
      message: "Não foi possível concluir esta operação.",
    };
  }

  if (metodo === "PUT" || metodo === "PATCH") {
    return {
      title: "Alteração não concluída",
      message: "Não foi possível actualizar os dados.",
    };
  }

  if (metodo === "DELETE") {
    return {
      title: "Operação não concluída",
      message: "Não foi possível remover o registo.",
    };
  }

  return {
    title: "Erro",
    message: "Ocorreu um erro durante a operação.",
  };
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const originalFetchRef = useRef(null);
  const notificacaoActivaRef = useRef(false);

  const showNotification = useCallback(
    ({
      type = "info",
      title,
      message,
      duration = 5000,
    }) => {
      notificacaoActivaRef.current = true;

      setNotification({
        id: Date.now() + Math.random(),
        type,
        title,
        message,
        duration,
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    notificacaoActivaRef.current = false;
    setNotification(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    /*
     * Intercepta apenas chamadas da API.
     * Não interfere com ficheiros estáticos, imagens,
     * CSS, JavaScript ou navegação normal.
     */
    if (!originalFetchRef.current && window.fetch) {
      originalFetchRef.current = window.fetch.bind(window);

      const fetchOriginal = originalFetchRef.current;

      window.fetch = async (...args) => {
        const request = args[0];
        const options = args[1] || {};

        const url =
          typeof request === "string"
            ? request
            : request?.url || "";

        const method = nomeMetodo(
          options.method ||
            (typeof request !== "string"
              ? request?.method
              : "GET")
        );

        const deveNotificar =
          eApi(url) &&
          METODOS_MUTACAO.has(method);

        if (!deveNotificar) {
          return fetchOriginal(...args);
        }

        try {
          const response = await fetchOriginal(...args);

const requestUrl =
  typeof args[0] === "string"
    ? args[0]
    : args[0]?.url || "";

const isAuthRequest = /\/auth\/(login|register)/i.test(requestUrl);

          if (response.ok) {
              if (!isAuthRequest) {
                const sucesso = mensagemSucessoMetodo(method);

                showNotification({
                  type: "success",
                  title: sucesso.title,
                  message: sucesso.message,
                  duration: 4000,
                });
              }
            } else {
            let mensagem = mensagemErroMetodo(method);

            try {
              const copia = response.clone();
              const dados = await copia.json();

              if (dados?.message) {
                mensagem = {
                  ...mensagem,
                  message: dados.message,
                };
              }

              if (dados?.error) {
                mensagem = {
                  ...mensagem,
                  message: dados.error,
                };
              }
            } catch {
              // Mantém a mensagem padrão.
            }

            showNotification({
              type: "error",
              title: mensagem.title,
              message: mensagem.message,
              duration: 6000,
            });
          }

          return response;
        } catch (error) {
          showNotification({
            type: "error",
            title: "Erro de ligação",
            message:
              "Não foi possível comunicar com o servidor. Verifique a ligação e tente novamente.",
            duration: 6000,
          });

          throw error;
        }
      };
    }

    return () => {
      /*
       * O fetch original permanece activo durante a aplicação.
       * Não restauramos aqui para evitar que React StrictMode
       * instale e remova o interceptor duas vezes.
       */
    };
  }, [showNotification]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const tratarErroGlobal = (event) => {
      const erro =
        event?.reason ||
        event?.error ||
        event?.message ||
        "Ocorreu um erro inesperado.";

      const mensagem =
        typeof erro === "string"
          ? erro
          : erro?.message ||
            "Ocorreu um erro inesperado no sistema.";

      showNotification({
        type: "error",
        title: "Erro inesperado",
        message: mensagem,
        duration: 6000,
      });
    };

    window.addEventListener(
      "unhandledrejection",
      tratarErroGlobal
    );

    window.addEventListener(
      "error",
      tratarErroGlobal
    );

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        tratarErroGlobal
      );

      window.removeEventListener(
        "error",
        tratarErroGlobal
      );
    };
  }, [showNotification]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    /*
     * Feedback de submissões de formulários.
     * A confirmação de sucesso continua a depender da resposta
     * da operação/API; aqui apenas informamos que a acção foi
     * iniciada quando o formulário é submetido.
     */
    const tratarSubmit = (event) => {
      const formulario = event.target;

      if (!(formulario instanceof HTMLFormElement)) {
        return;
      }

      if (formulario.dataset.notificationDisabled === "true") {
        return;
      }

      showNotification({
        type: "info",
        title: "A processar",
        message:
          "A sua solicitação está a ser processada. Aguarde.",
        duration: 2500,
      });
    };

    document.addEventListener(
      "submit",
      tratarSubmit,
      true
    );

    return () => {
      document.removeEventListener(
        "submit",
        tratarSubmit,
        true
      );
    };
  }, [showNotification]);

  const value = useMemo(
    () => ({
      notification,
      showNotification,
      hideNotification,
    }),
    [
      notification,
      showNotification,
      hideNotification,
    ]
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

