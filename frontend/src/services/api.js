const API_URL = "http://localhost:8000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    let message = "Ocorreu um erro no servidor.";

    if (typeof data.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data.detail)) {
      message = data.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item?.msg) {
            return item.msg;
          }

          return JSON.stringify(item);
        })
        .join(" | ");
    } else if (
      data.detail &&
      typeof data.detail === "object"
    ) {
      message =
        data.detail.msg ||
        data.detail.message ||
        JSON.stringify(data.detail);
    } else if (data.message) {
      message =
        typeof data.message === "string"
          ? data.message
          : JSON.stringify(data.message);
    }

    throw new Error(message);
  }

  return data;
}

export const authService = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAssessment: () =>
    request("/assessment"),

  submitAssessment: (payload) =>
    request("/assessment/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const courseService = {
  getCourses: () =>
    request("/courses"),

  getAllCourses: () =>
    request("/courses/all"),

  getCourse: (id) =>
    request(`/courses/${id}`),

  enroll: (courseId, userId) =>
    request(
      `/courses/${courseId}/enroll`,
      {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          lesson_id: lessonId,
        }),
      }
    ),

  completeLesson: (
    courseId,
    userId,
    lessonId
  ) =>
    request(
      `/courses/${courseId}/lessons/${lessonId}/complete`,
      {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          lesson_id: lessonId,
        }),
      }
    ),
  submitTest: (courseId, payload) =>
    request(
      `/courses/${courseId}/test`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
};

export const certificateService = {
  getUserCertificates: (userId) =>
    request(
      `/users/${userId}/certificates`
    ),

  get: (certificateId) =>
    request(
      `/certificates/${certificateId}`
    ),

  download: async (certificateId) => {
    const response = await fetch(
      `${API_URL}/certificates/${certificateId}/pdf`
    );

    if (!response.ok) {
      throw new Error(
        "Não foi possível gerar o certificado."
      );
    }

    return response.blob();
  },

  getAll: () =>
    request("/admin/certificates"),
};

export const adminService = {
  getStats: () =>
    request("/admin/stats"),

  getUsers: () =>
    request("/admin/users"),

  updateRole: (userId, role) =>
    request(
      `/admin/users/${userId}/role`,
      {
        method: "PUT",
        body: JSON.stringify({
          role,
        }),
      }
    ),

  createCourse: (payload) =>
    request("/admin/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCourse: (courseId, payload) =>
    request(
      `/admin/courses/${courseId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    ),

  deleteCourse: (courseId) =>
    request(
      `/admin/courses/${courseId}`,
      {
        method: "DELETE",
      }
    ),

  togglePublish: (courseId) =>
    request(
      `/admin/courses/${courseId}/publish`,
      {
        method: "POST",
      }
    ),

  addLesson: (courseId, payload) =>
    request(
      `/admin/courses/${courseId}/lessons`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  deleteLesson: (
    courseId,
    lessonId
  ) =>
    request(
      `/admin/courses/${courseId}/lessons/${lessonId}`,
      {
        method: "DELETE",
      }
    ),

  addQuestion: (
    courseId,
    payload
  ) =>
    request(
      `/admin/courses/${courseId}/questions`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  deleteQuestion: (
    courseId,
    questionId
  ) =>
    request(
      `/admin/courses/${courseId}/questions/${questionId}`,
      {
        method: "DELETE",
      }
    ),
};

export const simulationService = {
  getAll: () =>
    request("/simulations"),

  get: (id) =>
    request(`/simulations/${id}`),

  getPhishingResult: (userId) =>
    request(
      `/simulations/phishing/result/${userId}`
    ),

  clearPhishingResult: (userId) =>
    request(
      `/simulations/phishing/result/${userId}`,
      {
        method: "DELETE",
      }
    ),

  downloadPhishingResultPdf: async (userId) => {
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      "http://localhost:8000/api";

    const response = await fetch(
      `${baseUrl}/simulations/phishing/result/${userId}/pdf`
    );

    if (!response.ok) {
      let message =
        "Não foi possível gerar o relatório final.";

      try {
        const data = await response.json();

        if (data?.detail) {
          message = data.detail;
        }
      } catch {
        // resposta não JSON
      }

      throw new Error(message);
    }

    const blob = await response.blob();

    const disposition =
      response.headers.get(
        "content-disposition"
      ) || "";

    const match =
      disposition.match(
        /filename="?([^"]+)"?/i
      );

    return {
      blob,
      filename:
        match?.[1] ||
        "relatorio-phishing-sicsi-iii.pdf",
    };
  },
  getResult: (id, userId) =>
    request(
      `/simulations/${id}/result/${userId}`
    ),

  evaluate: (
    id,
    action,
    userId,
    stepId,
    interactionType,
    details
  ) => {
    let metadata = details || {};

    try {
      if (typeof document !== "undefined") {
        const emailInput =
          document.querySelector(
            'input[type="email"]'
          );

        const passwordInput =
          document.querySelector(
            'input[type="password"]'
          );

        const email =
          emailInput?.value?.trim() || "";

        const passwordEntered =
          Boolean(
            passwordInput?.value
          );

        metadata = {
          ...metadata,
          ...(email
            ? { email: email }
            : {}),
          password_entered:
            Boolean(
              metadata.password_entered
            ) ||
            passwordEntered,
        };
      }
    } catch {
      // A recolha visual nunca deve interromper a simulação.
    }

    return request(
      `/simulations/${id}/evaluate`,
      {
        method: "POST",
        body: JSON.stringify({
          action,
          user_id: userId,
          step_id: stepId,
          interaction_type:
            interactionType || action,
          metadata,
        }),
      }
    );
  },

  downloadResultPdf: async (
    id,
    userId
  ) => {
    const pdfUrl =
      `${API_URL}/simulations/${encodeURIComponent(
        id
      )}/result/${encodeURIComponent(
        userId
      )}/pdf`;

    let response;

    try {
      response = await fetch(
        pdfUrl,
        {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          headers: {
            Accept:
              "application/pdf",
          },
        }
      );
    } catch {
      throw new Error(
        "O SICSI III não conseguiu comunicar com o servidor para gerar o relatório."
      );
    }

    if (!response.ok) {
      let serverMessage =
        "O servidor não conseguiu gerar o relatório em PDF.";

      try {
        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          const errorData =
            await response.json();

          if (errorData?.detail) {
            serverMessage =
              String(
                errorData.detail
              );
          }
        }
      } catch {
        // Mantém mensagem padrão.
      }

      throw new Error(
        serverMessage
      );
    }

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType.includes(
        "application/pdf"
      )
    ) {
      throw new Error(
        "O servidor respondeu, mas não devolveu um ficheiro PDF válido."
      );
    }

    const blob =
      await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error(
        "O servidor devolveu um relatório PDF vazio."
      );
    }

    return blob;
  },

  clearResult: (
    id,
    userId
  ) =>
    request(
      `/simulations/${id}/result/${userId}`,
      {
        method: "DELETE",
      }
    ),
};



