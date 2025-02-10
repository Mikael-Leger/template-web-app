import React from 'react';

import { Step } from '@/app/interfaces/step.interface';
import DynamicIcon from '../dynamic-icon/dynamic-icon';

import './progression.scss';

interface ProgressionProps {
  steps: Step[];
  currentStep: number;
  onClick: (_stepNumber: number) => void;
}

export default function Progression({steps, currentStep, onClick}: ProgressionProps) {
  const calculateWidth = () => {
    const base = 100 / (steps.length - 1) / 2;
    const stepGap = 100 / (steps.length - 1);
    const res = base + (stepGap * currentStep);

    return `calc(${Math.min(res, 100)}%)`;
  };

  return (
    <div className='progression flex flex-col gap-2 w-full'>
      <div className='progression-steps flex flex-row justify-center'>
        {steps.map(step => {
          if (step.number === steps.length - 1) return;
          
          return (
            <div
              className={`progression-steps-step ${step.number < currentStep && 'step-done cursor-pointer'} flex-1 flex justify-center items-center gap-2`}
              onClick={() => onClick(step.number)}
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
          );})}
      </div>
      <div className='progression-bars relative'>
        <div className='progression-bars-shadow absolute w-full'/>
        <div className='progression-bars-current' style={{width: calculateWidth()}}/>
      </div>
    </div>
  );
}