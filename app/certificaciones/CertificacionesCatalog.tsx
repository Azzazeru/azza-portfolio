'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type PublicCertification = {
  slug: string;
  name: string;
  kind: 'certificacion' | 'credencial';
  issuer: string;
  image: string;
  url: string | null;
  sort_order: number;
};

type ApiResponse = {
  data?: PublicCertification[];
  hasMore?: boolean;
  error?: string;
};

const PAGE_SIZE = 8;

function shuffleItems<T>(items: T[]) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getFilterLabel(kind: 'all' | 'certificacion' | 'credencial') {
  if (kind === 'certificacion') return 'Certificaciones';
  if (kind === 'credencial') return 'Credenciales';
  return 'Todas';
}

function getFilterCommand(kind: 'all' | 'certificacion' | 'credencial') {
  if (kind === 'certificacion') return '$ ls -la ./certificaciones';
  if (kind === 'credencial') return '$ ls -la ./credenciales';
  return '$ ls -la --all';
}

export default function CertificationsCatalog() {
  const searchParams = useSearchParams();
  const activeFilter = useMemo(() => {
    const rawTipo = searchParams.get('tipo');
    if (rawTipo === 'certificacion' || rawTipo === 'credencial') return rawTipo;
    return 'all' as const;
  }, [searchParams]);

  const [items, setItems] = useState<PublicCertification[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoadingInitial(true);
      setLoadingMore(false);
      setError(null);
      setItems([]);
      setOffset(0);
      setHasMore(true);

      const query = new URLSearchParams({ limit: String(PAGE_SIZE), offset: '0' });
      if (activeFilter !== 'all') {
        query.set('tipo', activeFilter);
      }

      const response = await fetch(`/api/public/certifications?${query.toString()}`, {
        cache: 'no-store',
      });
      const json = (await response.json()) as ApiResponse;

      if (cancelled) return;

      if (!response.ok) {
        setError(json?.error ?? 'No se pudieron cargar certificaciones');
        setLoadingInitial(false);
        return;
      }

      const shuffled = shuffleItems(json.data ?? []);
      setItems(shuffled);
      setHasMore(Boolean(json.hasMore));
      setOffset(PAGE_SIZE);
      setLoadingInitial(false);
    }

    loadInitial();

    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  async function loadMore() {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    setError(null);

    const query = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    if (activeFilter !== 'all') {
      query.set('tipo', activeFilter);
    }

    const response = await fetch(`/api/public/certifications?${query.toString()}`, {
      cache: 'no-store',
    });
    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      setError(json?.error ?? 'No se pudieron cargar mas certificaciones');
      setLoadingMore(false);
      return;
    }

    const shuffled = shuffleItems(json.data ?? []);
    setItems((prev) => [...prev, ...shuffled]);
    setHasMore(Boolean(json.hasMore));
    setOffset((prev) => prev + PAGE_SIZE);
    setLoadingMore(false);
  }

  const totalLabel = items.length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1A1A1A] px-4 py-16 text-white">
      <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 animate-pulse rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 animate-pulse rounded-full bg-green-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-green-400">$ cd /certificaciones</p>
            <p className="mt-1 font-mono text-xs text-cyan-300">{getFilterCommand(activeFilter)}</p>
            <h1 className="mt-2 bg-gradient-to-r from-green-300 via-cyan-300 to-green-300 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              Certificaciones y Credenciales
            </h1>
            <p className="mt-3 inline-flex rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs text-green-200">
              {getFilterLabel(activeFilter)}: {totalLabel}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/certificaciones"
                className={`rounded-full border px-3 py-1 text-xs transition ${activeFilter === 'all'
                    ? 'border-cyan-300/60 bg-cyan-300/20 text-cyan-200'
                    : 'border-white/20 text-white/70 hover:border-cyan-300/50 hover:text-cyan-200'
                  }`}
              >
                Todas
              </Link>
              <Link
                href="/certificaciones?tipo=certificacion"
                className={`rounded-full border px-3 py-1 text-xs transition ${activeFilter === 'certificacion'
                    ? 'border-green-300/60 bg-green-300/20 text-green-200'
                    : 'border-white/20 text-white/70 hover:border-green-300/50 hover:text-green-200'
                  }`}
              >
                Certificaciones
              </Link>
              <Link
                href="/certificaciones?tipo=credencial"
                className={`rounded-full border px-3 py-1 text-xs transition ${activeFilter === 'credencial'
                    ? 'border-emerald-300/60 bg-emerald-300/20 text-emerald-200'
                    : 'border-white/20 text-white/70 hover:border-emerald-300/50 hover:text-emerald-200'
                  }`}
              >
                Credenciales
              </Link>
            </div>
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
            Error cargando certificaciones: {error}
          </div>
        ) : null}

        {!error && !loadingInitial && items.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            No hay resultados para el filtro seleccionado.
          </div>
        ) : null}

        {loadingInitial ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            Cargando certificaciones...
          </div>
        ) : null}

        <section className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((cert) => (
            <article
              key={`${cert.slug}-${cert.sort_order}`}
              className="group flex h-full min-h-[19.5rem] flex-col rounded-xl border border-white/10 bg-gradient-to-b from-slate-700/25 via-slate-800/20 to-black/35 p-5 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-green-300/50 hover:shadow-[0_16px_40px_rgba(34,197,94,0.18)]"
            >
              <div className="mb-3 flex h-28 items-center justify-center rounded-lg border border-white/10 bg-black/30 p-3 transition group-hover:border-green-300/30">
                {cert.image ? (
                  <Image
                    src={cert.image}
                    alt={cert.name}
                    width={140}
                    height={112}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-xs text-white/50">Sin imagen</span>
                )}
              </div>

              <h2 className="line-clamp-2 text-base font-semibold text-green-200 transition group-hover:text-green-100">
                {cert.name}
              </h2>
              <p className="mt-1 text-xs text-white/50">/{cert.slug}</p>
              <p className="mt-2 text-sm text-white/80">{cert.issuer}</p>

              <div className="mt-auto flex justify-center pt-4">
                {cert.url ? (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-md border border-green-400/50 px-3 py-1.5 text-xs text-green-300 transition hover:border-green-300 hover:bg-green-400/10"
                  >
                    {cert.kind === 'credencial'
                      ? 'Verificar credencial'
                      : 'Verificar certificacion'}
                  </a>
                ) : (
                  <span className="inline-flex cursor-not-allowed rounded-md border border-white/20 px-3 py-1.5 text-xs text-white/40">
                    Sin enlace de verificacion
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>

        {hasMore ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-lg border border-green-400/40 bg-green-500/10 px-5 py-2.5 text-sm text-green-300 transition hover:border-green-300 hover:bg-green-500/20 hover:text-green-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore ? 'Cargando mas...' : 'Cargar mas'}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
