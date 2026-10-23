import ManageTriviaClient from './ManageTriviaClient';

export const metadata = {
  title: 'Manajemen Kuis Edukasi | Manager',
  description: 'Kelola fakta menarik (trivia) untuk kuis interaktif',
};

export default function TriviaPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <ManageTriviaClient />
    </div>
  );
}
