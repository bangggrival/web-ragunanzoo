import { useState, useMemo } from 'react';
import { useAnimals } from './useAnimals';
import { useEvents } from './useEvents';
import { useNews } from './useNews';
import { useVenues } from './useVenues';
import { useLanguage } from '@/contexts/LanguageContext';

export interface SearchResult {
  id: string | number;
  type: 'animal' | 'event' | 'news' | 'venue' | 'page';
  title: string;
  description: string;
  image?: string | null;
  url: string;
}

export function useGlobalSearch(query: string) {
  const { language, getText } = useLanguage();
  const { animals, loading: animalsLoading } = useAnimals();
  const { events, loading: eventsLoading } = useEvents();
  const { news, loading: newsLoading } = useNews();
  const { venues, loading: venuesLoading } = useVenues();

  const isLoading = animalsLoading || eventsLoading || newsLoading || venuesLoading;

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];

    const searchQuery = query.toLowerCase().trim();
    const searchResults: SearchResult[] = [];

    // Search animals
    animals?.forEach((animal) => {
      const match = Object.values(animal).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(searchQuery)
      );

      if (match) {
        searchResults.push({
          id: animal.id,
          type: 'animal',
          title: animal.name,
          description: animal.latin_name || animal.description?.slice(0, 100) || '',
          image: animal.image_url,
          url: `/animals/${animal.id}`,
        });
      }
    });

    // Search events
    events?.forEach((event) => {
      const match = Object.values(event).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(searchQuery)
      );

      if (match) {
        searchResults.push({
          id: event.id,
          type: 'event',
          title: getText(event.title_id, event.title_en, event.title),
          description: getText(event.description_id, event.description_en, event.description || '').slice(0, 100),
          image: event.image_url,
          url: '/events',
        });
      }
    });

    // Search news
    news?.forEach((item) => {
      const match = Object.values(item).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(searchQuery)
      );

      if (match) {
        searchResults.push({
          id: item.id,
          type: 'news',
          title: getText(item.title_id, item.title_en, item.title),
          description: getText(item.description_id, item.description_en, item.description || '').slice(0, 100),
          image: item.image_url,
          url: `/news/${item.id}`,
        });
      }
    });

    // Search venues
    venues?.forEach((venue) => {
      const match = Object.values(venue).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(searchQuery)
      );

      if (match) {
        searchResults.push({
          id: venue.id,
          type: 'venue',
          title: venue.name,
          description: venue.description?.slice(0, 100) || '',
          image: venue.image_url,
          url: '/venues',
        });
      }
    });

    // Search static pages
    const staticPages = [
      { id: 'page-services', title_id: 'Pendaftaran Layanan PKL, Koas, Penelitian & Wawancara', title_en: 'Services Registration', url: '/services', desc_id: 'Layanan pendaftaran magang, praktik kerja lapangan (PKL), koas kedokteran hewan, penelitian akademik, dan wawancara media di Taman Margasatwa Ragunan.', desc_en: 'Registration services for internships, research, veterinary practice, and media interviews.' },
      { id: 'page-tour-guide', title_id: 'Pemandu Wisata (Tour Guide)', title_en: 'Tour Guide', url: '/tour-guide', desc_id: 'Layanan pemandu wisata dan tur edukasi keliling kebun binatang menggunakan kereta wisata atau jalan kaki.', desc_en: 'Tour guide services and educational tours around the zoo.' },
      { id: 'page-tickets', title_id: 'Tiket & Harga Masuk', title_en: 'Tickets & Pricing', url: '/tickets', desc_id: 'Informasi harga tiket masuk pengunjung, tarif parkir kendaraan, cara pembelian tiket online menggunakan JakCard.', desc_en: 'Information about entrance ticket prices, parking fees, and how to buy tickets online.' },
      { id: 'page-map', title_id: 'Peta & Navigasi', title_en: 'Map & Navigation', url: '/map', desc_id: 'Peta interaktif kebun binatang Ragunan untuk memudahkan pengunjung mencari rute menuju kandang satwa atau fasilitas.', desc_en: 'Interactive zoo map to help visitors find routes to animal enclosures or facilities.' },
      { id: 'page-jdih', title_id: 'JDIH (Jaringan Dokumentasi dan Informasi Hukum)', title_en: 'Legal Documents', url: '/jdih', desc_id: 'Dokumen produk hukum, peraturan, kebijakan, surat keputusan, dan perundang-undangan terkait Taman Margasatwa Ragunan.', desc_en: 'Legal documents, regulations, policies, and decrees related to the Zoo.' },
      { id: 'page-library', title_id: 'Perpustakaan Digital', title_en: 'Digital Library', url: '/library', desc_id: 'Koleksi buku elektronik, e-book, jurnal, karya ilmiah, dan majalah tentang satwa, tumbuhan, dan konservasi alam.', desc_en: 'Collection of electronic books, e-books, journals, and magazines about animals and nature.' },
      { id: 'page-wbs', title_id: 'Whistleblowing System (WBS)', title_en: 'Whistleblowing System', url: '/wbs', desc_id: 'Layanan pelaporan pelanggaran, aduan, komplain, atau penyimpangan oleh petugas bagi masyarakat.', desc_en: 'Reporting service for violations, complaints, or irregularities by officers.' },
      { id: 'page-standar-pelayanan', title_id: 'Standar Pelayanan', title_en: 'Service Standards', url: '/standar-pelayanan', desc_id: 'Standar operasional prosedur (SOP) dan maklumat pelayanan publik Taman Margasatwa Ragunan.', desc_en: 'Standard operating procedures and public service announcements.' },
      { id: 'page-history', title_id: 'Sejarah & Tentang Kami', title_en: 'History & About Us', url: '/history', desc_id: 'Sejarah panjang berdirinya Taman Margasatwa Ragunan sejak jaman kolonial Belanda hingga menjadi kebun binatang modern.', desc_en: 'The long history of Ragunan Zoo from the Dutch colonial era to becoming a modern zoo.' },
      { id: 'page-flora', title_id: 'Data Tumbuhan (Flora)', title_en: 'Plants (Flora)', url: '/flora', desc_id: 'Ensiklopedia berbagai jenis pohon, tanaman hias, bunga, dan vegetasi yang hidup di lingkungan kebun binatang.', desc_en: 'Encyclopedia of various types of trees, plants, and vegetation living in the zoo.' },
      { id: 'page-audio-guide', title_id: 'Panduan Suara (Audio Guide)', title_en: 'Audio Guide', url: '/audio-guide', desc_id: 'Dengarkan penjelasan edukatif berupa suara narasi tentang berbagai satwa langka koleksi kebun binatang.', desc_en: 'Listen to educational voice narrations about various rare animals.' },
      { id: 'page-gallery-3d', title_id: 'Galeri Virtual 3D', title_en: '3D Virtual Gallery', url: '/gallery-3d', desc_id: 'Jelajahi kebun binatang secara virtual dalam tampilan 3D 360 derajat yang imersif.', desc_en: 'Explore the zoo virtually in an immersive 360-degree 3D view.' },
    ];

    staticPages.forEach((page) => {
      const match = Object.values(page).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(searchQuery)
      );

      if (match) {
        searchResults.push({
          id: page.id,
          type: 'page',
          title: language === 'en' ? page.title_en : page.title_id,
          description: language === 'en' ? page.desc_en : page.desc_id,
          url: page.url,
        });
      }
    });

    return searchResults;
  }, [query, animals, events, news, venues, language, getText]);

  return { results, isLoading };
}
