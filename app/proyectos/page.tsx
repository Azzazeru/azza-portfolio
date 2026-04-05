import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type ProjectTag = {
  key: string;
  value: string;
};

type ProjectTagRow = {
  project_id: string;
  key?: string;
  value?: string;
  tag_key?: string;
  tag_value?: string;
};

type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  key_points: string[];
  repo_url: string | null;
  live_url: string | null;
  status: string;
  sort_order: number;
  tags?: ProjectTag[];
};

export const metadata: Metadata = {
  title: 'Proyectos',
  description: 'Listado completo de proyectos del portfolio.',
  alternates: {
    canonical: '/proyectos',
  },
};

async function getProjects() {
  const supabase = await createClient();

  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('id, slug, name, description, key_points, repo_url, live_url, status, sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true });

  if (projectsError) {
    return { items: [] as ProjectRow[], error: projectsError.message };
  }

  const projectIds = (projectsData ?? []).map((project) => project.id);
  let tagsByProjectId = new Map<string, ProjectTag[]>();

  if (projectIds.length > 0) {
    const { data: tagsData, error: tagsError } = await supabase
      .from('project_tags')
      .select('project_id, key, value')
      .in('project_id', projectIds);

    if (tagsError) {
      const fallbackTags = await supabase
        .from('project_tags')
        .select('project_id, tag_key, tag_value')
        .in('project_id', projectIds);

      if (fallbackTags.error) {
        return { items: [] as ProjectRow[], error: fallbackTags.error.message };
      }

      tagsByProjectId = ((fallbackTags.data ?? []) as ProjectTagRow[]).reduce(
        (acc, row) => {
          const existing = acc.get(row.project_id) ?? [];
          existing.push({ key: row.tag_key ?? '', value: row.tag_value ?? '' });
          acc.set(row.project_id, existing);
          return acc;
        },
        new Map<string, ProjectTag[]>()
      );
    } else {
      tagsByProjectId = ((tagsData ?? []) as ProjectTagRow[]).reduce((acc, row) => {
        const existing = acc.get(row.project_id) ?? [];
        existing.push({ key: row.key ?? '', value: row.value ?? '' });
        acc.set(row.project_id, existing);
        return acc;
      }, new Map<string, ProjectTag[]>());
    }
  }

  const items = ((projectsData ?? []) as ProjectRow[]).map((project) => ({
    ...project,
    tags: tagsByProjectId.get(project.id) ?? [],
  }));

  return { items, error: null as string | null };
}

export default async function ProjectsPage() {
  const { items, error } = await getProjects();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1A1A1A] px-4 py-16 text-white">
      <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 animate-pulse rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 animate-pulse rounded-full bg-green-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-green-400">$ cd /proyectos</p>
            <p className="mt-1 font-mono text-xs text-cyan-300">$ ls -la --all</p>
            <h1 className="mt-2 bg-gradient-to-r from-green-300 via-cyan-300 to-green-300 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              Proyectos
            </h1>
            <p className="mt-3 inline-flex rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs text-green-200">
              Total cargados: {items.length}
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:border-green-400 hover:text-green-300"
          >
            Volver al inicio
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            Error cargando proyectos: {error}
          </div>
        ) : null}

        {!error && items.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            No hay proyectos publicados para mostrar.
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
          {items.map((project) => (
            <article
              key={project.id}
              className="group flex h-full flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-slate-700/25 via-slate-800/20 to-black/35 p-5 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-green-300/50 hover:shadow-[0_16px_40px_rgba(34,197,94,0.18)]"
            >
              <p className="font-mono text-xs text-green-500/90">$ cat ./projects/{project.slug}.md</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-100 transition group-hover:text-green-300">
                {project.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">{project.description}</p>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-green-300">Puntos clave</h3>
                <ul className="mt-2 space-y-2 text-sm text-gray-300">
                  {(project.key_points ?? []).map((point, index) => (
                    <li key={`${project.id}-point-${index}`} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(project.tags ?? []).map((tag, index) => (
                  <span
                    key={`${project.id}-tag-${index}`}
                    title={`${tag.key}: ${tag.value}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75"
                  >
                    {tag.value}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-6 flex flex-wrap gap-4">
                {project.repo_url ? (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-300 transition hover:text-blue-200"
                  >
                    Ver repositorio →
                  </a>
                ) : null}

                {project.live_url ? (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-300 transition hover:text-emerald-200"
                  >
                    Ver demo →
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
