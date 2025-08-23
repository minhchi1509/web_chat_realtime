import * as React from 'react';

import { cn } from 'src/utils/common.util';

export interface InputProps extends React.ComponentProps<'input'> {
  prefixIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  suffixIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function Input({
  className,
  type,
  prefixIcon,
  suffixIcon,
  ...props
}: InputProps) {
  const PrefixIcon = prefixIcon;
  const SuffixIcon = suffixIcon;

  return (
    <div className="relative flex w-full items-center">
      {prefixIcon && (
        <button
          className="absolute left-3 text-center transition-all disabled:pointer-events-none disabled:opacity-50"
          type="button"
        >
          {PrefixIcon && (
            <PrefixIcon className="size-4 text-muted-foreground" />
          )}
        </button>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          prefixIcon && 'pl-9',
          suffixIcon && 'pr-9',
          className
        )}
        {...props}
      />
      {suffixIcon && (
        <button
          className="absolute right-3 text-center transition-all disabled:pointer-events-none disabled:opacity-50"
          type="button"
        >
          {SuffixIcon && (
            <SuffixIcon className="size-4 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}

export { Input };
