import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function DwsProtectedLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('dws_session')?.value;

  const expected = process.env.DWS_SESSION_TOKEN ?? 'dws-fallback-token';
  if (token !== expected) {
    redirect('/dws/login');
  }

  return <>{children}</>;
}
