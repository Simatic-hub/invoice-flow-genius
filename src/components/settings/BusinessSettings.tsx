
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/language';
import CompanyLogoUpload from './CompanyLogoUpload';
import { Database } from '@/integrations/supabase/types';

type BusinessSettings = Database['public']['Tables']['business_settings']['Row'];

const BusinessSettings = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState<Partial<BusinessSettings>>({
    business_name: '',
    address: '',
    vat_number: '',
    currency: 'USD'
  });

  const fetchBusinessData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setBusinessData({
          business_name: data.business_name || '',
          address: data.address || '',
          vat_number: data.vat_number || '',
          currency: data.currency || 'USD'
        });
      }
    } catch (error: any) {
      console.error('Error fetching business settings:', error.message);
      toast({
        title: t('error'),
        description: t('failed_to_fetch_business_data'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Ensure the business_settings table exists by attempting to query it
      const { error: tableCheckError } = await supabase
        .from('business_settings')
        .select('count')
        .limit(1);
      
      if (tableCheckError) {
        console.log('Business settings table might not exist, attempting to create record anyway');
      }
      
      const { data: existingData, error: checkError } = await supabase
        .from('business_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.log('Error checking existing data:', checkError.message, 'Will try to insert new record');
      }
      
      let error;
      
      if (existingData) {
        const { error: updateError } = await supabase
          .from('business_settings')
          .update({
            business_name: businessData.business_name,
            address: businessData.address,
            vat_number: businessData.vat_number,
            currency: businessData.currency,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('business_settings')
          .insert({
            user_id: user.id,
            business_name: businessData.business_name || '',
            address: businessData.address || '',
            vat_number: businessData.vat_number || '',
            currency: businessData.currency || 'USD'
          });
        
        error = insertError;
      }
      
      if (error) throw error;
      
      toast({
        title: t('success'),
        description: t('business_settings_updated')
      });
    } catch (error: any) {
      console.error('Error updating business settings:', error.message);
      toast({
        title: t('error'),
        description: t('failed_to_update_business_settings'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user]);

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setBusinessData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('business_settings')}</h1>
      
      <CompanyLogoUpload />
      
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.business.information')}</CardTitle>
          <CardDescription>
            {t('settings.business.update')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">{t('settings.business.name')}</Label>
            <Input 
              id="business_name" 
              placeholder="Acme Inc." 
              value={businessData.business_name} 
              onChange={handleBusinessChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('settings.business.address')}</Label>
            <Textarea 
              id="address" 
              placeholder="123 Business St, City, State, ZIP" 
              value={businessData.address} 
              onChange={handleBusinessChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vat_number">{t('settings.business.vat')}</Label>
              <Input 
                id="vat_number" 
                placeholder="XX-XXXXXXX" 
                value={businessData.vat_number} 
                onChange={handleBusinessChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t('settings.business.currency')}</Label>
              <Input 
                id="currency" 
                placeholder="USD" 
                value={businessData.currency} 
                onChange={handleBusinessChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={updateBusinessSettings} 
            disabled={loading}
          >
            {loading ? t('settings.saving') : t('settings.save.changes')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BusinessSettings;
