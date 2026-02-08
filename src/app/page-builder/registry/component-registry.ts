/**
 * Component Registry
 *
 * Central registry of all components available in the page builder.
 * Each component is registered with metadata for the editor UI.
 */

import React from 'react';

import {
  ComponentCategory,
  ComponentRegistryEntry,
  PropDefinition,
} from '../interfaces/page-config.interface';

// Import components
import Card from '@/app/components/card/card';
import Title from '@/app/components/title/title';
import Text from '@/app/components/text/text';
import Button from '@/app/components/button/button';
import Image from '@/app/components/image/image';
import Separator from '@/app/components/separator/separator';
import Layout from '@/app/components/layout/layout';
import BannerImage from '@/app/components/banner-image/banner-image';
import Newsletter from '@/app/components/newsletter/newsletter';
import Video from '@/app/components/video/video';
import Catalog from '@/app/components/catalog/catalog';
import { Testimonials } from '@/app/components/testimonial/testimonial';
import CarouselWrapper from '@/app/page-builder/components/carousel-wrapper';
import ParallaxCover from '@/app/components/parallax-cover/parallax-cover';
import Footer from '@/app/components/footer/footer';
import DescriptionAndImageWrapper from '@/app/page-builder/components/description-and-image-wrapper';
import Tooltip from '@/app/components/tooltip/tooltip';
import OrderProcessWrapper from '@/app/page-builder/components/order-process-wrapper';
import InteractiveShowcasesWrapper from '@/app/page-builder/components/interactive-showcases-wrapper';
import ContactFormWrapper from '@/app/page-builder/components/contact-form-wrapper';
import DetailsSectionWrapper from '@/app/page-builder/components/details-section-wrapper';

/**
 * Helper to create a prop definition
 */
function prop(
  type: PropDefinition['type'],
  label: string,
  options?: Partial<PropDefinition>
): PropDefinition {
  return { type, label, ...options };
}

/**
 * Helper to create a select prop
 */
function selectProp(
  label: string,
  opts: { label: string; value: string }[],
  defaultValue: string
): PropDefinition {
  return {
    type: 'select',
    label,
    options: opts,
    defaultValue,
  };
}

// Common prop definitions
const sizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Big', value: 'big' },
];

const orientationOptions = [
  { label: 'Left', value: 'start' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'end' },
];

const paddingOptions = [
  { label: 'None', value: 'none' },
  { label: 'Inner', value: 'inner' },
  { label: 'Inner Full', value: 'inner-full' },
  { label: 'Outer', value: 'outer' },
  { label: 'Outer Full', value: 'outer-full' },
];

const marginOptions = [
  { label: 'None', value: 'none' },
  { label: 'Inner', value: 'inner' },
  { label: 'Outer', value: 'outer' },
  { label: 'Mobile', value: 'mobile' },
];

/**
 * Component Registry Map
 */
const componentRegistry = new Map<string, ComponentRegistryEntry>();

// ===== LAYOUT COMPONENTS =====

componentRegistry.set('Card', {
  component: Card as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Card',
  category: 'layout',
  icon: 'BsCardChecklist',
  description: 'A container with customizable padding, background, and styling',
  acceptsChildren: true,
  propsSchema: {
    size: selectProp('Size', sizeOptions, 'medium'),
    padding: selectProp('Padding', paddingOptions, 'inner-full'),
    margin: selectProp('Margin', marginOptions, 'inner'),
    background: selectProp('Background', [
      { label: 'Default (White)', value: 'default' },
      { label: 'Gradient', value: 'gradient' },
    ], 'default'),
    orientation: selectProp('Alignment', orientationOptions, 'center'),
  },
  defaultProps: {
    size: 'medium',
    padding: 'inner-full',
    margin: 'inner',
    background: 'default',
    orientation: 'center',
  },
});

