'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BsArrowRight, BsArrowLeft } from 'react-icons/bs';

import Card from './components/card/card';
import Title from './components/title/title';
import DescriptionAndImage from './components/description-and-image/description-and-image';
import { InteractiveShowcases } from './components/interactive-showcase/interactive-showcase';
import Layout from './components/layout/layout';
import ParallaxCover from './components/parallax-cover/parallax-cover';

export default function HomePage() {
  const router = useRouter();

  const handleFirstButtonClick = () => {
    console.log('button clicked');
  };

  const handleItemClick = (url: string) => {
    router.push(url);
  };
  
  return (
    <div className='home w-full h-full flex'>
      <Card
        size='big'
        padding={'none'}>
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
          noBottomPadding
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
      <Card size='big'>
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
      <Card size='big'>
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
      <ParallaxCover imagePath='images/sample_5.png'/>
      <Card size='big'>
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
      <ParallaxCover imagePath='images/sample_6.png' height={100}/>
      <Card
        className={'flex-row flex-wrap justify-center flex-gap'}
        size={'big'}
        id='showcases'>
          
        <Title
          text='Text and image with interactive showcases'
          orientation='start'
          underline
          size='big'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          orientation='start'
          shape='circle'
          images={[{
            path: '/images/sample_1.png',
          }]}
          flip/>
        <InteractiveShowcases
          showcases={
            [
              {
                title: 'Nos produits',
                onClick: () => handleItemClick('/products'),
                images: [
                  {
                    path: '/images/products/sample_1.png',
                    style: {
                      width: 120,
                      top: 20,
                      right: 10,
                      transform: 'rotate(20deg)',
                      scale: 1
                    },
                    animations: [
                      {
                        to: {
                          y: -20,
                          x: 10,
                          scale: .9,
                          rotate: 10
                        }
                      }
                    ]
                  },
                  {
                    path: '/images/products/sample_2.png',
                    style: {
                      width: 70,
                      bottom: 10,
                      right: 10,
                      transform: 'translateX(0%)',
                      rotate: 0
                    },
                    animations: [
                      {
                        to: {
                          y: -10,
                          x: 10,
                          rotate: 20
                        }
                      }
                    ]
                  },
                  {
                    path: '/images/products/sample_3.png',
                    style: {
                      width: 100,
                      bottom: 0,
                      left: 0,
                      transform: 'translateX(-5%)',
                      scale: 1
                    },
                    animations: [
                      {
                        to: {
                          y: -10,
                          x: 5,
                          scale: 1.1
                        }
                      }
                    ]
                  }
                ]
              },
              {
                title: 'Contactez-nous',
                onClick: () => handleItemClick('/contact'),
                images:
                [
                  {
                    path: '/images/contact/sample_1.png',
                    style: {
                      width: 80,
                      top: 30,
                      left: 10,
                      transform: 'rotate(-10deg)'
                    },
                    animations: [
                      {
                        to: {
                          y: -20,
                          x: -10,
                          transform: 'rotate(-20deg)'
                        }
                      }
                    ]
                  },
                  {
                    path: '/images/contact/sample_2.png',
                    style: {
                      width: 60,
                      top: 40,
                      right: 10,
                      transform: 'rotate(10deg)'
                    },
                    animations: [
                      {
                        to: {
                          y: -20,
                          x: 10,
                          transform: 'rotate(20deg)'
                        }
                      }
                    ]
                  },
                  {
                    path: '/images/contact/sample_3.png',
                    style: {
                      width: 120,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bottom: 0,
                      scale: 1
                    },
                    animations: [
                      {
                        to: {
                          y: -10,
                          scale: 1.2
                        }
                      }
                    ]
                  }
                ]
              },
              {
                title: 'Commandez',
                onClick: () => handleItemClick('/order'),
                images:
                [
                  {
                    path: '/images/order/sample_1.png',
                    style: {
                      width: 180,
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)'
                    },
                    animations: [
                      {
                        to: {
                          y: -10,
                          x: -5,
                          transform: 'rotate(-5deg) translateX(-50%)'
                        }
                      }
                    ]
                  },
                  {
                    path: '/images/order/sample_2.png',
                    style: {
                      width: 40,
                      bottom: 70,
                      scale: 1,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    },
                    animations: [
                      {
                        to: {
                          y: -10,
                          x: -5,
                          scale: 1.2,
                          transform: 'rotate(-5deg) translateX(-50%)'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        />
      </Card>
      <ParallaxCover imagePath='images/sample_7.png' height={450}/>
      <Card size='big'>
        <Layout
          items={[
            {
              space: 2,
              node: (
                <Layout
                  orientation='col'
                  items={[
                    {
                      node: (
                        <Title
                          text='Title left 1'
                          size='medium'/>
                      )
                    },
                    {
                      node: (
                        <DescriptionAndImage
                          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                          orientation='start'
                          images={[{
                            path: '/images/sample_1.png',
                            caption: 'Lorem ipsum'
                          }]}/>
                      )
                    },
                    {
                      node: (
                        <Title
                          text='Title left 2'
                          size='medium'/>
                      )
                    },
                    {
                      node: (
                        <DescriptionAndImage
                          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                          orientation='end'
                          images={[{
                            path: '/images/sample_1.png',
                            caption: 'Lorem ipsum'
                          }]}/>
                      )
                    }
                  ]}/>
              )
            },
            {
              space: 1,
              node: (
                <Layout
                  orientation='col'
                  items={[
                    {
                      node: (
                        <Title
                          text='Title right 1'/>
                      )
                    },
                    {
                      node: (
                        <DescriptionAndImage
                          axis='col'
                          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'/>
                      )
                    },
                    {
                      node: (
                        <Title
                          text='Title right 2'/>
                      )
                    },
                    {
                      node: (
                        <DescriptionAndImage
                          axis='col'
                          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'/>
                      )
                    },
                    {
                      node: (
                        <Title
                          text='Title right 3'/>
                      )
                    },
                    {
                      node: (
                        <DescriptionAndImage
                          axis='col'
                          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'/>
                      )
                    },
                  ]}/>
              )
            },
          ]}/>
      </Card>
    </div>
  );
}
