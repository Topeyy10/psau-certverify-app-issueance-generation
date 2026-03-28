"use client";

import { Loader2Icon, SearchIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerify } from "../../hooks/use-verify";
import { useVerifyStore } from "../../store/verifyStore";

const SearchSlot = () => {
  const [hasInput, setHasInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const processing = useVerifyStore((s) => s.processing);
  const { processID } = useVerify();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hasValue = e.target.value.trim().length > 0;
    setHasInput(hasValue);
  };

  const handleVerification = useCallback(() => {
    const inputValue = inputRef.current?.value.trim();
    if (!inputValue || processing) return;

    processID(inputValue);

    if (inputRef.current) {
      inputRef.current.value = "";
      setHasInput(false);
    }
  }, [processID, processing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && hasInput) {
      handleVerification();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="manual-id">Certificate ID</Label>
      <div className="group relative">
        <Input
          className="w-full pl-7"
          id="manual-id"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter Certificate ID"
          ref={inputRef}
          type="text"
        />
        <SearchIcon className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-2 size-4 -translate-y-1/2" />
      </div>
      <Button disabled={!hasInput || processing} onClick={handleVerification}>
        {processing && <Loader2Icon className="animate-spin" />}
        Verify ID
      </Button>
      <span className="text-muted-foreground text-center text-xs">
        Enter the exact ID as shown on your certificate
      </span>
    </div>
  );
};

export { SearchSlot };