componentRegistry.set('Layout', {
  component: Layout as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Layout Grid',
  category: 'layout',
  icon: 'BsGrid',
  description: 'Flexible grid layout with customizable columns and spacing',
  acceptsChildren: true,
  propsSchema: {
    orientation: selectProp('Direction', [
      { label: 'Row', value: 'row' },
      { label: 'Column', value: 'col' },
    ], 'row'),
    space: selectProp('Space Distribution', [
      { label: 'Around', value: 'around' },
      { label: 'Between', value: 'between' },
      { label: 'Evenly', value: 'evenly' },
    ], 'between'),
    childRatios: {
      type: 'array',
      label: 'Child Ratios',
      description: 'Flex ratio for each child element (e.g., 1, 1, 1 for equal sizing)',
      defaultValue: [],
      arrayItemSchema: prop('number', 'Ratio', { defaultValue: 1, min: 0.1, max: 10 }),
    },
  },
  defaultProps: {
    orientation: 'row',
    space: 'between',
    childRatios: [],
  },
});

componentRegistry.set('Separator', {
  component: Separator as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Separator',
  category: 'layout',
  icon: 'BsDash',
  description: 'Visual divider line',
  acceptsChildren: false,
  propsSchema: {
    height: prop('number', 'Height (px)', { defaultValue: 1, min: 1, max: 10 }),
    width: prop('number', 'Width (%)', { defaultValue: 100, min: 10, max: 100 }),
  },
  defaultProps: {
    height: 1,
    width: 100,
  },
});

// ===== CONTENT COMPONENTS =====

componentRegistry.set('Title', {
  component: Title as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Title',
  category: 'content',
  icon: 'BsType',
  description: 'Text heading with customizable size and alignment',
  acceptsChildren: false,
  propsSchema: {
    text: prop('string', 'Text', { required: true, defaultValue: 'New Title' }),
    size: selectProp('Size', sizeOptions, 'medium'),
    orientation: selectProp('Alignment', orientationOptions, 'center'),
    underline: prop('boolean', 'Show Underline', { defaultValue: false }),
  },
  defaultProps: {
    text: 'New Title',
    size: 'medium',
    orientation: 'center',
    underline: false,
  },
});

componentRegistry.set('Text', {
  component: Text as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Text',
  category: 'content',
  icon: 'BsTextLeft',
  description: 'Paragraph text block',
  acceptsChildren: false,
  propsSchema: {
    content: prop('textarea', 'Content', { required: true, defaultValue: 'Enter your text here...' }),
    size: selectProp('Size', sizeOptions, 'medium'),
    orientation: selectProp('Alignment', orientationOptions, 'start'),
  },
  defaultProps: {
    content: 'Enter your text here...',
    size: 'medium',
    orientation: 'start',
  },
});

componentRegistry.set('Image', {
  component: Image as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Image',
  category: 'content',
  icon: 'BsImage',
  description: 'Display an image with optional styling',
  acceptsChildren: false,
  propsSchema: {
    path: prop('image', 'Image Path', { required: true, defaultValue: '/images/placeholder.png' }),
    objectFit: selectProp('Fit Mode', [
      { label: 'Cover', value: 'cover' },
      { label: 'Contain', value: 'contain' },
    ], 'cover'),
  },
  defaultProps: {
    path: '/images/placeholder.png',
    objectFit: 'cover',
  },
});

componentRegistry.set('Video', {
  component: Video as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Video',
  category: 'content',
  icon: 'BsPlayCircle',
  description: 'Video player component',
  acceptsChildren: false,
  propsSchema: {
    path: prop('string', 'Video URL', { required: true, defaultValue: '' }),
    width: prop('dimension', 'Width', { defaultValue: '100%' }),
    height: prop('dimension', 'Height', { defaultValue: '' }),
    aspectRatio: selectProp('Aspect Ratio', [
      { label: 'Auto', value: 'auto' },
      { label: '16:9 (Widescreen)', value: '16:9' },
      { label: '4:3 (Standard)', value: '4:3' },
      { label: '1:1 (Square)', value: '1:1' },
      { label: '9:16 (Vertical)', value: '9:16' },
    ], 'auto'),
    objectFit: selectProp('Object Fit', [
      { label: 'Cover', value: 'cover' },
      { label: 'Contain', value: 'contain' },
      { label: 'Fill', value: 'fill' },
      { label: 'None', value: 'none' },
    ], 'cover'),
    autoplay: prop('boolean', 'Autoplay', { defaultValue: true }),
    muted: prop('boolean', 'Muted', { defaultValue: true }),
    loop: prop('boolean', 'Loop', { defaultValue: true }),
    controls: prop('boolean', 'Show Controls', { defaultValue: false }),
  },
  defaultProps: {
    path: '',
    width: '100%',
    height: '',
    aspectRatio: 'auto',
    objectFit: 'cover',
    autoplay: true,
    muted: true,
    loop: true,
    controls: false,
  },
});

