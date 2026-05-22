
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";

    export default function Home() {
      return (
        <>
          <Header />
          <div className="pt-24">
             <Hero />
             <HowItWorks />
             <FAQ />
          </div>
        </>
      );
    }
