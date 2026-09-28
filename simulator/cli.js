#!/usr/bin/env node

/**
 * CirqProof Simulator CLI — backup demo runner
 *
 * Usage:
 *   node cli.js --scenario NORMAL --batch CP-001
 *   node cli.js --scenario INCONSISTENT --batch CP-002
 *   node cli.js --scenario TAMPERED --batch CP-003
 *   node cli.js --list-scenarios
 *
 * This CLI runs the simulation scenarios without needing the frontend or API.
 * It can operate in two modes:
 *   1. Against a running MongoDB instance (full mode)
 *   2. Standalone dry-run mode (no DB, just generates and displays events)
 */

const path = require('node:path');
const { runScenario, listScenarios, loadAllScenarios } = require('../backend/services/simulation/scenarios');
const { toEvidenceEvents } = require('../backend/services/simulation/adapter');

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { scenario: null, batch: null, listScenarios: false, dryRun: true, help: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--scenario':
      case '-s':
        parsed.scenario = args[++i];
        break;
      case '--batch':
      case '-b':
        parsed.batch = args[++i];
        break;
      case '--list-scenarios':
      case '-l':
        parsed.listScenarios = true;
        break;
      case '--full':
      case '-f':
        parsed.dryRun = false;
        break;
      case '--help':
      case '-h':
        parsed.help = true;
        break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        parsed.help = true;
    }
  }
  return parsed;
}

function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              CirqProof Simulator CLI                        ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  node cli.js --scenario <NORMAL|INCONSISTENT|TAMPERED> --batch <batchId>
  node cli.js --list-scenarios
  node cli.js --full --scenario NORMAL --batch CP-001

Options:
  --scenario, -s   Scenario to run (NORMAL, INCONSISTENT, TAMPERED)
  --batch, -b      Batch ID to use (e.g. CP-001)
  --list-scenarios List all available scenarios
  --full, -f       Run in full mode (requires MONGODB_URI env var)
  --help, -h       Show this help message

Examples:
  node cli.js --scenario NORMAL --batch CP-001
  node cli.js --scenario INCONSISTENT --batch CP-002
  node cli.js --scenario TAMPERED --batch CP-003
  node cli.js -l
