import ManageFeedingSchedulesClient from './ManageFeedingSchedulesClient';

export const metadata = {
  title: 'Manajemen Jadwal Makan Satwa | Manager',
  description: 'Kelola jadwal makan satwa untuk pengunjung',
};

export default function FeedingSchedulesPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <ManageFeedingSchedulesClient />
    </div>
  );
}
