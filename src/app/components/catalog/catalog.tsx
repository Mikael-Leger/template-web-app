import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import productsJson from '@/app/data/products.json';
import { useIsMobile } from '@/app/contexts/mobile-context';
import { ProductItem } from '@/app/interfaces/product.interface';
import Product from '../product/product';
import Button from '../button/button';
import Separator from '../separator/separator';
import DynamicIcon from '../dynamic-icon/dynamic-icon';

import './catalog.scss';

interface CatalogAction {
  value: string;
  title?: string | number;
  icon?: {
    path: string;
    orientation?: 'start' | 'end';
  };
  disabled?: boolean;
  onClick?: () => void;
}

interface CatalogFilters {
  limit: number;
  offset: number;
  tags: string[];
}

interface CatalogProps {
  pagination?: boolean;
  itemsPerPage?: number;
  totalVisiblePages?: number;
}

const productItems: ProductItem[] = productsJson.sort((a, b) => (a.tags.includes('nouveau') ? -1 : b.tags.includes('nouveau') ? 1 : 0));

export default function Catalog({itemsPerPage, totalVisiblePages = 5, pagination = false}: CatalogProps) {
  const {isMobile, breakpoint} = useIsMobile();
  const [itemsFiltered, setItemsFiltered] = useState<ProductItem[]>([]);
  const [filters, setFilters] = useState<CatalogFilters>({
    limit: pagination ? Math.min(productItems.length, itemsPerPage ?? 999999) : productItems.length,
    offset: 0,
    tags: [],
  });

  const refreshOrientation = useRef<'none' | 'prev' | 'next'>('none');

  useEffect(() => {
    setItemsFiltered(productItems);
  }, []);

  useEffect(() => {
    const products = document.getElementsByClassName('product');
    
    if (!products || products.length === 0) return;

    const xMove = 600;
    let newX = 0;
    if (refreshOrientation.current === 'prev') newX = -xMove;
    if (refreshOrientation.current === 'next') newX = xMove;

    gsap.from(products, {
      opacity: 0,
      x: newX,
    });
  }, [filters]);

  useEffect(() => {
    if (itemsFiltered.length === 0) return;

    refreshAnimation();
  }, [itemsFiltered]);

  const clearFilters = () => {
    refreshOrientation.current = 'none';
    setFilters({
      limit: pagination ? Math.min(productItems.length, itemsPerPage ?? 999999) : productItems.length,
      offset: 0,
      tags: [],
    });
  };

  const refreshAnimation = () => {
    gsap.fromTo('.product', {
      opacity: 0
    },
    {
      opacity: 1
    });
  };

  const filterItemsByTag = (tag: string = '') => {
    clearFilters();

    setFilters(prevFilters => {
      let updatedTags = [...prevFilters.tags];
  
      if (tag === '') {
        updatedTags = [];
      } else {
        updatedTags = [tag];
      }
  
      const filteredItems = productItems.filter(productItem =>
        updatedTags.length === 0 || updatedTags.some(t => productItem.tags?.includes(t))
      );
  
      setItemsFiltered(filteredItems);
      
      return { ...prevFilters, tags: updatedTags };
    });
  };

  const getAllTags = () => {
    return [...new Set(productItems.flatMap(item => item.tags || []))].sort((a, b) => (a === 'nouveau' ? -1 : b === 'nouveau' ? 1 : 0));
  };

  const handleFirst = () => {
    refreshOrientation.current = 'prev';
    setFilters(prevFilters => {
      const updatedFilters = {...prevFilters};
      updatedFilters.offset = 0;

      return updatedFilters;
    });
  };

  const handlePrev = () => {
    refreshOrientation.current = 'prev';
    setFilters(prevFilters => {
      const updatedFilters = {...prevFilters};
      updatedFilters.offset -= prevFilters.limit;

      return updatedFilters;
    });
  };

  const handleCurrent = (value: number) => {
    setFilters(prevFilters => {
      const updatedFilters = {...prevFilters};
      updatedFilters.offset = prevFilters.limit * value;
      
      refreshOrientation.current = updatedFilters.offset <= prevFilters.offset ? 'prev' : 'next';

      return updatedFilters;
    });
    
  };

  const handleNext = () => {
    refreshOrientation.current = 'next';
    setFilters(prevFilters => {
      const updatedFilters = {...prevFilters};
      updatedFilters.offset += prevFilters.limit;

      return updatedFilters;
    });
  };

  const handleLast = () => {
    refreshOrientation.current = 'next';
    setFilters(prevFilters => {
      const updatedFilters = {...prevFilters};
      const truncate = Math.trunc((itemsFiltered.length - 1) / updatedFilters.limit);
      updatedFilters.offset = truncate * updatedFilters.limit;

      return updatedFilters;
    });
  };

  const actions: CatalogAction[] = [
    {
      value: 'first',
      icon: {
        path: 'BsChevronDoubleLeft',
        orientation: 'start'
      },
      disabled: filters.offset === 0,
      onClick: handleFirst,
    },
    {
      value: 'prev',
      icon: {
        path: 'BsChevronLeft',
        orientation: 'start'
      },
      disabled: filters.offset === 0,
      onClick: handlePrev,
    },
    {
      value: 'current'
    },
    {
      value: 'next',
      icon: {
        path: 'BsChevronRight',
      },
      disabled: filters.offset >= itemsFiltered.length - filters.limit,
      onClick: handleNext,
    },
    {
      value: 'last',
      icon: {
        path: 'BsChevronDoubleRight',
      },
      disabled: filters.offset >= itemsFiltered.length - filters.limit,
      onClick: handleLast,
    },
  ];

  const renderAction = (action: CatalogAction) => {
    return (
      <Button
        icon={
          action.icon && {
            node: <DynamicIcon iconName={action.icon.path} size={18}/>,
            orientation: action.icon.orientation
          }}
        fullHeight
        outline={typeof action.title === 'number' && (Math.trunc(filters.offset / filters.limit) !== action.title - 1)}
        title={action.title}
        size={isMobile ? 'small' : 'medium'}
        disabled={action.disabled}
        onClick={action.onClick}
        key={action.value}/>
    );
  };

  const getPaginationAsArray = (): number[] => {
    const totalPages = Math.ceil(itemsFiltered.length / filters.limit);
    const pageIndex = Math.floor(filters.offset / filters.limit);
    const visiblePages = Math.min(isMobile ? 3 : totalVisiblePages, totalPages);
  
    let startPage = Math.max(0, pageIndex - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;
  
    if (endPage >= totalPages) {
      endPage = totalPages - 1;
      startPage = Math.max(0, endPage - visiblePages + 1);
    }
  
    const array = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return array;
  };

  const renderActions = () => {
    return (
      <div className='catalog-actions flex flex-row flex-gap justify-center padding-inner'>
        {actions
          .filter(action => action.value === 'prev' || action.value === 'current' || action.value === 'next' || !isMobile)
          .map(action => (
            action.value === 'current' ? 
              (
                getPaginationAsArray().map((pageIndex) => {
                  const value =`page-${pageIndex}`;
                  const actionCurrent: CatalogAction = {
                    value,
                    title: pageIndex + 1,
                    onClick: () => handleCurrent(pageIndex),
                  };

                  return (
                    <div className='catalog-actions-action' key={value}>
                      {renderAction(actionCurrent)}
                    </div>
                  );
                })
              ) : (
                <div className='catalog-actions-action' key={action.value}>
                  {renderAction(action)}
                </div>
              )
          ))}
      </div>
    );
  };

  const getItemsPerRow = (): number => {
    switch (breakpoint) {
    case 'xxs':
      return 1;
    case 'xs':
      return 2;
    case 'sm':
      return 2;
    case 'md':
      return 3;
    case 'lg':
      return 4;
    case 'xl':
      return 5;
    default:
      return 6;
    }
  };
  
  const renderProductsList = () => {
    const itemsPerRow = getItemsPerRow();
    
    const groupedProducts = itemsFiltered
      .filter((_, index) => index >= filters.offset && index < filters.offset + filters.limit)
      .reduce((acc, item, index) => {
        if (index % itemsPerRow === 0) acc.push([]);
        acc[acc.length - 1].push(item);

        return acc;
      }, [] as ProductItem[][]);

    return (
      <div
        className={'catalog-products flex flex-col items-center'}
        style={{height: getProductsListHeight()}}>
        {groupedProducts.map((group, groupIndex) => (
          <div className={`catalog-products-list list-${groupIndex} flex flex-row flex-gap justify-center`} key={groupIndex}>
            {group.map(productItem => (
              <Product item={productItem} key={productItem.title}/>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const getProductsListHeight = () => {
    const productHeight = 400;

    let times = 0;

    switch (breakpoint) {
    case 'xxs':
      times = filters.limit;

      return productHeight * (times + 1);
    case 'xs':
      times = Math.trunc(filters.limit / 2);

      return (productHeight + 20 * times) * (times + 1);
    case 'sm':
      times = Math.trunc(filters.limit / 2);

      return (productHeight + 25 * times) * (times + 1);
    case 'md':
      times = Math.trunc(filters.limit / 3);

      return (productHeight + 25 * times) * (times + 1);
    default:
      times = Math.trunc(filters.limit / filters.limit);

      return (productHeight + 70 * times) * (times + 1);
    }
  };

  const renderPagination = (bottom: boolean = false) => {
    return (
      <>
        {renderActions()}
        {bottom && (
          <div className='catalog-pages flex justify-center'>
            {`[${((filters.offset + 1) / filters.limit) * filters.limit} - ${((filters.offset / filters.limit) + 1) * filters.limit}] sur ${itemsFiltered.length}`}
          </div>
        )}
      </>
    );
  };

  const renderTag = (tag: string, outline: boolean, noTag: boolean = false) => {
    return <Button
      width={isMobile ? '40%' : '20%'}
      title={tag}
      onClick={() => filterItemsByTag(noTag ? '' : tag)}
      outline={outline}
      key={tag}/>;
  };

  const renderFilters = () => {
    return (
      <div className='catalog-filters flex flex-row flex-wrap justify-center items-center w-full'>
        <div className='catalog-filters-tags flex flex-wrap justify-center w-[80%]'>
          {renderTag('Tous', filters.tags.length !== 0, true)}
          {getAllTags().map(tag => (
            renderTag(tag, !filters.tags.includes(tag))
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className='catalog flex flex-col items-center'>
      {renderFilters()}
      {pagination && isMobile && renderPagination()}
      <Separator height={2}/>
      {renderProductsList()}
      <Separator height={2}/>
      {pagination && renderPagination(true)}
    </div>
  );
}
