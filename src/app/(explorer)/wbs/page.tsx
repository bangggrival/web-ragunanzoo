"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldAlert, Send, AlertTriangle, CheckCircle2, User, Mail, Phone, Calendar, MapPin, FileText, Eye, EyeOff, Paperclip, UserX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useWBSSubmissions } from '@/hooks/useWBSSubmissions';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { WBSEvidenceUpload } from '@/components/wbs/WBSEvidenceUpload';
const wbsFormSchema = z.object({
  is_anonymous: z.boolean().default(false),
  reporter_name: z.string().max(100).optional(),
  reporter_email: z.string().email('Email tidak valid').max(255).optional().or(z.literal('')),
  reporter_phone: z.string().max(20).optional(),
  category: z.string().min(1, 'Kategori harus dipilih'),
  incident_date: z.string().optional(),
  incident_location: z.string().max(200).optional(),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter').max(5000, 'Deskripsi maksimal 5000 karakter'),
  reported_person_name: z.string().max(100).optional(),
  reported_person_position: z.string().max(100).optional(),
});

type WBSFormValues = z.infer<typeof wbsFormSchema>;

export default function WBS() {
  const { language } = useLanguage();
  const { submitReport, WBS_CATEGORIES } = useWBSSubmissions();
  const [submitted, setSubmitted] = useState(false);
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);

  const form = useForm<WBSFormValues>({
    resolver: zodResolver(wbsFormSchema),
    defaultValues: {
      is_anonymous: false,
      reporter_name: '',
      reporter_email: '',
      reporter_phone: '',
      category: '',
      incident_date: '',
      incident_location: '',
      description: '',
      reported_person_name: '',
      reported_person_position: '',
    },
  });

  const isAnonymous = form.watch('is_anonymous');

  const onSubmit = async (data: WBSFormValues) => {
    await submitReport.mutateAsync({
      reporter_name: data.reporter_name,
      reporter_email: data.reporter_email,
      reporter_phone: data.reporter_phone,
      category: data.category,
      incident_date: data.incident_date,
      incident_location: data.incident_location,
      description: data.description,
      is_anonymous: data.is_anonymous,
      evidence_urls: evidenceUrls,
      reported_person_name: data.reported_person_name,
      reported_person_position: data.reported_person_position,
    });
    setSubmitted(true);
    setEvidenceUrls([]);
    form.reset();
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <AnimatedSection>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                {language === 'id' ? 'Laporan Terkirim!' : 'Report Submitted!'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'id' 
                  ? 'Terima kasih telah melaporkan. Laporan Anda akan ditindaklanjuti oleh tim kami.' 
                  : 'Thank you for reporting. Your report will be followed up by our team.'}
              </p>
              <Button 
                onClick={() => setSubmitted(false)}
                variant="outline"
              >
                {language === 'id' ? 'Kirim Laporan Lain' : 'Submit Another Report'}
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <AnimatedSection>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === 'id' ? 'Whistleblowing System' : 'Whistleblowing System'}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {language === 'id' 
              ? 'Laporkan dugaan pelanggaran, kecurangan, atau tindakan tidak etis secara rahasia dan aman.' 
              : 'Report suspected violations, fraud, or unethical conduct confidentially and safely.'}
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-secondary bg-secondary/10">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">
                  {language === 'id' ? 'Kerahasiaan Terjamin' : 'Confidentiality Guaranteed'}
                </p>
                <p>
                  {language === 'id' 
                    ? 'Identitas pelapor akan dijaga kerahasiaannya. Anda dapat memilih untuk melaporkan secara anonim.' 
                    : 'Reporter identity will be kept confidential. You can choose to report anonymously.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {language === 'id' ? 'Form Pelaporan' : 'Report Form'}
            </CardTitle>
            <CardDescription>
              {language === 'id' 
                ? 'Isi formulir di bawah ini dengan lengkap dan jelas.' 
                : 'Fill out the form below completely and clearly.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Anonymous Toggle */}
                <FormField
                  control={form.control}
                  name="is_anonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          {field.value ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {language === 'id' ? 'Laporkan Secara Anonim' : 'Report Anonymously'}
                        </FormLabel>
                        <FormDescription>
                          {language === 'id' 
                            ? 'Identitas Anda tidak akan dicantumkan dalam laporan.' 
                            : 'Your identity will not be included in the report.'}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Reporter Information - Hidden when anonymous */}
                {!isAnonymous && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="reporter_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nama Anda" {...field} className="manager-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reporter_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@contoh.com" {...field} className="manager-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reporter_phone"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {language === 'id' ? 'Nomor Telepon' : 'Phone Number'}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="08xxxxxxxxxx" {...field} className="manager-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Incident Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">
                    {language === 'id' ? 'Detail Kejadian' : 'Incident Details'}
                  </h3>

                  {/* Identitas Yang Dilaporkan */}
                  <div className="p-4 rounded-lg border bg-muted/20 space-y-4">
                    <h4 className="font-medium flex items-center gap-2 text-foreground">
                      <UserX className="w-4 h-4" />
                      {language === 'id' ? 'Identitas Yang Dilaporkan' : 'Reported Person Identity'}
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="reported_person_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'id' ? 'Nama Terlapor' : 'Reported Person Name'}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder={language === 'id' ? 'Nama orang yang dilaporkan' : 'Name of reported person'} {...field} className="manager-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reported_person_position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'id' ? 'Jabatan/Posisi Terlapor' : 'Reported Person Position'}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder={language === 'id' ? 'Jabatan atau posisi' : 'Position or role'} {...field} className="manager-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'id' ? 'Kategori Pelanggaran' : 'Violation Category'} *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="manager-input">
                              <SelectValue placeholder={language === 'id' ? 'Pilih kategori...' : 'Select category...'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WBS_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="incident_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {language === 'id' ? 'Tanggal Kejadian' : 'Incident Date'}
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="manager-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="incident_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {language === 'id' ? 'Lokasi Kejadian' : 'Incident Location'}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Lokasi atau area" {...field} className="manager-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'id' ? 'Deskripsi Kejadian' : 'Incident Description'} *
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={language === 'id' 
                              ? 'Jelaskan secara detail apa yang terjadi, siapa yang terlibat, dan kapan kejadiannya...' 
                              : 'Describe in detail what happened, who was involved, and when it occurred...'}
                            className="min-h-[150px] manager-input"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {language === 'id' ? 'Minimal 20 karakter' : 'Minimum 20 characters'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Evidence Upload */}
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      {language === 'id' ? 'Bukti Pendukung' : 'Supporting Evidence'}
                    </FormLabel>
                    <WBSEvidenceUpload
                      evidenceUrls={evidenceUrls}
                      onEvidenceChange={setEvidenceUrls}
                      maxFiles={5}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={submitReport.isPending}
                >
                  {submitReport.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {language === 'id' ? 'Mengirim...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {language === 'id' ? 'Kirim Laporan' : 'Submit Report'}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
}
