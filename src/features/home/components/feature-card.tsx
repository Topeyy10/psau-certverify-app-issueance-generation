import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeatureItems } from "../constants/features-data";

const FeatureCard = (props: (typeof FeatureItems)[0]) => {
  const { icon: Icon, feature, description } = props;

  return (
    <Card className="transition-all xl:hover:scale-103 xl:hover:shadow-lg">
      <CardHeader>
        <div className="bg-secondary text-secondary-foreground w-fit rounded-sm border p-3">
          <Icon className="size-8" />
        </div>

        <CardTitle className="text-xl font-bold">{feature}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export { FeatureCard };
