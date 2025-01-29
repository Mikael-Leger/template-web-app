import React, { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';

import './dynamic-icon.scss';

interface DynamicIconProps {
  iconName: string;
  color?: 'red' | 'none';
  size?: number | undefined;
}

const DynamicIcon = ({ iconName, color = 'none', size = undefined }: DynamicIconProps) => {
  const [Icon, setIcon] = useState<IconType | null>(null);

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const iconModule = await import('react-icons/bs');
        
        setIcon(() => iconModule[iconName  as keyof typeof iconModule]);

      } catch (error) {
        console.error(`Icon ${iconName} not found`, error);
      }
    };

    loadIcon();
  }, [iconName]);

  if (!Icon) return null;

  return <Icon
    className={`dynamic-icon-${color}`}
    size={size}/>;
};

export default DynamicIcon;