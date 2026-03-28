import { Loader2Icon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const LoadingButton = (
  props: Omit<React.ComponentProps<typeof Button>, "children"> & {
    icon?: LucideIcon;
    label?: string;
    loading?: boolean;
    loadingLabel?: string;
    showLoader?: boolean;
  },
) => {
  const {
    icon: IconComponent,
    label,
    className,
    disabled,
    loadingLabel,
    loading = false,
    showLoader = true,
    ...rest
  } = props;

  const renderIcon = () => {
    if (loading) {
      return showLoader ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        IconComponent && <IconComponent />
      );
    }
    return IconComponent && <IconComponent />;
  };

  return (
    <Button
      disabled={disabled || loading}
      {...rest}
      className={cn("flex items-center gap-3", className)}
    >
      {renderIcon()}
      <span>{loading ? loadingLabel || label : label}</span>
    </Button>
  );
};

export { LoadingButton };
