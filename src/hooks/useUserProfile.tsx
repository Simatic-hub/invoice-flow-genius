
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language';

type ProfileData = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
};

type UserProfileContextType = {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const defaultContext: UserProfileContextType = {
  profile: null,
  loading: false,
  error: null,
  updateProfile: async () => {},
  refreshProfile: async () => {}
};

const UserProfileContext = createContext<UserProfileContextType>(defaultContext);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      setProfile(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profile for user ID:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error.message);
        throw error;
      }
      
      console.log('Profile data retrieved:', data);
      
      // Ensure we have a consistent data structure
      // This is especially important for the avatar/name display logic
      setProfile({
        first_name: data?.first_name || null,
        last_name: data?.last_name || null,
        email: data?.email || user?.email || null,
        phone: data?.phone || null
      });
    } catch (error: any) {
      console.error('Error in fetchProfile:', error.message);
      setError(error.message);
      // Don't show toast for normal errors, as this might happen frequently
      // and would be annoying for users
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<ProfileData>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update the local state with the new data
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      
      toast({
        title: t('success'),
        description: t('profile_updated') || 'Profile updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      setError(error.message);
      toast({
        title: t('error'),
        description: t('failed_to_update_profile') || 'Failed to update profile',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    console.log('Explicitly refreshing profile data');
    await fetchProfile();
  };

  useEffect(() => {
    if (user) {
      console.log('User changed or component mounted, fetching profile');
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const value = {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export default useUserProfile;
