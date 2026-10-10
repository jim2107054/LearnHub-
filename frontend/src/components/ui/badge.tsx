import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-colors tracking-normal',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand text-white',
        secondary: 'border-hairline bg-surface text-ink',
        bestseller: 'border-transparent bg-[#ECEB98] text-[#3D3C0A] font-bold',
        popular: 'border-transparent bg-[#E8DEFC] text-[#5B4FCF] font-bold',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-hairline text-ink bg-transparent',
        success: 'border-transparent bg-[#D1E7DD] text-[#0F5132]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
