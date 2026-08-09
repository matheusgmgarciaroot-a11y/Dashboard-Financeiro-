import { createClient } from '@supabase/supabase-js';

console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY length:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAuth() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'matheus.gmgarciaroot@gmail.com',
      password: 'Mgmg222324$$*'
    });
    console.log("Data:", !!data.user);
    console.log("Error:", error?.message);
  } catch (e) {
    console.error("Exception:", e);
  }
}

testAuth();