// ===== NAVIGATION COMPONENTS =====

componentRegistry.set('BannerImage', {
  component: BannerImage as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Banner Image',
  category: 'navigation',
  icon: 'BsCardImage',
  description: 'Full-width banner image for hero sections',
  acceptsChildren: false,
  propsSchema: {
    path: prop('image', 'Image Path', { required: true, defaultValue: '/images/placeholder.png' }),
    height: prop('number', 'Height (px)', { defaultValue: 400, min: 100, max: 800 }),
  },
  defaultProps: {
    path: '/images/placeholder.png',
    height: 400,
  },
});

// ===== INTERACTIVE COMPONENTS =====

componentRegistry.set('Button', {
  component: Button as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Button',
  category: 'interactive',
  icon: 'BsHandIndex',
  description: 'Interactive button with various styles',
  acceptsChildren: false,
  propsSchema: {
    title: prop('string', 'Label', { required: true, defaultValue: 'Click me' }),
    type: selectProp('Style', [
      { label: 'Primary', value: 'primary' },
      { label: 'White', value: 'white' },
      { label: 'Black', value: 'black' },
      { label: 'Success', value: 'success' },
      { label: 'Warning', value: 'warn' },
      { label: 'Error', value: 'error' },
      { label: 'Info', value: 'info' },
    ], 'primary'),
    size: selectProp('Size', sizeOptions, 'medium'),
    background: prop('boolean', 'Show Background', { defaultValue: true }),
    fullWidth: prop('boolean', 'Full Width', { defaultValue: false }),
  },
  defaultProps: {
    title: 'Click me',
    type: 'primary',
    size: 'medium',
    background: true,
    fullWidth: false,
  },
});

componentRegistry.set('Newsletter', {
  component: Newsletter as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Newsletter',
  category: 'interactive',
  icon: 'BsEnvelope',
  description: 'Email newsletter signup form',
  acceptsChildren: false,
  propsSchema: {
    titles: prop('array', 'Titles', {
      defaultValue: ['Subscribe to our Newsletter', 'Thank you!'],
      arrayItemSchema: prop('string', 'Title')
    }),
    descriptions: prop('array', 'Descriptions', {
      defaultValue: ['Stay updated with our latest news and offers.', 'You have successfully subscribed.'],
      arrayItemSchema: prop('string', 'Description')
    }),
  },
  defaultProps: {
    titles: ['Subscribe to our Newsletter', 'Thank you!'],
    descriptions: ['Stay updated with our latest news and offers.', 'You have successfully subscribed.'],
  },
});

componentRegistry.set('InteractiveShowcases', {
  component: InteractiveShowcasesWrapper as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Interactive Showcases',
  category: 'interactive',
  icon: 'BsGrid3X3Gap',
  description: 'Interactive showcase cards with hover animations',
  acceptsChildren: false,
  propsSchema: {
    showcases: {
      type: 'array',
      label: 'Showcases',
      defaultValue: [],
      arrayItemSchema: {
        type: 'select',
        label: 'Showcase',
        dataSource: 'showcases',
        defaultValue: '',
      },
    },
    cardWidth: prop('number', 'Card Width', { defaultValue: 250, min: 100, max: 600 }),
    cardHeight: prop('number', 'Card Height', { defaultValue: 250, min: 100, max: 600 }),
    backgroundColor: selectProp('Background', [
      { label: 'Gradient', value: 'gradient' },
      { label: 'Default (White)', value: 'default' },
    ], 'gradient'),
  },
  defaultProps: {
    showcases: [],
    cardWidth: 250,
    cardHeight: 250,
    backgroundColor: 'gradient',
  },
});

// ===== FORM COMPONENTS =====

componentRegistry.set('ContactForm', {
  component: ContactFormWrapper as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Contact Form',
  category: 'form',
  icon: 'BsEnvelopePaper',
  description: 'Contact form with configurable fields and validation',
  acceptsChildren: false,
  propsSchema: {
    formId: { type: 'select', label: 'Form', dataSource: 'forms', defaultValue: '' },
    successMessage: prop('string', 'Success Message Override', { defaultValue: '' }),
    buttonLabel: prop('string', 'Button Label Override', { defaultValue: '' }),
  },
  defaultProps: {
    formId: '',
    successMessage: '',
    buttonLabel: '',
  },
});

