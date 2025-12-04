import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { isWeb } from '@gluestack-ui/utils/nativewind-utils';
const baseStyle = isWeb ? 'flex flex-col relative z-0' : '';

export const cardStyle = tva({
  base: `${baseStyle} overflow-hidden`,
  variants: {
    size: {
      sm: 'p-3 rounded-lg',
      md: 'p-5 rounded-xl',
      lg: 'p-6 rounded-2xl',
    },
    variant: {
      elevated: 'bg-background-0 shadow-md shadow-black/5',
      outline: 'border border-outline-200 bg-background-0',
      ghost: 'bg-transparent',
      filled: 'bg-background-50',
    },
  },
});

export const cardHeaderStyle = tva({
  base: 'mb-4 flex flex-col gap-1 p-0',
});

export const cardBodyStyle = tva({
  base: 'p-0',
});

export const cardFooterStyle = tva({
  base: 'mt-4 flex-row items-center justify-between border-t border-outline-50 pt-4 p-0',
});

export const cardTitleStyle = tva({
  base: 'text-xl font-semibold text-typography-900',
});

export const cardDescriptionStyle = tva({
  base: 'text-sm text-typography-600',
});
