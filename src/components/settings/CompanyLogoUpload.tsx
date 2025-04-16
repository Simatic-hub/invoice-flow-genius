
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/language';
import { Image, Upload } from 'lucide-react';

const CompanyLogoUpload: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Load existing logo on component mount
  const loadExistingLogo = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .storage
        .from('company_logos')
        .list(user.id, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error || !data || data.length === 0) {
        return;
      }
      
      const { data: logoData, error: logoError } = await supabase
        .storage
        .from('company_logos')
        .download(`${user.id}/${data[0].name}`);
        
      if (logoError || !logoData) {
        return;
      }
      
      setPreview(URL.createObjectURL(logoData));
    } catch (error) {
      console.error('Error loading existing logo:', error);
    }
  }, [user]);

  React.useEffect(() => {
    loadExistingLogo();
  }, [loadExistingLogo]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) {
      return;
    }

    const file = e.target.files[0];
    
    // Check if file is an image
    if (!file.type.includes('image/')) {
      toast({
        title: t('error') || 'Error',
        description: t('file_must_be_image') || 'File must be an image',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if file is too large (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t('error') || 'Error',
        description: t('file_too_large') || 'File must be less than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Check if company_logos bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'company_logos');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('company_logos', {
          public: false
        });
      }
      
      // Upload the file
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase
        .storage
        .from('company_logos')
        .upload(`${user.id}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Create a preview
      setPreview(URL.createObjectURL(file));
      
      toast({
        title: t('success') || 'Success',
        description: t('logo_uploaded') || 'Company logo uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: t('error') || 'Error',
        description: t('logo_upload_failed') || 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('company_logo') || 'Company Logo'}</CardTitle>
        <CardDescription>
          {t('company_logo_description') || 'Upload your company logo for use on invoices and quotes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          {preview ? (
            <div className="relative w-48 h-48 border border-gray-200 rounded-md overflow-hidden">
              <img
                src={preview}
                alt="Company logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-48 h-48 border border-dashed border-gray-300 rounded-md bg-gray-50">
              <Image className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">{t('no_logo') || 'No logo uploaded'}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById('logo-upload')?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('uploading') || 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {preview ? (t('change_logo') || 'Change Logo') : (t('upload_logo') || 'Upload Logo')}
                </>
              )}
            </Button>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          
          <p className="text-xs text-gray-500 italic">
            {t('logo_requirements') || 'Logo should be less than 2MB in size. Recommended format: PNG or JPEG.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyLogoUpload;
