import { createClient } from '@supabase/supabase-js';

try {
  const supabase = createClient(undefined, undefined);
  console.log("No error thrown!");
  
  supabase.auth.signInWithPassword({ email: 'test', password: 'test' })
    .then(console.log)
    .catch(e => console.log("Auth Error:", e.message));
} catch (e) {
  console.error("Sync Error:", e.message);
}
