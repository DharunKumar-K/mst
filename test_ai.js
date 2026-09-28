const axios = require('axios');
const { runScenario } = require('./backend/services/simulation/scenarios');
const { toEvidenceEvents } = require('./backend/services/simulation/adapter');

const SCENARIOS = ['NORMAL', 'INCONSISTENT', 'TAMPERED'];

async function testScenario(scenarioName) {
  console.log(`\n${'═'.repeat(62)}`);
  console.log(`  🧪 SCENARIO: ${scenarioName}`);
  console.log('═'.repeat(62));

  const simEvent = runScenario(scenarioName, `TEST-${scenarioName}`);
  const evidence = toEvidenceEvents(simEvent);
  const def = simEvent.definition;

  // Use the claim directly from the scenario JSON (claimedRecoveredWeight)
  const batch = {
    batchId: simEvent.batch.batchId,
    producer: simEvent.batch.producer,
    recycler: simEvent.batch.recycler,
    material: simEvent.batch.material,
    claim: {
      quantity: def.claimedRecoveredWeight,
      unit: simEvent.weights.unit,
    },
  };

  // For TAMPERED: inject an integrity failure (hash mismatch)
  let integrityResult = null;
  if (scenarioName === 'TAMPERED') {
    integrityResult = {
      allHashesMatch: false,
      mismatchedEvidenceIds: [`sim-${batch.batchId}-output`],
    };
  }

  const payload = { batch, evidence, integrityResult };

  try {
    const { data } = await axios.post('http://localhost:8000/reconcile', payload, { timeout: 30000 });

    const expectedStatus = def.expectedStatus;
    const passed = data.status === expectedStatus;

    console.log(`  Status:    ${data.status}`);
    console.log(`  Flags:     ${data.flags.length === 0 ? 'none' : data.flags.join(', ')}`);
    console.log(`\n  📝 Explanation (from Groq LLM):`);
    console.log(`  ${data.explanation}`);
    console.log(`\n  💡 Recommendation:`);
    console.log(`  ${data.recommendation}`);
    console.log(`\n  Mass Balance: input=${data.massBalanceResult?.input}kg → processed=${data.massBalanceResult?.output}kg, claim=${data.massBalanceResult?.claim}kg`);
    console.log(`  Downstream:   ${data.downstreamMatch?.quantity}kg (matches claim: ${data.downstreamMatch?.matchesClaim})`);
    console.log(`\n  Expected: ${expectedStatus}  |  Got: ${data.status}  →  ${passed ? '✅ PASS' : '❌ FAIL'}`);
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    if (err.response) console.error(`  Response: ${JSON.stringify(err.response.data, null, 2)}`);
  }
}

(async () => {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║      CirqProof AI Service — Full Scenario Test Suite        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  for (const s of SCENARIOS) {
    await testScenario(s);
  }
  console.log('\n' + '═'.repeat(62) + '\n');
})();
