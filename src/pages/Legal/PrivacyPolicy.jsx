import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Shield,
  Eye,
  Database,
  Cookie,
  Share2,
  Lock,
  Mail,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Palette,
} from 'lucide-react';
import './Legal.css';

const LAST_UPDATED = 'January 5, 2026';

const SECTIONS = [
  {
    id: 'introduction',
    icon: Shield,
    title: 'Introduction',
    content: `Welcome to CColorPalette ("we," "our," or "us"). We are committed to protecting your privacy and being transparent about how we handle information when you use our color palette generator tool.

This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. By using CColorPalette, you agree to the terms outlined in this policy.

CColorPalette is designed with privacy in mind. We don't require user accounts, don't collect personal information, and don't track individual users across sessions.`,
  },
  {
    id: 'information-we-collect',
    icon: Database,
    title: 'Information We Collect',
    content: `**Information You Provide**

CColorPalette does not require you to create an account or provide any personal information to use our service. We do not collect:
- Names or email addresses
- Payment information
- User accounts or passwords
- Personal identifiers

**Automatically Collected Information**

When you visit CColorPalette, we may automatically collect certain technical information:
- Browser type and version
- Operating system
- Device type (desktop, mobile, tablet)
- Referring website (if applicable)
- Pages visited and features used
- Approximate geographic location (country/region level only)

This information is collected in aggregate form and cannot be used to identify individual users.

**URL Data**

Your color palettes are encoded in the URL (e.g., /E63946-F1FAEE-A8DADC). This allows you to bookmark and share palettes. We do not store or track which palettes individual users create or view.`,
  },
  {
    id: 'how-we-use-information',
    icon: Eye,
    title: 'How We Use Information',
    content: `We use the limited information we collect for the following purposes:

**Service Improvement**
- Understanding which features are most popular
- Identifying and fixing bugs or performance issues
- Optimizing the user experience across different devices and browsers

**Analytics**
- Measuring overall website traffic and usage patterns
- Understanding how users interact with our tool
- Making data-driven decisions about new features

**Security**
- Protecting against malicious activity
- Maintaining the integrity of our service

We do NOT use your information to:
- Build individual user profiles
- Target advertising
- Sell or share data with third parties for marketing
- Track you across other websites`,
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: 'Cookies and Local Storage',
    content: `**Cookies**

CColorPalette uses minimal cookies. We may use:
- Essential cookies required for the website to function
- Analytics cookies to understand aggregate usage (if applicable)

We do not use:
- Advertising or tracking cookies
- Third-party marketing cookies
- Cross-site tracking cookies

**Local Storage**

CColorPalette may use your browser's local storage to:
- Remember your session preferences (like panel states)
- Store your palette history temporarily for the undo/redo feature

This data is stored only in your browser and is not transmitted to our servers. You can clear this data at any time through your browser settings.

**Managing Cookies**

You can control cookies through your browser settings. Note that disabling cookies may affect some functionality of the website.`,
  },
  {
    id: 'data-sharing',
    icon: Share2,
    title: 'Data Sharing and Third Parties',
    content: `**We Do Not Sell Your Data**

CColorPalette does not sell, rent, or trade any user information to third parties.

**Service Providers**

We may use third-party services to help operate our website:
- Hosting providers (to serve the website)
- Analytics services (to understand aggregate usage)
- Content delivery networks (to improve performance)

These providers only have access to aggregate, non-personally identifiable information and are contractually obligated to protect any data they process.

**Legal Requirements**

We may disclose information if required by law or if we believe disclosure is necessary to:
- Comply with legal obligations
- Protect our rights or property
- Prevent fraud or security issues
- Protect the safety of users or the public`,
  },
  {
    id: 'data-security',
    icon: Lock,
    title: 'Data Security',
    content: `We take reasonable measures to protect the limited information we collect:

- Our website uses HTTPS encryption for all connections
- We regularly update our software and dependencies
- We follow security best practices in our development process
- We limit access to any collected data to authorized personnel only

Since CColorPalette doesn't collect personal information or require user accounts, the risk of data breaches affecting individual users is minimal.

**Your Responsibility**

When you share a palette URL, anyone with that URL can view the palette. Be mindful of this when sharing links that may contain color schemes for confidential projects.`,
  },
  {
    id: 'your-rights',
    icon: Shield,
    title: 'Your Rights',
    content: `Depending on your location, you may have certain rights regarding your data:

**General Rights**
- Access: Request information about data we collect
- Deletion: Request deletion of any data we may have
- Opt-out: Decline non-essential cookies and analytics

**For EU/EEA Residents (GDPR)**
- Right to access, rectify, or erase personal data
- Right to restrict or object to processing
- Right to data portability
- Right to withdraw consent

**For California Residents (CCPA)**
- Right to know what personal information is collected
- Right to delete personal information
- Right to opt-out of sale of personal information
- Right to non-discrimination for exercising rights

Since CColorPalette doesn't collect personal information, most of these rights are automatically satisfied. If you have any concerns, please contact us.`,
  },
  {
    id: 'childrens-privacy',
    icon: Shield,
    title: "Children's Privacy",
    content: `CColorPalette is a general-audience tool and is not directed at children under 13 years of age. We do not knowingly collect personal information from children.

Since we don't collect personal information from any users, there is no special risk to children using our service. However, parents and guardians should supervise their children's internet use as a general practice.

If you believe we have inadvertently collected information from a child, please contact us immediately.`,
  },
  {
    id: 'changes',
    icon: Calendar,
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.

When we make changes:
- We will update the "Last Updated" date at the top of this policy
- For significant changes, we may provide additional notice on our website
- Continued use of CColorPalette after changes constitutes acceptance of the updated policy

We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.`,
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact Us',
    content: `If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:

**Email:** privacy@ccolorpalette.com

**Response Time:** We aim to respond to all privacy-related inquiries within 30 days.

For general questions about using CColorPalette, please visit our FAQ section on the homepage.`,
  },
];

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <Helmet>
        <title>Privacy Policy | CColorPalette</title>
        <meta
          name="description"
          content="Privacy Policy for CColorPalette - Learn how we protect your privacy and handle data on our free color palette generator."
        />
        <link rel="canonical" href="https://ccolorpalette.com/privacy" />
      </Helmet>

      {/* Header */}
      <header className="legal-header">
        <div className="legal-header-container">
          <Link to="/home" className="legal-logo">
            <div className="legal-logo-mark">
              <span style={{ backgroundColor: '#E63946' }}></span>
              <span style={{ backgroundColor: '#F1FAEE' }}></span>
              <span style={{ backgroundColor: '#457B9D' }}></span>
            </div>
            <span className="legal-logo-text">CColorPalette</span>
          </Link>

          <Link to="/home" className="legal-back-link">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="legal-hero">
        <div className="legal-hero-container">
          <div className="legal-hero-icon">
            <Shield size={32} />
          </div>
          <h1 className="legal-hero-title">Privacy Policy</h1>
          <p className="legal-hero-subtitle">
            Your privacy matters to us. Learn how CColorPalette handles your data.
          </p>
          <div className="legal-hero-meta">
            <Calendar size={14} />
            <span>Last updated: {LAST_UPDATED}</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <nav className="legal-toc">
        <div className="legal-toc-container">
          <h2 className="legal-toc-title">Contents</h2>
          <ul className="legal-toc-list">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="legal-toc-link">
                  <section.icon size={14} />
                  <span>{section.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Content */}
      <main className="legal-content">
        <div className="legal-content-container">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="legal-section">
              <div className="legal-section-header">
                <div className="legal-section-icon">
                  <section.icon size={20} />
                </div>
                <h2 className="legal-section-title">{section.title}</h2>
              </div>
              <div className="legal-section-content">
                {section.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h3 key={index} className="legal-subsection-title">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('**')) {
                    const [title, ...rest] = paragraph.split('**').filter(Boolean);
                    return (
                      <div key={index}>
                        <h3 className="legal-subsection-title">{title}</h3>
                        <p>{rest.join('')}</p>
                      </div>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n').filter((line) => line.startsWith('- '));
                    return (
                      <ul key={index} className="legal-list">
                        {items.map((item, i) => (
                          <li key={i}>{item.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={index}>{paragraph}</p>;
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="legal-footer">
        <div className="legal-footer-container">
          <div className="legal-footer-links">
            <Link to="/home">Home</Link>
            <Link to="/">Generator</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          <p className="legal-footer-copyright">
            &copy; {new Date().getFullYear()} CColorPalette. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PrivacyPolicy;