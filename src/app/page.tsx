'use client';

import React from 'react';
import { BsArrowRight, BsArrowLeft } from 'react-icons/bs';

import Card from './components/card/card';
import Title from './components/title/title';
import DescriptionAndImage from './components/description-and-image/description-and-image';

import './home.scss';

export default function HomePage() {
  const handleFirstButtonClick = () => {
    console.log('button clicked');
  };
  
  return (
    <div className='home w-full h-full flex'>
      <Card size='big'>
        <Title
          text='Text and image absolute center carousel swipe'
          orientation='center'
          size='big'
          underline/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          images={[
            {
              path: '/images/sample_1.png'
            },
            {
              path: '/images/sample_2.png'
            },
            {
              path: '/images/sample_3.png'
            },
            {
              path: '/images/sample_4.png'
            }
          ]}
          opacity={.7}
          absolute
          delayMs={12000}
          buttons={[
            {
              title: 'White',
              position: 'end',
              type: 'white',
              underline: true,
              onClick: handleFirstButtonClick
            },
            {
              title: 'Primary',
              position: 'end',
              borderColor: 'white',
              type: 'primary',
              onClick: handleFirstButtonClick
            }
          ]}/>
      </Card>
      <Card size='medium'>
        <Title
          text='Text and image absolute center carousel circle'
          orientation='center'
          size='big'
          underline/>
        <DescriptionAndImage
          images={[
            {
              path: '/images/sample_1.png'
            },
            {
              path: '/images/sample_2.png'
            },
            {
              path: '/images/sample_3.png'
            },
            {
              path: '/images/sample_4.png'
            }
          ]}
          opacity={.7}
          absolute
          transition='circle'
          delayMs={7000}/>
      </Card>
      <Card size='small'>
        <Title
          text='Image absolute center opacity'
          orientation='center'
          size='medium'/>
        <DescriptionAndImage
          images={[{path: '/images/sample_1.png'}]}
          opacity={.7}
          absolute/>
          
        <Title
          text='Text and image start button'
          orientation='start'
          size='medium'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          orientation='start'
          shape='circle'
          images={[{
            path: '/images/sample_1.png',
            caption: 'Lorem ipsum'
          }]}
          buttons={[
            {
              title: 'Success',
              position: 'end',
              size: 'small',
              icon: {
                orientation: 'end',
                node: <BsArrowRight/>
              },
              type: 'success',
              onClick: handleFirstButtonClick
            },
            {
              title: 'Warn',
              position: 'end',
              size: 'small',
              icon: {
                orientation: 'end',
                node: <BsArrowRight/>
              },
              type: 'warn',
              onClick: handleFirstButtonClick
            },
            {
              title: 'Error',
              position: 'end',
              size: 'small',
              icon: {
                orientation: 'end',
                node: <BsArrowRight/>
              },
              type: 'error',
              onClick: handleFirstButtonClick
            },
            {
              title: 'Info',
              position: 'end',
              size: 'small',
              icon: {
                orientation: 'end',
                node: <BsArrowRight/>
              },
              type: 'info',
              onClick: handleFirstButtonClick
            },
            {
              title: 'Primary',
              position: 'end',
              size: 'small',
              icon: {
                orientation: 'end',
                node: <BsArrowRight/>
              },
              type: 'primary',
              onClick: handleFirstButtonClick
            },
            {
              title: 'Black',
              position: 'end',
              size: 'small',
              icon: {
                orientation: 'end',
                node: <BsArrowRight/>
              },
              type: 'black',
              onClick: handleFirstButtonClick
            },
            {
              title: 'White',
              position: 'end',
              size: 'small',
              icon: {
                orientation: 'end',
                node: <BsArrowRight/>
              },
              type: 'white',
              onClick: handleFirstButtonClick
            }
          ]}/>
          
      </Card>
      <Card size='small'>
        <Title
          text='Text and image end'
          orientation='end'
          size='medium'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          orientation='end'
          images={[{path: '/images/sample_1.png'}]}
          buttons={[
            {
              title: 'Success',
              position: 'start',
              size: 'big',
              icon: {
                orientation: 'start',
                node: <BsArrowLeft/>
              },
              type: 'success',
              onClick: handleFirstButtonClick
            },
            {
              title: 'Warn',
              position: 'start',
              size: 'big',
              icon: {
                orientation: 'start',
                node: <BsArrowLeft/>
              },
              type: 'warn',
              onClick: handleFirstButtonClick
            },
          ]}/>
          
        <Title
          text='Text top and image'
          orientation='center'
          size='medium'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          orientation='center'
          axis='col'
          images={[{path: '/images/sample_1.png'}]}
          buttons={[
            {
              title: 'Success',
              position: 'center',
              size: 'medium',
              type: 'success',
              onClick: handleFirstButtonClick
            },
            {
              title: 'Warn',
              position: 'center',
              size: 'medium',
              type: 'warn',
              onClick: handleFirstButtonClick
            },
          ]}/>
          
      </Card>
      <Card size='small'>
        <Title
          text='Text bottom and image'
          orientation='center'
          size='medium'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          orientation='center'
          axis='col'
          images={[{path: '/images/sample_1.png'}]}
          buttons={[
            {
              title: 'Success',
              position: 'end',
              size: 'small',
              icon: {
                orientation: 'end',
                node: <BsArrowRight/>
              },
              type: 'success',
              onClick: handleFirstButtonClick
            },
            {
              title: 'Warn',
              position: 'end',
              size: 'small',
              icon: {
                orientation: 'end',
                node: <BsArrowRight/>
              },
              type: 'warn',
              onClick: handleFirstButtonClick
            },
          ]}/>
      </Card>
    </div>
  );
}
