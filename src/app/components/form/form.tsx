import React, { useState } from 'react';
import { flushSync } from 'react-dom';

import InputText, { InputTextProps } from '../input-text/input-text';
import Button from '../button/button';
import InputPhone from '../input-phone/input-phone';
import Loading from '../loading/loading';
import { useIsMobile } from '@/app/contexts/mobile-context';

import './form.scss';

export interface FormField {
  items: InputTextProps[];
}

interface FormProps {
  fieldsByRows: FormField[];
  successMessage: string;
  onSubmit: () => Promise<boolean>;
}

export default function Form({fieldsByRows, successMessage, onSubmit}: FormProps) {
  const {isMobile} = useIsMobile();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!fieldsByRows) return;

  const formAction = async () => {
    flushSync(() => {
      setIsLoading(true);
    });

    const success = await onSubmit();
    setIsSuccess(success);

    flushSync(() => {
      setIsLoading(false);
    });
  };
  
  const renderLoading = () => {
    return (
      <div className='form-content-loading w-full h-full absolute'>
        <Loading/>
      </div>
    );
  };

  return (
    <React.Fragment>
      <form
        className='form flex flex-col flex-gap items-center'
        action={formAction}>
        <div className='form-content flex flex-col flex-gap padding-inner relative'
          style={{
            opacity: isSuccess ? 0 : 1,
            width: isMobile ? '100vw' : '70vw'
          }}>
          {fieldsByRows.map((fields, index) => {
            return (
              <div className='form-content-fields flex flex-row flex-gap flex-wrap padding-inner' key={index}>
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
          <div className='form-content-button padding-inner'>
            <Button title={'Envoyer'} buttonType={'submit'} fullWidth size='big'/>
          </div>
          {isLoading && renderLoading()}
        </div>
        {isSuccess && successMessage && (
          <div className='form-content-text absolute'>
            {successMessage}
          </div>
        )}
      </form>
    </React.Fragment>
  );
}
