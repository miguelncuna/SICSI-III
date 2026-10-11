/**
 * SICSI III
 * Motor de sessão das simulações.
 *
 * Responsabilidades:
 * - criar uma sessão única;
 * - identificar a experiência actual;
 * - manter o estado da experiência;
 * - controlar sequência temporal;
 * - preparar a sessão para telemetria e relatório.
 *
 * Não armazena palavras-passe ou outros segredos.
 */

const SESSION_STORAGE_KEY = "sicsi_simulation_session";

function generateId(prefix = "sicsi") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function createSimulationSession({
  area = "phishing",
  simulationId,
  simulationNumber,
  initialState = "initial",
}) {
  const now = Date.now();

  const session = {
    session_id: generateId("session"),
    area,
    simulation_id: simulationId,
    simulation_number: simulationNumber,
    started_at: nowIso(),
    last_event_at: now,
    current_state: initialState,
    sequence: 0,
    completed: false,
    completed_at: null,
  };

  persistSimulationSession(session);

  return session;
}

export function persistSimulationSession(session) {
  if (!session) {
    return;
  }

  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(session)
  );
}

export function getSimulationSession() {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function updateSimulationSession(updates = {}) {
  const current = getSimulationSession();

  if (!current) {
    return null;
  }

  const updated = {
    ...current,
    ...updates,
  };

  persistSimulationSession(updated);

  return updated;
}

export function advanceSimulationState(nextState) {
  if (!nextState) {
    return getSimulationSession();
  }

  return updateSimulationSession({
    current_state: nextState,
  });
}

export function completeSimulationSession() {
  const current = getSimulationSession();

  if (!current) {
    return null;
  }

  if (current.completed) {
    return current;
  }

  return updateSimulationSession({
    completed: true,
    completed_at: nowIso(),
  });
}

/**
 * Compatibilidade com o nome anterior.
 *
 * O nome oficial passa a ser completeSimulationSession().
 */
export function markSimulationCompleted() {
  return completeSimulationSession();
}

export function clearSimulationSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getSessionStorageKey() {
  return SESSION_STORAGE_KEY;
}