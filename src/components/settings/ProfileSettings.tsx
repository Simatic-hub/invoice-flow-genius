
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { type Database } from '@/integrations/supabase/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

const ProfileSettings = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile: contextProfile, updateProfile: updateContextProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Profile>({
    created_at: '',
    updated_at: '',
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  // Fetch profile data and create if doesn't exist
  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First, check if the profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        // If error is "No rows found", create a new profile
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          return await createNewProfile();
        }
        // For other errors, throw to be caught by the catch block
        throw error;
      }
      
      if (data) {
        setProfileData({
          ...data,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      toast({
        title: t('error'),
        description: t('failed_to_fetch_profile_data'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new profile if one doesn't exist
  const createNewProfile = async () => {
    if (!user) return;
    
    try {
      const newProfile = {
        id: user.id,
        email: user.email || '',
        first_name: '',
        last_name: '',
        phone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .insert([newProfile]);
      
      if (error) throw error;
      
      setProfileData(newProfile);
      toast({
        title: t('success'),
        description: t('profile_created')
      });
      
      // After successful creation, we need to fetch the newly created profile
      // to ensure we have all fields populated correctly
      return fetchProfileData();
    } catch (error: any) {
      console.error('Error creating profile:', error.message);
      toast({
        title: t('error'),
        description: t('failed_to_create_profile'),
        variant: 'destructive'
      });
    }
  };

  // Update profile
  const updateProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const updatedData = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update the context profile instead of reloading the page
      await updateContextProfile({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone
      });
      
      toast({
        title: t('success'),
        description: t('profile_updated')
      });
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        title: t('error'),
        description: t('failed_to_update_profile'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Use contextProfile data if available, otherwise fetch from API
  useEffect(() => {
    if (contextProfile) {
      // If we have profile data in the context, use it
      setProfileData(prevData => ({
        ...prevData,
        first_name: contextProfile.first_name || '',
        last_name: contextProfile.last_name || '',
        email: contextProfile.email || '',
        phone: contextProfile.phone || ''
      }));
    } else {
      // Otherwise fetch from API
      fetchProfileData();
    }
  }, [contextProfile, user]);

  // Handle profile input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.profile.information')}</CardTitle>
        <CardDescription>
          {t('settings.profile.update')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
      <CardFooter>
        <Button 
          onClick={updateProfile} 
          disabled={loading}
        >
          {loading ? t('settings.saving') : t('settings.save.changes')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSettings;
