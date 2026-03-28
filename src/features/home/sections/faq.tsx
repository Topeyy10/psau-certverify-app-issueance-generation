import { CircleQuestionMarkIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getKeyIndex } from "@/lib/utils";
import { SectionContainer } from "../components";
import { FAQItems } from "../constants/faq-data";

const FAQ = () => {
  return (
    <SectionContainer
      id="faq"
      title="Frequently Asked Questions"
      subtitle="Find answers to common questions about our certificate verification system"
      badgeIcon={CircleQuestionMarkIcon}
      badgeText="Got Questions?"
    >
      <Accordion
        type="single"
        defaultValue="question-0"
        collapsible
        className="mx-auto max-w-3xl"
      >
        {FAQItems.map(({ question, answer }) => {
          const id = getKeyIndex();

          return (
            <AccordionItem value={`question-${id}`} key={`question-${id}`}>
              <AccordionTrigger className="text-base">
                {question}
              </AccordionTrigger>
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </SectionContainer>
  );
};

export { FAQ };
