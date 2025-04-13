
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
};

const defaultContext: UserProfileContextType = {
  profile: null,
  loading: false,
  error: null,
  updateProfile: async () => {}
};

const UserProfileContext = createContext<UserProfileContextType>(defaultContext);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      setError(error.message);
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
      
      // Update the profile state with new data
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile when user changes
  useEffect(() => {
    fetchProfile();
  }, [user]);

  const value = {
    profile,
    loading,
    error,
    updateProfile
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
