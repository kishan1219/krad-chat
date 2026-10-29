// @ts-nocheck
import React from 'react'
import authLogo from '../../assets/images/logo/platform.svg'
import './TermsAndConditions.scss'

const WhatsappPolicy = () => {
    return (
        <div className="tc-wrapper">
            <div className="paper-page">
                <div className='d-flex justify-content-center'>
                    <img style={{ width: 250, height: 100 }} className='img-fluid' src={authLogo} />
                </div>
                <header>
                    <h1>Terms & Conditions for availing WHATSAPP BUSINESS API</h1>
                </header>

                {/* SECTION I */}
                <section>
                    <h2>I. Technical Mandates (The "Anti-Ban" Clause)</h2>
                    <p>The Vendor must strictly adhere to the following technical standards to ensure the safety of our official communication channel:</p>
                    <ul>
                        <li>
                            <strong>Official API Integration:</strong> The Vendor warrants the use of the <strong>Official WhatsApp Business API</strong>.
                            Use of unauthorized "Web-based scrapers," "Android-emulators," or "SIM-farming" constitutes a material breach of contract.
                        </li>
                        <li>
                            <strong>Meta Partner Verification:</strong> The Vendor must maintain status as an authorized Meta Business Solution Provider (BSP) or a verified sub-processor.
                        </li>
                        <li>
                            <strong>Template Governance:</strong> The Vendor shall facilitate the submission of message templates to Meta and ensure they are categorized correctly (Marketing vs. Utility) to prevent account "Quality Rating" drops.
                        </li>
                    </ul>
                </section>

                {/* SECTION II */}
                <section>
                    <h2>II. Data Sovereignty & Security</h2>
                    <ul>
                        <li>
                            <strong>EPFO, Regional Office, Bengaluru (Central)</strong> retains 100% ownership of all uploaded contact databases. The Vendor acquires no rights to this data.
                        </li>
                        <li><strong>Data Residency:</strong> All data must be stored on servers located in <strong>India</strong>.</li>
                        <li>
                            <strong>Zero-Use Policy:</strong> The Vendor is strictly prohibited from "cross-pollinating" data, selling leads, or using EPFO, Regional Office, Bengaluru (Central)’s contact list for any other client’s campaigns.
                        </li>
                        <li>
                            <strong>Encryption:</strong> All data in transit between our office and the Vendor’s gateway must be secured via <strong>AES-256-bit encryption</strong> (Advanced Encryption Standard) or higher.
                        </li>
                    </ul>
                </section>

                {/* SECTION III */}
                <section>
                    <h2>III. Service Level & Operational Guarantees (SLA)</h2>
                    <ul>
                        <li><strong>Uptime & Reliability:</strong> A minimum of <strong>99.9% platform uptime</strong> is required.</li>
                        <li>
                            <strong>Automatic Opt-Out:</strong> The platform must feature an automated <strong>"Keyword Trigger"</strong> system. If a user replies with "STOP," "UNSUBSCRIBE," or "QUIT," the system must instantly blacklist that number from future broadcasts without manual intervention.
                        </li>
                        <li>
                            <strong>Transparency in Analytics:</strong> The Vendor must provide a real-time dashboard showing:
                            <ul className="sub-list">
                                <li>Sent vs. Delivered status.</li>
                                <li>Read receipts (Blue ticks).</li>
                                <li>Click-through rates (CTR) for interactive buttons.</li>
                            </ul>
                        </li>
                    </ul>
                </section>

                {/* SECTION IV */}
                <section>
                    <h2>IV. Financial Transparency</h2>
                    <ul>
                        <li><strong>Itemized Billing:</strong> Invoices must clearly separate <strong>Meta’s Conversation Fees</strong> from the <strong>Vendor’s Platform/Management Fees</strong>.</li>
                        <li><strong>Credit Recovery:</strong> EPFO, Regional Office, Bengaluru (Central) shall not be billed for messages that fail due to Vendor system outages or API connectivity errors.</li>
                    </ul>
                </section>

                <div className="divider" />
                <p style={{ fontStyle: 'italic', fontWeight: '600' }}>Terms and conditions w.r.t the floated bid the vendor must submit the following:</p>

                {/* ELIGIBILITY */}
                <section>
                    <h3>1. Mandatory Technical Eligibility</h3>
                    <div className="bullet-point">
                        <span className="icon">➢</span>
                        <div>
                            <strong>Official Meta Business Solution Provider (BSP) Status:</strong> The bidder must be an authorized Meta BSP or a verified tech partner. (Please provide link to their listing in the Meta Partner Directory).
                        </div>
                    </div>
                    <div className="bullet-point">
                        <span className="icon">➢</span>
                        <div>
                            <strong>TRAI Registration:</strong> The bidder should have a valid registration with <strong>TRAI as a Telemarketer</strong>. (To ensure compliance with Indian telecom regulations for commercial messaging).
                        </div>
                    </div>
                    <ul>
                        <li>
                            <strong>SMS Fallback Capability:</strong> The platform must have an integrated "SMS Fallback" feature to ensure that if a WhatsApp message fails, the notification is delivered via standard SMS.
                        </li>
                    </ul>
                </section>

                {/* SECURITY & COMPLIANCE */}
                <section>
                    <h3>2. Security & Compliance Criteria (The "Safety" Check)</h3>
                    <div className="bullet-point">
                        <span className="icon">➢</span>
                        <div>
                            <strong>Data Residency (Sovereignty):</strong> The bidder must provide a self-declaration that all EPFO data will be stored on <strong>servers physically located within India</strong>.
                        </div>
                    </div>
                    <div className="bullet-point">
                        <span className="icon">➢</span>
                        <div>
                            <strong>DPDP Act & IT Act Compliance:</strong> The bidder must be compliant with the <strong>Digital Personal Data Protection (DPDP) Act</strong> and <strong>ISO/IEC 27001:2013</strong> certification.
                        </div>
                    </div>
                    <div className="bullet-point">
                        <span className="icon">➢</span>
                        <div>
                            <strong>Encryption:</strong> End-to-end encryption for all message payloads and AES-256-bit encryption for data at rest.
                        </div>
                    </div>
                </section>

                {/* EXPERIENCE & SLA */}
                <section>
                    <h3>3. Experience & Performance (As per GeM Bid)</h3>
                    <div className="bullet-point">
                        <span className="icon">➢</span>
                        <div>
                            <strong>Past Experience:</strong> At least <strong>3 years of experience</strong> in providing Bulk Messaging/WhatsApp API services to Central/State Govt, PSUs, or Autonomous bodies.
                        </div>
                    </div>

                    <h3>4. Functional Requirements (SLA)</h3>
                    <ul>
                        <li><strong>Automated Opt-Out (Keyword Triggers):</strong> System must handle "STOP" or "UNSUBSCRIBE" requests to keep "Health Score" high.</li>
                        <li><strong>Dashboard & Analytics:</strong> Bidder must provide a web-based dashboard showing real-time status: Sent, Delivered, Read, and Failed.</li>
                        <li><strong>Uptime Guarantee:</strong> A minimum uptime of <strong>99.9%</strong> for the API gateway.</li>
                    </ul>
                </section>
         
                
            </div>
        </div>
    )
}

export default WhatsappPolicy
