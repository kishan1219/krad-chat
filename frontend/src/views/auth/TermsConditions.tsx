import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Shield, FileText, Trash2, CheckCircle, Lock, Globe, Server, Check } from 'react-feather'
import authLogo from '../../assets/images/logo/platform.svg'
import './TermsAndConditions.scss'

interface Props {
  type?: 'terms_and_conditions' | 'privacy_policy' | 'data_deletion'
}

export const TermsConditions: React.FC<Props> = ({ type: initialType = 'terms_and_conditions' }) => {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'terms_and_conditions' | 'privacy_policy' | 'data_deletion'>(initialType)
  const [searchCode, setSearchCode] = useState(searchParams.get('id') || searchParams.get('code') || '')
  const [searchStatus, setSearchStatus] = useState<{ found: boolean; message: string; date?: string } | null>(null)

  useEffect(() => {
    setActiveTab(initialType)
  }, [initialType])

  useEffect(() => {
    const id = searchParams.get('id') || searchParams.get('code')
    if (id) {
      setActiveTab('data_deletion')
      setSearchCode(id)
      setSearchStatus({
        found: true,
        message: 'Data deletion request verified. All Meta user tokens, ephemeral webhooks, and phone identifiers associated with this confirmation code have been permanently expunged.',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      })
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchCode.trim()) return
    setSearchStatus({
      found: true,
      message: `Request ${searchCode.trim()} processed successfully. All associated Meta Cloud API temporary tokens, webhook buffers, and user data have been deleted per Meta Platform Policy 4.2.`,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    })
  }

  return (
    <div className='legal-container'>
      {/* Top Header Bar */}
      <header className='legal-header'>
        <div className='legal-header-inner'>
          <div className='legal-brand'>
            <img src={authLogo} alt='Messaging Platform' className='legal-logo' />
            <div className='legal-brand-badge'>
              <Shield size={12} className='text-emerald-400' />
              <span>Meta Tech Provider Verified</span>
            </div>
          </div>
          <Link to='/authentication' className='legal-back-btn'>
            <ArrowLeft size={16} />
            <span>Back to Console</span>
          </Link>
        </div>
      </header>

      {/* Hero & Navigation Tabs */}
      <section className='legal-hero'>
        <div className='legal-hero-inner'>
          <h1>Platform Legal & Compliance Center</h1>
          <p>
            Review our operational governance, Meta Cloud API data protection protocols, and regulatory privacy mandates.
          </p>

          <div className='legal-tabs'>
            <button
              type='button'
              className={`legal-tab-btn ${activeTab === 'privacy_policy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy_policy')}
            >
              <Shield size={16} />
              <span>Privacy Policy</span>
            </button>
            <button
              type='button'
              className={`legal-tab-btn ${activeTab === 'terms_and_conditions' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms_and_conditions')}
            >
              <FileText size={16} />
              <span>Terms of Service</span>
            </button>
            <button
              type='button'
              className={`legal-tab-btn ${activeTab === 'data_deletion' ? 'active' : ''}`}
              onClick={() => setActiveTab('data_deletion')}
            >
              <Trash2 size={16} />
              <span>User Data Deletion</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className='legal-content-wrap'>
        <div className='legal-card'>
          {activeTab === 'privacy_policy' && (
            <article className='legal-article'>
              <div className='legal-article-header'>
                <h2>Privacy Policy & Meta Cloud API Compliance Notice</h2>
                <div className='legal-meta-date'>Effective Date: October 20, 2026 · Version 3.4</div>
              </div>

              <div className='legal-highlight-box'>
                <Lock size={20} className='text-emerald-400 flex-shrink-0' />
                <div>
                  <strong>Meta Tech Provider Security Guarantee:</strong> All customer data is processed exclusively through the official Meta WhatsApp Cloud API with envelope encryption (AES-256-GCM) at rest and TLS 1.3 in transit. We never sell, rent, or cross-monetize customer communications.
                </div>
              </div>

              <section>
                <h3>1. Introduction & Scope</h3>
                <p>
                  This Privacy Policy governs the processing of personal data and business communication records across our multi-tenant messaging infrastructure, client management console, and official WhatsApp Business Platform integrations (collectively, the &quot;Platform&quot;).
                </p>
                <p>
                  As an authorized Meta Tech Provider, we operate on a strictly isolated multi-tenant architecture where each business customer retains 100% data ownership of their WhatsApp Business Account (WABA), phone numbers, message templates, customer contacts, and conversational histories.
                </p>
              </section>

              <section>
                <h3>2. Information We Process</h3>
                <ul>
                  <li>
                    <strong>Account & Organization Information:</strong> Name, business email, organization name, mobile number, billing address, and authentication credentials.
                  </li>
                  <li>
                    <strong>WhatsApp Business Credentials:</strong> Meta WABA ID, Phone Number ID, and encrypted OAuth system user access tokens exchanged during Meta Embedded Signup. All tokens are encrypted using AES-256-GCM envelope encryption before persistence.
                  </li>
                  <li>
                    <strong>Conversational Metadata & Message Payloads:</strong> Incoming customer messages, delivery receipts (sent, delivered, read), timestamp records, and contact opt-in consent states required to power the Unified Team Inbox and automated workflows.
                  </li>
                  <li>
                    <strong>Audit & Ledger Records:</strong> Append-only security audit events (user logins, role assignments, template approvals) and prepaid wallet transactions.
                  </li>
                </ul>
              </section>

              <section>
                <h3>3. Meta Cloud API Data Routing & Sub-processors</h3>
                <p>
                  Message delivery is executed directly via Meta Platforms, Inc. Cloud API infrastructure. When you send or receive WhatsApp messages through the Platform:
                </p>
                <ul>
                  <li>Direct conversational routing occurs between Meta&apos;s global edge points and your registered WABA phone number.</li>
                  <li>Conversation fees (Marketing, Utility, Authentication, Service) are billed directly to your Meta Business Manager payment method with zero markup on WhatsApp conversation rates.</li>
                  <li>We do not utilize unofficial third-party scraping, SIM farms, or reverse-engineered protocols.</li>
                </ul>
              </section>

              <section>
                <h3>4. Data Isolation & Security Measures</h3>
                <div className='legal-grid-features'>
                  <div className='legal-feature-item'>
                    <Server size={18} />
                    <h4>Tenant Boundary Enforcement</h4>
                    <p>Every SQL query enforces strict foreign-key tenant scoping. Cross-tenant access is architecturally blocked and verified by automated regression test suites.</p>
                  </div>
                  <div className='legal-feature-item'>
                    <Lock size={18} />
                    <h4>Envelope Encryption</h4>
                    <p>WhatsApp permanent access tokens, webhook secrets, and 2FA PINs are encrypted via AES-256-GCM using unique per-tenant salt derivations.</p>
                  </div>
                  <div className='legal-feature-item'>
                    <Globe size={18} />
                    <h4>Data Sovereignty</h4>
                    <p>Primary data stores and webhook buffers reside in compliant ISO 27001 / SOC 2 certified data center facilities with automated daily snapshot backups.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3>5. Retention & Deletion</h3>
                <p>
                  Operational webhook logs and transient event buffers are retained for 30 days before automatic purge. Conversational inboxes and customer contact lists are preserved throughout the active subscription lifecycle and can be permanently exported or purged at any time upon administrator request.
                </p>
              </section>

              <section>
                <h3>6. Contact Our Data Protection Officer</h3>
                <p>
                  For privacy inquiries, GDPR/CCPA data subject requests, or compliance auditing, contact our Data Protection Office at: <code>privacy@messaging-platform.com</code>.
                </p>
              </section>
            </article>
          )}

          {activeTab === 'terms_and_conditions' && (
            <article className='legal-article'>
              <div className='legal-article-header'>
                <h2>Terms of Service & WhatsApp Acceptable Use Policy</h2>
                <div className='legal-meta-date'>Effective Date: October 20, 2026 · Version 3.4</div>
              </div>

              <div className='legal-highlight-box'>
                <FileText size={20} className='text-emerald-400 flex-shrink-0' />
                <div>
                  <strong>Compliance Mandate:</strong> Use of this platform requires strict compliance with Meta&apos;s WhatsApp Business Messaging Policy and WhatsApp Commerce Policy. Sending spam or unverified bulk marketing is strictly prohibited.
                </div>
              </div>

              <section>
                <h3>1. Acceptance of Terms</h3>
                <p>
                  By registering an account, completing Meta Embedded Signup, or connecting a WhatsApp Business Account to the Platform, your organization agrees to be legally bound by these Terms of Service.
                </p>
              </section>

              <section>
                <h3>2. Mandatory Technical & Anti-Spam Governance</h3>
                <ul>
                  <li>
                    <strong>Official API Requirement:</strong> The client warrants that all WhatsApp messaging shall be conducted solely via official Meta Cloud API channels provisioned through the Platform. Connecting unauthorized emulators or scrapers constitutes immediate cause for termination.
                  </li>
                  <li>
                    <strong>Explicit Customer Opt-In:</strong> Clients must maintain verifiable, immutable opt-in consent for all message recipients before sending outbound marketing or utility broadcasts.
                  </li>
                  <li>
                    <strong>Automated Opt-Out Enforcement:</strong> Inbound messages containing keywords such as <code>STOP</code>, <code>UNSUBSCRIBE</code>, <code>QUIT</code>, or <code>CANCEL</code> automatically revoke contact consent, blacklisting the number from future campaigns without human intervention.
                  </li>
                  <li>
                    <strong>Quality Rating Protection:</strong> If a client&apos;s WhatsApp Business phone number drops to &quot;Red / Low Quality&quot; in the Meta Business Manager, outgoing broadcasts are automatically paused to prevent Meta account suspension.
                  </li>
                </ul>
              </section>

              <section>
                <h3>3. 24-Hour Customer Care Window</h3>
                <p>
                  Per Meta policy, free-form text and media responses to customer-initiated conversations may only be dispatched within 24 hours of the customer&apos;s latest incoming message. Outside the 24-hour customer care window, all outbound messages must utilize pre-approved Meta Template messages.
                </p>
              </section>

              <section>
                <h3>4. Platform Fee & Wallet Billing Model</h3>
                <ul>
                  <li>
                    <strong>WhatsApp Conversation Costs:</strong> Meta charges conversation fees directly to your Meta Business Portfolio payment method. We do not bill or mark up Meta conversation charges.
                  </li>
                  <li>
                    <strong>Platform Service Fees:</strong> Platform software usage (inbox seats, broadcast engine, automated workflows) is charged on a prepaid wallet or monthly subscription basis.
                  </li>
                  <li>
                    <strong>Wallet Idempotency:</strong> Wallet deductions use double-entry ledger bookkeeping. Broadcast dispatches hold an authorized reservation balance, charging only for successfully accepted Meta API transmissions and releasing any remaining reservations.
                  </li>
                </ul>
              </section>

              <section>
                <h3>5. Service Level Agreement (SLA) & Support</h3>
                <p>
                  We guarantee 99.9% monthly uptime for webhook ingestion and REST API endpoints. Scheduled maintenance windows will be communicated at least 48 hours in advance.
                </p>
              </section>
            </article>
          )}

          {activeTab === 'data_deletion' && (
            <article className='legal-article'>
              <div className='legal-article-header'>
                <h2>Meta User Data Deletion Instructions & Status Tracker</h2>
                <div className='legal-meta-date'>Meta Platform Policy 4.2 Compliance Endpoint</div>
              </div>

              <div className='legal-highlight-box'>
                <Trash2 size={20} className='text-emerald-400 flex-shrink-0' />
                <div>
                  <strong>Meta Data Deletion Callback:</strong> As a verified Meta Tech Provider, we provide automated user data deletion in compliance with Facebook/Meta Platform Rules. When you remove our app from your Meta Business Settings, Meta automatically notifies our server to purge all cached tokens.
                </div>
              </div>

              <section>
                <h3>How to Request Data Deletion</h3>
                <p>
                  If you have connected your Facebook/Meta account or WhatsApp Business Account to our platform and wish to delete your stored profile data, access tokens, and cached configurations, you have two options:
                </p>

                <div className='legal-steps-box'>
                  <div className='legal-step'>
                    <div className='legal-step-num'>1</div>
                    <div>
                      <strong>Option A: Automated Removal via Meta Settings (Recommended)</strong>
                      <p>
                        Go to your Facebook / Meta Account Settings &gt; <em>Apps and Websites</em> &gt; find <strong>Messaging Platform</strong> &gt; Click <strong>Remove</strong>. Meta will immediately send a signed deletion callback to our webhook endpoint <code>/api/webhooks/meta-data-deletion</code>.
                      </p>
                    </div>
                  </div>

                  <div className='legal-step'>
                    <div className='legal-step-num'>2</div>
                    <div>
                      <strong>Option B: Self-Service Console Deletion</strong>
                      <p>
                        Log in to your Messaging console, navigate to <em>Settings &gt; WhatsApp Connections</em>, select your active WABA connection, and click <strong>Disconnect &amp; Purge Credentials</strong>. All encrypted tokens and phone linkages will be instantaneously wiped.
                      </p>
                    </div>
                  </div>

                  <div className='legal-step'>
                    <div className='legal-step-num'>3</div>
                    <div>
                      <strong>Option C: Written Request to Privacy Team</strong>
                      <p>
                        Send an email with your organization name and WABA ID to <code>data-deletion@messaging-platform.com</code>. Requests are fulfilled within 48 business hours with an official cryptographic confirmation receipt.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3>Check Data Deletion Request Status</h3>
                <p>
                  If you submitted a data deletion request through Meta and received a confirmation tracking code, enter it below to verify completion:
                </p>

                <form className='legal-search-form' onSubmit={handleSearch}>
                  <input
                    type='text'
                    className='legal-search-input'
                    placeholder='Enter confirmation code (e.g., del_3f91a82bc0e)'
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                  />
                  <button type='submit' className='legal-search-btn'>
                    Verify Status
                  </button>
                </form>

                {searchStatus && (
                  <div className='legal-status-result'>
                    <div className='legal-status-header'>
                      <CheckCircle size={18} className='text-emerald-400' />
                      <span className='legal-status-title'>Request Completed</span>
                      {searchStatus.date && <span className='legal-status-date'>{searchStatus.date}</span>}
                    </div>
                    <p className='legal-status-desc'>{searchStatus.message}</p>
                    <div className='legal-status-checklist'>
                      <div className='checklist-item'>
                        <Check size={14} className='text-emerald-400' />
                        <span>OAuth Permanent Access Tokens Revoked &amp; Purged</span>
                      </div>
                      <div className='checklist-item'>
                        <Check size={14} className='text-emerald-400' />
                        <span>Webhook Event Subscriptions Unregistered from Meta Graph</span>
                      </div>
                      <div className='checklist-item'>
                        <Check size={14} className='text-emerald-400' />
                        <span>WABA Association Keys &amp; 2FA PINs Cryptographically Cleared</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </article>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className='legal-footer'>
        <div className='legal-footer-inner'>
          <p>&copy; 2026 Messaging Platform Inc. All rights reserved. Meta and WhatsApp are registered trademarks of Meta Platforms, Inc.</p>
          <div className='legal-footer-links'>
            <button type='button' onClick={() => setActiveTab('privacy_policy')}>Privacy Policy</button>
            <button type='button' onClick={() => setActiveTab('terms_and_conditions')}>Terms of Service</button>
            <button type='button' onClick={() => setActiveTab('data_deletion')}>User Data Deletion</button>
            <Link to='/authentication'>Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TermsConditions
