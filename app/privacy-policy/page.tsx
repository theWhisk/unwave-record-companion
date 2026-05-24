import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple privacy policy for my website. Here is some context:
// - Website: https://unwave.net
// - Name: Unwave
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Purpose of Data Collection: Order processing
// - Data sharing: we do not share the data with any other parties
// - Children's Privacy: we do not collect any data from children
// - Updates to the Privacy Policy: users will be updated by email
// - Contact information: william@unwave.net

// Please write a simple privacy policy for my site. Add the current date.  Do not add or explain your reasoning. Answer:

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
          {`Privacy Policy for UnwaveSeekr

Last updated: April 30, 2024

    Consent: Your use of UnwaveSeekr constitutes acceptance of this Privacy Policy and signifies your consent to the collection, processing, and use of your personal information in accordance with the terms outlined herein.

    Data Collection: We collect specific user data necessary for order processing, including but not limited to:
        Name
        Email
        Payment information

    Non-personal Data: UnwaveSeekr may also gather non-personal information through the use of web cookies to enhance user experience and improve our services.

    Data Sharing: We do not share, sell, or disclose any user data to third parties without explicit consent, except as required by law or as necessary for order processing.

    Children's Privacy: UnwaveSeekr is not directed at individuals under the age of 18, and we do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.

    Updates to Privacy Policy: Users will be informed of any changes to this Privacy Policy via email. Continued use of UnwaveSeekr after such modifications constitutes acceptance of the updated terms.

    Contact Information: If you have any questions, concerns, or requests regarding our privacy practices, please reach out to us at william@unwave.net.

Your trust and privacy are of utmost importance to us at UnwaveSeekr. Thank you for choosing to use our service.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
