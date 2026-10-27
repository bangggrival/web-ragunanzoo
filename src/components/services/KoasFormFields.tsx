import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { id as idLocale, enUS } from 'date-fns/locale';
import { AppIcon } from '@/components/ui/AppIcon';
import AvailabilityCalendar from './AvailabilityCalendar';

interface KoasFormData {
  faculty: string;
  rotationDepartment: string;
  supervisorName: string;
  supervisorPhone: string;
  koasStartDate: Date | undefined;
  koasEndDate: Date | undefined;
}

interface KoasFormFieldsProps {
  formData: KoasFormData;
  language: 'id' | 'en';
  onInputChange: (field: string, value: any) => void;
}

const texts = {
  id: {
    faculty: 'Fakultas Kedokteran',
    rotationDepartment: 'Bagian/Stase yang Diminati',
    supervisorName: 'Nama Pembimbing Akademik',
    supervisorPhone: 'No. Telepon Pembimbing',
    startDate: 'Tanggal Mulai',
    endDate: 'Tanggal Selesai',
    selectDepartment: 'Pilih bagian',
    deptMedicine: 'Kedokteran Umum',
    deptDentistry: 'Kedokteran Gigi',
    deptNursing: 'Keperawatan',
    deptPharmacy: 'Farmasi',
    deptPublicHealth: 'Kesehatan Masyarakat',
    deptNutrition: 'Gizi',
    deptVeterinary: 'Kedokteran Hewan',
    availabilityNote: 'Warna menunjukkan ketersediaan slot',
  },
  en: {
    faculty: 'Medical Faculty',
    rotationDepartment: 'Preferred Rotation/Department',
    supervisorName: 'Academic Supervisor Name',
    supervisorPhone: 'Supervisor Phone Number',
    startDate: 'Start Date',
    endDate: 'End Date',
    selectDepartment: 'Select department',
    deptMedicine: 'General Medicine',
    deptDentistry: 'Dentistry',
    deptNursing: 'Nursing',
    deptPharmacy: 'Pharmacy',
    deptPublicHealth: 'Public Health',
    deptNutrition: 'Nutrition',
    deptVeterinary: 'Veterinary Medicine',
    availabilityNote: 'Colors indicate slot availability',
  }
};

export default function KoasFormFields({ formData, language, onInputChange }: KoasFormFieldsProps) {
  const txt = texts[language];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="faculty">{txt.faculty} *</Label>
          <Input 
            id="faculty"
            value={formData.faculty}
            onChange={(e) => onInputChange('faculty', e.target.value)}
            placeholder={language === 'id' ? 'FK Universitas Indonesia' : 'University of Indonesia Medical Faculty'}
          />
        </div>
        <div className="space-y-2">
          <Label>{txt.rotationDepartment}</Label>
          <select 
            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
            value={formData.rotationDepartment}
            onChange={(e) => onInputChange('rotationDepartment', e.target.value)}
          >
            <option value="">{txt.selectDepartment}</option>
            <option value="medicine">{txt.deptMedicine}</option>
            <option value="dentistry">{txt.deptDentistry}</option>
            <option value="nursing">{txt.deptNursing}</option>
            <option value="pharmacy">{txt.deptPharmacy}</option>
            <option value="public_health">{txt.deptPublicHealth}</option>
            <option value="nutrition">{txt.deptNutrition}</option>
            <option value="veterinary">{txt.deptVeterinary}</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supervisorName">{txt.supervisorName}</Label>
          <Input 
            id="supervisorName"
            value={formData.supervisorName}
            onChange={(e) => onInputChange('supervisorName', e.target.value)}
            placeholder={language === 'id' ? 'Dr. Nama Dosen' : 'Dr. Supervisor Name'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supervisorPhone">{txt.supervisorPhone}</Label>
          <Input 
            id="supervisorPhone"
            value={formData.supervisorPhone}
            onChange={(e) => onInputChange('supervisorPhone', e.target.value)}
            placeholder="08xxxxxxxxxx"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AppIcon name="solar:calendar-bold-duotone" className="w-4 h-4 text-accent-foreground" />
            {txt.startDate} *
          </Label>
          <p className="text-xs text-muted-foreground mb-2">{txt.availabilityNote}</p>
          <AvailabilityCalendar
            programType="koas"
            selectedDate={formData.koasStartDate}
            onSelectDate={(date) => onInputChange('koasStartDate', date)}
            language={language}
          />
        </div>
        <div className="space-y-2">
          <Label>{txt.endDate} *</Label>
          <Calendar
            mode="single"
            selected={formData.koasEndDate}
            onSelect={(date) => onInputChange('koasEndDate', date)}
            locale={language === 'id' ? idLocale : enUS}
            className="rounded-md border pointer-events-auto"
            disabled={(date) => date < (formData.koasStartDate || new Date())}
          />
        </div>
      </div>
    </div>
  );
}
