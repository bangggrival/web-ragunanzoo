'use client';

import React, { useState } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';

export interface AnimalFunFactsCardProps {
  animalName: string;
  species?: string | null;
  habitat?: string | null;
  categoryName?: string | null;
  className?: string;
  onOpenQuiz?: () => void;
}

interface FactTopic {
  id: 'diet' | 'habitat' | 'traits' | 'conservation';
  labelId: string;
  labelEn: string;
  icon: React.ReactNode;
}

export default function AnimalFunFactsCard({
  animalName,
  species,
  habitat,
  categoryName,
  className = '',
  onOpenQuiz,
}: AnimalFunFactsCardProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState<'diet' | 'habitat' | 'traits' | 'conservation'>('diet');

  // Deteksi profil satwa untuk konten spesifik
  const lowerName = animalName.toLowerCase();

  const animalFacts = React.useMemo(() => {
    // 1. Harimau Sumatera
    if (lowerName.includes('harimau') || lowerName.includes('tiger')) {
      return {
        diet: {
          titleId: 'Karnivora Puncak Hutan Tropis',
          titleEn: 'Apex Predator of the Rainforest',
          descId: 'Membutuhkan 5-7 kg daging segar setiap hari di Ragunan. Di alam liar, mereka berburu rusa, babi hutan, dan kijang secara senyap pada malam hari (nokturnal).',
          descEn: 'Requires 5-7 kg of fresh meat daily at Ragunan. In the wild, they stealthily hunt deer, wild boars, and muntjacs primarily at night.',
          highlightId: 'Punya cakar tajam sepanjang 10 cm yang dapat ditarik masuk sempurna.',
          highlightEn: 'Possesses 10 cm retractable claws that stay razor sharp.',
        },
        habitat: {
          titleId: 'Penjelajah Rimba Sumatera',
          titleEn: 'Sumatran Rainforest Roamer',
          descId: 'Menghuni hutan dataran rendah hingga pegunungan tinggi di Pulau Sumatera. Harimau Sumatera sangat mahir berenang dan sering berendam di air dingin untuk mendinginkan tubuh.',
          descEn: 'Inhabits lowland to mountainous rainforests across Sumatra. Unlike most cats, they are exceptional swimmers and love cooling off in river pools.',
          highlightId: 'Wilayah jelajah satu individu dapat mencapai 100 kilometer persegi.',
          highlightEn: 'A single home range can span over 100 square kilometers.',
        },
        traits: {
          titleId: 'Loreng Unik Seperti Sidik Jari',
          titleEn: 'Stripes Unique Like Fingerprints',
          descId: 'Pola garis hitam pada Harimau Sumatera paling rapat di antara seluruh subspesies harimau di dunia, berfungsi sebagai kamuflase sempurna di lebatnya ilalang hutan tropis.',
          descEn: 'Has the densest stripe pattern of all tiger subspecies worldwide, providing flawless camouflage in thick tropical undergrowth.',
          highlightId: 'Penglihatan malam hari 6 kali lebih tajam daripada mata manusia.',
          highlightEn: 'Night vision is 6 times sharper than that of a human.',
        },
        conservation: {
          titleId: 'Satwa Kritis Prioritas Konservasi Nasional',
          titleEn: 'Critically Endangered Conservation Priority',
          descId: 'Hanya tersisa kurang dari 400 individu di habitat aslinya. Ragunan Zoo berperan aktif dalam program penangkaran terencana (studbook breeding) untuk mencegah kepunahan total.',
          descEn: 'Fewer than 400 individuals remain in the wild. Ragunan Zoo plays a key role in captive studbook breeding programs to prevent total extinction.',
          highlightId: 'Status: Kritis (Critically Endangered - IUCN Red List).',
          highlightEn: 'Status: Critically Endangered on the IUCN Red List.',
        },
      };
    }

    // 2. Gajah Sumatera
    if (lowerName.includes('gajah') || lowerName.includes('elephant')) {
      return {
        diet: {
          titleId: 'Mega-Herbivora Pemakan Tumbuhan',
          titleEn: 'Mega-Herbivore Plant Grazer',
          descId: 'Gajah dewasa mengonsumsi hingga 150-200 kg rumput, pelepah kelapa, tebu, dan buah-buahan serta meminum lebih dari 100 liter air segar setiap harinya.',
          descEn: 'Adult elephants consume up to 150-200 kg of grasses, palm fronds, sugarcane, and fruits alongside over 100 liters of fresh water daily.',
          highlightId: 'Menghabiskan 16 jam per hari hanya untuk mengunyah makanan.',
          highlightEn: 'Spends up to 16 hours every day simply foraging and eating.',
        },
        habitat: {
          titleId: 'Insinyur Ekosistem Hutan',
          titleEn: 'Rainforest Ecosystem Engineer',
          descId: 'Berjalan dalam kelompok keluarga matriarkal melintasi koridor hutan dataran rendah. Kotorannya menyebarkan biji-bijian pohon besar ke seluruh penjuru hutan.',
          descEn: 'Travels in matriarchal family herds through lowland forest corridors. Their dung disperses seeds of giant trees throughout the forest canopy.',
          highlightId: 'Jejak langkah gajah menciptakan jalur jalan bagi satwa rimba lainnya.',
          highlightEn: 'Elephant pathways create walking routes for many other forest species.',
        },
        traits: {
          titleId: 'Belalai Multifungsi 40.000 Otot',
          titleEn: 'Multi-functional Trunk with 40,000 Muscles',
          descId: 'Belalai gajah tidak bertulang sama sekali, tersusun atas puluhan ribu serat otot yang sangat kuat namun cukup sensitif untuk memungut sebutir kacang kecil.',
          descEn: 'The elephant trunk has no bones, comprising tens of thousands of muscle fascicles strong enough to uproot trees yet sensitive enough to pick a peanut.',
          highlightId: 'Berkomunikasi jarak jauh menggunakan getaran infrasonik di tanah.',
          highlightEn: 'Communicates across miles using seismic infrasound vibrations.',
        },
        conservation: {
          titleId: 'Perlindungan Koridor Satwa Ragunan',
          titleEn: 'Ragunan Wildlife Protection Effort',
          descId: 'Ragunan memelihara gajah dengan perawatan kuku rutin, kolam pemandian luas, dan program pengayaan (enrichment) teka-teki makanan demi kesehatan mental satwa.',
          descEn: 'Ragunan provides routine footpad care, spacious bathing lagoons, and cognitive puzzle feeding enrichment to keep elephants thriving.',
          highlightId: 'Populasi liar terfragmentasi akibat perkebunan sawit monokultur.',
          highlightEn: 'Wild population is fragmented heavily by monoculture plantations.',
        },
      };
    }

    // 3. Orangutan
    if (lowerName.includes('orangutan') || lowerName.includes('bekantan') || lowerName.includes('primata')) {
      return {
        diet: {
          titleId: 'Pemakan Buah Hutan (Frugivora)',
          titleEn: 'Wild Rainforest Frugivore',
          descId: 'Menyukai buah ara (ficus), durian hutan, pucuk daun muda, kulit kayu manis, serta sesekali rayap atau madu lebah hutan sebagai sumber protein alami.',
          descEn: 'Feeds primarily on wild figs, forest durians, young shoots, sweet bark, and occasionally termites or wild honey for natural protein.',
          highlightId: 'Mampu mengingat lokasi ratusan pohon berbuah di hutan luas.',
          highlightEn: 'Can memorize the location and fruiting cycles of hundreds of jungle trees.',
        },
        habitat: {
          titleId: 'Kanopi Pohon Hutan Hujan Tropis',
          titleEn: 'Tropical Rainforest Tree Canopy',
          descId: 'Hampir 90% waktu hidupnya dihabiskan di atas dahan pohon (arboreal). Setiap sore mereka membuat sarang tidur baru dari ranting berdaun empuk.',
          descEn: 'Spends over 90% of life high up in tree branches (arboreal). Every evening, they construct a fresh leafy sleeping nest.',
          highlightId: 'Pusat Primata Schmutzer di Ragunan adalah salah satu fasilitas primata terbaik dunia.',
          highlightEn: 'The Schmutzer Primate Center at Ragunan is world-renowned.',
        },
        traits: {
          titleId: 'Kecerdasan Tinggi & DNA 97% Mirip Manusia',
          titleEn: 'High Intelligence & 97% Human DNA Overlap',
          descId: 'Mampu menggunakan ranting sebagai alat pengambil madu atau daun lebar sebagai payung alami saat hujan lebat di kanopi hutan.',
          descEn: 'Documented using sticks as toolsets to harvest honey and broad leaves as natural umbrellas during heavy tropical downpours.',
          highlightId: 'Rentang kedua lengannya mencapai lebih dari 2 meter panjangnya.',
          highlightEn: 'Arm span can exceed 2 meters from fingertip to fingertip.',
        },
        conservation: {
          titleId: 'Penyelamatan & Konservasi Genetik',
          titleEn: 'Genetic Rescue & Rehabilitation',
          descId: 'Ragunan bekerja sama dengan balai konservasi untuk merawat primata sitaan dan mempertahankan keragaman genetik satwa endemik Nusantara.',
          descEn: 'Ragunan partners with national conservation centers to nurture rescued primates and maintain genetic resilience.',
          highlightId: 'Masa asuh induk ke anak mencapai 7-8 tahun (terlama di mamalia).',
          highlightEn: 'Maternal nursing lasts 7-8 years (longest of any non-human mammal).',
        },
      };
    }

    // 4. Burung / Elang Jawa / Cenderawasih
    if (lowerName.includes('burung') || lowerName.includes('elang') || lowerName.includes('cenderawasih') || lowerName.includes('bird')) {
      return {
        diet: {
          titleId: 'Pola Makan Spesifik Spesies',
          titleEn: 'Specialized Species Diet',
          descId: 'Elang memangsa mamalia kecil dan reptil, sedangkan Cenderawasih memakan nektar bunga hutan dan buah berri ranum penuh antioksidan.',
          descEn: 'Raptors prey on small mammals and reptiles, while Birds of Paradise feed on canopy floral nectar and wild antioxidant-rich berries.',
          highlightId: 'Pencernaan cepat dan efisien mendukung mobilitas terbang tinggi.',
          highlightEn: 'Rapid and efficient digestion optimized for airborne mobility.',
        },
        habitat: {
          titleId: 'Hutan Primer Lereng Pegunungan',
          titleEn: 'Primary Mountain Slope Forests',
          descId: 'Menghuni kanopi pepohonan purba yang tenang dan terhindar dari kebisingan kota, kini dilestarikan di kubah Aviari Ragunan yang rimbun.',
          descEn: 'Inhabits ancient, undisturbed old-growth canopy now preserved in Ragunan’s lush walk-in Aviary dome.',
          highlightId: 'Elang Jawa merupakan inspirasi lambang negara Garuda Pancasila.',
          highlightEn: 'The Javan Hawk-Eagle inspired Indonesia’s national emblem Garuda.',
        },
        traits: {
          titleId: 'Ketajaman Mata & Bulu Menawan',
          titleEn: 'Precision Optics & Mesmerizing Plumage',
          descId: 'Mata elang mampu mengunci gerakan tikus dari ketinggian ratusan meter. Sementara Cenderawasih memiliki tarian kawin tercantik di dunia satwa.',
          descEn: 'Eagle eyesight can spot small movements from hundreds of meters aloft. Birds of paradise boast the world’s most elaborate courtship dances.',
          highlightId: 'Tulang berongga (pneumatik) menjadikan bobot tubuh sangat ringan.',
          highlightEn: 'Pneumatic hollow bones keep their body weight exceptionally light.',
        },
        conservation: {
          titleId: 'Perlindungan Satwa Langka Nasional',
          titleEn: 'National Rare Wildlife Sanctuary',
          descId: 'Aviari Ragunan mendukung penangkaran burung langka dan edukasi pengunjung mengenai bahaya perburuan liar satwa bersayap.',
          descEn: 'Ragunan’s sanctuary fosters captive breeding of endangered avian fauna and raises awareness against illegal songbird trapping.',
          highlightId: 'Dilindungi penuh oleh Peraturan Pemerintah No. 7 Tahun 1999.',
          highlightEn: 'Fully protected under Indonesian Government Regulation No. 7/1999.',
        },
      };
    }

    // Fallback satwa umum (Komodo, Beruang, Jerapah, dll)
    return {
      diet: {
        titleId: 'Nutrisi Khusus Ragunan Zoo',
        titleEn: 'Custom Ragunan Zoo Nutrition',
        descId: `Kebutuhan pakan harian ${animalName} ditakar secara presisi oleh tim dokter hewan dan ahli nutrisi satwa Ragunan untuk meniru gizi aslinya di alam bebas.`,
        descEn: `Daily nutritional needs of the ${animalName} are calculated with precision by Ragunan’s veterinarians to mirror their wild dietary profile.`,
        highlightId: 'Pemeriksaan kualitas pakan segar dilakukan setiap pagi.',
        highlightEn: 'Fresh feed quality inspection is conducted every morning.',
      },
      habitat: {
        titleId: 'Replika Ekosistem Alami',
        titleEn: 'Naturalistic Habitat Replica',
        descId: `Kandang terbuka ${animalName} dirancang dengan pepohonan pelindung, bebatuan alami, dan kolam air agar satwa merasa seperti di habitat aslinya di ${habitat || 'Indonesia'}.`,
        descEn: `The open enclosure is landscaped with shade trees, authentic boulders, and water pools to replicate natural biome conditions in ${habitat || 'Indonesia'}.`,
        highlightId: 'Dilengkapi fasilitas perawatan suhu dan kelembaban ideal.',
        highlightEn: 'Equipped with thermal and humidity conditioning shelters.',
      },
      traits: {
        titleId: 'Adaptasi Biologis Luar Biasa',
        titleEn: 'Extraordinary Biological Adaptation',
        descId: `Spesies ini memiliki adaptasi fisiologis yang memungkinkannya bertahan dari perubahan iklim tropis dan bersaing secara seimbang dalam jaring makanan alami.`,
        descEn: `This species evolved specialized physiological traits enabling it to withstand tropical climate swings and maintain ecosystem balance.`,
        highlightId: 'Masing-masing individu memiliki kebiasaan dan karakter kepribadian unik.',
        highlightEn: 'Each individual displays distinct personality traits and behaviors.',
      },
      conservation: {
        titleId: 'Misi Konservasi Berkelanjutan',
        titleEn: 'Sustainable Conservation Mission',
        descId: `Sebagai lembaga konservasi terkemuka, Ragunan Zoo menjaga populasi ${animalName} dari ancaman kepunahan habitat serta mendidik masyarakat tentang keanekaragaman hayati.`,
        descEn: `As a premier conservation institution, Ragunan preserves ${animalName} populations from habitat loss and fosters public biodiversity education.`,
        highlightId: 'Terhubung dengan jaringan kebun binatang internasional (SEAZA & WAZA).',
        highlightEn: 'Affiliated with international zoo networks (SEAZA & WAZA).',
      },
    };
  }, [lowerName, animalName, habitat]);

  const topics: FactTopic[] = [
    {
      id: 'diet',
      labelId: 'Pola Makan',
      labelEn: 'Diet & Nutrition',
      icon: <AppIcon name="solar:dish-bold-duotone" className="w-3.5 h-3.5" />,
    },
    {
      id: 'habitat',
      labelId: 'Habitat Alam',
      labelEn: 'Biome & Range',
      icon: <AppIcon name="solar:compass-bold-duotone" className="w-3.5 h-3.5" />,
    },
    {
      id: 'traits',
      labelId: 'Ciri Unik',
      labelEn: 'Unique Traits',
      icon: <AppIcon name="solar:bolt-bold-duotone" className="w-3.5 h-3.5" />,
    },
    {
      id: 'conservation',
      labelId: 'Konservasi',
      labelEn: 'Conservation',
      icon: <AppIcon name="solar:shield-check-bold-duotone" className="w-3.5 h-3.5" />,
    },
  ];

  const currentFact = animalFacts[activeTab];

  return (
    <div className={`p-5 md:p-6 rounded-3xl bg-card border border-border/80 shadow-xs ${className}`}>
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <AppIcon name="solar:stars-minimalistic-bold-duotone" className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <span>{isEn ? 'Fascinating Wildlife Insights' : 'Fakta Unik & Wawasan Satwa'}</span>
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isEn ? `Discover the wonders of ${animalName}` : `Mengenal lebih dekat keistimewaan ${animalName}`}
            </p>
          </div>
        </div>

        {onOpenQuiz && (
          <button
            onClick={onOpenQuiz}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/25 transition-all self-start sm:self-auto hover:scale-105 active:scale-95"
          >
            <AppIcon name="solar:cup-star-bold-duotone" className="w-3.5 h-3.5" />
            <span>{isEn ? 'Test Your Knowledge' : 'Uji Kuis Satwa Ini'}</span>
            <AppIcon name="solar:alt-arrow-right-linear" className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Tab Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-muted/70 mb-4">
        {topics.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-card text-primary shadow-xs scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              {t.icon}
              <span className="truncate">{isEn ? t.labelEn : t.labelId}</span>
            </button>
          );
        })}
      </div>

      {/* Fact Content Stage */}
      <div className="p-4 sm:p-5 rounded-2xl bg-muted/35 border border-border/50 transition-all duration-300">
        <h4 className="font-bold text-sm sm:text-base text-foreground mb-1.5">
          {isEn ? currentFact.titleEn : currentFact.titleId}
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">
          {isEn ? currentFact.descEn : currentFact.descId}
        </p>

        {/* Fun Highlight Badge */}
        <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs font-medium w-full">
          <AppIcon name="solar:bolt-bold-duotone" className="w-4 h-4 text-amber-500 flex-shrink-0 animate-bounce" />
          <span className="leading-snug">
            <strong>{isEn ? 'Key Fact: ' : 'Fakta Kunci: '}</strong>
            {isEn ? currentFact.highlightEn : currentFact.highlightId}
          </span>
        </div>
      </div>
    </div>
  );
}
