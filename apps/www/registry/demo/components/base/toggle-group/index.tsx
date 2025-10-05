import {
  Toggle,
  ToggleGroup,
  type ToggleGroupProps,
} from '@/registry/components/base/toggle-group';
import { Bold, Italic, Underline } from 'lucide-react';

interface BaseToggleGroupDemoProps {
  toggleMultiple: boolean;
  variant: ToggleGroupProps['variant'];
  size: ToggleGroupProps['size'];
}

export function BaseToggleGroupDemo({
  toggleMultiple,
  variant,
  size,
}: BaseToggleGroupDemoProps) {
  return (
    <ToggleGroup toggleMultiple={toggleMultiple} variant={variant} size={size}>
      <Toggle value="bold" aria-label="Toggle bold">
        <Bold />
      </Toggle>
      <Toggle value="italic" aria-label="Toggle italic">
        <Italic />
      </Toggle>
      <Toggle value="strikethrough" aria-label="Toggle strikethrough">
        <Underline />
      </Toggle>
    </ToggleGroup>
  );
}
