'use client';

import { useEffect, useMemo, useState } from 'react';

type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  key_points: string[];
  repo_url: string | null;
  live_url: string | null;
  featured: boolean;
  published: boolean;
  status: string;
  sort_order: number;
  created_at: string;
  tags?: Array<{ key: string; value: string }>;
  project_type_ids?: string[];
  project_types?: Array<{ id: string; label: string }>;
};

type ProjectType = {
  id: string;
  label: string;
};

const DEFAULT_STATUS_OPTIONS: string[] = ['draft', 'active', 'archived'];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  archived: 'Archivado',
};

function getStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

const initialForm = {
  name: '',
  slug: '',
  description: '',
  key_points: [''],
  repo_url: '',
  live_url: '',
  status: 'draft',
  sort_order: 0,
  tags: [{ key: '', value: '' }],
  project_type_ids: [] as string[],
};

type ProjectsCrudProps = {
  externalEditId?: string | null;
};

export default function ProjectsCrud({ externalEditId }: ProjectsCrudProps) {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [apiStatusOptions, setApiStatusOptions] = useState<string[]>([]);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const statusOptions = useMemo(() => {
    const existingStatuses = items
      .map((item) => item.status)
      .filter((status) => Boolean(status));

    const allOptions = new Set([
      ...DEFAULT_STATUS_OPTIONS,
      ...apiStatusOptions,
      ...existingStatuses,
    ]);

    if (form.status) {
      allOptions.add(form.status);
    }

    return Array.from(allOptions);
  }, [apiStatusOptions, form.status, items]);

  async function loadData() {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/admin/projects', { cache: 'no-store' });
    const json = await res.json();

    if (!res.ok) {
      setError(json?.error ?? 'No se pudo cargar proyectos');
      setLoading(false);
      return;
    }

    setItems(
      (json.data ?? []).map((item: Project) => ({
        ...item,
        project_type_ids: (item.project_type_ids ?? []).map((id) => String(id)),
      }))
    );
    setProjectTypes(
      (json.types ?? []).map((type: ProjectType) => ({
        ...type,
        id: String(type.id),
      }))
    );
    setApiStatusOptions(json.statusOptions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!externalEditId || items.length === 0) return;

    const target = items.find((item) => item.id === externalEditId);
    if (target) {
      startEdit(target);
    }
  }, [externalEditId, items]);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setError(null);
  }

  function startEdit(item: Project) {
    setEditingId(item.id);
    setForm({
      name: item.name ?? '',
      slug: item.slug ?? '',
      description: item.description ?? '',
      key_points:
        item.key_points && item.key_points.length > 0 ? item.key_points : [''],
      repo_url: item.repo_url ?? '',
      live_url: item.live_url ?? '',
      status: item.status ?? '',
      sort_order: item.sort_order ?? 0,
      tags:
        item.tags && item.tags.length > 0
          ? item.tags.map((tag) => ({ key: tag.key, value: tag.value }))
          : [{ key: '', value: '' }],
      project_type_ids: (item.project_type_ids ?? []).map((id) => String(id)),
    });
    setError(null);
  }

  function toggleProjectType(projectTypeId: string) {
    setForm((prev) => {
      const exists = prev.project_type_ids.includes(projectTypeId);
      return {
        ...prev,
        project_type_ids: exists
          ? prev.project_type_ids.filter((id) => id !== projectTypeId)
          : [...prev.project_type_ids, projectTypeId],
      };
    });
  }

  function addTagRow() {
    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, { key: '', value: '' }],
    }));
  }

  function updateTagRow(index: number, field: 'key' | 'value', value: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.map((tag, currentIndex) =>
        currentIndex === index ? { ...tag, [field]: value } : tag
      ),
    }));
  }

  function removeTagRow(index: number) {
    setForm((prev) => {
      const nextTags = prev.tags.filter((_, currentIndex) => currentIndex !== index);

      return {
        ...prev,
        tags: nextTags.length > 0 ? nextTags : [{ key: '', value: '' }],
      };
    });
  }

  function addKeyPointRow() {
    setForm((prev) => ({
      ...prev,
      key_points: [...prev.key_points, ''],
    }));
  }

  function updateKeyPointRow(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      key_points: prev.key_points.map((point, currentIndex) =>
        currentIndex === index ? value : point
      ),
    }));
  }

  function removeKeyPointRow(index: number) {
    setForm((prev) => {
      const nextPoints = prev.key_points.filter((_, currentIndex) => currentIndex !== index);

      return {
        ...prev,
        key_points: nextPoints.length > 0 ? nextPoints : [''],
      };
    });
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.name) {
      setError('El nombre es obligatorio');
      setSaving(false);
      return;
    }

    if (!form.description.trim()) {
      setError('La descripcion es obligatoria');
      setSaving(false);
      return;
    }

    if (!form.status.trim()) {
      setError('El status es obligatorio');
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      key_points: form.key_points,
      repo_url: form.repo_url || null,
      live_url: form.live_url || null,
      featured: false,
      published: true,
      status: form.status,
      sort_order: form.sort_order,
      tags: form.tags,
      project_type_ids: form.project_type_ids,
    };

    const endpoint = isEditing
      ? `/api/admin/projects/${editingId}`
      : '/api/admin/projects';

    const method = isEditing ? 'PATCH' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    setSaving(false);

    if (!res.ok) {
      setError(json?.error ?? 'Error guardando proyecto');
      return;
    }

    resetForm();
    loadData();
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm('Seguro que quieres eliminar este proyecto?');
    if (!confirmed) return;

    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.error ?? 'Error eliminando proyecto');
      return;
    }

    loadData();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-semibold">Proyectos CRUD</h2>

      {error ? (
        <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <form onSubmit={submitForm} className="mt-5 space-y-5">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <h3 className="text-sm font-semibold text-white/80">Datos base</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
              placeholder="Nombre *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />

            <input
              className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
              placeholder="Slug (opcional)"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            />

            <select
              className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              required
            >
              <option value="" disabled>
                Selecciona un estado
              </option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>

            <input
              className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
              type="url"
              placeholder="Repo URL (opcional)"
              value={form.repo_url}
              onChange={(e) => setForm((p) => ({ ...p, repo_url: e.target.value }))}
            />

            <input
              className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
              type="url"
              placeholder="Live URL (opcional)"
              value={form.live_url}
              onChange={(e) => setForm((p) => ({ ...p, live_url: e.target.value }))}
            />

            <input
              className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
              type="number"
              placeholder="Orden (opcional)"
              value={form.sort_order}
              onChange={(e) =>
                setForm((p) => ({ ...p, sort_order: Number(e.target.value) || 0 }))
              }
            />

            <textarea
              className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500 md:col-span-2 min-h-28"
              placeholder="Descripcion *"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/80">Puntos clave</h3>
            <button
              type="button"
              onClick={addKeyPointRow}
              className="rounded-md border border-white/20 px-3 py-1 text-xs hover:border-emerald-500"
            >
              Agregar punto
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {form.key_points.map((point, index) => (
              <div key={`kp-${index}`} className="grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
                  placeholder={`Punto clave ${index + 1}`}
                  value={point}
                  onChange={(e) => updateKeyPointRow(index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeKeyPointRow(index)}
                  className="h-10 rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <h3 className="text-sm font-semibold text-white/80">Tipo de proyecto</h3>
          {projectTypes.length === 0 ? (
            <p className="mt-3 text-xs text-white/50">No hay tipos cargados en project_types.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {projectTypes.map((type) => {
                const active = form.project_type_ids.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleProjectType(type.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${active
                      ? 'border-emerald-400 bg-emerald-400/20 text-emerald-200'
                      : 'border-white/20 text-white/70 hover:border-emerald-400'
                      }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/80">Tags (clave-valor)</h3>
            <button
              type="button"
              onClick={addTagRow}
              className="rounded-md border border-white/20 px-3 py-1 text-xs hover:border-emerald-500"
            >
              Agregar tag
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {form.tags.map((tag, index) => (
              <div
                key={`tag-${index}`}
                className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
                  placeholder="Clave (ej: stack)"
                  value={tag.key}
                  onChange={(e) => updateTagRow(index, 'key', e.target.value)}
                />
                <input
                  className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
                  placeholder="Valor (ej: nextjs)"
                  value={tag.value}
                  onChange={(e) => updateTagRow(index, 'value', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeTagRow(index)}
                  className="h-10 rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <h3 className="text-sm font-semibold text-white/80">Publicacion</h3>
          <p className="mt-1 text-xs text-white/60">
            Todos los proyectos se guardan como publicados y no destacados.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>

          {isEditing ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-white/20 px-4 py-2"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-8 space-y-2">
        <h3 className="font-semibold">Lista actual</h3>
        {loading ? <p className="text-white/60">Cargando...</p> : null}
        {!loading && items.length === 0 ? (
          <p className="text-white/60">Sin proyectos aun.</p>
        ) : null}

        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3"
          >
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-white/60">
                /{item.slug}
              </p>
              <p className="mt-1 text-xs text-white/50">status: {item.status}</p>
              <p className="mt-1 text-xs text-white/50 line-clamp-2">{item.description}</p>
              {item.key_points && item.key_points.length > 0 ? (
                <p className="mt-1 text-xs text-white/40">
                  puntos: {item.key_points.length}
                </p>
              ) : null}
              {item.tags && item.tags.length > 0 ? (
                <p className="mt-1 text-xs text-white/50">
                  {item.tags.map((tag) => `${tag.key}:${tag.value}`).join(' · ')}
                </p>
              ) : null}
              {item.project_types && item.project_types.length > 0 ? (
                <p className="mt-1 text-xs text-emerald-300/80">
                  tipos: {item.project_types.map((type) => type.label).join(' · ')}
                </p>
              ) : null}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => startEdit(item)}
                className="rounded-md border border-white/20 px-3 py-1 text-sm hover:border-emerald-500"
              >
                Editar
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="rounded-md border border-red-400/50 px-3 py-1 text-sm text-red-300 hover:bg-red-400/10"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}