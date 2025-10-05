import {
  Tooltip,
  TooltipTrigger,
  TooltipPanel,
  type TooltipPanelProps,
} from '@/registry/components/base/tooltip';
import { Button } from '@workspace/ui/components/ui/button';

interface BaseTooltipDemoProps {
  side: TooltipPanelProps['side'];
  sideOffset: TooltipPanelProps['sideOffset'];
  align: TooltipPanelProps['align'];
  alignOffset: TooltipPanelProps['alignOffset'];
}

export function BaseTooltipDemo({
  side,
  sideOffset,
  align,
  alignOffset,
}: BaseTooltipDemoProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">Hover</Button>} />
      <TooltipPanel
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <p>Add to library</p>
      </TooltipPanel>
    </Tooltip>
  );
}
