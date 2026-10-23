import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon } from 'lucide-react';
import AvailabilityCalendar from './AvailabilityCalendar';

interface InterviewFormData {
  mediaOrganization: string;
  interviewTopic: string;
  targetInterviewee: string;
  equipmentUsed: string;
  interviewDate: Date | undefined;
  interviewTime: string;
}

interface InterviewFormFieldsProps {
  formData: InterviewFormData;
  language: 'id' | 'en';
  onInputChange: (field: string, value: any) => void;
}

const texts = {
  id: {
    mediaOrganization: 'Nama Media/Organisasi',
    interviewTopic: 'Topik/Tujuan Wawancara',
    interviewTopicPlaceholder: 'Jelaskan topik dan tujuan wawancara Anda...',
    targetInterviewee: 'Narasumber yang Dituju',
    targetIntervieweePlaceholder: 'Direktur / Kepala Bidang / dll.',
    equipmentUsed: 'Peralatan yang Digunakan',
    equipmentPlaceholder: 'Kamera, Microphone, dll.',
    interviewDate: 'Tanggal Wawancara',
    interviewTime: 'Waktu Wawancara',
    selectTime: 'Pilih waktu',
    morning: 'Pagi (08:00 - 12:00)',
    afternoon: 'Siang (12:00 - 15:00)',
    evening: 'Sore (15:00 - 17:00)',
    availabilityNote: 'Warna menunjukkan ketersediaan slot',
  },
  en: {
    mediaOrganization: 'Media/Organization Name',
    interviewTopic: 'Interview Topic/Purpose',
    interviewTopicPlaceholder: 'Explain your interview topic and purpose...',
    targetInterviewee: 'Target Interviewee',
    targetIntervieweePlaceholder: 'Director / Head of Department / etc.',
    equipmentUsed: 'Equipment Used',
    equipmentPlaceholder: 'Camera, Microphone, etc.',
    interviewDate: 'Interview Date',
    interviewTime: 'Interview Time',
    selectTime: 'Select time',
    morning: 'Morning (08:00 - 12:00)',
    afternoon: 'Afternoon (12:00 - 15:00)',
    evening: 'Evening (15:00 - 17:00)',
    availabilityNote: 'Colors indicate slot availability',
  }
};

export default function InterviewFormFields({ formData, language, onInputChange }: InterviewFormFieldsProps) {
  const txt = texts[language];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mediaOrganization">{txt.mediaOrganization} *</Label>
          <Input 
            id="mediaOrganization"
            value={formData.mediaOrganization}
            onChange={(e) => onInputChange('mediaOrganization', e.target.value)}
            placeholder={language === 'id' ? 'Kompas, Metro TV, dll.' : 'CNN, BBC, etc.'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetInterviewee">{txt.targetInterviewee}</Label>
          <Input 
            id="targetInterviewee"
            value={formData.targetInterviewee}
            onChange={(e) => onInputChange('targetInterviewee', e.target.value)}
            placeholder={txt.targetIntervieweePlaceholder}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interviewTopic">{txt.interviewTopic} *</Label>
        <Textarea 
          id="interviewTopic"
          value={formData.interviewTopic}
          onChange={(e) => onInputChange('interviewTopic', e.target.value)}
          placeholder={txt.interviewTopicPlaceholder}
          className="min-h-[100px]"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="equipmentUsed">{txt.equipmentUsed}</Label>
          <Input 
            id="equipmentUsed"
            value={formData.equipmentUsed}
            onChange={(e) => onInputChange('equipmentUsed', e.target.value)}
            placeholder={txt.equipmentPlaceholder}
          />
        </div>
        <div className="space-y-2">
          <Label>{txt.interviewTime}</Label>
          <select 
            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
            value={formData.interviewTime}
            onChange={(e) => onInputChange('interviewTime', e.target.value)}
          >
            <option value="">{txt.selectTime}</option>
            <option value="morning">{txt.morning}</option>
            <option value="afternoon">{txt.afternoon}</option>
            <option value="evening">{txt.evening}</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          {txt.interviewDate} *
        </Label>
        <p className="text-xs text-muted-foreground mb-2">{txt.availabilityNote}</p>
        <AvailabilityCalendar
          programType="interview"
          selectedDate={formData.interviewDate}
          onSelectDate={(date) => onInputChange('interviewDate', date)}
          language={language}
        />
      </div>
    </div>
  );
}
