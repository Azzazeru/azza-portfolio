import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'aaron.fuentesdioca@gmail.com';

function isBypassEnabled() {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_ADMIN_BYPASS_LOCAL === 'true'
  );
}

function normalizeSlug(value: string) {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return normalized || 'certificacion';
}

async function assertAdmin() {
  if (isBypassEnabled()) return { ok: true as const };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return { ok: false as const, error: 'Unauthorized' };
  }

  return { ok: true as const };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  if (body.verification_type === 'external_url' && !body.verification_url) {
    return NextResponse.json(
      { error: 'verification_url es obligatorio cuando verification_type=external_url' },
      { status: 400 }
    );
  }

  if (body.verification_type === 'pdf_file' && !body.pdf_path) {
    return NextResponse.json(
      { error: 'pdf_path es obligatorio cuando verification_type=pdf_file' },
      { status: 400 }
    );
  }

  const updates = {
    slug: normalizeSlug(body.slug ?? body.name ?? ''),
    name: body.name,
    kind: body.kind,
    obtention: body.obtention,
    issuer: body.issuer,
    verification_type: body.verification_type,
    verification_url: body.verification_url ?? null,
    image_path: body.image_path ?? null,
    pdf_path: body.pdf_path ?? null,
    is_public: body.is_public,
    sort_order: body.sort_order,
  };

  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('certifications')
    .update(cleanUpdates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id } = await context.params;

  const supabase = await createClient();
  const { data: certification, error: fetchError } = await supabase
    .from('certifications')
    .select('image_path, pdf_path')
    .eq('id', id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const storageRemovals: Array<Promise<{ error: unknown }>> = [];

  if (certification?.image_path) {
    storageRemovals.push(
      supabase.storage.from('cert-images').remove([certification.image_path])
    );
  }

  if (certification?.pdf_path) {
    storageRemovals.push(
      supabase.storage.from('cert-pdfs').remove([certification.pdf_path])
    );
  }

  await Promise.all(storageRemovals);

  const { error } = await supabase.from('certifications').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}