import Link from "next/link";
import { BRAND_CONFIG, Brand } from "@/components/shared/branding";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MobileNotice = () => {
  return (
    <div className="absolute inset-0 sm:hidden">
      <div className="flex size-full flex-col justify-center space-y-6 p-4">
        <Brand variant="icon-only" size="lg" boxed />
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl">{BRAND_CONFIG.name}</CardTitle>
            <CardDescription>
              This application is designed for an optimal experience on desktop
              and tablet devices. Due to the complexity and interactive nature
              of the features, functionality may be limited or not work properly
              on mobile devices. For the best user experience, please access
              this app on a larger screen.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="link" className="mx-auto" asChild>
              <Link href="/app/dashboard">Return To Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export { MobileNotice };
