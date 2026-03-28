import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Brand } from "@/components/shared/branding";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { saveCanvas } from "@/features/editor/lib/utils";

const FileDropdown = () => {
  const router = useRouter();

  const handleTemplateSave = async () => {
    await saveCanvas();
  };

  const handleSaveAndExit = useCallback(async () => {
    await saveCanvas();
    router.push("/app/dashboard");
  }, [router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Brand variant="icon-only" size="xs" roundness="sm" boxed />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleTemplateSave}>
          Save Template
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSaveAndExit}>
          Save and Exit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { FileDropdown };
