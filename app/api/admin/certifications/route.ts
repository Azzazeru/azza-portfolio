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

async function getNextCertificationSortOrder(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase
    .from('certifications')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  if (error) {
    return { sortOrder: 0, error: error.message };
  }

  const currentMax = data?.[0]?.sort_order ?? -1;
  return { sortOrder: currentMax + 1, error: null as string | null };
}

export async function GET() {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('certifications')
    .select(
      'id, slug, name, kind, obtention, issuer, verification_type, verification_url, image_path, pdf_path, is_public, sort_order, created_at'
    )
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json();

  if (!body?.name || !body?.kind || !body?.obtention || !body?.issuer) {
    return NextResponse.json(
      { error: 'name, kind, obtention e issuer son obligatorios' },
      { status: 400 }
    );
  }

  if (!body?.image_path) {
    return NextResponse.json(
      { error: 'image_path es obligatorio para certificaciones' },
      { status: 400 }
    );
  }

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

  const slug = normalizeSlug(body.slug && body.slug.trim().length > 0 ? body.slug : body.name);

  const supabase = await createClient();
  const nextSortOrderResult = Number.isFinite(body.sort_order) && Number(body.sort_order) > 0
    ? { sortOrder: Number(body.sort_order), error: null as string | null }
    : await getNextCertificationSortOrder(supabase);

  if (nextSortOrderResult.error) {
    return NextResponse.json({ error: nextSortOrderResult.error }, { status: 500 });
  }

  const payload = {
    slug,
    name: body.name,
    kind: body.kind,
    obtention: body.obtention,
    issuer: body.issuer,
    verification_type: body.verification_type ?? 'none',
    verification_url: body.verification_url ?? null,
    image_path: body.image_path ?? null,
    pdf_path: body.pdf_path ?? null,
    is_public: body.is_public ?? true,
    sort_order: nextSortOrderResult.sortOrder,
  };

  const { data, error } = await supabase
    .from('certifications')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}