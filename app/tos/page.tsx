import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.app.name}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.app.name}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Terms of Service

Effective Date: September 6, 2026

Welcome to Crate Mole!

These Terms of Service ("Terms") govern your use of Crate Mole (the "Service"), provided by Unwave and accessible via https://maracuya.unwave.net. By accessing or using the Service, you agree to be bound by these Terms.

    Description of Service: Crate Mole helps record collectors look up vinyl pricing and information. You submit a search (as text, or as a photo of an album cover) and the Service returns pricing suggestions, ratings, genre tags, and a summary sourced from third parties, including Discogs and Wikipedia.

    No Accounts, No Payments: The Service does not require you to create an account and does not process payments. It is provided free of charge.

    Third-Party Data: Pricing, ratings, and catalog data come from Discogs; summaries come from Wikipedia; currency conversion comes from ExchangeRate-API; photo identification is performed by an Anthropic AI model. Unwave does not control and is not responsible for the accuracy of this third-party data — prices are suggestions, not guarantees.

    Acceptable Use: You agree not to abuse, scrape, or overload the Service, or use it for any unlawful purpose.

    Disclaimer of Warranty: The Service is provided "as is," without warranty of any kind. Unwave does not guarantee the Service will be uninterrupted, error-free, or that pricing data will be accurate or current.

    Changes to the Terms: We may update these Terms from time to time. Continued use of the Service after a change constitutes acceptance of the updated Terms.

    Governing Law: These Terms shall be governed by and construed in accordance with the laws of [jurisdiction to be confirmed].

If you have any questions or concerns about these Terms, please contact us at william@unwave.net.

Thank you for using Crate Mole!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
