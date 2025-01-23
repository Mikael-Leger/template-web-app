'use client';

import React from 'react';

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
          text='Text and image absolute center opacity-.5'
          orientation='center'
          size='medium'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          imagePaths={['/images/sample_1.png', '/images/sample_2.png']}
          opacity={.5}
          absolute/>
          
        <Title
          text='Image absolute center'
          orientation='center'
          size='medium'/>
        <DescriptionAndImage
          imagePaths={['/images/sample_1.png']}
          absolute/>
          
        <Title
          text='Text and image start button'
          orientation='start'
          size='medium'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          orientation='start'
          imagePaths={['/images/sample_1.png']}
          button={{
            title: 'Next',
            position: 'end',
            onClick: handleFirstButtonClick
          }}/>
          
        <Title
          text='Text and image end'
          orientation='end'
          size='medium'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          orientation='end'
          imagePaths={['/images/sample_1.png']}/>
          
        <Title
          text='Text and image top'
          orientation='center'
          size='medium'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          orientation='top'
          imagePaths={['/images/sample_1.png']}/>
          
        <Title
          text='Text and image bottom'
          orientation='center'
          size='medium'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          orientation='bottom'
          imagePaths={['/images/sample_1.png']}/>
      </Card>
    </div>
  );
}
