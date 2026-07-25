import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('faculty_assignments')
    .select(`
      id,
      is_primary,
      sections (
        id,
        name,
        subjects (
          id,
          title,
          code,
          courses (
            id,
            code,
            title
          )
        )
      )
    `)
    .limit(10);
    
  if (error) console.error(error);
  
  console.log(JSON.stringify(data, null, 2));
}

test();
