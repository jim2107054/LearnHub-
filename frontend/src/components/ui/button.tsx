import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-btn text-base font-bold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none tracking-normal',
  {
    variants: {
      variant: {
        default:
          'bg-ink text-white hover:bg-ink/90 hover:underline active:bg-btn-active active:text-white active:border active:border-[#A2C0A9]/50 shadow-none',
        brand:
          'bg-brand text-white hover:bg-brand/90 hover:underline active:bg-btn-active active:text-white active:border active:border-[#A2C0A9]/50 shadow-none',
        outline:
          'border border-ink bg-transparent text-ink hover:bg-black/5 hover:underline active:bg-btn-active active:text-white active:border-transparent',
        white:
          'border border-hairline bg-white text-ink hover:underline active:bg-btn-active active:text-white shadow-none',
        secondary:
          'bg-surface text-ink hover:bg-surface/80 hover:underline active:bg-btn-active active:text-white',
        ghost:
          'text-ink hover:bg-surface hover:underline active:bg-btn-active active:text-white',
        link:
          'text-brand p-0 h-auto font-bold hover:text-link-hover hover:underline active:text-link-hover',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:underline',
      },
      size: {
        default: 'h-12 px-5 py-2.5',
        sm: 'h-9 px-3 text-sm rounded-btn',
        lg: 'h-14 px-8 text-lg rounded-btn',
        icon: 'h-7 w-7 rounded-full p-0 bg-white/50 text-ink shadow-udemy-sm hover:underline hover:bg-white',
        'icon-md': 'h-10 w-10 rounded-full p-0 bg-white text-ink shadow-udemy-sm hover:underline hover:bg-surface',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
