/**
 * SICSI III
 * Telemetria genérica das simulações.
 *
 * Regista acontecimentos significativos independentemente
 * de a decisão do utilizador ser segura ou perigosa.
 *
 * Nunca guardar:
 * - palavras-passe;
 * - códigos MFA;
 * - tokens;
 * - dados secretos introduzidos pelo utilizador.
 */

import {
  getSimulationSession,
  persistSimulationSession,
} from "./simulationSession";

const EVENTS_STORAGE_KEY = "sicsi_simulation_events";

function nowIso() {
  return new Date().toISOString();
}

function getEvents() {
  const raw = localStorage.getItem(EVENTS_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    return [];
  }
}

function persistEvents(events) {
  localStorage.setItem(
    EVENTS_STORAGE_KEY,
    JSON.stringify(events)
  );
}

export function recordSimulationEvent({
  action,
  nextState = null,
  interactionType = "interaction",
  metadata = {},
}) {
  const session = getSimulationSession();

  if (!session) {
    return null;
  }

  const timestamp = Date.now();
  const previousTimestamp = Number(session.last_event_at || timestamp);

  const event = {
    session_id: session.session_id,
    simulation_id: session.simulation_id,
    simulation_number: session.simulation_number,
    sequence: Number(session.sequence || 0) + 1,
    current_state: session.current_state,
    action,
    next_state: nextState,
    timestamp: nowIso(),
    duration_ms: Math.max(0, timestamp - previousTimestamp),
    interaction_type: interactionType,
    metadata: sanitizeMetadata(metadata),
  };

  const events = getEvents();

  events.push(event);

  persistEvents(events);

  persistSimulationSession({
    ...session,
    sequence: event.sequence,
    last_event_at: timestamp,
    current_state: nextState || session.current_state,
  });

  return event;
}

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }

  const sanitized = { ...metadata };

  const forbiddenKeys = [
    "password",
    "pass",
    "secret",
    "token",
    "mfa_code",
    "otp",
    "access_token",
    "refresh_token",
  ];

  forbiddenKeys.forEach((key) => {
    if (key in sanitized) {
      sanitized[key] = "[REDACTED]";
    }
  });

  return sanitized;
}

export function getSimulationEvents() {
  return getEvents();
}

export function getSessionEvents(sessionId) {
  return getEvents().filter(
    (event) => event.session_id === sessionId
  );
}

export function clearSimulationEvents() {
  localStorage.removeItem(EVENTS_STORAGE_KEY);
}

export function clearSessionEvents(sessionId) {
  if (!sessionId) {
    return;
  }

  const remaining = getEvents().filter(
    (event) => event.session_id !== sessionId
  );

  persistEvents(remaining);
}

export function getEventsStorageKey() {
  return EVENTS_STORAGE_KEY;
}
