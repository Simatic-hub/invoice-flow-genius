
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PhoneInput, { CountryData } from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { useLanguage } from '@/contexts/language';

const clientFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  company: z.string().optional(),
  email: z.string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  phone: z.string()
    .refine((val) => !val || isValidPhoneNumber(val), {
      message: "Invalid phone number format",
    }),
  vat_number: z.string().min(1, { message: "VAT number is required" }),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (clientId: string) => void;
  existingClient?: any;
}

export function ClientFormDialog({ open, onOpenChange, onClientCreated, existingClient }: ClientFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [phoneCountry, setPhoneCountry] = useState('us');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: existingClient ? {
      name: existingClient.name || '',
      company: existingClient.company || '',
      email: existingClient.email || '',
      phone: existingClient.phone || '',
      vat_number: existingClient.vat_number || '',
      address: existingClient.address || '',
      city: existingClient.city || '',
      postal_code: existingClient.postal_code || '',
      country: existingClient.country || '',
    } : {
      name: '',
      company: '',
      email: '',
      phone: '',
      vat_number: '',
      address: '',
      city: '',
      postal_code: '',
      country: '',
    },
  });

  const onSubmit = async (data: ClientFormValues) => {
    if (!user) {
      toast({
        title: t("error") || "Authentication Error",
        description: t("auth.required") || "You must be signed in to create a client",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (existingClient) {
        const { error } = await supabase
          .from('clients')
          .update({
            name: data.name,
            address: data.address,
            vat_number: data.vat_number,
            company: data.company,
            email: data.email,
            phone: data.phone,
            city: data.city,
            postal_code: data.postal_code,
            country: data.country,
          })
          .eq('id', existingClient.id);

        if (error) throw error;

        toast({
          title: t("client.updated") || "Client Updated",
          description: t("client.updated.description") || "The client has been updated successfully.",
        });
      } else {
        const { data: client, error } = await supabase
          .from('clients')
          .insert({
            user_id: user.id,
            name: data.name,
            address: data.address,
            vat_number: data.vat_number,
            company: data.company,
            email: data.email,
            phone: data.phone,
            city: data.city,
            postal_code: data.postal_code,
            country: data.country,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: t("client.added") || "Client Created",
          description: t("client.added.description") || "The client has been created successfully.",
        });

        if (onClientCreated && client) {
          onClientCreated(client.id);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });

      form.reset();
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: t("error") || "Error",
        description: t("failed.to.save.client") || "Failed to save client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{existingClient ? t('edit.client') : t('add.new.client')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("company")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vat_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("vat_number")}*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}*</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phone")}</FormLabel>
                    <FormControl>
                      <div className="phone-input-wrapper">
                        <PhoneInput
                          country={phoneCountry}
                          value={field.value}
                          onChange={(value, data: CountryData) => {
                            field.onChange('+' + value);
                            if (data && data.countryCode) {
                              setPhoneCountry(data.countryCode);
                            }
                          }}
                          inputProps={{
                            name: 'phone',
                            required: false,
                            className: 'phone-input'
                          }}
                          containerClass="phone-input-container"
                          buttonClass="phone-input-button"
                          dropdownClass="phone-input-dropdown"
                          searchClass="phone-input-search"
                          enableSearch
                          isValid={(value, country) => {
                            try {
                              if (!value) return true;
                              if (!country) return false;
                              
                              const countryCode = (country as CountryData).countryCode || '';
                              return isValidPhoneNumber('+' + value, {
                                defaultCountry: countryCode as CountryCode
                              });
                            } catch (e) {
                              return false;
                            }
                          }}
                          preferredCountries={['be', 'fr', 'us', 'gb', 'de', 'nl']}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("address")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("city")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("postal_code")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("country")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("saving") || "Saving..." : existingClient ? t("update.client") || "Update Client" : t("save.client") || "Save Client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
