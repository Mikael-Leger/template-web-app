'use client';

import React, { useState, useMemo } from 'react';
import {
  BsCardChecklist,
  BsCardList,
  BsGrid,
  BsGrid3X3Gap,
  BsDash,
  BsType,
  BsTextLeft,
  BsImage,
  BsPlayCircle,
  BsCardImage,
  BsHandIndex,
  BsEnvelope,
  BsEnvelopePaper,
  BsShop,
  BsTruck,
  BsLayers,
  BsPuzzle,
  BsChatQuote,
  BsImages,
  BsLayoutTextWindow,
  BsChat,
  BsWindowDock,
} from 'react-icons/bs';

import { useEditor } from '../../contexts/editor-context';
import {
  getAllComponents,
  getCategories,
  getComponent,
} from '../../registry/component-registry';
import { ComponentCategory, ComponentRegistryEntry } from '../../interfaces/page-config.interface';
import LayerTree from './layer-tree';

// Icon map for component icons
const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  BsCardChecklist,
  BsCardList,
  BsGrid,
  BsGrid3X3Gap,
  BsDash,
  BsType,
  BsTextLeft,
  BsImage,
  BsPlayCircle,
  BsCardImage,
  BsHandIndex,
  BsEnvelope,
  BsEnvelopePaper,
  BsShop,
  BsTruck,
  BsChatQuote,
  BsImages,
  BsLayers,
  BsLayoutTextWindow,
  BsChat,
  BsWindowDock,
};

// Category display names
const categoryNames: Record<ComponentCategory, string> = {
  layout: 'Layout',
  content: 'Content',
  navigation: 'Navigation',
  interactive: 'Interactive',
  form: 'Forms',
  business: 'Business',
  utility: 'Utility',
};

export default function ComponentSidebar() {
  const { addComponent, state, setSidebarTab, dispatch } = useEditor();
  const [searchQuery, setSearchQuery] = useState('');
  const activeTab = state.sidebarTab;

  const allComponents = useMemo(() => getAllComponents(), []);
  const categories = useMemo(() => getCategories(), []);

  // Filter components by search
  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return allComponents;

    const query = searchQuery.toLowerCase();

    return allComponents.filter(
      (comp) =>
        comp.displayName.toLowerCase().includes(query) ||
        comp.description.toLowerCase().includes(query)
    );
  }, [allComponents, searchQuery]);

  // Group by category
  const componentsByCategory = useMemo(() => {
    const grouped: Record<ComponentCategory, ComponentRegistryEntry[]> = {
      layout: [],
      content: [],
      navigation: [],
      interactive: [],
      form: [],
      business: [],
      utility: [],
    };

    filteredComponents.forEach((comp) => {
      grouped[comp.category].push(comp);
    });

    return grouped;
  }, [filteredComponents]);

  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.effectAllowed = 'copy';
    dispatch({ type: 'START_DRAG', payload: componentType });
  };

  const handleDragEnd = () => {
    dispatch({ type: 'END_DRAG' });
  };

  const handleClick = (componentType: string) => {
    if (!componentType) return;

    // Modifier components can only be dropped onto existing components
    const registryEntry = getComponent(componentType);
    if (registryEntry?.isModifier) return;

    // Add component to root level when clicked
    const index = state.page?.components.length || 0;

    addComponent(componentType, null, index);
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];

    if (IconComponent) {
      return <IconComponent size={16}/>;
    }

    return null;
  };

  return (
    <aside className='editor-sidebar'>
      <div className='editor-sidebar-tabs'>
        <button
          className={`editor-sidebar-tab ${activeTab === 'components' ? 'active' : ''}`}
          onClick={() => setSidebarTab('components')}
        >
          <BsPuzzle size={14} />
          Components
        </button>
        <button
          className={`editor-sidebar-tab ${activeTab === 'layers' ? 'active' : ''}`}
          onClick={() => setSidebarTab('layers')}
        >
          <BsLayers size={14} />
          Layers
        </button>
      </div>

      {activeTab === 'components' ? (
        <>
          <div className='editor-sidebar-search'>
            <input
              type='text'
              placeholder='Search components...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className='editor-sidebar-content'>
            {categories.map((category) => {
              const components = componentsByCategory[category];

              if (components.length === 0) return null;

              return (
                <div key={category} className='editor-sidebar-category'>
                  <div className='editor-sidebar-category-title'>
                    {categoryNames[category]}
                  </div>
                  {components.map((comp) => (
                    <div
                      key={comp.type || comp.displayName}
                      className={`editor-sidebar-item ${comp.isModifier ? 'editor-sidebar-item-modifier' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, comp.type || '')}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleClick(comp.type || '')}
                      title={comp.isModifier ? 'Drag onto an existing component' : comp.description}
                    >
                      <div className='editor-sidebar-item-icon'>
                        {renderIcon(comp.icon)}
                      </div>
                      <div className='editor-sidebar-item-info'>
                        <div className='editor-sidebar-item-info-name'>
                          {comp.displayName}
                          {comp.isModifier && <span className='editor-sidebar-item-modifier-badge'>MOD</span>}
                        </div>
                        <div className='editor-sidebar-item-info-desc'>
                          {comp.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <LayerTree />
      )}
    </aside>
  );
}
