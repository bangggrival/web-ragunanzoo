'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen py-24 relative z-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {language === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'en' 
              ? 'Last updated: June 2026' 
              : 'Terakhir diperbarui: Juni 2026'}
          </p>
        </div>

        <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12 prose prose-green max-w-none">
            {language === 'en' ? (
              <>
                <p className="lead text-lg">
                  At Taman Margasatwa Ragunan, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our ticketing services.
                </p>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">1. Information We Collect</h2>
                </div>
                <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
                <ul>
                  <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with the site or when you purchase tickets.</li>
                  <li><strong>Transaction Data:</strong> Financial information, such as data related to your payment method (e.g. valid credit card number, card brand, expiration date) that we may collect when you purchase, order, or request information about our services.</li>
                </ul>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">2. Use of Your Information</h2>
                </div>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                <ul>
                  <li>Process and manage ticketing, purchases, and related transactions.</li>
                  <li>Email you regarding your ticket or account status.</li>
                  <li>Generate a personal profile about you to make future visits to the site more personalized.</li>
                  <li>Notify you of updates to our park facilities or event schedules.</li>
                </ul>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">3. Data Security</h2>
                </div>
                <p>
                  We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Contact Us</h2>
                <p>
                  If you have questions or comments about this Privacy Policy, please contact us at:<br/>
                  <strong>Taman Margasatwa Ragunan</strong><br/>
                  Jl. Harsono RM No. 1, Ragunan, Pasar Minggu<br/>
                  Jakarta Selatan, Indonesia<br/>
                  Email: privacy@ragunanzoo.jakarta.go.id
                </p>
              </>
            ) : (
              <>
                <p className="lead text-lg">
                  Di Taman Margasatwa Ragunan, kami sangat menjaga privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi Anda ketika Anda mengunjungi situs web kami dan menggunakan layanan pemesanan tiket kami.
                </p>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">1. Informasi yang Kami Kumpulkan</h2>
                </div>
                <p>Kami dapat mengumpulkan informasi tentang Anda dalam berbagai cara. Informasi yang mungkin kami kumpulkan meliputi:</p>
                <ul>
                  <li><strong>Data Pribadi:</strong> Informasi identitas pribadi, seperti nama, alamat email, dan nomor telepon Anda, yang Anda berikan secara sukarela kepada kami saat Anda mendaftar di situs atau saat Anda membeli tiket kunjungan.</li>
                  <li><strong>Data Transaksi:</strong> Informasi keuangan, seperti data yang terkait dengan metode pembayaran Anda yang mungkin kami kumpulkan saat Anda membeli tiket, menyumbang, atau meminta informasi tentang layanan kami.</li>
                </ul>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">2. Penggunaan Informasi Anda</h2>
                </div>
                <p>Memiliki informasi yang akurat tentang Anda memungkinkan kami untuk memberikan Anda pengalaman yang lancar, efisien, dan disesuaikan. Secara khusus, kami dapat menggunakan informasi yang dikumpulkan tentang Anda untuk:</p>
                <ul>
                  <li>Memproses dan mengelola tiket, pembelian, dan transaksi terkait.</li>
                  <li>Mengirimkan email kepada Anda mengenai status tiket atau akun Anda.</li>
                  <li>Membuat profil pribadi tentang Anda untuk membuat kunjungan mendatang ke situs menjadi lebih personal.</li>
                  <li>Memberi tahu Anda tentang pembaruan fasilitas taman atau jadwal acara / pertunjukan satwa.</li>
                </ul>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">3. Keamanan Data</h2>
                </div>
                <p>
                  Kami menggunakan langkah-langkah keamanan administratif, teknis, dan fisik untuk membantu melindungi informasi pribadi Anda. Meskipun kami telah mengambil langkah-langkah wajar untuk mengamankan informasi pribadi yang Anda berikan kepada kami, harap disadari bahwa terlepas dari upaya kami, tidak ada langkah keamanan yang sempurna atau tidak dapat ditembus.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Hubungi Kami</h2>
                <p>
                  Jika Anda memiliki pertanyaan atau komentar tentang Kebijakan Privasi ini, silakan hubungi kami di:<br/>
                  <strong>Taman Margasatwa Ragunan</strong><br/>
                  Jl. Harsono RM No. 1, Ragunan, Pasar Minggu<br/>
                  Jakarta Selatan, Indonesia<br/>
                  Email: privacy@ragunanzoo.jakarta.go.id
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