componentRegistry.set('DetailsSection', {
  component: DetailsSectionWrapper as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Details Section',
  category: 'content',
  icon: 'BsCardList',
  description: 'Contact details with icons (address, phone, hours)',
  acceptsChildren: false,
  propsSchema: {
    sections: {
      type: 'array',
      label: 'Sections',
      defaultValue: [
        { title: 'Adresse', icon: 'BsPinMap', image: '', descriptions: ['Rue Brederode, 16', '1000 Bruxelles, Belgique'] },
        { title: 'Téléphone', icon: 'BsTelephone', image: '', descriptions: ['01 23 45 67 89'] },
        { title: 'Horaires', icon: 'BsClock', image: '', descriptions: ['Lundi - Vendredi', '9h-18h', 'Samedi et Dimanche', '10h-12h'] },
      ],
      arrayItemSchema: {
        type: 'object',
        label: 'Section',
        objectSchema: {
          title: prop('string', 'Title', { defaultValue: 'New Section' }),
          icon: prop('icon', 'Icon', { defaultValue: 'BsInfoCircle' }),
          image: prop('image', 'Image', { defaultValue: '' }),
          descriptions: {
            type: 'array',
            label: 'Descriptions',
            defaultValue: [''],
            arrayItemSchema: prop('string', 'Line'),
          },
        },
      },
    },
    backgroundColor: prop('color', 'Background Color', { defaultValue: '' }),
    iconBackgroundColor: prop('color', 'Icon Background', { defaultValue: '' }),
    textColor: prop('color', 'Text Color', { defaultValue: '' }),
  },
  defaultProps: {
    sections: [
      { title: 'Adresse', icon: 'BsPinMap', image: '', descriptions: ['Rue Brederode, 16', '1000 Bruxelles, Belgique'] },
      { title: 'Téléphone', icon: 'BsTelephone', image: '', descriptions: ['01 23 45 67 89'] },
      { title: 'Horaires', icon: 'BsClock', image: '', descriptions: ['Lundi - Vendredi', '9h-18h', 'Samedi et Dimanche', '10h-12h'] },
    ],
    backgroundColor: '',
    iconBackgroundColor: '',
    textColor: '',
  },
});

// ===== BUSINESS COMPONENTS =====

componentRegistry.set('Catalog', {
  component: Catalog as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Product Catalog',
  category: 'business',
  icon: 'BsShop',
  description: 'Display product catalog with search and pagination',
  acceptsChildren: false,
  propsSchema: {
    searchBar: prop('boolean', 'Show Search Bar', { defaultValue: true }),
    pagination: prop('boolean', 'Show Pagination', { defaultValue: true }),
    itemsPerPage: prop('number', 'Items Per Page', { defaultValue: 6, min: 3, max: 12 }),
  },
  defaultProps: {
    searchBar: true,
    pagination: true,
    itemsPerPage: 6,
  },
});

componentRegistry.set('OrderProcess', {
  component: OrderProcessWrapper as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Delivery Process',
  category: 'business',
  icon: 'BsTruck',
  description: 'Full delivery process with basket, address, and payment steps',
  acceptsChildren: false,
  propsSchema: {
    defaultProductCount: prop('number', 'Default Product Count', { defaultValue: 1, min: 0, max: 10 }),
  },
  defaultProps: {
    defaultProductCount: 1,
  },
});

// ===== ADDITIONAL CONTENT COMPONENTS =====

componentRegistry.set('Testimonials', {
  component: Testimonials as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Testimonials',
  category: 'content',
  icon: 'BsChatQuote',
  description: 'Customer testimonials carousel with auto-rotation',
  acceptsChildren: false,
  propsSchema: {
    delayMs: prop('number', 'Auto-rotate Delay (ms)', { defaultValue: 5000, min: 1000, max: 15000 }),
  },
  defaultProps: {
    delayMs: 5000,
  },
});

