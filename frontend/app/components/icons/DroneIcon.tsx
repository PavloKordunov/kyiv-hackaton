import React from 'react';

interface DroneIconProps {
  className?: string;
  strokeWidth?: number;
}

export function DroneIcon({ className = "size-6", strokeWidth = 2 }: DroneIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
   
      <rect x="9" y="9" width="6" height="6" rx="1" />

      
      <line x1="9" y1="9" x2="4" y2="4" />   
      <line x1="15" y1="9" x2="20" y2="4" />  
      <line x1="9" y1="15" x2="4" y2="20" />  
      <line x1="15" y1="15" x2="20" y2="20" /> 

      
      <circle cx="4" cy="4" r="2" />   
      <circle cx="20" cy="4" r="2" />  
      <circle cx="4" cy="20" r="2" /> 
      <circle cx="20" cy="20" r="2" /> 


      {/* <path d="M16 16C19 13 22 14 23 16C24 18 22 22 18 22C16 22 15 19 16 16Z" fill="#22c55e" stroke="none" /> */}
    </svg>
  );
}