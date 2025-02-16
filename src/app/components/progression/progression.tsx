import React from 'react';

import { Step } from '@/app/interfaces/step.interface';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import { useIsMobile } from '@/app/contexts/mobile-context';

import './progression.scss';

interface ProgressionProps {
  steps: Step[];
  currentStep: number;
  onClick: (_stepNumber: number) => void;
}

export default function Progression({steps, currentStep, onClick}: ProgressionProps) {
  const {isMobile} = useIsMobile();

  const calculateSize = () => {
    const base = 100 / (steps.length - 1) / 2;
    const stepGap = 100 / (steps.length - 1);
    const res = base + (stepGap * currentStep);

    return `calc(${Math.min(res, 100)}%)`;
  };

  const renderSteps = () => {
    return (
      <div className={`progression-steps flex ${isMobile ? 'flex-col' : 'flex-row'} justify-center`}>
        {steps.map(step => {
          if (step.number === steps.length - 1) return;
          
          return (
            <div
              className={`progression-steps-step ${step.number < currentStep && 'step-done'} ${(step.number < currentStep && currentStep !== steps.length - 1) && 'cursor-pointer'} flex-1 flex ${isMobile ? 'justify-start' : 'justify-center'} items-center gap-2`}
              onClick={() => {
                if (currentStep === steps.length - 1) return;
                
                onClick(step.number);
              }}
              key={step.number}>
              {step.number < currentStep && (
                <div className='progression-steps-step-icon'>
                  <DynamicIcon iconName='BsCheck2Circle'/>
                </div>
              )}
              <div className='progression-steps-step-title'>
                {step.number + 1}. {step.title}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBar = () => {
    return (
      <div className='progression-bars relative'>
        <div className='progression-bars-shadow absolute w-full'/>
        <div
          className='progression-bars-current'
          style={{
            width: isMobile ? '8px' : calculateSize(),
            height: isMobile ? calculateSize() : '4px'
          }}/>
      </div>
    );
  };

  return (
    <div className={`progression justify-center flex ${isMobile ? 'flex-row' : 'flex-col'} gap-2 w-full`}>
      {isMobile ? <>{renderBar()}{renderSteps()}</> : <>{renderSteps()}{renderBar()}</>}
    </div>
  );
}