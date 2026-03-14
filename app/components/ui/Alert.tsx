"use client";

import { useState, type ReactNode } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
} from "lucide-react";

type AlertVariant = "success" | "warning" | "error" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const config: Record<
  AlertVariant,
  { icon: typeof Info; bg: string; border: string; text: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    iconColor: "text-green-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    iconColor: "text-yellow-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-500",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
  },
};

export default function Alert({
  variant = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  className = "",
}: AlertProps) {
  const [visible, setVisible] = useState(true);
  const c = config[variant];
  const Icon = c.icon;

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-lg border ${c.bg} ${c.border} ${className}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.iconColor}`} />
      <div className={`flex-1 text-sm ${c.text}`}>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition ${c.text}`}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
