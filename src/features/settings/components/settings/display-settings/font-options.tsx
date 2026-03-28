import { TypeIcon } from "lucide-react";
import { memo } from "react";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface FontOptionProps {
  font: string;
  isSelected: boolean;
}

const FontOptions = memo((props: FontOptionProps) => {
  const { font, isSelected } = props;
  return (
    <FormItem>
      <FormControl className="sr-only">
        <RadioGroupItem value={font} />
      </FormControl>
      <FormLabel
        className={cn(
          "border rounded-sm p-3 grid grid-cols-1 gap-1",
          isSelected &&
            "bg-secondary !border-foreground text-secondary-foreground",
        )}
      >
        <div className="flex items-center justify-between">
          <span>{font}</span>
          <TypeIcon className="size-4 text-muted-foreground" />
        </div>
        <div className="truncate" style={{ fontFamily: font }}>
          The quick brown fox jumps over the lazy dog
        </div>
      </FormLabel>
    </FormItem>
  );
});

export { FontOptions };
