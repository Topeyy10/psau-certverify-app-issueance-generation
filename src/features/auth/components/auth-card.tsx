import { Card, CardContent } from "@/components/ui/card";

const AuthCard = ({
  children,
}: Readonly<{ children?: React.ReactElement }>) => {
  return (
    <Card className="w-full max-w-sm py-10">
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export { AuthCard };
