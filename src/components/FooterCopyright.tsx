import React from 'react';

interface FooterCopyrightProps {
  className?: string;
  linkClassName?: string;
}

export default function FooterCopyright({ 
  className = "text-neutral-500 text-sm",
  linkClassName = "text-amber-500 hover:text-amber-400 font-medium hover:underline transition-colors"
}: FooterCopyrightProps) {
  return (
    <p className={`tracking-normal ${className}`}>
      &copy; 2026 Asado Cafe. All rights reserved. Designed &amp; Developed by{' '}
      <a 
        href="mailto:helloamar36@gmail.com" 
        className={linkClassName}
        title="Contact ARJ Digital"
      >
        ARJ Digital
      </a>
    </p>
  );
}
