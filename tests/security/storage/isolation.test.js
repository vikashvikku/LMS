const { getAuthenticatedClient } = require('../helpers/client');

async function runStorageTests(fixtures) {
  let passed = 0;
  let failed = 0;

  console.log("\n--- Storage Security Tests ---");

  try {
    const studentAClient = await getAuthenticatedClient('sec_test_student_a@campusos.local');
    const studentBClient = await getAuthenticatedClient('sec_test_student_b@campusos.local');
    
    // We mock the storage path structure based on policy: {submission_id}/filename.txt
    const correctPath = `${fixtures.submissionA}/test.txt`;

    // 1. Student A can access own submission path (mock download)
    // Supabase JS creates a URL or attempts download. Let's just create a dummy upload to verify INSERT policy.
    const emptyFile = new Blob(['test'], { type: 'text/plain' });

    const { error: uploadAError } = await studentAClient.storage.from('submission-files').upload(correctPath, emptyFile);
    if (!uploadAError) {
      console.log("✓ Student A can upload to own authorized submission");
      passed++;
    } else {
      console.log("✗ FAIL: Student A upload failed", uploadAError.message);
      failed++;
    }

    // 2. Student B cannot access Student A's submission
    const { error: readBError } = await studentBClient.storage.from('submission-files').download(correctPath);
    if (readBError) {
      console.log("✓ Student B cannot read Student A's submission");
      passed++;
    } else {
      console.log("✗ FAIL: Student B read Student A's submission");
      failed++;
    }

    // 3. Forged Path Attack: Student A tries to upload to Student B's submission
    // First we need a dummy submission for Student B
    // But we know fixtures.submissionA belongs to Student A.
    // If Student B tries to upload to submissionA path:
    const { error: forgeError } = await studentBClient.storage.from('submission-files').upload(`${fixtures.submissionA}/forged.txt`, emptyFile);
    if (forgeError) {
      console.log("✓ Forged path attack denied");
      passed++;
    } else {
      console.log("✗ CRITICAL FAIL: STORAGE PATH AUTHORIZATION BYPASS");
      failed++;
    }

  } catch (err) {
    console.log("✗ ERROR in storage tests:", err.message);
    failed++;
  }

  return { passed, failed };
}

module.exports = { runStorageTests };
