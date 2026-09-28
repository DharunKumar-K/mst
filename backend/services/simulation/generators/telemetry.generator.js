/**
 * Telemetry Generator — simulates machine/plant telemetry data.
 *
 * Generates:
 * - temperature (°C)
 * - energy consumption (kWh)
 * - runtime (minutes)
 * - machine load (%)
 * - operational status
 */

const { seededRandom, hashCode } = require('./batch.generator');

const OPERATIONAL_STATUSES = ['running', 'idle', 'maintenance', 'overloaded'];

/**
 * @param {object} options
 * @param {string} [options.batchId]
 * @param {number} [options.seed]
 * @param {number} [options.inputWeight]   used to scale energy/runtime
 * @param {number} [options.machineLoad]   override load %
 * @returns {object} telemetry event data
 */
function generateTelemetry(options = {}) {
  const seed = options.seed ?? hashCode(options.batchId || 'default');
  const rng = seededRandom(seed + 300);

  const inputWeight = options.inputWeight || 1000;

  // Temperature: 150-280°C typical for polymer recycling
  const temperature = Math.round((150 + rng() * 130) * 10) / 10;

  // Energy: ~0.5-1.2 kWh per kg
  const energyPerKg = 0.5 + rng() * 0.7;
  const energyConsumption = Math.round(inputWeight * energyPerKg * 10) / 10;

  // Runtime: ~1 min per 10kg
  const runtime = Math.max(10, Math.round(inputWeight / 10 * (0.8 + rng() * 0.4)));

  // Machine load
  const machineLoad = options.machineLoad || Math.round((40 + rng() * 55) * 10) / 10;

  // Operational status based on load
  let status;
  if (machineLoad > 90) status = 'overloaded';
  else if (machineLoad > 30) status = 'running';
  else if (machineLoad > 10) status = 'idle';
  else status = 'maintenance';

  return {
    temperature,
    temperatureUnit: '°C',
    energyConsumption,
    energyUnit: 'kWh',
    runtime,
    runtimeUnit: 'minutes',
    machineLoad,
    status,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { generateTelemetry };