componentRegistry.set('Carousel', {
  component: CarouselWrapper as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Image Carousel',
  category: 'content',
  icon: 'BsImages',
  description: 'Slideshow of images with transitions',
  acceptsChildren: false,
  propsSchema: {
    image1: prop('image', 'Image 1', { defaultValue: '/images/placeholder.png' }),
    image2: prop('image', 'Image 2', { defaultValue: '/images/placeholder.png' }),
    image3: prop('image', 'Image 3', { defaultValue: '' }),
    image4: prop('image', 'Image 4', { defaultValue: '' }),
    transition: selectProp('Transition', [
      { label: 'Swipe', value: 'swipe' },
      { label: 'Circle', value: 'circle' },
    ], 'swipe'),
    autoRotate: prop('boolean', 'Auto-rotate', { defaultValue: false }),
    delayMs: prop('number', 'Auto-rotate Delay (ms)', { defaultValue: 3000, min: 1000, max: 10000 }),
  },
  defaultProps: {
    image1: '/images/placeholder.png',
    image2: '/images/placeholder.png',
    image3: '',
    image4: '',
    transition: 'swipe',
    autoRotate: false,
    delayMs: 3000,
  },
});

componentRegistry.set('ParallaxCover', {
  component: ParallaxCover as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Parallax Cover',
  category: 'navigation',
  icon: 'BsLayers',
  description: 'Parallax scrolling image effect',
  acceptsChildren: false,
  propsSchema: {
    imagePath: prop('image', 'Image Path', { required: true, defaultValue: '/images/placeholder.png' }),
    height: prop('number', 'Height (px)', { defaultValue: 300, min: 100, max: 800 }),
    objectFit: selectProp('Object Fit', [
      { value: 'cover', label: 'Cover' },
      { value: 'contain', label: 'Contain' },
      { value: 'fill', label: 'Fill' },
    ], { defaultValue: 'cover' }),
    objectPosition: selectProp('Object Position', [
      { value: 'center', label: 'Center' },
      { value: 'top', label: 'Top' },
      { value: 'bottom', label: 'Bottom' },
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
    ], { defaultValue: 'center' }),
    scrollStart: prop('number', 'Scroll Start (%)', { defaultValue: -10, min: -100, max: 100 }),
    scrollEnd: prop('number', 'Scroll End (%)', { defaultValue: 210, min: 100, max: 400 }),
    overlayColor: prop('color', 'Overlay Color', { defaultValue: '' }),
    overlayOpacity: prop('number', 'Overlay Opacity (%)', { defaultValue: 50, min: 0, max: 100 }),
    useMaskImage: prop('boolean', 'Use Mask Image', { defaultValue: false }),
    maskImagePath: prop('image', 'Mask Image', { defaultValue: '' }),
  },
  defaultProps: {
    imagePath: '/images/placeholder.png',
    height: 300,
    objectFit: 'cover',
    objectPosition: 'center',
    scrollStart: -10,
    scrollEnd: 210,
    overlayColor: '',
    overlayOpacity: 50,
    useMaskImage: false,
    maskImagePath: '',
  },
});

componentRegistry.set('DescriptionAndImage', {
  component: DescriptionAndImageWrapper as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Text & Image',
  category: 'content',
  icon: 'BsLayoutTextWindow',
  description: 'Text content with image side by side',
  acceptsChildren: false,
  propsSchema: {
    text: prop('string', 'Text Content', { defaultValue: 'Add your description here...' }),
    orientation: selectProp('Layout', [
      { label: 'Image Left', value: 'end' },
      { label: 'Text Left', value: 'start' },
      { label: 'Centered', value: 'center' },
    ], 'start'),
    axis: selectProp('Direction', [
      { label: 'Horizontal', value: 'row' },
      { label: 'Vertical', value: 'col' },
    ], 'row'),
    imagePath: prop('image', 'Image Path', { defaultValue: '/images/placeholder.png' }),
    imageCaption: prop('string', 'Image Caption', { defaultValue: '' }),
    shape: selectProp('Image Shape', [
      { label: 'Default', value: 'none' },
      { label: 'Circle', value: 'circle' },
    ], 'none'),
    flip: prop('boolean', 'Flip Animation on Hover', { defaultValue: false }),
    fullWidth: prop('boolean', 'Full Width', { defaultValue: false }),
  },
  defaultProps: {
    text: 'Add your description here...',
    orientation: 'start',
    axis: 'row',
    imagePath: '/images/placeholder.png',
    imageCaption: '',
    shape: 'none',
    flip: false,
    fullWidth: false,
  },
});

