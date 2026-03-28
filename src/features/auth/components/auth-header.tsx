import Link from "next/link";
import { Brand } from "@/components/shared/branding";

const AuthHeader = (props: { title: string; subtitle: string }) => {
  const { title, subtitle } = props;

  return (
    <header className="mb-10 flex flex-col items-center">
      <div className="mb-5">
        <Link href="/">
          <Brand variant="icon-only" size="xl" className="mb-3" boxed />
        </Link>
      </div>

      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground font-medium">{subtitle}</p>
    </header>
  );
};

export { AuthHeader };
