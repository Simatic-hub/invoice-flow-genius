
import { useState } from 'react';

export const useFileAttachment = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return {
    file,
    setFile,
    handleFileChange
  };
};
