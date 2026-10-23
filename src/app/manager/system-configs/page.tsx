import ManageSystemConfigsClient from './ManageSystemConfigsClient';

export const metadata = {
  title: 'Pengaturan Sistem | Manager',
  description: 'Kelola berbagai konfigurasi statis pada sistem.',
};

export default function SystemConfigsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <ManageSystemConfigsClient />
    </div>
  );
}
