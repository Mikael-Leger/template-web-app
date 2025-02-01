import React from 'react';

import Separator from '../separator/separator';
import { useBasket } from '@/app/contexts/basket-context';
import Button from '../button/button';
import DynamicIcon from '../dynamic-icon/dynamic-icon';

import './sheet.scss';

interface CellType {
  value: (string | number);
  editable?: boolean;
};

interface SheetProps {
  items: CellType[][];
  headers: string[];
  footers: string[];
  colWidth: number;
  width: number;
}

export default function Sheet({items, headers, footers, colWidth, width}: SheetProps) {
  const {getActions} = useBasket();

  const renderCell = (item: CellType, index: number, length: number, firstCell: CellType) => {
    const indexLongest = 0;
    let justifyStyle = 'justify-start';
    if (length === 1) {
      justifyStyle = 'justify-end';
    }
    if (index !== indexLongest) {
      justifyStyle = 'justify-center';
    }

    return (
      <div
        className={`sheet-col flex flex-row items-center gap-2 ${justifyStyle} ${index === indexLongest && 'flex-1'}`}
        style={{
          width: length !== 1 ? `${colWidth}%` : undefined
        }}
        key={index}>
        {item.editable ? 
          getActions(firstCell.value as string).map((action, index) => {
            return (
              <div
                className={'product-image-actions-container-button'}
                key={index}>
                <Button
                  icon={{
                    node: action.iconName ? <DynamicIcon iconName={action.iconName} size={18}/> : undefined
                  }}
                  input={action.input}
                  backgroundColor= 'secondary'
                  maxChars={action.maxChars}
                  title={action.title}
                  round={action.round}
                  underline
                  disabled={action.hide}
                  onClick={action.onClick}
                  onChange={action.onChange}/>
              </div>
            );
          })
          : item.value}
      </div>
    );
  };

  const renderRow = (row: CellType[], index: number = -1) => {
    return (
      <div
        className='sheet-row padding-inner flex flex-row flex-gap justify-end'
        key={index !== -1 ? index : undefined}>
        {row.map((col, colIndex) => renderCell(col, colIndex, row.length, row[0]))}
      </div>
    );
  };

  const renderArray = (array: CellType[][]) => {
    return (
      array.map((item, rowIndex) =>
        renderRow(item, rowIndex)
      )      
    );
  };

  return (
    <div className='sheet flex flex-col' style={{width: `${width}vw`}}>
      {renderRow(headers.map(header => ({value: header})))}
      <Separator/>
      {renderArray(items)}
      <Separator/>
      {renderRow(footers.map(footer => ({value: footer})))}
    </div>
  );
}
