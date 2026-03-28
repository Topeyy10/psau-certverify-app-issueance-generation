import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Metadata } from "@/types";

interface CardWrapperProps<T extends Metadata> {
  meta: T;
  group: keyof T;
  children: React.ReactNode;
  className?: string;
}

const CardWrapper = <T extends Metadata>(props: CardWrapperProps<T>) => {
  const { meta, group, children, className } = props;
  const metaData = meta[group];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <metaData.icon className="size-4" />
          <CardTitle>{metaData.title}</CardTitle>
        </div>
        <CardDescription>{metaData.description}</CardDescription>
      </CardHeader>
      <CardContent className={className}>{children}</CardContent>
    </Card>
  );
};

export { CardWrapper };
