
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { type Database } from '@/integrations/supabase/types';
import { useLanguage } from '@/contexts/LanguageContext';

type BusinessSettings = Database['public']['Tables']['business_settings']['Row'];

const BusinessSettings = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState<Partial<BusinessSettings>>({
    business_name: '',
    address: '',
    vat_number: '',
    currency: 'USD'
  });

  // Fetch business data
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

  // Update or insert business settings
  const updateBusinessSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from('business_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let error;
      
      if (existingData) {
        // Update existing record
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
        // Insert new record
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

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user]);

  // Handle business input changes
  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setBusinessData(prev => ({ ...prev, [id]: value }));
  };

  return (
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
  );
};

export default BusinessSettings;
