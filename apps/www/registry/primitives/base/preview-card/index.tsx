'use client';

import * as React from 'react';
import { PreviewCard as PreviewCardPrimitive } from '@base-ui-components/react/preview-card';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';

type PreviewCardContextType = {
  isOpen: boolean;
  setIsOpen: PreviewCardProps['onOpenChange'];
};

const [PreviewCardProvider, usePreviewCard] =
  getStrictContext<PreviewCardContextType>('PreviewCardContext');

type PreviewCardProps = React.ComponentProps<typeof PreviewCardPrimitive.Root>;

function PreviewCard(props: PreviewCardProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <PreviewCardProvider value={{ isOpen, setIsOpen }}>
      <PreviewCardPrimitive.Root
        data-slot="preview-card"
        {...props}
        onOpenChange={setIsOpen}
      />
    </PreviewCardProvider>
  );
}

type PreviewCardTriggerProps = React.ComponentProps<
  typeof PreviewCardPrimitive.Trigger
>;

function PreviewCardTrigger(props: PreviewCardTriggerProps) {
  return (
    <PreviewCardPrimitive.Trigger data-slot="preview-card-trigger" {...props} />
  );
}

type PreviewCardPortalProps = Omit<
  React.ComponentProps<typeof PreviewCardPrimitive.Portal>,
  'keepMounted'
>;

function PreviewCardPortal(props: PreviewCardPortalProps) {
  const { isOpen } = usePreviewCard();

  return (
    <AnimatePresence>
      {isOpen && (
        <PreviewCardPrimitive.Portal
          keepMounted
          data-slot="preview-card-portal"
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

type PreviewCardPositionerProps = React.ComponentProps<
  typeof PreviewCardPrimitive.Positioner
>;

function PreviewCardPositioner(props: PreviewCardPositionerProps) {
  return (
    <PreviewCardPrimitive.Positioner
      data-slot="preview-card-positioner"
      {...props}
    />
  );
}

type PreviewCardPopupProps = Omit<
  React.ComponentProps<typeof PreviewCardPrimitive.Popup>,
  'render'
> &
  HTMLMotionProps<'div'>;

function PreviewCardPopup({
  transition = { type: 'spring', stiffness: 300, damping: 25 },
  ...props
}: PreviewCardPopupProps) {
  return (
    <PreviewCardPrimitive.Popup
      render={
        <motion.div
          key="preview-card-popup"
          data-slot="preview-card-popup"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={transition}
          {...props}
        />
      }
    />
  );
}

type PreviewCardBackdropProps = React.ComponentProps<
  typeof PreviewCardPrimitive.Backdrop
>;

function PreviewCardBackdrop(props: PreviewCardBackdropProps) {
  return (
    <PreviewCardPrimitive.Backdrop
      data-slot="preview-card-backdrop"
      {...props}
    />
  );
}

type PreviewCardArrowProps = React.ComponentProps<
  typeof PreviewCardPrimitive.Arrow
>;

function PreviewCardArrow(props: PreviewCardArrowProps) {
  return (
    <PreviewCardPrimitive.Arrow data-slot="preview-card-arrow" {...props} />
  );
}

export {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardPortal,
  PreviewCardPositioner,
  PreviewCardPopup,
  PreviewCardBackdrop,
  PreviewCardArrow,
  usePreviewCard,
  type PreviewCardProps,
  type PreviewCardTriggerProps,
  type PreviewCardPortalProps,
  type PreviewCardPositionerProps,
  type PreviewCardPopupProps,
  type PreviewCardBackdropProps,
  type PreviewCardArrowProps,
  type PreviewCardContextType,
};
