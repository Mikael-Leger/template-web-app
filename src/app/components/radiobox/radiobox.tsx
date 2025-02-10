import React, { useState } from 'react';

import './radiobox.scss';

export interface RadioboxProps {
  title: string;
  icons?: {
    path: string, style?: object
  }[];
  checked?: boolean;
  onClick?: () => void;
}

export default function Radiobox({title, icons, checked, onClick}: RadioboxProps) {
  return (
    <div className='radiobox flex flex-row flex-gap items-center justify-between padding-inner' onClick={onClick}>
      <div className='radiobox-content flex flex-row flex-gap'>
        <input type='radio' checked={checked} onChange={() => {}}/>
        {title}
      </div>
      <div className='radiobox-icons flex flex-row flex-gap'>
        {icons?.map(icon => (
          <img
            className='logo-icon'
            src={icon.path}
            style={icon.style || {width: 32, height: 32}}
            key={icon.path}/>
        ))}
      </div>
    </div>
  );
}

interface RadioboxesContainerProps {
  items: RadioboxProps[];
}

export function RadioboxesContainer({items}: RadioboxesContainerProps) {
  const [indexChecked, setIndexChecked] = useState<number | null>();

  return (
    <div className='radioboxes-container flex flex-col flex-gap padding-inner'>
      {items.map((item, index) => (
        <Radiobox
          {...item}
          checked={indexChecked === index}
          onClick={() => setIndexChecked(index)}
          key={item.title}/>
      ))}
    </div>
  );
}
