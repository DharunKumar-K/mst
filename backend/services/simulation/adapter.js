/**
 * Simulation Adapter — converts SimulationEvents into EvidenceEvent[] objects
 * compatible with the P2 evidence ingestion service.
 *
 * Mapping:
 *   SimulationEvent.weights.inputWeight    → EvidenceEvent(type = weighbridge)
 *   SimulationEvent.processing             → EvidenceEvent(type = processing_log)
 *   SimulationEvent.recovery               → EvidenceEvent(type = output_record)
 *   SimulationEvent.downstream             → EvidenceEvent(type = downstream_invoice)
 *   SimulationEvent.telemetry              → EvidenceEvent(type = telemetry)
 *   SimulationEvent.weights (capacity)     → EvidenceEvent(type = capacity)
 */

const crypto = require('node:crypto');

/**
 * Convert a SimulationEvent to an array of EvidenceEvent objects.
 *
 * @param {object} simEvent  SimulationEvent from scenarios.runScenario()
 * @returns {object[]}       EvidenceEvent[] ready for ingest()
 */
function toEvidenceEvents(simEvent) {
  const { batch, weights, processing, recovery, downstream, telemetry } = simEvent;
  const batchId = batch.batchId;
  const now = new Date().toISOString();
  const events = [];

  // 1. Weighbridge — input weight measurement
  events.push({
    eventId: `sim-${batchId}-weighbridge`,
    batchId,
    type: 'weighbridge',
    timestamp: now,
    source: batch.recycler,
    origin: 'simulation',
    data: {
      weight: weights.inputWeight,
      unit: weights.unit,
    },
  });

  // 2. Processing log — input/output from processing line
  events.push({
    eventId: `sim-${batchId}-processing`,
    batchId,
    type: 'processing_log',
    timestamp: now,
    source: batch.recycler,
    origin: 'simulation',
    data: {
      inputWeight: processing.inputWeight,
      outputWeight: processing.outputWeight,
      unit: weights.unit,
      runtime: processing.runtime,
      status: processing.status,
      machineLoad: processing.machineLoad,
    },
  });

  // 3. Output record — recovered material quantities
  events.push({
    eventId: `sim-${batchId}-output`,
    batchId,
    type: 'output_record',
    timestamp: now,
    source: batch.recycler,
    origin: 'simulation',
    data: {
      totalRecovered: recovery.totalRecovered,
      unit: weights.unit,
      materials: recovery.materials,
      recoveryRate: recovery.recoveryRate,
    },
  });

  // 4. Downstream invoice — buyer transaction
  events.push({
    eventId: `sim-${batchId}-downstream`,
    batchId,
    type: 'downstream_invoice',
    timestamp: now,
    source: downstream.buyer,
    origin: 'simulation',
    data: {
      quantity: downstream.quantity,
      unit: weights.unit,
      buyer: downstream.buyer,
      transactionAmount: downstream.transactionAmount,
      currency: downstream.currency,
    },
  });

  // 5. Telemetry — machine/plant operational data
  events.push({
    eventId: `sim-${batchId}-telemetry`,
    batchId,
    type: 'telemetry',
    timestamp: now,
    source: batch.recycler,
    origin: 'simulation',
    data: {
      temperature: telemetry.temperature,
      temperatureUnit: telemetry.temperatureUnit,
      energyConsumption: telemetry.energyConsumption,
      energyUnit: telemetry.energyUnit,
      runtime: telemetry.runtime,
      machineLoad: telemetry.machineLoad,
      status: telemetry.status,
    },
  });

  // 6. Capacity — plant capacity declaration
  events.push({
    eventId: `sim-${batchId}-capacity`,
    batchId,
    type: 'capacity',
    timestamp: now,
    source: batch.recycler,
    origin: 'simulation',
    data: {
      capacity: 1200, // standard plant capacity
      unit: weights.unit,
    },
  });

  return events;
}

/**
 * Convert a raw scenario definition's evidence array into EvidenceEvent[].
 * Used when the scenario JSON already has pre-defined evidence.
 *
 * @param {object} scenarioDef  loaded scenario definition
 * @returns {object[]}          EvidenceEvent[]
 */
function fromScenarioDefinition(scenarioDef) {
  const batchId = scenarioDef.batch.batchId;
  const now = new Date().toISOString();

  return scenarioDef.evidence.map((ev) => ({
    eventId: ev.eventId,
    batchId,
    type: ev.type,
    timestamp: now,
    source: ev.source,
    origin: 'simulation',
    data: ev.data,
  }));
}

module.exports = { toEvidenceEvents, fromScenarioDefinition };
