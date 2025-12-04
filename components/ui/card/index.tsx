import React from 'react';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { View, ViewProps, Text as RNText, TextProps } from 'react-native';
import {
  cardBodyStyle,
  cardDescriptionStyle,
  cardFooterStyle,
  cardHeaderStyle,
  cardStyle,
  cardTitleStyle,
} from './styles';

type ICardProps = ViewProps &
  VariantProps<typeof cardStyle> & { className?: string };

const Card = React.forwardRef<React.ComponentRef<typeof View>, ICardProps>(
  function Card(
    { className, size = 'md', variant = 'elevated', ...props },
    ref
  ) {
    return (
      <View
        className={cardStyle({ size, variant, class: className })}
        {...props}
        ref={ref}
      />
    );
  }
);

type ICardSectionProps = ViewProps & { className?: string };

const CardHeader = React.forwardRef<React.ComponentRef<typeof View>, ICardSectionProps>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <View
        ref={ref}
        {...props}
        className={cardHeaderStyle({ class: className })}
      />
    );
  }
);

const CardBody = React.forwardRef<React.ComponentRef<typeof View>, ICardSectionProps>(
  function CardBody({ className, ...props }, ref) {
    return (
      <View ref={ref} {...props} className={cardBodyStyle({ class: className })} />
    );
  }
);

const CardFooter = React.forwardRef<
  React.ComponentRef<typeof View>,
  ICardSectionProps
>(function CardFooter({ className, ...props }, ref) {
  return (
    <View
      ref={ref}
      {...props}
      className={cardFooterStyle({ class: className })}
    />
  );
});

type CardTextProps = TextProps & { className?: string };

const CardTitle = React.forwardRef<React.ComponentRef<typeof RNText>, CardTextProps>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <RNText
        ref={ref}
        {...props}
        className={cardTitleStyle({ class: className })}
      />
    );
  }
);

const CardDescription = React.forwardRef<
  React.ComponentRef<typeof RNText>,
  CardTextProps
>(function CardDescription({ className, ...props }, ref) {
  return (
    <RNText
      ref={ref}
      {...props}
      className={cardDescriptionStyle({ class: className })}
    />
  );
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';

export { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle };
