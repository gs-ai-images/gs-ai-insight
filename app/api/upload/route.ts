import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { supabase } from "@/utils/supabase";

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
      const buffer = Buffer.from(bytes);
      
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${safeName}`;
      
      const { data, error } = await supabase
        .storage
        .from('gs-ai-images')
        .upload(filename, buffer, {
          contentType: file.type,
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
