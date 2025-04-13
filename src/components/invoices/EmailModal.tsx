
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient?: string;
  subject?: string;
  documentType: 'invoice' | 'quote';
  documentNumber: string;
  onSend: (emailData: { 
    to: string; 
    cc?: string; 
    bcc?: string; 
    subject: string; 
    body: string; 
    attachPdf: boolean; 
    showLayout: boolean; 
    sendReminder: boolean; 
  }) => void;
}

const EmailModal: React.FC<EmailModalProps> = ({
  open,
  onOpenChange,
  recipient = '',
  subject = '',
  documentType,
  documentNumber,
  onSend
}) => {
  const { toast } = useToast();
  const [to, setTo] = useState(recipient);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [emailSubject, setEmailSubject] = useState(subject || `Your ${documentType} ${documentNumber}`);
  
  const defaultBody = `
Beste,

U heeft een digitale ${documentType === 'invoice' ? 'factuur' : 'offerte'} ontvangen van [Your Company Name].

U kan deze ${documentType === 'invoice' ? 'factuur' : 'offerte'} bekijken en downloaden via [link]

Gelieve het gefactureerde bedrag over te schrijven op rekeningnummer [Your IBAN].

Vriendelijke groeten,
[Your Name]
  `.trim();
  
  const [body, setBody] = useState(defaultBody);
  const [attachPdf, setAttachPdf] = useState(true);
  const [attachUbl, setAttachUbl] = useState(false);
  const [showLayout, setShowLayout] = useState(true);
  const [sendReminder, setSendReminder] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSend = () => {
    // Validate email addresses
    if (!to || !validateEmail(to)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid recipient email address.",
        variant: "destructive"
      });
      return;
    }

    if (cc && !validateEmail(cc)) {
      toast({
        title: "Invalid CC email",
        description: "Please enter a valid CC email address.",
        variant: "destructive"
      });
      return;
    }

    if (bcc && !validateEmail(bcc)) {
      toast({
        title: "Invalid BCC email",
        description: "Please enter a valid BCC email address.",
        variant: "destructive"
      });
      return;
    }

    if (!emailSubject) {
      toast({
        title: "Missing subject",
        description: "Please enter an email subject.",
        variant: "destructive"
      });
      return;
    }

    onSend({
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject: emailSubject,
      body,
      attachPdf,
      showLayout,
      sendReminder
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send {documentType === 'invoice' ? 'Invoice' : 'Quote'} by Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="from">From</Label>
              <Input 
                id="from"
                value="Your company email (edit in settings)"
                disabled
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="to">To</Label>
              <Input 
                id="to" 
                value={to} 
                onChange={(e) => setTo(e.target.value)} 
                placeholder="Recipient's email"
                className="mt-1"
              />
            </div>

            {showCcBcc && (
              <>
                <div>
                  <Label htmlFor="cc">CC</Label>
                  <Input 
                    id="cc" 
                    value={cc} 
                    onChange={(e) => setCc(e.target.value)} 
                    placeholder="CC email addresses"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bcc">BCC</Label>
                  <Input 
                    id="bcc" 
                    value={bcc} 
                    onChange={(e) => setBcc(e.target.value)} 
                    placeholder="BCC email addresses"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {!showCcBcc && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCcBcc(true)}
                className="w-fit"
              >
                + CC / BCC
              </Button>
            )}

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                value={emailSubject} 
                onChange={(e) => setEmailSubject(e.target.value)} 
                placeholder="Email subject"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea 
                id="body" 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                rows={10}
                className="mt-1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="attach-pdf" 
                  checked={attachPdf} 
                  onCheckedChange={(checked) => setAttachPdf(checked as boolean)} 
                />
                <label
                  htmlFor="attach-pdf"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Attach PDF version
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="attach-ubl" 
                  checked={attachUbl} 
                  onCheckedChange={(checked) => setAttachUbl(checked as boolean)} 
                />
                <label
                  htmlFor="attach-ubl"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Attach UBL version
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-layout" 
                  checked={showLayout} 
                  onCheckedChange={(checked) => setShowLayout(checked as boolean)} 
                />
                <label
                  htmlFor="show-layout"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Display layout and logo
                </label>
              </div>

              {documentType === 'invoice' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="send-reminder" 
                    checked={sendReminder} 
                    onCheckedChange={(checked) => setSendReminder(checked as boolean)} 
                  />
                  <label
                    htmlFor="send-reminder"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send automatic reminder when payment deadline passes
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
