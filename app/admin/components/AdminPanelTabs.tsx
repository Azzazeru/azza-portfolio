'use client';

import { useEffect, useMemo, useState } from 'react';
import CertificationsCrud from './CertificationsCrud';
import ProjectsCrud from './ProjectsCrud';

type AdminTab = 'certifications' | 'projects' | 'listado';

type CertItem = {
  id: string;
  name: string;
  slug: string;
  issuer: string;
  sort_order: number;
};

type ProjectItem = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

function tabButtonClass(active: boolean) {
  return active
    ? 'rounded-lg border border-emerald-400 bg-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-200'
    : 'rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-emerald-400';
}

export default function AdminPanelTabs() {
  const [activeTab, setActiveTab] = useState<AdminTab>('listado');
  const [certifications, setCertifications] = useState<CertItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [certEditId, setCertEditId] = useState<string | null>(null);
  const [projectEditId, setProjectEditId] = useState<string | null>(null);

  const totalItems = useMemo(
    () => certifications.length + projects.length,
    [certifications.length, projects.length]
  );

  async function loadListData() {
    setLoadingList(true);
    setListError(null);

    const [certRes, projectRes] = await Promise.all([
      fetch('/api/admin/certifications', { cache: 'no-store' }),
      fetch('/api/admin/projects', { cache: 'no-store' }),
    ]);

    const certJson = await certRes.json();
    const projectJson = await projectRes.json();

    if (!certRes.ok) {
      setListError(certJson?.error ?? 'No se pudo cargar certificaciones');
      setLoadingList(false);
      return;
    }

    if (!projectRes.ok) {
      setListError(projectJson?.error ?? 'No se pudo cargar proyectos');
      setLoadingList(false);
      return;
    }

    setCertifications(certJson.data ?? []);
    setProjects(projectJson.data ?? []);
    setLoadingList(false);
  }

  useEffect(() => {
    if (activeTab === 'listado') {
      loadListData();
    }
  }, [activeTab]);

  async function deleteCertification(id: string) {
    const confirmed = window.confirm('Seguro que quieres eliminar esta certificacion?');
    if (!confirmed) return;

    const res = await fetch(`/api/admin/certifications/${id}`, { method: 'DELETE' });
    const json = await res.json();

    if (!res.ok) {
      setListError(json?.error ?? 'Error eliminando certificacion');
      return;
    }

    loadListData();
  }

  async function deleteProject(id: string) {
    const confirmed = window.confirm('Seguro que quieres eliminar este proyecto?');
    if (!confirmed) return;

    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    const json = await res.json();

    if (!res.ok) {
      setListError(json?.error ?? 'Error eliminando proyecto');
      return;
    }

    loadListData();
  }

  function goToCertEdit(id: string) {
    setCertEditId(id);
    setActiveTab('certifications');
  }

  function goToProjectEdit(id: string) {
    setProjectEditId(id);
    setActiveTab('projects');
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={tabButtonClass(activeTab === 'certifications')}
            onClick={() => setActiveTab('certifications')}
          >
            Certificaciones
          </button>
          <button
            type="button"
            className={tabButtonClass(activeTab === 'projects')}
            onClick={() => setActiveTab('projects')}
          >
            Proyectos
          </button>
          <button
            type="button"
            className={tabButtonClass(activeTab === 'listado')}
            onClick={() => setActiveTab('listado')}
          >
            Listado
          </button>
        </div>
      </div>

      {activeTab === 'certifications' ? (
        <CertificationsCrud externalEditId={certEditId} />
      ) : null}

      {activeTab === 'projects' ? (
        <ProjectsCrud externalEditId={projectEditId} />
      ) : null}

      {activeTab === 'listado' ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Listado General</h2>
            <p className="mt-1 text-sm text-white/60">{totalItems} registros totales</p>
          </div>

          {listError ? (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
              {listError}
            </div>
          ) : null}

          {loadingList ? <p className="text-white/60">Cargando listado...</p> : null}

          <div className="space-y-3">
            <h3 className="font-semibold">Certificaciones</h3>
            {!loadingList && certifications.length === 0 ? (
              <p className="text-sm text-white/60">Sin certificaciones.</p>
            ) : null}

            {certifications.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-white/60">
                    /{item.slug} · issuer: {item.issuer} · orden: {item.sort_order}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => goToCertEdit(item.id)}
                    className="rounded-md border border-white/20 px-3 py-1 text-sm hover:border-emerald-500"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCertification(item.id)}
                    className="rounded-md border border-red-400/50 px-3 py-1 text-sm text-red-300 hover:bg-red-400/10"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Proyectos</h3>
            {!loadingList && projects.length === 0 ? (
              <p className="text-sm text-white/60">Sin proyectos.</p>
            ) : null}

            {projects.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-white/60">
                    /{item.slug} · orden: {item.sort_order}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => goToProjectEdit(item.id)}
                    className="rounded-md border border-white/20 px-3 py-1 text-sm hover:border-emerald-500"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProject(item.id)}
                    className="rounded-md border border-red-400/50 px-3 py-1 text-sm text-red-300 hover:bg-red-400/10"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}