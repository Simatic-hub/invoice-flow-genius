
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
        title: "Authentication Error",
        description: "You must be signed in to create a client",
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
          title: "Client Updated",
          description: "The client has been updated successfully.",
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
          title: "Client Created",
          description: "The client has been created successfully.",
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
        title: "Error",
        description: "Failed to save client. Please try again.",
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
          <DialogTitle>{existingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
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
                    <FormLabel>Company</FormLabel>
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
                    <FormLabel>VAT Number*</FormLabel>
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
                    <FormLabel>Email*</FormLabel>
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <div className="phone-input-container">
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
                            className: 'w-full p-2 rounded-md border'
                          }}
                          containerClass="w-full"
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
                          dropdownClass="absolute z-50 bg-white border rounded-md shadow-lg"
                          buttonClass="bg-white border rounded-l-md"
                          searchClass="p-2 border-b"
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
                    <FormLabel>Address</FormLabel>
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
                      <FormLabel>City</FormLabel>
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
                      <FormLabel>Postal Code</FormLabel>
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
                    <FormLabel>Country</FormLabel>
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
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : existingClient ? 'Update Client' : 'Save Client'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
