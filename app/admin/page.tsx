import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminPanelTabs from './components/AdminPanelTabs';

const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'aaron.fuentesdioca@gmail.com';

export default async function AdminPage() {
  const isBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_ADMIN_BYPASS_LOCAL === 'true';

  const supabase = await createClient();

  let userEmail = 'local-bypass';
  if (!isBypass) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect('/admin/login');
    }

    if (user.email !== ADMIN_EMAIL) {
      redirect('/admin/login');
    }

    userEmail = user.email ?? ADMIN_EMAIL;
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
            Admin panel
          </p>
          <h1 className="mt-2 text-3xl font-bold">Hola, {userEmail}</h1>
          <p className="mt-2 text-white/70">
            Este panel ya esta protegido por sesion y correo.
          </p>

          {isBypass ? (
            <p className="mt-3 text-sm text-amber-300">
              Modo bypass local activo (solo desarrollo).
            </p>
          ) : null}

        </header>

        <AdminPanelTabs />
      </div>
    </main>
  );
}