componentRegistry.set('Tooltip', {
  component: Tooltip as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Tooltip',
  category: 'utility',
  icon: 'BsChat',
  description: 'Tooltip modifier - drag onto an existing component to add a hover tooltip',
  acceptsChildren: false,
  hideSpacing: true,
  isModifier: true,
  propsSchema: {
    text: prop('string', 'Tooltip Text', { required: true, defaultValue: 'Hover for info' }),
    position: selectProp('Position', [
      { label: 'Bottom', value: 'bottom' },
      { label: 'Top', value: 'top' },
      { label: 'Left', value: 'left' },
      { label: 'Right', value: 'right' },
    ], 'bottom'),
    opacity: prop('number', 'Opacity (%)', { defaultValue: 100, min: 0, max: 100 }),
    maxWidthMode: selectProp('Max Width', [
      { label: 'Auto', value: 'auto' },
      { label: 'Custom', value: 'custom' },
    ], 'auto'),
    maxWidthAuto: {
      type: 'select',
      label: 'Width Type',
      options: [
        { label: 'Fit Content', value: 'fit-content' },
        { label: 'Max Content', value: 'max-content' },
      ],
      defaultValue: 'fit-content',
      showWhen: { prop: 'maxWidthMode', equals: 'auto' },
    },
    maxWidthCustom: {
      type: 'dimension',
      label: 'Width Value',
      defaultValue: '250px',
      showWhen: { prop: 'maxWidthMode', equals: 'custom' },
    },
    maxHeightMode: selectProp('Max Height', [
      { label: 'Auto', value: 'auto' },
      { label: 'Custom', value: 'custom' },
    ], 'auto'),
    maxHeightAuto: {
      type: 'select',
      label: 'Height Type',
      options: [
        { label: 'Fit Content', value: 'fit-content' },
        { label: 'Max Content', value: 'max-content' },
      ],
      defaultValue: 'fit-content',
      showWhen: { prop: 'maxHeightMode', equals: 'auto' },
    },
    maxHeightCustom: {
      type: 'dimension',
      label: 'Height Value',
      defaultValue: '150px',
      showWhen: { prop: 'maxHeightMode', equals: 'custom' },
    },
    overflow: selectProp('Overflow', [
      { label: 'Visible', value: 'visible' },
      { label: 'Scrollable', value: 'scroll' },
      { label: 'Truncate', value: 'truncate' },
    ], 'visible'),
    link: prop('string', 'Click URL', { defaultValue: '' }),
  },
  defaultProps: {
    text: 'Hover for info',
    position: 'bottom',
    opacity: 100,
    maxWidthMode: 'auto',
    maxWidthAuto: 'fit-content',
    maxWidthCustom: '250px',
    maxHeightMode: 'auto',
    maxHeightAuto: 'fit-content',
    maxHeightCustom: '150px',
    overflow: 'visible',
    link: '',
  },
});

componentRegistry.set('Footer', {
  component: Footer as unknown as React.ComponentType<Record<string, unknown>>,
  displayName: 'Footer',
  category: 'navigation',
  icon: 'BsWindowDock',
  description: 'Site footer with links and social media',
  acceptsChildren: false,
  propsSchema: {},
  defaultProps: {},
});

/**
 * Get a component entry by type name
 */

export function getComponent(type: string): ComponentRegistryEntry | undefined {
  return componentRegistry.get(type);
}

/**
 * Get all components in a specific category
 */

export function getComponentsByCategory(
  category: ComponentCategory
): ComponentRegistryEntry[] {
  return Array.from(componentRegistry.values()).filter(
    (entry) => entry.category === category
  );
}

/**
 * Get all registered components (includes type key)
 */

export function getAllComponents(): ComponentRegistryEntry[] {
  return Array.from(componentRegistry.entries()).map(([type, entry]) => ({
    ...entry,
    type,
  }));
}

/**
 * Get all component types (keys)
 */

export function getComponentTypes(): string[] {
  return Array.from(componentRegistry.keys());
}

/**
 * Get all available categories
 */

export function getCategories(): ComponentCategory[] {
  return ['layout', 'content', 'navigation', 'interactive', 'form', 'business', 'utility'];
}

/**
 * Check if a component type exists in the registry
 */

export function hasComponent(type: string): boolean {
  return componentRegistry.has(type);
}

export default componentRegistry;
