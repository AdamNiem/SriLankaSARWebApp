import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipPortal,
  TooltipTrigger,
} from '@/registry/primitives/radix/tooltip';

interface RadixTooltipDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export const RadixTooltipDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
}: RadixTooltipDemoProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
            className="bg-primary text-primary-foreground px-2 py-1 text-sm z-50"
          >
            <p>Add to library</p>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};
