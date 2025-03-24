
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";

const TermsPage = () => {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Terms & Policies" showBackButton showThemeToggle />
      
      <div className="pt-16 px-5">
        <div className="bg-card rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Terms of Service</h2>
          
          <div className="space-y-4 text-muted-foreground">
            <p>
              Welcome to Zoo Adventure! These Terms of Service govern your use of our mobile application and related services.
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6">1. Acceptance of Terms</h3>
            <p>
              By accessing or using the Zoo Adventure application, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our application.
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6">2. User Accounts</h3>
            <p>
              Some features of our application may require you to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6">3. User Content</h3>
            <p>
              Our application may allow you to post, share, or store content. You retain ownership of any intellectual property rights that you hold in that content.
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6">4. Prohibited Activities</h3>
            <p>
              You agree not to engage in any of the following prohibited activities: (i) copying, distributing, or disclosing any part of the application; (ii) using any automated system to access the application; (iii) transmitting any viruses or other code that has a harmful effect; (iv) interfering with the proper working of the application.
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6">5. Modification of Terms</h3>
            <p>
              We reserve the right to modify these Terms of Service at any time. Your continued use of the application after any such changes constitutes your acceptance of the new Terms of Service.
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6">6. Privacy Policy</h3>
            <p>
              Please review our Privacy Policy, which also governs your use of the Zoo Adventure application, to understand our practices regarding the collection and use of your personal information.
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6">7. Contact Information</h3>
            <p>
              If you have any questions about these Terms of Service, please contact us at legal@zooadventure.com.
            </p>
            
            <p className="text-sm mt-6">
              Last Updated: July 15, 2023
            </p>
          </div>
        </div>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default TermsPage;
