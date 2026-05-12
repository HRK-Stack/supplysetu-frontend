// src/components/ui/Card.tsx

import type {
  HTMLAttributes,
  ReactNode,
} from "react";

interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;

  padding?:
    | "none"
    | "sm"
    | "md"
    | "lg";

  shadow?:
    | "none"
    | "sm"
    | "md";

  hoverable?: boolean;
}

function cn(
  ...classes: Array<
    string | undefined | null | false
  >
) {
  return classes
    .filter(Boolean)
    .join(" ");
}

const paddingVariants = {
  none: "",

  sm: "p-4",

  md: "p-5",

  lg: "p-6",
};

const shadowVariants = {
  none: "",

  sm: "shadow-sm",

  md: "shadow-md",
};

export function Card({
  children,
  className,
  padding = "md",
  shadow = "none",
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        /*
          ===================================
          Base Styles
          ===================================
        */

        "rounded-xl border border-[var(--border)] bg-[var(--white)]",

        /*
          ===================================
          Layout
          ===================================
        */

        "transition-all duration-200",

        /*
          ===================================
          Padding
          ===================================
        */

        paddingVariants[
          padding
        ],

        /*
          ===================================
          Shadow
          ===================================
        */

        shadowVariants[
          shadow
        ],

        /*
          ===================================
          Hover State
          ===================================
        */

        hoverable &&
          "hover:border-[var(--navy-soft)] hover:shadow-sm",

        className,
      )}

      {...props}
    >
      {children}
    </div>
  );
}

/*
  ===================================
  Card Header
  ===================================
*/

interface CardHeaderProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({
  children,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-1 border-b border-[var(--border)] pb-4",

        className,
      )}

      {...props}
    >
      {children}
    </div>
  );
}

/*
  ===================================
  Card Title
  ===================================
*/

interface CardTitleProps
  extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function CardTitle({
  children,
  className,
  ...props
}: CardTitleProps) {
  return (
    <h2
      className={cn(
        "font-[var(--fh)] text-lg font-semibold text-[var(--navy)]",

        className,
      )}

      {...props}
    >
      {children}
    </h2>
  );
}

/*
  ===================================
  Card Description
  ===================================
*/

interface CardDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({
  children,
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm text-[var(--text2)]",

        className,
      )}

      {...props}
    >
      {children}
    </p>
  );
}

/*
  ===================================
  Card Content
  ===================================
*/

interface CardContentProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn(
        "text-[13px] text-[var(--text)]",

        className,
      )}

      {...props}
    >
      {children}
    </div>
  );
}

/*
  ===================================
  Card Footer
  ===================================
*/

interface CardFooterProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({
  children,
  className,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        "mt-5 flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4",

        className,
      )}

      {...props}
    >
      {children}
    </div>
  );
}