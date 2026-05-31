import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function DwsProtectedLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('dws_session')?.value;

  if (token !== process.env.DWS_SESSION_TOKEN) {
    redirect('/dws/login');
  }

  return <>{children}</>;
}
