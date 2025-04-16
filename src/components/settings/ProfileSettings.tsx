
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useProfileData } from './profile/useProfileData';
import ProfileHeader from './profile/ProfileHeader';
import ProfileForm from './profile/ProfileForm';

const ProfileSettings = () => {
  const { profileData, loading, handleProfileChange, updateProfile } = useProfileData();

  return (
    <Card>
      <ProfileHeader />
      <CardContent>
        <ProfileForm 
          profileData={profileData}
          loading={loading}
          handleProfileChange={handleProfileChange}
          updateProfile={updateProfile}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
