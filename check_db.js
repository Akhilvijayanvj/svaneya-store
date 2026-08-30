require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('store_settings').select('*').limit(1);
  console.log("store_settings columns:", data && data.length > 0 ? Object.keys(data[0]) : error);
}
test();
