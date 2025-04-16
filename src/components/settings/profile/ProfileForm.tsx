
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { type Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileFormProps {
  profileData: Profile;
  loading: boolean;
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateProfile: () => Promise<void>;
}

const ProfileForm = ({ profileData, loading, handleProfileChange, updateProfile }: ProfileFormProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">{t('settings.profile.first.name')}</Label>
          <Input 
            id="first_name" 
            placeholder="John" 
            value={profileData.first_name} 
            onChange={handleProfileChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">{t('settings.profile.last.name')}</Label>
          <Input 
            id="last_name" 
            placeholder="Doe" 
            value={profileData.last_name} 
            onChange={handleProfileChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('settings.profile.email')}</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="john@example.com" 
          value={profileData.email} 
          disabled 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
        <Input 
          id="phone" 
          placeholder="(555) 123-4567" 
          value={profileData.phone} 
          onChange={handleProfileChange}
        />
      </div>

      <Button 
        onClick={updateProfile} 
        disabled={loading}
        className="mt-4"
      >
        {loading ? t('settings.saving') : t('settings.save.changes')}
      </Button>
    </div>
  );
};

export default ProfileForm;
