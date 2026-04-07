import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Testing Supabase Storage Upload...');
  
  // Create a small test text file in memory
  const fileName = `test-${Date.now()}.txt`;
  const fileContent = 'Hello from testing script!';

  const { data, error } = await supabase.storage
    .from('gs-ai-images')
    .upload(fileName, fileContent, {
      contentType: 'text/plain',
      upsert: true
    });

  if (error) {
    console.error('Error uploading file:', error.message);
    return;
  }

  console.log('File uploaded successfully!', data);

  const { data: publicUrlData } = supabase.storage
    .from('gs-ai-images')
    .getPublicUrl(fileName);

  console.log('Public URL:', publicUrlData.publicUrl);
}

main();
