/**
 * Simulation Routes
 *
 * POST /api/simulation/generate     — run a scenario and ingest all events
 * POST /api/simulation/events       — ingest raw simulation events
 * POST /api/simulation/tamper/:batchId — tamper with evidence for demo
 *
 * GET  /api/simulation/scenarios    — list available scenarios
 * GET  /api/simulation/events/:batchId — get events for a batch
 */

const express = require('express');
const router = express.Router();
const simulationService = require('../services/simulation/simulation.service');
const { ingest } = require('../services/evidence/ingest');

/**
 * POST /api/simulation/generate
 * Body: { scenario: "NORMAL" | "INCONSISTENT" | "TAMPERED", batchId?: string }
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { scenario, batchId } = req.body;
    if (!scenario) {
      return res.status(400).json({ ok: false, error: 'scenario is required' });
    }
    const result = await simulationService.generate(scenario, batchId);
    res.status(201).json({
      ok: true,
      data: {
        runId: result.run.runId,
        batchId: result.batch.batchId,
        scenario: result.run.scenario,
        status: result.run.status,
        events: result.events,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/simulation/events
 * Body: EvidenceEvent object (with origin: "simulation")
 */
router.post('/events', async (req, res, next) => {
  try {
    const event = { ...req.body, origin: 'simulation' };
    const result = await ingest(event);
    res.status(201).json({
      ok: true,
      data: {
        evidence: {
          evidenceId: result.evidence.evidenceId,
          batchId: result.evidence.batchId,
          type: result.evidence.type,
          fileHash: result.evidence.fileHash,
        },
        evidenceRoot: result.evidenceRoot,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/simulation/tamper/:batchId
 * Body: optional { data: { ... } } replacement data
 */
router.post('/tamper/:batchId', async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const result = await simulationService.tamperBatch(batchId, req.body.data);
    res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/simulation/scenarios
 */
router.get('/scenarios', (_req, res) => {
  try {
    const scenarios = simulationService.loadAllScenarios();
    res.json({
      ok: true,
      data: { scenarios },
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/simulation/events/:batchId
 */
router.get('/events/:batchId', async (req, res, next) => {
  try {
    const run = await simulationService.getEventsByBatch(req.params.batchId);
    res.json({
      ok: true,
      data: {
        runId: run.runId,
        batchId: run.batchId,
        scenario: run.scenario,
        status: run.status,
        events: run.events,
        startTime: run.startTime,
        endTime: run.endTime,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
module.exports.router = router;
