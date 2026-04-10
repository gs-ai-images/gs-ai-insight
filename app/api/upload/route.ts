import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { supabase } from "@/utils/supabase";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const fileUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      let buffer: any = Buffer.from(bytes);
      
      let safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      let contentType = file.type;

      // Compress images ignoring svg and gif
      if (contentType.startsWith('image/') && !contentType.includes('svg') && !contentType.includes('gif')) {
        try {
          buffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();
            
          contentType = 'image/webp';
          const extMatch = safeName.match(/\.([^.]+)$/);
          if (extMatch) {
            safeName = safeName.replace(new RegExp(`\\.${extMatch[1]}$`, 'i'), '.webp');
          } else {
            safeName += '.webp';
          }
        } catch (error) {
          console.error("Image optimization failed, falling back to original:", error);
        }
      }
      
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${safeName}`;
      
      const { data, error } = await supabase
        .storage
        .from('gs-ai-images')
        .upload(filename, buffer, {
          contentType: contentType,
          upsert: false
        });
        
      if (error) {
        console.error("Supabase upload error:", error);
        throw error;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('gs-ai-images')
        .getPublicUrl(filename);
      
      fileUrls.push(publicUrl);
    }

    return NextResponse.json({ urls: fileUrls });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
