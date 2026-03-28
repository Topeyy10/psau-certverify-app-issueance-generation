import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolButtonProps extends React.ComponentProps<typeof Button> {
  delay?: number;
}

const ToolButton = memo<ToolButtonProps>((props) => {
  const { delay = 1500, disabled, variant, title, ...rest } = props;

  return (
    <Tooltip delayDuration={delay}>
      <TooltipTrigger disabled={disabled} asChild>
        <Button
          variant={disabled ? "secondary" : variant}
          disabled={disabled}
          {...rest}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{title}</p>
      </TooltipContent>
    </Tooltip>
  );
});

export { ToolButton };
