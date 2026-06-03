'use client';

import React, { useState, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';

const AccordionContext = createContext(null);

export function Accordion({ type = 'single', collapsible = true, defaultValue, value, onValueChange, className = '', children, ...props }) {
  const [activeValue, setActiveValue] = useState(defaultValue || null);

  const isExpanded = (val) => {
    return activeValue === val;
  };

  const toggleItem = (val) => {
    if (activeValue === val) {
      if (collapsible) {
        setActiveValue(null);
      }
    } else {
      setActiveValue(val);
    }
  };

  return (
    <AccordionContext.Provider value={{ activeValue, toggleItem, isExpanded }}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, className = '', children, ...props }) {
  return (
    <div
      data-state={useContext(AccordionContext).isExpanded(value) ? 'open' : 'closed'}
      className={`border-b ${className}`}
      {...props}
    >
      <AccordionContext.Provider value={{ ...useContext(AccordionContext), itemValue: value }}>
        {children}
      </AccordionContext.Provider>
    </div>
  );
}

export function AccordionTrigger({ className = '', children, ...props }) {
  const { toggleItem, isExpanded, itemValue } = useContext(AccordionContext);
  const expanded = isExpanded(itemValue);

  return (
    <div className="flex">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => toggleItem(itemValue)}
        className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[aria-expanded=true]>svg]:rotate-180 cursor-pointer ${className}`}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    </div>
  );
}

export function AccordionContent({ className = '', children, ...props }) {
  const { isExpanded, itemValue } = useContext(AccordionContext);
  const expanded = isExpanded(itemValue);

  return (
    <div
      className={`overflow-hidden text-sm transition-all pb-4 ${expanded ? 'block' : 'hidden'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
