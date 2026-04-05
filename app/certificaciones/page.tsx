import type { Metadata } from 'next';
import CertificationsCatalog from './CertificacionesCatalog';

export const metadata: Metadata = {
  title: 'Certificaciones',
  description: 'Listado completo de certificaciones y credenciales.',
  alternates: {
    canonical: '/certificaciones',
  },
};

export const dynamic = 'force-dynamic';

export default function CertificationsPage() {
  return <CertificationsCatalog />;
}