import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env explicitly
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function main() {
  console.log('Migrating local images to Supabase Storage...');
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('No local uploads directory found.');
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`Found ${files.length} files to migrate.`);

  let uploadedCount = 0;
  for (const filename of files) {
    const filePath = path.join(uploadsDir, filename);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      const fileBuffer = fs.readFileSync(filePath);
      
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';

      const { error } = await supabase.storage
        .from('gs-ai-images')
        .upload(filename, fileBuffer, {
          contentType: contentType,
          upsert: true
        });

      if (error) {
        console.error(`Failed to upload ${filename}:`, error.message);
      } else {
        console.log(`Uploaded ${filename}`);
        uploadedCount++;
      }
    }
  }

  console.log(`Uploaded ${uploadedCount} out of ${files.length} files.`);

  // Update Database records
  console.log('Updating database image URLs to Supabase paths...');
  
  const publicUrlPrefix = supabaseUrl + '/storage/v1/object/public/gs-ai-images/';
  
  const posts = await prisma.post.findMany();
  let dbUpdates = 0;
  
  for (const post of posts) {
    if (post.imageUrl && post.imageUrl.startsWith('/uploads/')) {
      const filename = post.imageUrl.replace('/uploads/', '');
      const newUrl = publicUrlPrefix + filename;
      
      await prisma.post.update({
        where: { id: post.id },
        data: { imageUrl: newUrl }
      });
      dbUpdates++;
    }
  }
  
  console.log(`Updated ${dbUpdates} database records with new Image URLs!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
