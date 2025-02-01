import React, { useEffect, useState } from 'react';
import { IconType } from 'react-icons';

import { useIcons } from '@/app/contexts/icons-context';

import './dynamic-icon.scss';

interface DynamicIconProps {
  iconName: string;
  color?: 'red' | 'none';
  size?: number | undefined;
}

const DynamicIcon = ({ iconName, color = 'none', size = undefined }: DynamicIconProps) => {
  const {icons} = useIcons();

  const [Icon, setIcon] = useState<IconType | null>(null);

  useEffect(() => {
    const loadIcon = () => {
      const Icon = icons[iconName as keyof typeof icons] as IconType | undefined;
      if (!Icon) {
        console.error(`Icon ${iconName} not found`);

        return;
      }
        
      setIcon(() => Icon);
    };

    loadIcon();
  }, [iconName]);

  if (!Icon) return <span className='icon-placeholder'></span>;

  return <Icon
    className={`dynamic-icon-${color}`}
    size={size}/>;
};

export default DynamicIcon;