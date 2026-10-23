import { redirect } from 'next/navigation';

export default function PerpustakaanRedirect() {
  redirect('/manager/library');
}
