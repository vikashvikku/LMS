const TEST_EMAIL_PREFIX = 'sec_test_';

async function cleanupFixtures(admin) {
  console.log("Cleaning up security test fixtures...");

  // We find all users with the prefix and delete them using admin auth API.
  // This cascade-deletes their profiles and relational data if FKs are CASCADE.
  // We'll also delete test organizations.
  
  const { data: users, error: userError } = await admin.auth.admin.listUsers();
  if (userError) {
    const isBadJwt = userError.message && userError.message.includes('invalid JWT') || userError.status === 403;
    if (isBadJwt) {
      console.error("\nPRIVILEGED CLIENT CONFIGURATION FAILURE");
      console.error("The admin client produced a bad_jwt error during cleanup.");
      console.error("RLS Tests: NOT EXECUTED");
      console.error("Storage Tests: NOT EXECUTED");
    }
    throw userError;
  }

  const testUsers = users.users.filter(u => u.email && u.email.startsWith(TEST_EMAIL_PREFIX));
  
  for (const u of testUsers) {
    await admin.auth.admin.deleteUser(u.id);
  }

  // Delete organizations explicitly (in case they don't cascade from users)
  await admin.from('organizations').delete().like('name', 'TEST_FIXTURE_%');
  
  // Storage buckets - cleanup anything in submission-files with test UUIDs
  // Not going to do complex storage cleanup unless absolutely needed for idempotency.
  
  console.log(`Cleaned up ${testUsers.length} test users.`);
}

module.exports = { cleanupFixtures };
