import React, { useState } from 'react';

import InputText from '../input-text/input-text';
import { isValidEmail } from '@/app/services/email';
import Title from '../title/title';
import Layout from '../layout/layout';

import './newsletter.scss';

interface NewsletterProps {
  titles: string[];
  descriptions: string[];
}

export default function Newsletter({titles, descriptions}: NewsletterProps) {
  const [isRegisteredToNewsletter, setIsRegisteredToNewsletter] = useState<boolean>(false);
  const [newsletterError, setNewsletterError] = useState<string>('');
  
  const newsletterRegister = (email: string) => {
    if (isValidEmail(email)) {
      setIsRegisteredToNewsletter(true);
    } else {
      setNewsletterError('Addresse e-mail invalide');
    }
  };
  
  const renderNewsletter = () => {
    return isRegisteredToNewsletter ? (
      descriptions[1]
    ) : (
      <>
        {descriptions[0]}
        <InputText
          name='newsletter'
          placeholder='john.doe@exemple.com'
          border
          type='email'
          error={newsletterError}
          submit={newsletterRegister}/>
      </>
    );
  };

  return (
    <div className='newsletter flex flex-col'>
      <Title
        className='padding-inner'
        size='medium'
        text={isRegisteredToNewsletter ? titles[1] : titles[0]}
        orientation='start'/>
      <Layout
        className='flex-1'
        items={[
          {
            node: renderNewsletter()
            ,
            space: 2,
            className: 'padding-outer flex-gap'
          },
          {
            node: <img className='absolute top-[-30px]' src='/images/newsletter/sample_1.png'/>,
            space: 1,
            className: 'relative overflow-hidden flex items-end'
          }
        ]}
      />
    </div>
  );
}
