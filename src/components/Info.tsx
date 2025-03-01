import React from 'react';
import { Info as InfoIcon } from 'lucide-react';

interface InfoProps {
  className?: string;
}

const Info: React.FC<InfoProps> = ({ className }) => {
  return <InfoIcon className={className} />;
};

export default Info;