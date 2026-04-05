'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Certification = {
  id: string;
  slug: string;
  name: string;
  kind: 'certificacion' | 'credencial';
  obtention: 'finalizacion' | 'examen' | 'examen_pagado';
  issuer: string;
  verification_type: 'none' | 'external_url' | 'pdf_file';
  verification_url: string | null;
  image_path: string | null;
  pdf_path: string | null;
  is_public: boolean;
  sort_order: number;
  created_at: string;
};

const initialForm = {
  slug: '',
  name: '',
  kind: 'certificacion' as 'certificacion' | 'credencial',
  obtention: 'finalizacion' as 'finalizacion' | 'examen' | 'examen_pagado',
  issuer: '',
  verification_type: 'none' as 'none' | 'external_url' | 'pdf_file',
  verification_url: '',
  image_path: '',
  pdf_path: '',
  image_file: null as File | null,
  pdf_file: null as File | null,
  sort_order: 0,
};

type CertificationsCrudProps = {
  externalEditId?: string | null;
};

export default function CertificationsCrud({
  externalEditId,
}: CertificationsCrudProps) {
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

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

  function getFileExtension(file: File) {
    const parts = file.name.split('.');
    if (parts.length < 2) return '';

    return parts.pop()?.toLowerCase() ?? '';
  }

  function buildStoragePath(
    bucket: 'cert-images' | 'cert-pdfs',
    slug: string,
    file: File
  ) {
    const extension = getFileExtension(file);
    const suffix = extension ? `.${extension}` : '';

    if (bucket === 'cert-images') {
      return `${slug}${suffix}`;
    }

    return `${slug}-verification${suffix}`;
  }

  function isAllowedImageFile(file: File) {
    return file.type === 'image/avif' || file.type === 'image/webp';
  }

  function getObtentionLabel(value: Certification['obtention']) {
    if (value === 'examen') return 'Examen';
    if (value === 'examen_pagado') return 'Examen pagado';
    return 'Finalizacion';
  }

  async function loadData() {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/admin/certifications', { cache: 'no-store' });
    const json = await res.json();

    if (!res.ok) {
      setError(json?.error ?? 'No se pudo cargar certificaciones');
      setLoading(false);
      return;
    }

    setItems(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setError(null);
  }

  const startEdit = useCallback((item: Certification) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug ?? '',
      name: item.name ?? '',
      kind: item.kind ?? 'certificacion',
      obtention: item.obtention ?? 'finalizacion',
      issuer: item.issuer ?? '',
      verification_type: item.verification_type ?? 'none',
      verification_url: item.verification_url ?? '',
      image_path: item.image_path ?? '',
      pdf_path: item.pdf_path ?? '',
      image_file: null,
      pdf_file: null,
      sort_order: item.sort_order ?? 0,
    });
    setError(null);
  }, []);

  useEffect(() => {
    if (!externalEditId || items.length === 0) return;

    const target = items.find((item) => item.id === externalEditId);
    if (target) {
      const timer = window.setTimeout(() => {
        startEdit(target);
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [externalEditId, items, startEdit]);

  async function uploadFile(
    file: File | null,
    bucket: 'cert-images' | 'cert-pdfs',
    slug: string
  ): Promise<string | null> {
    if (!file) return null;

    setUploading(true);

    const supabase = createClient();
    const filename = buildStoragePath(bucket, slug, file);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, { upsert: true, contentType: file.type });

    setUploading(false);

    if (error) {
      setError(`Error subiendo archivo: ${error.message}`);
      return null;
    }

    return data?.path ?? null;
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.name || !form.issuer || !form.kind || !form.obtention) {
      setError('Nombre, issuer, kind y obtention son obligatorios');
      setSaving(false);
      return;
    }

    if (!form.image_path && !form.image_file) {
      setError('Debes subir una imagen');
      setSaving(false);
      return;
    }

    if (
      form.verification_type === 'external_url' &&
      !form.verification_url
    ) {
      setError('URL de verificación es obligatoria para tipo externa');
      setSaving(false);
      return;
    }

    if (
      form.verification_type === 'pdf_file' &&
      !form.pdf_path &&
      !form.pdf_file
    ) {
      setError('Debes subir un PDF');
      setSaving(false);
      return;
    }

    const slug = normalizeSlug(form.slug && form.slug.trim().length > 0 ? form.slug : form.name);

    let imagePath: string | null = form.image_path || null;
    let pdfPath: string | null = form.pdf_path || null;

    if (form.image_file) {
      const uploadedImagePath = await uploadFile(
        form.image_file,
        'cert-images',
        slug
      );
      if (!uploadedImagePath) {
        setSaving(false);
        return;
      }

      imagePath = uploadedImagePath;
    }

    if (form.pdf_file) {
      const uploadedPdfPath = await uploadFile(form.pdf_file, 'cert-pdfs', slug);
      if (!uploadedPdfPath) {
        setSaving(false);
        return;
      }

      pdfPath = uploadedPdfPath;
    }

    const payload = {
      slug,
      name: form.name,
      kind: form.kind,
      obtention: form.obtention,
      issuer: form.issuer,
      verification_type: form.verification_type,
      verification_url: form.verification_url || null,
      image_path: imagePath,
      pdf_path: pdfPath || null,
      is_public: true,
      sort_order: form.sort_order,
    };

    const endpoint = isEditing
      ? `/api/admin/certifications/${editingId}`
      : '/api/admin/certifications';

    const method = isEditing ? 'PATCH' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    setSaving(false);

    if (!res.ok) {
      setError(json?.error ?? 'Error guardando certificacion');
      return;
    }

    resetForm();
    loadData();
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm(
      'Seguro que quieres eliminar esta certificacion?'
    );
    if (!confirmed) return;

    const res = await fetch(`/api/admin/certifications/${id}`, {
      method: 'DELETE',
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.error ?? 'Error eliminando certificacion');
      return;
    }

    loadData();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-semibold">Certificaciones CRUD</h2>

      {error ? (
        <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <form onSubmit={submitForm} className="mt-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
            placeholder="Nombre *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <select
            className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
            value={form.kind}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                kind: e.target.value as Certification['kind'],
              }))
            }
          >
            <option value="certificacion">Certificacion</option>
            <option value="credencial">Credencial</option>
          </select>

          <select
            className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
            value={form.obtention}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                obtention: e.target.value as Certification['obtention'],
              }))
            }
          >
            <option value="finalizacion">Finalizacion</option>
            <option value="examen">Examen</option>
            <option value="examen_pagado">Examen pagado</option>
          </select>

          <input
            className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
            placeholder="Issuer *"
            value={form.issuer}
            onChange={(e) => setForm((p) => ({ ...p, issuer: e.target.value }))}
            required
          />

          <input
            className="rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
            placeholder="Slug (opcional)"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
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
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-2">
            Imagen * (.avif o .webp)
          </label>
          <input
            className="block w-full text-sm text-white/60 file:rounded-lg file:bg-emerald-500 file:text-black file:px-3 file:py-2 file:border-0 file:cursor-pointer hover:file:bg-emerald-400"
            type="file"
            accept="image/avif,image/webp"
            onChange={(e) =>
              (() => {
                const file = e.target.files?.[0] || null;

                if (!file) {
                  setForm((p) => ({ ...p, image_file: null }));
                  return;
                }

                if (!isAllowedImageFile(file)) {
                  setError('Solo se permiten imágenes .avif o .webp');
                  e.target.value = '';
                  return;
                }

                setForm((p) => ({
                  ...p,
                  image_file: file,
                }));
              })()
            }
          />
          {form.image_path && (
            <p className="mt-2 text-xs text-emerald-300">
              ✓ Imagen: {form.image_path}
            </p>
          )}
          {form.image_file && (
            <p className="mt-2 text-xs text-emerald-300">
              ✓ Nueva imagen: {form.image_file.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-2">
            Tipo de verificacion
          </label>
          <select
            className="w-full rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
            value={form.verification_type}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                verification_type:
                  e.target.value as Certification['verification_type'],
                verification_url: '',
                pdf_file: null,
                pdf_path: '',
              }))
            }
          >
            <option value="none">Sin verificacion</option>
            <option value="external_url">URL externa</option>
            <option value="pdf_file">PDF interno</option>
          </select>
        </div>

        {form.verification_type === 'external_url' ? (
          <div>
            <label className="block text-sm text-white/80 mb-2">
              URL de verificacion *
            </label>
            <input
              className="w-full rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:border border-emerald-500"
              type="url"
              placeholder="https://..."
              value={form.verification_url}
              onChange={(e) =>
                setForm((p) => ({ ...p, verification_url: e.target.value }))
              }
              required
            />
          </div>
        ) : null}

        {form.verification_type === 'pdf_file' ? (
          <div>
            <label className="block text-sm text-white/80 mb-2">
              PDF *
            </label>
            <input
              className="block w-full text-sm text-white/60 file:rounded-lg file:bg-emerald-500 file:text-black file:px-3 file:py-2 file:border-0 file:cursor-pointer hover:file:bg-emerald-400"
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  pdf_file: e.target.files?.[0] || null,
                }))
              }
            />
            {form.pdf_path && (
              <p className="mt-2 text-xs text-emerald-300">
                ✓ PDF: {form.pdf_path}
              </p>
            )}
            {form.pdf_file && (
              <p className="mt-2 text-xs text-emerald-300">
                ✓ Nuevo PDF: {form.pdf_file.name}
              </p>
            )}
          </div>
        ) : null}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading
              ? 'Subiendo archivos...'
              : saving
                ? 'Guardando...'
                : isEditing
                  ? 'Actualizar'
                  : 'Crear'}
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
          <p className="text-white/60">Sin certificaciones aun.</p>
        ) : null}

        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3"
          >
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-white/60">
                {item.kind} · {getObtentionLabel(item.obtention)} · {item.issuer}
              </p>
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