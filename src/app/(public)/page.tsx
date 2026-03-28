import { Footer, Header } from "@/components/layout";
import { FAQ, Features, Hero, HowItWorks, Verification } from "@/features/home";

const HomePage = () => {
  return (
    <div className="bg-background min-h-screen w-full">
      <Header />
      <main>
        <Hero />
        <Verification />
        <HowItWorks />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
