const STORAGE_KEY = "sicsI_social_engineering_session";

const DEFAULT_SESSION = {
  startedAt: null,
  completedAt: null,
  name: "",
  currentSimulation: 1,

  simulations: {
    1: {
      completed: false,
      score: 0,
      risk: 0,
      decisions: [],
      sharedInformation: [],
      authorisations: [],
      techniques: [],
      consequences: [],
    },
    2: {
      completed: false,
      score: 0,
      risk: 0,
      decisions: [],
      sharedInformation: [],
      authorisations: [],
      techniques: [],
      consequences: [],
    },
    3: {
      completed: false,
      score: 0,
      risk: 0,
      decisions: [],
      sharedInformation: [],
      authorisations: [],
      techniques: [],
      consequences: [],
    },
    4: {
      completed: false,
      score: 0,
      risk: 0,
      decisions: [],
      sharedInformation: [],
      authorisations: [],
      techniques: [],
      consequences: [],
    },
    5: {
      completed: false,
      score: 0,
      risk: 0,
      decisions: [],
      sharedInformation: [],
      authorisations: [],
      techniques: [],
      consequences: [],
    },
  },
};

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_SESSION));
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return cloneDefault();
    }

    const parsed = JSON.parse(raw);

    return {
      ...cloneDefault(),
      ...parsed,
      simulations: {
        ...cloneDefault().simulations,
        ...(parsed.simulations || {}),
      },
    };
  } catch {
    return cloneDefault();
  }
}

export function saveSession(session) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // A experiência continua funcional mesmo se o armazenamento estiver indisponível.
  }

  return session;
}

export function startSession(name = "") {
  const session = cloneDefault();

  session.startedAt = new Date().toISOString();
  session.name = String(name || "").trim();
  session.currentSimulation = 1;

  saveSession(session);

  return session;
}

export function ensureSession() {
  const existing = getSession();

  if (!existing.startedAt) {
    return startSession("");
  }

  return existing;
}

export function setParticipantName(name) {
  const session = ensureSession();

  session.name = String(name || "").trim();

  return saveSession(session);
}

export function getParticipantLabel() {
  const session = getSession();

  return session.name ? `Sr. ${session.name}` : "Sr.";
}

export function recordDecision(simulationId, data = {}) {
  const session = ensureSession();

  const simulation = session.simulations[simulationId];

  if (!simulation) {
    return session;
  }

  simulation.decisions.push({
    id: `${simulationId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...data,
  });

  if (typeof data.score === "number") {
    simulation.score += data.score;
  }

  if (typeof data.risk === "number") {
    simulation.risk += data.risk;
  }

  if (data.sharedInformation) {
    simulation.sharedInformation.push(data.sharedInformation);
  }

  if (data.authorisation) {
    simulation.authorisations.push(data.authorisation);
  }

  if (data.technique) {
    if (!simulation.techniques.includes(data.technique)) {
      simulation.techniques.push(data.technique);
    }
  }

  if (data.consequence) {
    simulation.consequences.push(data.consequence);
  }

  return saveSession(session);
}

export function completeSimulation(simulationId) {
  const session = ensureSession();

  if (session.simulations[simulationId]) {
    session.simulations[simulationId].completed = true;
    session.currentSimulation = Math.min(simulationId + 1, 5);
  }

  return saveSession(session);
}

export function getSimulation(simulationId) {
  const session = getSession();

  return (
    session.simulations[simulationId] || {
      completed: false,
      score: 0,
      risk: 0,
      decisions: [],
      sharedInformation: [],
      authorisations: [],
      techniques: [],
      consequences: [],
    }
  );
}

export function getTotals() {
  const session = getSession();

  const simulations = Object.values(session.simulations);

  return simulations.reduce(
    (total, simulation) => ({
      score: total.score + simulation.score,
      risk: total.risk + simulation.risk,
      decisions: total.decisions + simulation.decisions.length,
      sharedInformation: [
        ...total.sharedInformation,
        ...simulation.sharedInformation,
      ],
      authorisations: [
        ...total.authorisations,
        ...simulation.authorisations,
      ],
      techniques: [
        ...new Set([...total.techniques, ...simulation.techniques]),
      ],
      consequences: [
        ...total.consequences,
        ...simulation.consequences,
      ],
      completed:
        total.completed + (simulation.completed ? 1 : 0),
    }),
    {
      score: 0,
      risk: 0,
      decisions: 0,
      sharedInformation: [],
      authorisations: [],
      techniques: [],
      consequences: [],
      completed: 0,
    },
  );
}

export function finishSession() {
  const session = getSession();

  session.completedAt = new Date().toISOString();

  return saveSession(session);
  
}

export function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sem acção adicional.
  }
}

export function getStorageKey() {
  return STORAGE_KEY;
}