import type { LucideIcon } from "lucide-react";
import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VerificationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

const VerificationCard = (props: VerificationCardProps) => {
  const { icon: Icon, title, description, children } = props;
  return (
    <Card className="transition-all xl:hover:scale-103 xl:hover:shadow-lg">
      <CardHeader className="-space-y-2 text-center">
        <div className="bg-primary text-primary-foreground mx-auto mb-2 w-fit rounded-sm p-3">
          <Icon size={40} />
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[200px] w-full lg:aspect-[4/3]">{children}</div>
      </CardContent>
    </Card>
  );
};

export { VerificationCard as Card };
