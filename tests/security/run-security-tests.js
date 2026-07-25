const { setupFixtures } = require('./setup/fixtures');
const { cleanupFixtures } = require('./cleanup/fixtures');
const { runEscalationTests } = require('./auth/escalation.test');
const { runRLSTests } = require('./rls/student.test');
const { runStorageTests } = require('./storage/isolation.test');
const { getAdminClient } = require('./helpers/client');
const config = require('./helpers/config');

async function preflight(admin) {
  console.log("--- Admin Preflight ---");
  // First request
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    console.error("Privileged Admin configuration: FAIL");
    console.error(error.message);
    process.exit(1);
  }
  
  // Second request to verify consistency
  const { error: secondError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (secondError) {
    console.error("Privileged Admin consistency check: FAIL");
    console.error(secondError.message);
    process.exit(1);
  }

  console.log("Privileged Admin configuration: PASS");
  console.log("Admin Preflight client source:", config.privilegedKeySource);
  console.log("Cleanup client source:", config.privilegedKeySource);
  console.log("Fixture Setup client source:", config.privilegedKeySource);
  console.log("Admin client factory consistency: PASS\n");
}

async function runAll() {
  const adminClient = getAdminClient();
  await preflight(adminClient);
  
  console.log("=== CampusOS Security Acceptance Suite ===");

  let fixtures = {};
  let totalPassed = 0;
  let totalFailed = 0;
  let touchedFixtures = false;

  try {
    // 1. Cleanup old fixtures just in case
    await cleanupFixtures(adminClient);
    
    // 2. Setup new fixtures
    fixtures = await setupFixtures(adminClient);
    touchedFixtures = true;

    // 3. Run Escalation Tests
    const escResults = await runEscalationTests(fixtures);
    totalPassed += escResults.passed;
    totalFailed += escResults.failed;

    // 4. Run RLS Tests
    const rlsResults = await runRLSTests(fixtures);
    totalPassed += rlsResults.passed;
    totalFailed += rlsResults.failed;

    // 5. Run Storage Tests
    const storageResults = await runStorageTests(fixtures);
    totalPassed += storageResults.passed;
    totalFailed += storageResults.failed;

  } catch (err) {
    console.error("FATAL SUITE ERROR:", err);
    totalFailed++;
  } finally {
    // 6. Cleanup
    if (touchedFixtures) {
      try {
        await cleanupFixtures(adminClient);
      } catch (e) {
        console.error("Failed to cleanup fixtures:", e);
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);
  
  if (totalFailed > 0) {
    console.error("\nSECURITY SUITE FAILED");
    process.exit(1);
  } else {
    console.log("\nSECURITY SUITE PASSED");
    process.exit(0);
  }
}

runAll();
