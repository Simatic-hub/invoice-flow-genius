
import React from 'react';
import { Pricing } from '@/components/Pricing';
import { ContactForm } from '@/components/ContactForm';

interface ModalDialogsProps {
  showPricing: boolean;
  setShowPricing: (show: boolean) => void;
  showContact: boolean;
  setShowContact: (show: boolean) => void;
}

const ModalDialogs: React.FC<ModalDialogsProps> = ({
  showPricing,
  setShowPricing,
  showContact,
  setShowContact
}) => {
  return (
    <>
      <Pricing open={showPricing} onOpenChange={setShowPricing} />
      <ContactForm open={showContact} onOpenChange={setShowContact} />
    </>
  );
};

export default ModalDialogs;
