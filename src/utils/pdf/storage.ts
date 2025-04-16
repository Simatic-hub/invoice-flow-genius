
import { supabase } from '@/integrations/supabase/client';

/**
 * Get business settings from Supabase
 */
export const getBusinessSettings = async (userId: string) => {
  try {
    console.log('Fetching business settings for user:', userId);
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching business settings:', error);
      return null;
    }
    
    console.log('Business settings retrieved:', data);
    return data;
  } catch (error) {
    console.error('Exception in getBusinessSettings:', error);
    return null;
  }
};

/**
 * Fetch company logo from storage
 */
export const getCompanyLogo = async (userId: string): Promise<string | null> => {
  try {
    console.log('Fetching company logo for user:', userId);
    
    // First check if the bucket exists
    let { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return null;
    }
    
    const companyLogosBucketExists = buckets?.some(bucket => bucket.name === 'company_logos');
    
    if (!companyLogosBucketExists) {
      console.log('company_logos bucket does not exist, creating it now');
      const { error: createBucketError } = await supabase.storage.createBucket('company_logos', {
        public: false
      });
      
      if (createBucketError) {
        console.error('Error creating company_logos bucket:', createBucketError);
        return null;
      }
      
      console.log('company_logos bucket created successfully');
      return null; // No logo yet since we just created the bucket
    }
    
    // Check if the user has a folder in the bucket
    const { data, error } = await supabase
      .storage
      .from('company_logos')
      .list(userId, {
        limit: 1,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) {
      console.error('Error listing company logos:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No logo found for user');
      return null;
    }
    
    console.log('Logo file found:', data[0].name);
    
    const { data: logoData, error: logoError } = await supabase
      .storage
      .from('company_logos')
      .download(`${userId}/${data[0].name}`);
      
    if (logoError || !logoData) {
      console.error('Error downloading logo:', logoError);
      return null;
    }
    
    console.log('Logo downloaded successfully');
    return URL.createObjectURL(logoData);
  } catch (error) {
    console.error('Exception in getCompanyLogo:', error);
    return null;
  }
};
