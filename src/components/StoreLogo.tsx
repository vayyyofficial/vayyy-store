import React from 'react';

/**
 * Official single logo source for Vayyy.Store
 * All components and pages must reference this constant or the StoreLogo component.
 * Location: assets/logo.png (served as /assets/logo.png in Vite public directory)
 */
export const STORE_LOGO = '/assets/logo.png';

export interface StoreLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number | string;
  variant?: 'circle' | 'rounded' | 'square';
}

export const StoreLogo: React.FC<StoreLogoProps> = ({
  size = 36,
  width,
  height,
  className = '',
  style,
  alt = 'Vayyy.Store Logo',
  variant = 'circle',
  ...props
}) => {
  const finalSize = width || size;
  const borderRadius =
    variant === 'circle' ? '50%' : variant === 'rounded' ? '10px' : '0';

  return (
    <img
      src={STORE_LOGO}
      alt={alt}
      width={finalSize}
      height={height || finalSize}
      className={`store-brand-logo ${className}`.trim()}
      style={{
        width: typeof finalSize === 'number' ? `${finalSize}px` : finalSize,
        height: typeof (height || finalSize) === 'number' ? `${height || finalSize}px` : (height || finalSize),
        borderRadius,
        objectFit: 'cover',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
      loading="eager"
      {...props}
    />
  );
};

export default StoreLogo;
