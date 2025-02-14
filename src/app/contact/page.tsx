'use client';

import React from 'react';
import Card from '../components/card/card';
import Form, { FormField } from '../components/form/form';
import Title from '../components/title/title';
import DetailsSection, { DetailsInterface } from '../components/details-section/details-section';

export default function ContactPage() {
  const fieldsByRows: FormField[] = [
    {
      items: [
        {
          name: 'email',
          title: 'E-mail',
          placeholder: 'john.doe@exemple.com',
          type: 'email'
        },
        {
          name: 'name',
          title: 'Nom',
          placeholder: 'John Doe'
        },
      ]
    },
    {
      items: [
        {
          name: 'phone',
          title: 'Téléphone',
        },
        {
          name: 'subject',
          title: 'Objet',
          placeholder: 'Objet'
        },
      ]
    },
    {
      items: [
        {
          name: 'message',
          title: 'Message',
          placeholder: 'Votre message...',
          type: 'textarea'
        },
      ]
    }
  ];

  const details: DetailsInterface[] = [
    {
      title: 'Adresse',
      icon: 'BsPinMap',
      content: [
        'Rue Brederode, 16',
        '1000 Bruxelles, Belgique'
      ]
    },
    {
      title: 'Téléphone',
      icon: 'BsTelephone',
      content: [
        '01 23 45 67 89'
      ]
    },
    {
      title: 'Horaires',
      icon: 'BsClock',
      content: [
        'Lundi - Vendredi',
        '9h-18h',
        'Samedi et Dimanche',
        '10h-12h'
      ]
    }
  ];

  const onFormSubmit = async (): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 2000));

    return true;
  };
  
  return (
    <div className='contact flex flex-col'>
      <Card size='big' className='flex-gap'>
        <Title text={'Contact'} size='big'/>
        <Form fieldsByRows={fieldsByRows} onSubmit={onFormSubmit} successMessage={'Votre message a été envoyé. Nous y répondrons au plus vite.'}/>
        <DetailsSection items={details}/>
      </Card>
    </div>
  );
}
