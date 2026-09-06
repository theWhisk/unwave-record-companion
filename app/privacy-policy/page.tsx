import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.app.name}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
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
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.app.name}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Privacy Policy for Crate Mole

Last updated: September 6, 2026

    No Accounts: Crate Mole does not require you to sign up, and we do not collect your name, email, or payment information. There are no user accounts.

    Search Data: When you search by text, your query is sent server-side to Discogs and Wikipedia to look up pricing, ratings, and summary information. When you search by photo, the captured image is sent server-side to an Anthropic AI model to identify the artist and album; the image is used only to generate that identification and is not stored by Crate Mole afterward.

    Technical Logs: Like most web services, our infrastructure providers (Sentry for error tracking, Axiom for structured logging) may automatically record technical data such as IP address, browser type, and request metadata, for the purpose of diagnosing errors and keeping the Service reliable. This data is not used to build a profile of you and is not sold.

    Cookies: Crate Mole does not use cookies for tracking or advertising.

    Data Sharing: We do not sell or share your data with third parties except as described above (Discogs, Wikipedia, Anthropic, Sentry, Axiom, ExchangeRate-API) as necessary to operate the Service, or as required by law.

    Children's Privacy: Crate Mole is not directed at children, and we do not knowingly collect personal information from children.

    Updates to this Privacy Policy: We may update this Privacy Policy from time to time. Continued use of the Service after a change constitutes acceptance of the updated policy.

    Contact Information: If you have any questions, concerns, or requests regarding our privacy practices, please reach out to us at william@unwave.net.

Thank you for using Crate Mole.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
