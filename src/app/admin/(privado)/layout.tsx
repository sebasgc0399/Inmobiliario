import { obtenerAdminAuth } from '@/lib/firebase/admin';
import ShellAdmin from '@/components/admin/ShellAdmin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const runtime = 'nodejs';

const NOMBRE_COOKIE_SESION = '__session';

interface LayoutPrivadoAdminProps {
  children: ReactNode;
}

export default async function LayoutPrivadoAdmin({
  children,
}: LayoutPrivadoAdminProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(NOMBRE_COOKIE_SESION)?.value;

  if (!sessionCookie) {
    redirect('/admin/login');
  }

  let email = 'admin';

  try {
    const tokenDecodificado = await obtenerAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );

    if (tokenDecodificado.admin !== true) {
      redirect('/admin/login');
    }

    email = tokenDecodificado.email ?? 'admin';
  } catch {
    redirect('/admin/login');
  }

  return <ShellAdmin email={email}>{children}</ShellAdmin>;
}
