import { ArrowRightIcon, MouseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section
      id="home"
      className="overflow-hidden [background:radial-gradient(125%_125%_at_50%_10%,var(--color-primary)_10%,var(--color-foreground)_80%)]"
    >
      <div className="text-primary-foreground justify-content-center mx-auto flex flex-col items-center space-y-8 px-4 pt-24 pb-12 text-center sm:max-w-6xl xl:pt-32 xl:pb-16">
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
          <span>Verify PSAU Certificates</span>
          <br />
          <span className="opacity-60">Instantly and Securely</span>
        </h1>

        <p className="max-w-xl text-xl leading-relaxed text-balance xl:text-2xl">
          Instantly validate credentials with our state-of-the-art verification
          system. <span className="font-bold">Fast, reliable and secured.</span>
        </p>

        <Button variant="secondary" size="lg" className="group" asChild>
          <a href="#verification">
            <span className="text-base xl:text-lg">Start Verification</span>
            <ArrowRightIcon className="mr-1.5 transition-transform group-hover:translate-x-1.5" />
          </a>
        </Button>

        <MouseIcon className="mt-10 animate-bounce" />
      </div>
    </section>
  );
};

export { Hero };