`);
}

function printDivider(title) {
  const line = '═'.repeat(60);
  console.log(`\n╔${line}╗`);
  console.log(`║  ${title.padEnd(58)}║`);
  console.log(`╚${line}╝`);
}

function printSection(title, data) {
  console.log(`\n  ┌─── ${title} ${'─'.repeat(Math.max(0, 50 - title.length))}┐`);
  if (typeof data === 'object' && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        console.log(`  │  ${key}:`);
        for (const [k, v] of Object.entries(value)) {
          console.log(`  │    ${k}: ${v}`);
        }
      } else if (Array.isArray(value)) {
        console.log(`  │  ${key}: [${value.length} items]`);
        value.forEach((item, idx) => {
          if (typeof item === 'object') {
            console.log(`  │    [${idx}] ${JSON.stringify(item)}`);
          } else {
            console.log(`  │    [${idx}] ${item}`);
          }
        });
      } else {
        console.log(`  │  ${key}: ${value}`);
      }
    }
  } else {
    console.log(`  │  ${data}`);
  }
  console.log(`  └${'─'.repeat(56)}┘`);
}

async function runFullMode(scenario, batchId) {
  // Load dotenv for MONGODB_URI
  try {
    require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
  } catch (_) {
    // dotenv not critical
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is required for full mode. Use dry-run mode (default) or set MONGODB_URI.');
    process.exit(1);
  }

  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const { generate } = require('../backend/services/simulation/simulation.service');
  const result = await generate(scenario, batchId);

  printDivider(`FULL SIMULATION: ${scenario}`);
  printSection('Run', { runId: result.run.runId, status: result.run.status });
  printSection('Batch', { batchId: result.batch.batchId, status: result.batch.status });
  printSection('Events', result.events.reduce((acc, ev) => { acc[ev.eventId] = ev.status; return acc; }, {}));

  // Run reconciliation
  try {
    const { reconcile } = require('../backend/services/ai/aiClient');
    const Evidence = require('../backend/models/Evidence');
    const evidence = await Evidence.find({ batchId: result.batch.batchId });
    const report = await reconcile(result.batch, evidence);
    printSection('Reconciliation', {
      status: report.status,
      flags: report.flags,
      explanation: report.explanation,
    });
  } catch (error) {
    printSection('Reconciliation', { error: error.message });
  }

  await mongoose.disconnect();
}

async function runDryMode(scenario, batchId) {
  printDivider(`DRY RUN: ${scenario}`);

  const simEvent = runScenario(scenario, batchId);

  printSection('Batch', {
    batchId: simEvent.batch.batchId,
    producer: simEvent.batch.producer,
    recycler: simEvent.batch.recycler,
    material: simEvent.batch.material,
    claim: `${simEvent.batch.claim.quantity} ${simEvent.batch.claim.unit}`,
  });

  printSection('Weights', {
    input: `${simEvent.weights.inputWeight} ${simEvent.weights.unit}`,
    processed: `${simEvent.weights.processedWeight} ${simEvent.weights.unit}`,
    recovered: `${simEvent.weights.recoveredWeight} ${simEvent.weights.unit}`,
    residue: `${simEvent.weights.residueWeight} ${simEvent.weights.unit}`,
  });

  printSection('Processing', {
    inputWeight: simEvent.processing.inputWeight,
    outputWeight: simEvent.processing.outputWeight,
    runtime: `${simEvent.processing.runtime} min`,
    machineLoad: `${simEvent.processing.machineLoad}%`,
    status: simEvent.processing.status,
    yieldRatio: `${simEvent.processing.yieldRatio}%`,
  });

  printSection('Recovery', {
    totalRecovered: `${simEvent.recovery.totalRecovered} ${simEvent.recovery.unit}`,
    recoveryRate: `${simEvent.recovery.recoveryRate}%`,
    materials: simEvent.recovery.materials,
  });

  printSection('Telemetry', {
    temperature: `${simEvent.telemetry.temperature} ${simEvent.telemetry.temperatureUnit}`,
    energy: `${simEvent.telemetry.energyConsumption} ${simEvent.telemetry.energyUnit}`,
    runtime: `${simEvent.telemetry.runtime} ${simEvent.telemetry.runtimeUnit}`,
    machineLoad: `${simEvent.telemetry.machineLoad}%`,
    status: simEvent.telemetry.status,
  });

  printSection('Downstream', {
    buyer: simEvent.downstream.buyer,
    quantity: `${simEvent.downstream.quantity} ${simEvent.downstream.unit}`,
    amount: `$${simEvent.downstream.transactionAmount} ${simEvent.downstream.currency}`,
    pricePerKg: `$${simEvent.downstream.pricePerKg}/kg`,
  });

  // Generate evidence events (for display)
  const evidenceEvents = toEvidenceEvents(simEvent);
  printSection('Generated Evidence Events', evidenceEvents.reduce((acc, ev) => {
    acc[ev.eventId] = `${ev.type} (${ev.source})`;
    return acc;
  }, {}));

  // Show expected outcome
  const def = simEvent.definition;
  printSection('Expected Outcome', {
    expectedStatus: def.expectedStatus,
    expectedFlags: def.expectedFlag || def.expectedFlags || 'none',
  });

  console.log('\n✅ Dry run complete. Use --full flag with MONGODB_URI to run against a database.\n');
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.listScenarios) {
    printDivider('Available Scenarios');
    const scenarios = loadAllScenarios();
    for (const s of scenarios) {
      printSection(s.name, {
        expectedStatus: s.definition.expectedStatus,
        inputWeight: s.definition.inputWeight,
        claimedRecoveredWeight: s.definition.claimedRecoveredWeight,
        downstreamWeight: s.definition.downstreamWeight,
      });
    }
    process.exit(0);
  }

  if (!args.scenario) {
    console.error('❌ --scenario is required. Use --help for usage.');
    process.exit(1);
  }

  const validScenarios = listScenarios();
  const scenario = args.scenario.toUpperCase();
  if (!validScenarios.includes(scenario)) {
    console.error(`❌ Invalid scenario: ${args.scenario}. Must be one of: ${validScenarios.join(', ')}`);
    process.exit(1);
  }

  const batchId = args.batch || `CP-${Date.now()}`;

  try {
    if (args.dryRun) {
      await runDryMode(scenario, batchId);
    } else {
      await runFullMode(scenario, batchId);
    }
  } catch (error) {
    console.error(`\n❌ Simulation failed: ${error.message}`);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
