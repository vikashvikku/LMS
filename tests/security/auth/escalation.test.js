const { getAuthenticatedClient } = require('../helpers/client');

async function runEscalationTests(fixtures) {
  let passed = 0;
  let failed = 0;

  console.log("\n--- Privilege Escalation Tests ---");

  try {
    const studentClient = await getAuthenticatedClient('sec_test_student_a@campusos.local');
    
    // 1. Role escalation
    const { error: roleError } = await studentClient.from('profiles').update({ role: 'super_admin' }).eq('id', fixtures.studentA);
    if (roleError && roleError.message.includes('Permission denied')) {
      console.log("✓ Student cannot become super_admin");
      passed++;
    } else {
      console.log("✗ FAIL: Student became super_admin or missing error", roleError);
      failed++;
    }

    // 2. Organization escalation
    const { error: orgError } = await studentClient.from('profiles').update({ organization_id: fixtures.orgB }).eq('id', fixtures.studentA);
    if (orgError && orgError.message.includes('Permission denied')) {
      console.log("✓ Student cannot change organization");
      passed++;
    } else {
      console.log("✗ FAIL: Student changed organization or missing error", orgError);
      failed++;
    }

    // 3. Safe profile update
    const { error: safeError } = await studentClient.from('profiles').update({ first_name: 'SafeUpdate' }).eq('id', fixtures.studentA);
    if (!safeError) {
      console.log("✓ Student can update safe profile fields");
      passed++;
    } else {
      console.log("✗ FAIL: Safe update failed", safeError);
      failed++;
    }
  } catch (err) {
    console.log("✗ ERROR in escalation tests:", err.message);
    failed++;
  }

  return { passed, failed };
}

module.exports = { runEscalationTests };
