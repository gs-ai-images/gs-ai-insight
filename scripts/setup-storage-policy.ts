import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Setting up Supabase Storage RLS policies...');
  
  try {
    // Drop existing policies if any to prevent conflicts
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;`);
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;`);
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;`);
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;`);
    } catch (e) {
      console.log('No existing policies to drop or error dropping:', e);
    }

    // Give everyone public access to 'gs-ai-images' bucket objects
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Upload Access"
      ON storage.objects FOR INSERT TO public
      WITH CHECK (bucket_id = 'gs-ai-images');
    `);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Read Access"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'gs-ai-images');
    `);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Delete Access"
      ON storage.objects FOR DELETE TO public
      USING (bucket_id = 'gs-ai-images');
    `);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Update Access"
      ON storage.objects FOR UPDATE TO public
      USING (bucket_id = 'gs-ai-images');
    `);

    console.log('Storage RLS policies configured successfully!');
  } catch (error) {
    console.error('Failed to setup storage policies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
