import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type ProjectTagInput = {
  key?: string;
  value?: string;
};

function isMissingProjectTypeIdColumnError(message?: string) {
  if (!message) return false;
  return (
    message.includes('project_type_id') ||
    message.includes('Could not find the "project_type_id" column')
  );
}

function normalizeTagKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function isMissingKeyColumnError(message?: string) {
  if (!message) return false;
  return (
    message.includes("'key' column") ||
    message.includes('column project_tags.key does not exist') ||
    message.includes('Could not find the \"key\" column')
  );
}

async function insertProjectTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  tags: Array<{ key: string; value: string }>
) {
  const primaryPayload = tags.map((tag) => ({
    project_id: projectId,
    key: tag.key,
    value: tag.value,
  }));

  const primaryInsert = await supabase.from('project_tags').insert(primaryPayload);
  if (!primaryInsert.error) return null;

  if (!isMissingKeyColumnError(primaryInsert.error.message)) {
    return primaryInsert.error.message;
  }

  const fallbackPayload = tags.map((tag) => ({
    project_id: projectId,
    tag_key: tag.key,
    tag_value: tag.value,
  }));

  const fallbackInsert = await supabase.from('project_tags').insert(fallbackPayload);
  if (fallbackInsert.error) {
    return fallbackInsert.error.message;
  }

  return null;
}

async function insertProjectTypeAssignments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  projectTypeIds: string[]
) {
  const numericTypeIds = projectTypeIds
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id));

  if (numericTypeIds.length === 0) return null;

  const payloadWithProjectTypeId = numericTypeIds.map((typeId) => ({
    project_id: projectId,
    project_type_id: typeId,
  }));

  const primary = await supabase
    .from('project_type_assignments')
    .insert(payloadWithProjectTypeId);

  if (!primary.error) return null;

  if (!isMissingProjectTypeIdColumnError(primary.error.message)) {
    return primary.error.message;
  }

  const payloadWithTypeId = numericTypeIds.map((typeId) => ({
    project_id: projectId,
    type_id: typeId,
  }));

  const fallback = await supabase
    .from('project_type_assignments')
    .insert(payloadWithTypeId);

  if (fallback.error) {
    return fallback.error.message;
  }

  return null;
}

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

  return normalized || 'proyecto';
}

function sanitizeTags(rawTags: unknown): Array<{ key: string; value: string }> {
  if (!Array.isArray(rawTags)) return [];

  return rawTags
    .map((tag) => {
      const candidate = tag as ProjectTagInput;
      return {
        key: normalizeTagKey(String(candidate.key ?? '')),
        value: (candidate.value ?? '').trim(),
      };
    })
    .filter((tag) => tag.key.length > 0 && tag.value.length > 0);
}

function sanitizeTypeIds(rawIds: unknown): string[] {
  if (!Array.isArray(rawIds)) return [];

  return rawIds
    .map((id) => String(id ?? '').trim())
    .filter((id) => id.length > 0);
}

function sanitizeKeyPoints(rawKeyPoints: unknown): string[] {
  if (!Array.isArray(rawKeyPoints)) return [];

  return rawKeyPoints
    .map((point) => (typeof point === 'string' ? point.trim() : ''))
    .filter((point) => point.length > 0);
}

function normalizeProjectStatus(value: string) {
  const normalized = value.trim().toLowerCase();

  const aliases: Record<string, string> = {
    borrador: 'draft',
    en_progreso: 'active',
    'en-progreso': 'active',
    completado: 'active',
    in_progress: 'active',
    completed: 'active',
    archivado: 'archived',
  };

  return aliases[normalized] ?? normalized;
}

async function buildUniqueProjectSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string,
  currentProjectId: string
) {
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', candidate)
      .neq('id', currentProjectId)
      .limit(1);

    if (error) {
      return { slug: baseSlug, error: error.message };
    }

    if (!data || data.length === 0) {
      return { slug: candidate, error: null as string | null };
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
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
  const hasTagsInPayload = body.tags !== undefined;
  const hasProjectTypesInPayload = body.project_type_ids !== undefined;
  const hasKeyPointsInPayload = body.key_points !== undefined;
  const tags = sanitizeTags(body.tags);
  const projectTypeIds = sanitizeTypeIds(body.project_type_ids);
  const keyPoints = sanitizeKeyPoints(body.key_points);

  const supabase = await createClient();

  let nextSlug: string | undefined = undefined;
  if (body.slug !== undefined || body.name !== undefined) {
    const baseSlug = normalizeSlug(body.slug ?? body.name ?? '');
    const uniqueSlugResult = await buildUniqueProjectSlug(supabase, baseSlug, id);
    if (uniqueSlugResult.error) {
      return NextResponse.json({ error: uniqueSlugResult.error }, { status: 500 });
    }
    nextSlug = uniqueSlugResult.slug;
  }

  const updates = {
    name: body.name,
    description:
      body.description !== undefined ? String(body.description).trim() : undefined,
    key_points: hasKeyPointsInPayload ? keyPoints : undefined,
    repo_url: body.repo_url !== undefined ? body.repo_url?.trim() || null : undefined,
    live_url: body.live_url !== undefined ? body.live_url?.trim() || null : undefined,
    slug: nextSlug,
    featured: false,
    published: true,
    status:
      body.status !== undefined
        ? normalizeProjectStatus(String(body.status))
        : undefined,
    sort_order: body.sort_order,
  };

  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .update(cleanUpdates)
    .eq('id', id)
    .select(
      'id, slug, name, description, key_points, repo_url, live_url, featured, published, status, sort_order, created_at, updated_at'
    )
    .single();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  if (hasTagsInPayload) {
    const { error: deleteTagsError } = await supabase
      .from('project_tags')
      .delete()
      .eq('project_id', id);

    if (deleteTagsError) {
      return NextResponse.json({ error: deleteTagsError.message }, { status: 500 });
    }

    if (tags.length > 0) {
      const insertTagsError = await insertProjectTags(supabase, id, tags);
      if (insertTagsError) {
        return NextResponse.json({ error: insertTagsError }, { status: 500 });
      }
    }
  }

  if (hasProjectTypesInPayload) {
    const { error: deleteAssignmentsError } = await supabase
      .from('project_type_assignments')
      .delete()
      .eq('project_id', id);

    if (deleteAssignmentsError) {
      return NextResponse.json({ error: deleteAssignmentsError.message }, { status: 500 });
    }

    if (projectTypeIds.length > 0) {
      const insertAssignmentsError = await insertProjectTypeAssignments(
        supabase,
        id,
        projectTypeIds
      );

      if (insertAssignmentsError) {
        return NextResponse.json({ error: insertAssignmentsError }, { status: 500 });
      }
    }
  }

  const data = {
    ...projectData,
    tags: hasTagsInPayload ? tags : undefined,
    project_type_ids: projectTypeIds,
  };

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
  const { error: deleteTagsError } = await supabase
    .from('project_tags')
    .delete()
    .eq('project_id', id);

  if (deleteTagsError) {
    return NextResponse.json({ error: deleteTagsError.message }, { status: 500 });
  }

  const { error: deleteAssignmentsError } = await supabase
    .from('project_type_assignments')
    .delete()
    .eq('project_id', id);

  if (deleteAssignmentsError) {
    return NextResponse.json({ error: deleteAssignmentsError.message }, { status: 500 });
  }

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}