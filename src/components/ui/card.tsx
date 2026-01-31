import { HTMLAttributes, forwardRef } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-lg bg-white shadow ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`border-b border-gray-200 px-4 py-3 ${className}`}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => {
    return <div ref={ref} className={`p-4 ${className}`} {...props} />;
  }
);

CardContent.displayName = 'CardContent';
