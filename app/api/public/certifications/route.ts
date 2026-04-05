import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const limitValue = Number.parseInt(requestUrl.searchParams.get('limit') ?? '7', 10);
  const offsetValue = Number.parseInt(requestUrl.searchParams.get('offset') ?? '0', 10);
  const filterKind = requestUrl.searchParams.get('tipo');

  const limit = Number.isFinite(limitValue) && limitValue > 0 ? Math.min(limitValue, 24) : 7;
  const offset = Number.isFinite(offsetValue) && offsetValue >= 0 ? offsetValue : 0;

  const supabase = await createClient();

  let query = supabase
    .from('certifications')
    .select('slug, name, kind, issuer, image_path, verification_url, pdf_path, sort_order')
    .eq('is_public', true)
    .order('sort_order', { ascending: true })
    .range(offset, offset + limit);

  if (filterKind === 'certificacion' || filterKind === 'credencial') {
    query = query.eq('kind', filterKind);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hasMore = (data ?? []).length > limit;
  const pagedData = (data ?? []).slice(0, limit);

  const normalized = pagedData
    .map((item) => {
      const imagePath = item.image_path ?? '';
      const isAbsoluteImageUrl = /^https?:\/\//i.test(imagePath);
      const publicImageUrl = imagePath
        ? isAbsoluteImageUrl
          ? imagePath
          : supabase.storage.from('cert-images').getPublicUrl(imagePath).data.publicUrl
        : '';

      const verificationUrl =
        item.verification_url ??
        (item.pdf_path
          ? supabase.storage.from('cert-pdfs').getPublicUrl(item.pdf_path).data.publicUrl
          : null);

      return {
        name: item.name,
        slug: item.slug,
        kind: item.kind,
        issuer: item.issuer,
        image: publicImageUrl,
        url: verificationUrl,
        sort_order: item.sort_order,
      };
    })
    .filter((item) => Boolean(item.name) && Boolean(item.image));

  return NextResponse.json({ data: normalized, hasMore });
}