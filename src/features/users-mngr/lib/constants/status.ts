import type { Badge } from "@/components/ui/badge";

type Status = "-1" | "0" | "1";
type Variant = Pick<React.ComponentProps<typeof Badge>, "variant">;

export const STATUS_MAP: Record<
  Status,
  { label: string } & NonNullable<Variant>
> = {
  "-1": { label: "Revoked", variant: "destructive" },
  "0": { label: "Pending", variant: "outline" },
  "1": { label: "Valid", variant: "default" },
};
