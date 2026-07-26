import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Size limit check (10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Extension check
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json({ success: false, error: 'Only JPG, JPEG, PNG, or PDF files are allowed' }, { status: 400 });
    }

    const isMock = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder');
    if (isMock) {
      // Simulate file upload with data URL
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mockUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ success: true, url: mockUrl });
    }

    // Real Supabase upload
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const fileName = `receipts/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Upload to 'designs' bucket which has public read policies
    const { data, error } = await supabase.storage
      .from('designs')
      .upload(fileName, buffer, {
        contentType: file.type,
        duplex: 'half'
      } as any);

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('designs')
      .getPublicUrl(fileName);

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error: any) {
    console.error('Receipt upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
