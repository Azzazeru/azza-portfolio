import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type ProjectTagInput = {
  key?: string;
  value?: string;
};

type ProjectTagRow = {
  project_id: string;
  key?: string;
  value?: string;
  tag_key?: string;
  tag_value?: string;
};

type ProjectTypeRow = {
  id: string;
  code?: string;
  label?: string;
  name?: string;
};

type ProjectTypeAssignmentRow = {
  project_id: string;
  project_type_id?: string | number;
  type_id?: string | number;
};

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

function isMissingKeyColumnError(message?: string) {
  if (!message) return false;
  return (
    message.includes("'key' column") ||
    message.includes('column project_tags.key does not exist') ||
    message.includes('Could not find the \"key\" column')
  );
}

function isMissingProjectTypeIdColumnError(message?: string) {
  if (!message) return false;
  return (
    message.includes('project_type_id') ||
    message.includes('Could not find the "project_type_id" column')
  );
}

function mapTagRow(row: ProjectTagRow) {
  return {
    key: row.key ?? row.tag_key ?? '',
    value: row.value ?? row.tag_value ?? '',
  };
}

async function selectProjectTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectIds: string[]
) {
  const primary = await supabase
    .from('project_tags')
    .select('project_id, key, value')
    .in('project_id', projectIds);

  if (!primary.error) {
    return { data: (primary.data ?? []) as ProjectTagRow[], error: null as string | null };
  }

  if (!isMissingKeyColumnError(primary.error.message)) {
    return { data: [] as ProjectTagRow[], error: primary.error.message };
  }

  const fallback = await supabase
    .from('project_tags')
    .select('project_id, tag_key, tag_value')
    .in('project_id', projectIds);

  if (fallback.error) {
    return { data: [] as ProjectTagRow[], error: fallback.error.message };
  }

  return { data: (fallback.data ?? []) as ProjectTagRow[], error: null as string | null };
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

async function selectProjectTypeAssignments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectIds: string[]
) {
  const primary = await supabase
    .from('project_type_assignments')
    .select('project_id, project_type_id')
    .in('project_id', projectIds);

  if (!primary.error) {
    return {
      data: (primary.data ?? []) as ProjectTypeAssignmentRow[],
      error: null as string | null,
    };
  }

  if (!isMissingProjectTypeIdColumnError(primary.error.message)) {
    return { data: [] as ProjectTypeAssignmentRow[], error: primary.error.message };
  }

  const fallback = await supabase
    .from('project_type_assignments')
    .select('project_id, type_id')
    .in('project_id', projectIds);

  if (fallback.error) {
    return { data: [] as ProjectTypeAssignmentRow[], error: fallback.error.message };
  }

  return {
    data: (fallback.data ?? []) as ProjectTypeAssignmentRow[],
    error: null as string | null,
  };
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
  baseSlug: string
) {
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', candidate)
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

async function getNextProjectSortOrder(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase
    .from('projects')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  if (error) {
    return { sortOrder: 0, error: error.message };
  }

  const currentMax = data?.[0]?.sort_order ?? -1;
  return { sortOrder: currentMax + 1, error: null as string | null };
}

function getTypeLabel(type: ProjectTypeRow) {
  return type.label ?? type.name ?? type.code ?? type.id;
}

async function selectProjectTypes(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const orderedByLabel = await supabase
    .from('project_types')
    .select('*')
    .order('label', { ascending: true });

  if (!orderedByLabel.error) {
    return {
      data: (orderedByLabel.data ?? []) as ProjectTypeRow[],
      error: null as string | null,
    };
  }

  const orderedByName = await supabase
    .from('project_types')
    .select('*')
    .order('name', { ascending: true });

  if (!orderedByName.error) {
    return {
      data: (orderedByName.data ?? []) as ProjectTypeRow[],
      error: null as string | null,
    };
  }

  const unordered = await supabase.from('project_types').select('*');
  if (unordered.error) {
    return { data: [] as ProjectTypeRow[], error: unordered.error.message };
  }

  return { data: (unordered.data ?? []) as ProjectTypeRow[], error: null as string | null };
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

export async function GET() {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select(
      'id, slug, name, description, key_points, repo_url, live_url, featured, published, status, sort_order, created_at, updated_at'
    )
    .order('sort_order', { ascending: true });

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }

  const projectIds = (projectsData ?? []).map((project) => project.id);

  const { data: projectTypesData, error: projectTypesError } = await selectProjectTypes(
    supabase
  );

  if (projectTypesError) {
    return NextResponse.json({ error: projectTypesError }, { status: 500 });
  }

  const types = (projectTypesData ?? [])
    .slice()
    .sort((a, b) => getTypeLabel(a).localeCompare(getTypeLabel(b)));
  const typeById = new Map(types.map((type) => [type.id, type]));

  let tagsByProjectId = new Map<string, Array<{ key: string; value: string }>>();
  let assignmentIdsByProjectId = new Map<string, string[]>();

  if (projectIds.length > 0) {
    const { data: tagsData, error: tagsError } = await selectProjectTags(
      supabase,
      projectIds
    );

    if (tagsError) {
      return NextResponse.json({ error: tagsError }, { status: 500 });
    }

    tagsByProjectId = (tagsData ?? []).reduce((acc, row) => {
      const existing = acc.get(row.project_id) ?? [];
      existing.push(mapTagRow(row));
      acc.set(row.project_id, existing);
      return acc;
    }, new Map<string, Array<{ key: string; value: string }>>());

    const { data: assignmentsData, error: assignmentsError } =
      await selectProjectTypeAssignments(supabase, projectIds);

    if (assignmentsError) {
      return NextResponse.json({ error: assignmentsError }, { status: 500 });
    }

    assignmentIdsByProjectId = (assignmentsData ?? []).reduce((acc, row) => {
      const current = acc.get(row.project_id) ?? [];
      const idValue = String(row.project_type_id ?? row.type_id ?? '').trim();
      if (idValue.length > 0) current.push(idValue);
      acc.set(row.project_id, current);
      return acc;
    }, new Map<string, string[]>());
  }

  const data = (projectsData ?? []).map((project) => {
    const tags = tagsByProjectId.get(project.id) ?? [];
    const projectTypeIds = assignmentIdsByProjectId.get(project.id) ?? [];

    return {
      ...project,
      tags,
      project_type_ids: projectTypeIds,
      project_types: projectTypeIds
        .map((typeId) => typeById.get(typeId))
        .filter(Boolean)
        .map((type) => ({ id: type!.id, label: getTypeLabel(type!) })),
    };
  });

  const statusOptions = Array.from(
    new Set((projectsData ?? []).map((project) => project.status).filter(Boolean))
  );

  return NextResponse.json({
    data,
    types: types.map((type) => ({ id: type.id, label: getTypeLabel(type) })),
    statusOptions,
  });
}

export async function POST(request: Request) {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json();

  if (!body?.name) {
    return NextResponse.json({ error: 'name es obligatorio' }, { status: 400 });
  }

  if (!body?.description || body.description.trim().length === 0) {
    return NextResponse.json({ error: 'description es obligatorio' }, { status: 400 });
  }

  const normalizedStatus = normalizeProjectStatus(String(body?.status ?? ''));

  if (!normalizedStatus) {
    return NextResponse.json({ error: 'status es obligatorio' }, { status: 400 });
  }

  const baseSlug = normalizeSlug(
    body.slug && body.slug.trim().length > 0 ? body.slug : body.name
  );
  const tags = sanitizeTags(body.tags);
  const projectTypeIds = sanitizeTypeIds(body.project_type_ids);
  const keyPoints = sanitizeKeyPoints(body.key_points);

  const supabase = await createClient();
  const uniqueSlugResult = await buildUniqueProjectSlug(supabase, baseSlug);
  if (uniqueSlugResult.error) {
    return NextResponse.json({ error: uniqueSlugResult.error }, { status: 500 });
  }

  const nextSortOrderResult =
    Number.isFinite(body.sort_order) && Number(body.sort_order) > 0
      ? { sortOrder: Number(body.sort_order), error: null as string | null }
      : await getNextProjectSortOrder(supabase);

  if (nextSortOrderResult.error) {
    return NextResponse.json({ error: nextSortOrderResult.error }, { status: 500 });
  }

  const payload = {
    name: body.name,
    slug: uniqueSlugResult.slug,
    description: body.description.trim(),
    key_points: keyPoints,
    repo_url: body.repo_url?.trim() || null,
    live_url: body.live_url?.trim() || null,
    featured: false,
    published: true,
    status: normalizedStatus,
    sort_order: nextSortOrderResult.sortOrder,
  };

  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .insert(payload)
    .select(
      'id, slug, name, description, key_points, repo_url, live_url, featured, published, status, sort_order, created_at, updated_at'
    )
    .single();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  if (tags.length > 0) {
    const insertTagsError = await insertProjectTags(supabase, projectData.id, tags);
    if (insertTagsError) {
      return NextResponse.json({ error: insertTagsError }, { status: 500 });
    }
  }

  if (projectTypeIds.length > 0) {
    const insertAssignmentsError = await insertProjectTypeAssignments(
      supabase,
      projectData.id,
      projectTypeIds
    );

    if (insertAssignmentsError) {
      return NextResponse.json({ error: insertAssignmentsError }, { status: 500 });
    }
  }

  const data = {
    ...projectData,
    tags,
    project_type_ids: projectTypeIds,
  };

  return NextResponse.json({ data }, { status: 201 });
}