import React from 'react';
import { getSafeExternalUrl } from '../utils/externalLinks';

const SafeExternalLink = ({
  href,
  allowedHosts,
  className,
  children,
  fallbackClassName,
  title,
}) => {
  const safeHref = getSafeExternalUrl(href, { allowedHosts });

  if (!safeHref) {
    return (
      <span
        className={fallbackClassName || className}
        aria-disabled="true"
        title={title}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
    >
      {children}
    </a>
  );
};

export default SafeExternalLink;
