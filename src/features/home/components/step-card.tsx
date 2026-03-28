import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StepCardProps {
  step: string;
  description: string;
  index: number;
}

const StepCard = (props: StepCardProps) => {
  const { step, description, index } = props;

  return (
    <Card className="group border-none bg-transparent text-center shadow-none">
      <CardHeader>
        <div className="bg-primary text-primary-foreground mx-auto flex aspect-square size-18 items-center justify-center rounded-full p-3 shadow-lg transition-all group-hover:scale-105 group-hover:shadow-xl">
          <span className="text-3xl font-bold">{index + 1}</span>
        </div>
        <CardTitle className="mt-4 text-2xl font-bold">{step}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export { StepCard };
