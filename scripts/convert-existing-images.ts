import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

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
  console.log('Starting migration to strictly utilize WebP...');
  const bucketName = 'gs-ai-images';
  
  // 1. Get all objects
  const { data: files, error } = await supabase.storage.from(bucketName).list();
  if (error || !files) {
    console.error("Failed to list files:", error);
    process.exit(1);
  }

  console.log(`Found ${files.length} total objects in bucket.`);

  let successfullyConvertedCount = 0;
  
  // 2. Filter images and iterate
  for (const file of files) {
    if (file.name === '.emptyFolderPlaceholder') continue;
    
    const extMatch = file.name.match(/\.([^.]+)$/);
    const originalExt = extMatch ? extMatch[1].toLowerCase() : '';
    
    // Ignore already optimized, svg, or gif
    if (originalExt === 'svg' || originalExt === 'gif' || originalExt === 'webp') {
       continue;
    }

    // Ignore nested folders recursively from base dir listing
    if (!extMatch) {
        continue;
    }

    console.log(`======================`);
    console.log(`Processing file: ${file.name}`);
    
    try {
      // Stream or download buffer
      const { data: fileData, error: dlError } = await supabase.storage.from(bucketName).download(file.name);
      if (dlError || !fileData) {
        console.error(`Failed to download ${file.name}:`, dlError);
        continue;
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());

      // Sharp convert
      const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
      
      const newFileName = file.name.replace(new RegExp(`\\.${extMatch[1]}$`, 'i'), '.webp');
      
      // Upload converted
      const { error: upError } = await supabase.storage.from(bucketName).upload(newFileName, webpBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

      if (upError) {
        console.error(`Failed to upload converted ${newFileName}:`, upError);
        continue;
      }

      // Delete Original
      if (newFileName !== file.name) { 
         const { error: delError } = await supabase.storage.from(bucketName).remove([file.name]);
         if (delError) {
           console.error(`Warning: Failed to delete original ${file.name}:`, delError);
         } else {
           console.log(`Optimized and replaced: ${file.name} -> ${newFileName}`);
         }
      }
      
      successfullyConvertedCount++;
    } catch(err) {
      console.error(`Conversion crashed for ${file.name}:`, err);
    }
  }

  console.log(`\nSuccessfully converted ${successfullyConvertedCount} images to WebP.`);
  
  // 3. Update DB
  console.log('\nChecking Database references for Post table updates...');
  
  const posts = await prisma.post.findMany();
  let dbUpdates = 0;
  
  for (const post of posts) {
     if (post.imageUrl) {
        let isModified = false;
        
        let newUrl = post.imageUrl;
        const extMatch = newUrl.match(/\.([^.]+)$/);
        
        if (extMatch) {
            const originalExt = extMatch[1].toLowerCase();
            if (['jpg', 'jpeg', 'png'].includes(originalExt)) {
                newUrl = newUrl.replace(new RegExp(`\\.${extMatch[1]}$`, 'i'), '.webp');
                isModified = true;
            }
            
            // Also need to check summary/content if images exist there but wait! this is only imageUrl
            if (isModified) {
                await prisma.post.update({
                  where: { id: post.id },
                  data: { imageUrl: newUrl }
                });
                dbUpdates++;
            }
        }
     }
  }
  
  console.log(`Updated ${dbUpdates} database records to point to .webp extensions!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
