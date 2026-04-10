import React from 'react';

interface TextWithLinksProps {
  text: string;
  linkClassName?: string;
}

export default function TextWithLinks({ text, linkClassName = "text-blue-500 hover:text-blue-600 underline font-medium break-all" }: TextWithLinksProps) {
  if (!text) return null;

  // Split text by URL (http:// or https://)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a 
              key={index} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={linkClassName}
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}
