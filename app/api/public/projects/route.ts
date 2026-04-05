import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type ProjectTagRow = {
  project_id: string;
  key?: string;
  value?: string;
  tag_key?: string;
  tag_value?: string;
};

function isMissingKeyColumnError(message?: string) {
  if (!message) return false;
  return (
    message.includes("'key' column") ||
    message.includes('column project_tags.key does not exist') ||
    message.includes('Could not find the "key" column')
  );
}

function mapTagRow(row: ProjectTagRow) {
  return {
    key: row.key ?? row.tag_key ?? '',
    value: row.value ?? row.tag_value ?? '',
  };
}

export const revalidate = 60;

export async function GET() {
  const supabase = await createClient();

  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('id, slug, name, description, key_points, repo_url, live_url, status, sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true });

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }

  const projectIds = (projectsData ?? []).map((project) => project.id);

  let tagsByProjectId = new Map<string, Array<{ key: string; value: string }>>();

  if (projectIds.length > 0) {
    const primaryTags = await supabase
      .from('project_tags')
      .select('project_id, key, value')
      .in('project_id', projectIds);

    let tagRows: ProjectTagRow[] = [];

    if (!primaryTags.error) {
      tagRows = (primaryTags.data ?? []) as ProjectTagRow[];
    } else if (isMissingKeyColumnError(primaryTags.error.message)) {
      const fallbackTags = await supabase
        .from('project_tags')
        .select('project_id, tag_key, tag_value')
        .in('project_id', projectIds);

      if (fallbackTags.error) {
        return NextResponse.json({ error: fallbackTags.error.message }, { status: 500 });
      }

      tagRows = (fallbackTags.data ?? []) as ProjectTagRow[];
    } else {
      return NextResponse.json({ error: primaryTags.error.message }, { status: 500 });
    }

    tagsByProjectId = tagRows.reduce((acc, row) => {
      const existing = acc.get(row.project_id) ?? [];
      const mapped = mapTagRow(row);
      if (mapped.key && mapped.value) existing.push(mapped);
      acc.set(row.project_id, existing);
      return acc;
    }, new Map<string, Array<{ key: string; value: string }>>());
  }

  const data = (projectsData ?? []).map((project) => ({
    ...project,
    tags: tagsByProjectId.get(project.id) ?? [],
  }));

  return NextResponse.json({ data });
}
