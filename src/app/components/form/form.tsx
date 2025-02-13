import React from 'react';

import InputText, { InputTextProps } from '../input-text/input-text';
import Title from '../title/title';
import Button from '../button/button';
import InputPhone from '../input-phone/input-phone';

import './form.scss';

export interface FormField {
  items: InputTextProps[]
}

interface FormProps {
  title: string;
  fieldsByRows: FormField[];
}

export default function Form({title, fieldsByRows}: FormProps) {
  if (!fieldsByRows) return;

  return (
    <form className='form flex flex-col flex-gap items-center'>
      <Title text={title} size='big'/>
      <div className='form-content flex flex-col flex-gap'>
        {fieldsByRows.map((fields, index) => {
          return (
            <div className='form-content flex flex-row flex-gap' key={index}>
              {fields.items.map(field => {
                if (field.name === 'phone') {
                  return <InputPhone 
                    defaultValue=''
                    {...field}
                    key={field.name}/>;
                }

                return (
                  <InputText
                    {...field}
                    border
                    key={field.name}/>
                );
              })}
            </div>
          );
        })}
        <Button title={'Envoyer'} buttonType={'submit'} fullWidth/>
      </div>
    </form>
  );
}
