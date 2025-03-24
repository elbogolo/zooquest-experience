
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Search } from "lucide-react";
import { useState } from "react";

// Sample FAQ data
const faqs = [
  {
    question: "What are the zoo opening hours?",
    answer: "Our zoo is open daily from 9:00 AM to 6:00 PM, with last entry at 5:00 PM. We are closed on certain holidays, please check our calendar for specific dates."
  },
  {
    question: "Are there food options inside the zoo?",
    answer: "Yes, we have several restaurants and snack kiosks throughout the zoo. Our main restaurant is located near the entrance, and we offer a variety of food options including vegetarian and vegan choices."
  },
  {
    question: "Can I bring my own food and drinks?",
    answer: "Yes, you may bring your own food and non-alcoholic beverages. We have picnic areas available throughout the zoo. However, we ask that you do not feed the animals."
  },
  {
    question: "Is the zoo wheelchair accessible?",
    answer: "Yes, our zoo is designed to be accessible for all visitors. We have paved pathways throughout, accessible restrooms, and rental wheelchairs available at the front entrance."
  },
  {
    question: "Do you offer guided tours?",
    answer: "Yes, we offer guided tours daily at 10:00 AM and 2:00 PM. These tours are included with your admission. Private tours can also be arranged for an additional fee."
  },
  {
    question: "Can I pet or feed the animals?",
    answer: "For the safety of our animals and visitors, direct interaction with most animals is not permitted. However, we do have designated petting zoo areas where supervised interaction is allowed."
  },
  {
    question: "What should I do if I lose something at the zoo?",
    answer: "Please visit our Lost and Found office located near the main entrance. Items found are kept for 30 days. You can also call us at (555) 123-4567 or email lostandfound@zooadventure.com."
  },
  {
    question: "Are there ATMs available at the zoo?",
    answer: "Yes, we have ATMs located at the main entrance, near the central food court, and by the gift shop."
  }
];

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Filter FAQs based on search term
  const filteredFAQs = faqs.filter(
    faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Frequently Asked Questions" showBackButton showThemeToggle />
      
      <div className="pt-16 px-5">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-zoo-primary focus:border-transparent transition-all"
          />
        </div>
        
        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-card rounded-lg overflow-hidden border border-border shadow-sm"
              >
                <button
                  className="w-full text-left p-4 font-medium flex justify-between items-center text-foreground"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  {faq.question}
                  <span className="transition-transform duration-200 transform">
                    {expandedIndex === index ? '−' : '+'}
                  </span>
                </button>
                
                {expandedIndex === index && (
                  <div className="p-4 pt-0 text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No FAQs found matching "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-2 text-zoo-primary"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
        
        {/* Contact Link */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-2">Can't find what you're looking for?</p>
          <a 
            href="/help" 
            className="text-zoo-primary font-medium hover:underline"
          >
            Contact our support team
          </a>
        </div>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default FAQPage;
