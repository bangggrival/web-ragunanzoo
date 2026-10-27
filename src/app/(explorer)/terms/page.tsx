'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { AppIcon } from '@/components/ui/AppIcon';

export default function TermsOfServicePage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen py-24 relative z-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <AppIcon icon="FileWarning" className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {language === 'en' ? 'Terms of Service' : 'Syarat & Ketentuan'}
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
                  Welcome to Taman Margasatwa Ragunan. By accessing our website and purchasing tickets, you agree to be bound by these Terms of Service. Please read them carefully.
                </p>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <AppIcon icon="Ticket" className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">1. Ticketing & Admission</h2>
                </div>
                <ul>
                  <li>All tickets purchased are strictly <strong>non-refundable</strong> and non-transferable.</li>
                  <li>Tickets are only valid for the specific date and time selected during purchase.</li>
                  <li>Taman Margasatwa Ragunan reserves the right to refuse admission or to ask visitors to leave the premises without refund if their behavior is deemed inappropriate or dangerous.</li>
                  <li>Children under the age of 12 must be accompanied by an adult at all times.</li>
                </ul>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <AppIcon icon="Ban" className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">2. Park Rules & Animal Welfare</h2>
                </div>
                <p>To ensure the safety of our animals and all visitors, the following actions are strictly prohibited:</p>
                <ul>
                  <li><strong>Do not feed the animals</strong> with unauthorized food. Only use designated food provided by the zoo at specific feeding zones.</li>
                  <li>Do not throw objects, trash, or debris into the animal enclosures.</li>
                  <li>Do not cross safety barriers or climb on fences.</li>
                  <li>Making loud noises, tapping on glass, or teasing the animals is strictly forbidden.</li>
                  <li>Smoking is only permitted in designated smoking areas.</li>
                </ul>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <AppIcon icon="Gavel" className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">3. Liability</h2>
                </div>
                <p>
                  Visitors enter Taman Margasatwa Ragunan at their own risk. The management is not liable for any loss, damage, or injury to personal property or persons occurring within the premises, except where such injury or damage is caused directly by the management's negligence.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. Any changes will be effective immediately upon posting to the website. Your continued use of the website and services constitutes your acceptance of these changes.
                </p>
              </>
            ) : (
              <>
                <p className="lead text-lg">
                  Selamat datang di Taman Margasatwa Ragunan. Dengan mengakses situs web kami dan membeli tiket, Anda setuju untuk terikat oleh Syarat & Ketentuan ini. Mohon baca dengan saksama.
                </p>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <AppIcon icon="Ticket" className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">1. Tiket & Tiket Masuk</h2>
                </div>
                <ul>
                  <li>Semua tiket yang dibeli secara tegas <strong>tidak dapat diuangkan kembali (non-refundable)</strong> dan tidak dapat dipindahtangankan.</li>
                  <li>Tiket hanya berlaku untuk tanggal dan waktu spesifik yang dipilih saat pembelian.</li>
                  <li>Taman Margasatwa Ragunan berhak menolak tiket masuk atau meminta pengunjung meninggalkan area tanpa pengembalian uang jika perilaku mereka dianggap tidak pantas atau berbahaya.</li>
                  <li>Anak-anak di bawah usia 12 tahun wajib didampingi oleh orang dewasa setiap saat.</li>
                </ul>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <AppIcon icon="Ban" className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">2. Aturan Taman & Kesejahteraan Satwa</h2>
                </div>
                <p>Untuk menjamin keamanan satwa kami dan seluruh pengunjung, tindakan berikut ini sangat dilarang keras:</p>
                <ul>
                  <li><strong>Dilarang memberi makan satwa</strong> dengan makanan sembarangan. Hanya gunakan makanan yang disediakan oleh pihak kebun binatang pada zona khusus feeding.</li>
                  <li>Dilarang melempar benda, sampah, atau puing-puing ke dalam kandang satwa.</li>
                  <li>Dilarang melewati pagar pembatas keamanan atau memanjat pagar.</li>
                  <li>Dilarang membuat suara bising, mengetuk kaca, atau menggoda/mengganggu satwa.</li>
                  <li>Merokok hanya diizinkan di area khusus merokok yang telah disediakan.</li>
                </ul>

                <div className="flex items-center gap-3 mt-8 mb-4">
                  <AppIcon icon="Gavel" className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">3. Tanggung Jawab</h2>
                </div>
                <p>
                  Pengunjung memasuki Taman Margasatwa Ragunan dengan risiko sendiri. Pihak manajemen tidak bertanggung jawab atas kerugian, kerusakan, atau cedera pada properti pribadi atau orang yang terjadi di dalam area, kecuali jika cedera atau kerusakan tersebut disebabkan langsung oleh kelalaian manajemen.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Perubahan Syarat & Ketentuan</h2>
                <p>
                  Kami berhak untuk mengubah Syarat & Ketentuan ini kapan saja. Setiap perubahan akan langsung berlaku efektif setelah diunggah ke situs web. Penggunaan berkelanjutan Anda atas situs web dan layanan ini merupakan penerimaan Anda terhadap perubahan tersebut.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
