import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }: CardFooterProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
