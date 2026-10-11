/**
 * SICSI III
 * Motor genérico de transições das simulações.
 *
 * A mesma estrutura poderá ser utilizada pelas 25 experiências:
 *
 * 5 áreas × 5 experiências.
 */

import {
  completeSimulationSession,
  createSimulationSession,
  getSimulationSession,
} from "./simulationSession";

import { recordSimulationEvent } from "./simulationTelemetry";

export function startSimulation({
  area,
  simulationId,
  simulationNumber,
  initialState = "initial",
  forceNew = false,
}) {
  const existing = getSimulationSession();

  if (
    !forceNew &&
    existing &&
    existing.simulation_id === simulationId &&
    !existing.completed
  ) {
    return existing;
  }

  return createSimulationSession({
    area,
    simulationId,
    simulationNumber,
    initialState,
  });
}

export function transitionSimulation({
  action,
  nextState = null,
  interactionType = "interaction",
  metadata = {},
}) {
  const event = recordSimulationEvent({
    action,
    nextState,
    interactionType,
    metadata,
  });

  if (!event) {
    return {
      event: null,
      session: null,
    };
  }

  return {
    event,
    session: getSimulationSession(),
  };
}

export function registerAction({
  action,
  nextState = null,
  interactionType = "interaction",
  metadata = {},
}) {
  return transitionSimulation({
    action,
    nextState,
    interactionType,
    metadata,
  });
}

export function completeSimulation() {
  return completeSimulationSession();
}

export function getCurrentSimulation() {
  return getSimulationSession();
}
