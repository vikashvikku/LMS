const { getAuthenticatedClient, getAnonClient } = require('../helpers/client');

async function runRLSTests(fixtures) {
  let passed = 0;
  let failed = 0;

  console.log("\n--- RLS Tenant Isolation & Access Tests ---");

  try {
    const studentAClient = await getAuthenticatedClient('sec_test_student_a@campusos.local');
    const facultyAClient = await getAuthenticatedClient('sec_test_faculty_a@campusos.local');
    const adminAClient = await getAuthenticatedClient('sec_test_admin_a@campusos.local');
    const anonClient = getAnonClient();

    // 1. Anonymous Access
    const { data: anonData, error: anonError } = await anonClient.from('profiles').select('*');
    if (!anonData || anonData.length === 0) {
      console.log("✓ Anonymous access to profiles denied");
      passed++;
    } else {
      console.log("✗ FAIL: Anonymous accessed profiles", anonData.length);
      failed++;
    }

    // 2. Student Cross-tenant
    const { data: studentCData } = await studentAClient.from('profiles').select('*').eq('id', fixtures.studentC);
    if (!studentCData || studentCData.length === 0) {
      console.log("✓ Student A cannot access Organization B profiles");
      passed++;
    } else {
      console.log("✗ FAIL: Student A accessed Org B");
      failed++;
    }

    // 3. Faculty Isolation
    // Faculty A should see Section A
    const { data: facSecData } = await facultyAClient.from('sections').select('*').eq('id', fixtures.sectionA);
    if (facSecData && facSecData.length > 0) {
      console.log("✓ Faculty A can access assigned Section A");
      passed++;
    } else {
      console.log("✗ FAIL: Faculty A cannot access assigned section");
      failed++;
    }

    // 4. University Admin Tenant Scoping
    const { data: adminOrgB } = await adminAClient.from('departments').select('*').eq('organization_id', fixtures.orgB);
    if (!adminOrgB || adminOrgB.length === 0) {
      console.log("✓ University Admin A cannot access Organization B departments");
      passed++;
    } else {
      console.log("✗ FAIL: University Admin A accessed Org B departments");
      failed++;
    }

  } catch (err) {
    console.log("✗ ERROR in RLS tests:", err.message);
    failed++;
  }

  return { passed, failed };
}

module.exports = { runRLSTests };
