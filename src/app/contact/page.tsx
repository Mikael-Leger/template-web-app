'use client';

import React from 'react';
import Card from '../components/card/card';
import Form, { FormField } from '../components/form/form';

export default function ContactPage() {
  const fieldsByRows: FormField[] = [
    {
      items: [
        {
          name: 'email',
          title: 'E-mail',
          placeholder: 'john.doe@exemple.com',
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
          textarea: true
        },
      ]
    }
  ];
  
  return (
    <div className='contact flex flex-col'>
      <Card size='big'>
        <Form title='Contact' fieldsByRows={fieldsByRows}/>
      </Card>
    </div>
  );
}
