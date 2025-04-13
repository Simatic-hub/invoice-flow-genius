
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotesAttachmentsSectionProps {
  form: any;
  file: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NotesAttachmentsSection: React.FC<NotesAttachmentsSectionProps> = ({ 
  form, 
  file, 
  handleFileChange 
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">{t("notes_attachments") || "Notes & Attachments"}</h3>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("notes") || "Notes"}</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    value={field.value || ''}
                    placeholder={t("add_notes_placeholder") || "Add notes visible on invoice"}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <Label htmlFor="attachment">{t("attachment") || "Attachment"}</Label>
            <Input 
              id="attachment" 
              type="file" 
              onChange={handleFileChange}
              className="mt-1"
            />
            {file && (
              <p className="text-sm mt-1">{t("selected_file") || "Selected file"}: {file.name}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesAttachmentsSection;
