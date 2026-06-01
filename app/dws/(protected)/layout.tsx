import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import DwsAutoLogout from '@/components/DwsAutoLogout';

export default async function DwsProtectedLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('dws_session')?.value;

  if (token !== 'dws-active') {
    redirect('/dws/login');
  }

  return (
    <>
      <DwsAutoLogout />
      {children}
    </>
  );
}
