# CampusOS Security Testing

This document describes how to execute the automated live Security Acceptance Suite for CampusOS. 
This suite asserts RLS policies, multi-tenant isolation, profile security, and Storage authorization.

## 1. Required Test Environment Variables
Copy `.env.security-test.example` to `.env.security-test.local` and populate it:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon/publishable key.
- `SUPABASE_SECRET_KEY`: Your Supabase service role / secret key (preferred current privileged credential required to bypass RLS to provision test fixtures).
- `SUPABASE_SERVICE_ROLE_KEY`: Optional legacy alternative to SUPABASE_SECRET_KEY. Only ONE of these two is needed.
- `CAMPUSOS_SECURITY_TEST`: Must be `true`. The test harness will refuse to run destructive setup/cleanup if this is absent.

**WARNING**: The `SUPABASE_SECRET_KEY` has full administrative privileges over your database. It must NEVER reach the browser, be committed to Git, or be printed in logs. 
If it is accidentally exposed, immediately rotate it via the Supabase Dashboard (Project Settings > API > JWT Settings > Generate new JWT secret).

## 2. Test Identity & Fixture Setup
The harness uses the privileged credential to directly insert isolated DEVELOPMENT test identities into `auth.users` and `public.profiles`. It provisions mock organizations, departments, assignments, sections, and storage files specifically prefixed with `TEST_FIXTURE_` to avoid colliding with real data.

Public signup logic is strictly preserved; non-student identities are directly seeded through the service role bypassing the default signup triggers.

## 3. How to Run Tests
Ensure `.env.security-test.local` is present in the root directory. Then execute:
```bash
npm run test:security
```
The suite will output the progress of each authentication, escalation, tenant isolation, and storage test.

## 4. Understanding the Output
- **PASS**: The live database successfully enforced the expected security boundary (e.g., an unauthorized read returned 0 rows, or an unauthorized update threw an error).
- **FAIL**: The live database allowed an unauthorized action, or denied an authorized one. If any test fails, the process exits with a non-zero code.
- **BLOCKED**: The test could not be executed due to a missing requirement (e.g., missing environment variables).

## 5. Cleanup
The test harness runs a cleanup routine at the end (or start) of the suite. It selectively deletes ONLY rows where the metadata explicitly flags them as security test fixtures. It will NEVER execute broad `DELETE FROM` statements. This is guarded by the `CAMPUSOS_SECURITY_TEST=true` check.
