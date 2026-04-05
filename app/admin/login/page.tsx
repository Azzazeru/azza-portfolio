'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'aaron.fuentesdioca@gmail.com';

export default function AdminLoginPage() {
  const router = useRouter();
  const isBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_ADMIN_BYPASS_LOCAL === 'true';

  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isBypass) {
      router.replace('/admin');
    }
  }, [isBypass, router]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setCooldown((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (cooldown > 0) {
      setMessage(`Espera ${cooldown}s antes de pedir otro enlace.`);
      return;
    }

    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    });

    setLoading(false);

    if (error) {
      const normalizedMessage = error.message.toLowerCase();

      if (
        normalizedMessage.includes('rate limit') ||
        normalizedMessage.includes('too many') ||
        normalizedMessage.includes('email rate limit exceeded')
      ) {
        setMessage(
          'Se alcanzó el límite de envíos. Espera un rato antes de volver a intentar.'
        );
        setCooldown(60);
        return;
      }

      setMessage(error.message);
      return;
    }

    setMessage('Revisa tu correo para abrir el enlace de acceso.');
    setCooldown(60);
  };

  if (isBypass) {
    return (
      <main className="min-h-screen bg-[#0b0f14] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
            Admin access
          </p>
          <h1 className="mt-3 text-3xl font-bold">Bypass activo</h1>
          <p className="mt-2 text-sm text-white/70">
            Estás en desarrollo, así que te mando directo al panel.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
          Admin access
        </p>
        <h1 className="mt-3 text-3xl font-bold">Entrar al panel</h1>
        <p className="mt-2 text-sm text-white/70">
          Usa el enlace de acceso por email para entrar al panel administrativo.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-white/80">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Enviando...'
              : cooldown > 0
                ? `Espera ${cooldown}s`
                : 'Enviar magic link'}
          </button>
        </form>

        {message ? (
          <p className="mt-4 text-sm text-emerald-300">{message}</p>
        ) : null}
      </div>
    </main>
  );
}