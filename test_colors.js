const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColors() {
  const { data, error } = await supabase.from('products').select('name, has_colors, color_heading, colors').eq('has_colors', true);
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
checkColors();
