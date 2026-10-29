import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Users,
  Cpu,
  BarChart2,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Star,
  Layers,
  Send,
  X,
  Menu,
  Lock,
  Sun,
  Moon,
  Sliders
} from 'react-feather'
import kradBanner from '../../assets/images/logo/krad-sms-banner.png'
import kradTechCleanDarkSvg from '../../assets/images/logo/krad-technology-clean-dark.svg'
import kradTechCleanLightSvg from '../../assets/images/logo/krad-technology-clean-light.svg'
import kradTechDarkSvg from '../../assets/images/logo/krad-technology-dark.svg'
import kradTechLightSvg from '../../assets/images/logo/krad-technology-light.svg'
import logoIconSvg from '../../assets/images/logo/krad-logo-icon.svg'
import { setFaviconBadge } from '../../@core/utils/faviconBadge'
import './home-page.scss'

type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'AED'

interface CurrencyRate {
  code: CurrencyCode
  symbol: string
  prefix: string
  rate: number // conversion rate against INR (1 INR = 1/rate in foreign curr)
  label: string
}

const CURRENCIES: Record<CurrencyCode, CurrencyRate> = {
  INR: { code: 'INR', symbol: '₹', prefix: '₹', rate: 1.0, label: 'INR (₹)' },
  USD: { code: 'USD', symbol: '$', prefix: '$', rate: 86.0, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', prefix: '€', rate: 93.0, label: 'EUR (€)' },
  AED: { code: 'AED', symbol: 'د.إ', prefix: 'AED ', rate: 23.4, label: 'AED (د.إ)' }
}

const HomePage: React.FC = () => {
  // Theme & Currency States
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true)
  const [currency, setCurrency] = useState<CurrencyCode>('INR')

  // UI Interactive States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const [demoForm, setDemoForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    package: 'Business (₹30,000)'
  })
  const [demoSubmitted, setDemoSubmitted] = useState(false)

  // Interactive Credit Calculator State
  const [mktVol, setMktVol] = useState<number>(10000)
  const [utilVol, setUtilVol] = useState<number>(5000)
  const [svcVol, setSvcVol] = useState<number>(2000)
  const [includeGst, setIncludeGst] = useState<boolean>(true)

  // Floating Live Chat Widget State
  const [chatWidgetOpen, setChatWidgetOpen] = useState<boolean>(false)
  const [chatInputText, setChatInputText] = useState<string>('')
  const [unreadChatCount, setUnreadChatCount] = useState<number>(1)
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState<boolean>(false)

  // Automated Favicon Unread Notification Badge
  useEffect(() => {
    setFaviconBadge(unreadChatCount)
  }, [unreadChatCount])

  // Close currency dropdown when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('#krad-currency-selector')) {
        setCurrencyDropdownOpen(false)
      }
    }
    if (currencyDropdownOpen) {
      document.addEventListener('click', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [currencyDropdownOpen])

  // Currency Converter Utility Helper
  const formatMoney = (inrAmount: number, isRate = false): string => {
    const cur = CURRENCIES[currency]
    const converted = inrAmount / cur.rate

    if (isRate) {
      if (currency === 'INR') {
        return `₹${inrAmount.toFixed(4)}`
      }
      return `${cur.prefix}${converted.toFixed(4)}`
    }

    if (currency === 'INR') {
      return `₹${Math.round(inrAmount).toLocaleString('en-IN')}`
    } else if (currency === 'USD') {
      return `$${Math.round(converted).toLocaleString('en-US')}`
    } else if (currency === 'EUR') {
      return `€${Math.round(converted).toLocaleString('de-DE')}`
    } else {
      return `AED ${Math.round(converted).toLocaleString('en-AE')}`
    }
  }

  // Credit Calculator Calculations
  const costMkt = mktVol * 0.9131
  const costUtil = utilVol * 0.1650
  const costSvc = svcVol * 0.1650
  const subtotalCostInr = costMkt + costUtil + costSvc
  const totalMessages = mktVol + utilVol + svcVol
  const platformFeeInr = totalMessages * 0.05
  const metaChargesInr = subtotalCostInr - platformFeeInr
  const gstAmountInr = includeGst ? subtotalCostInr * 0.18 : 0
  const grandTotalInr = subtotalCostInr + gstAmountInr
  const avgCostPerMsgInr = totalMessages > 0 ? (grandTotalInr / totalMessages) : 0

  // Plan recommendation based on volume
  const getRecommendedPlan = () => {
    if (totalMessages <= 20000) {
      return {
        title: 'Starter Package',
        price: '₹15,000',
        desc: 'Ideal setup for early campaigns and single-user broadcast management.'
      }
    } else if (totalMessages <= 100000) {
      return {
        title: 'Business Package',
        price: '₹30,000',
        desc: 'Recommended: Full Multi-Agent Shared Inbox + Instant Auto-Replies.'
      }
    } else {
      return {
        title: 'Automation / Enterprise',
        price: '₹40,000+',
        desc: 'High-throughput scaling with autonomous multi-step AI chatbots and CRM webhooks.'
      }
    }
  }

  const recommendedPlan = getRecommendedPlan()

  // Actions
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setDemoSubmitted(true)
    const text = encodeURIComponent(
      `Hello KRAD SMS Team! I am interested in getting started.\nName: ${demoForm.name}\nCompany: ${demoForm.company}\nPhone: ${demoForm.phone}\nInterested Package: ${demoForm.package}\nCurrency: ${currency}`
    )
    window.open(`https://wa.me/919516871900?text=${text}`, '_blank')
    setTimeout(() => {
      setDemoSubmitted(false)
      setDemoModalOpen(false)
    }, 2000)
  }

  const handleCalculatorWhatsAppCTA = () => {
    const text = encodeURIComponent(
      `Hi KRAD SMS Team! I used your Interactive Credit Calculator.\n\n` +
      `📊 My Estimated Monthly Volume:\n` +
      `• Marketing Messages: ${mktVol.toLocaleString()}\n` +
      `• Utility & OTP Messages: ${utilVol.toLocaleString()}\n` +
      `• Customer Service Replies: ${svcVol.toLocaleString()}\n` +
      `• Total Messages: ${totalMessages.toLocaleString()} msgs/mo\n\n` +
      `💰 Estimated Monthly Cost (${currency}): ${formatMoney(grandTotalInr)} ${includeGst ? '(incl. 18% GST)' : '(excl. GST)'}\n` +
      `🎯 Recommended Setup Plan: ${recommendedPlan.title} (${formatMoney(totalMessages <= 20000 ? 15000 : totalMessages <= 100000 ? 30000 : 40000)})\n\n` +
      `Please provide onboarding assistance and help me activate our WhatsApp Cloud API!`
    )
    window.open(`https://wa.me/919516871900?text=${text}`, '_blank')
  }

  const handleLiveChatAction = (customPrompt?: string) => {
    const query = customPrompt || chatInputText.trim()
    if (!query) return
    const text = encodeURIComponent(
      `Hi KRAD SMS Specialist! I am browsing your website and need help with:\n"${query}"`
    )
    window.open(`https://wa.me/919516871900?text=${text}`, '_blank')
    setChatInputText('')
    setChatWidgetOpen(false)
  }

  return (
    <div className={`krad-landing ${isDarkTheme ? 'theme-dark' : 'theme-light'}`}>
      <div className='krad-circuit-overlay' aria-hidden='true' />

      {/* ====================================================================
          Navigation Bar (Official Logo, Currency & Theme Controls)
          ==================================================================== */}
      <header className='krad-nav'>
        <div className='krad-container'>
          <div className='krad-nav-inner'>
            <Link to='/' className='krad-brand' aria-label='KRAD Technology Home'>
              <img
                src={isDarkTheme ? kradTechCleanDarkSvg : kradTechCleanLightSvg}
                alt='KRAD Technology'
                className='krad-brand-img'
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav>
              <ul className='krad-nav-links'>
                <li>
                  <a href='#benefits' className='krad-nav-link'>Why Us</a>
                </li>
                <li>
                  <a href='#features' className='krad-nav-link'>Features</a>
                </li>
                <li>
                  <a href='#usecases' className='krad-nav-link'>Use Cases</a>
                </li>
                <li>
                  <a href='#calculator' className='krad-nav-link'>Calculator</a>
                </li>
                <li>
                  <a href='#pricing' className='krad-nav-link'>Packages & Rates</a>
                </li>
                <li>
                  <a href='#testimonials' className='krad-nav-link'>Testimonials</a>
                </li>
                <li>
                  <a href='#faq' className='krad-nav-link'>FAQ</a>
                </li>
              </ul>
            </nav>

            {/* Nav Controls: Currency Dropdown, Theme Switcher & Login CTA */}
            <div className='krad-nav-actions'>
              {/* Currency Dropdown Selector */}
              <div className='krad-currency-dropdown' id='krad-currency-selector'>
                <button
                  type='button'
                  className={`krad-currency-trigger ${currencyDropdownOpen ? 'active' : ''}`}
                  onClick={() => setCurrencyDropdownOpen(prev => !prev)}
                  aria-haspopup='listbox'
                  aria-expanded={currencyDropdownOpen}
                  title='Select Pricing Currency'
                >
                  <span className='krad-cur-symbol'>{CURRENCIES[currency].symbol}</span>
                  <span className='krad-cur-code'>{currency}</span>
                  <ChevronDown size={13} className={`krad-cur-chevron ${currencyDropdownOpen ? 'open' : ''}`} />
                </button>

                {currencyDropdownOpen && (
                  <div className='krad-currency-menu' role='listbox'>
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map(curCode => {
                      const item = CURRENCIES[curCode]
                      const isSel = currency === curCode
                      return (
                        <button
                          key={curCode}
                          type='button'
                          role='option'
                          aria-selected={isSel}
                          className={`krad-currency-item ${isSel ? 'selected' : ''}`}
                          onClick={() => {
                            setCurrency(curCode)
                            setCurrencyDropdownOpen(false)
                          }}
                        >
                          <span className='krad-item-symbol'>{item.symbol}</span>
                          <div className='krad-item-info'>
                            <span className='krad-item-code'>{curCode}</span>
                            <span className='krad-item-label'>{item.label}</span>
                          </div>
                          {isSel && <Check size={13} className='krad-item-check' />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Dark / Light Theme Toggle */}
              <button
                type='button'
                className='krad-theme-toggle'
                onClick={() => setIsDarkTheme(prev => !prev)}
                aria-label={`Switch to ${isDarkTheme ? 'Light' : 'Dark'} Mode`}
                title={`Switch to ${isDarkTheme ? 'Light' : 'Dark'} Mode`}
              >
                {isDarkTheme ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <Link to='/authentication' className='krad-btn-login'>
                <span>Console Sign In</span>
                <ArrowRight size={14} />
              </Link>

              <button
                type='button'
                className='krad-btn-primary'
                onClick={() => setDemoModalOpen(true)}
              >
                <span>Request Demo</span>
              </button>

              <button
                type='button'
                className='krad-nav-toggle'
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-label='Toggle menu'
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className='krad-mobile-menu'>
            <a href='#benefits' className='krad-mobile-link' onClick={() => setMobileMenuOpen(false)}>Why Us</a>
            <a href='#features' className='krad-mobile-link' onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href='#usecases' className='krad-mobile-link' onClick={() => setMobileMenuOpen(false)}>Use Cases</a>
            <a href='#calculator' className='krad-mobile-link' onClick={() => setMobileMenuOpen(false)}>Credit Calculator</a>
            <a href='#pricing' className='krad-mobile-link' onClick={() => setMobileMenuOpen(false)}>Packages & Rates</a>
            <a href='#testimonials' className='krad-mobile-link' onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
            <a href='#faq' className='krad-mobile-link' onClick={() => setMobileMenuOpen(false)}>FAQ</a>

            {/* Mobile Currency Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
              <div className='krad-currency-bar'>
                {(['INR', 'USD', 'EUR', 'AED'] as CurrencyCode[]).map(curCode => (
                  <button
                    key={curCode}
                    type='button'
                    className={`krad-currency-btn ${currency === curCode ? 'active' : ''}`}
                    onClick={() => setCurrency(curCode)}
                  >
                    {curCode}
                  </button>
                ))}
              </div>
            </div>

            <Link to='/authentication' className='krad-btn-login' style={{ justifyContent: 'center' }}>
              Console Sign In
            </Link>
          </div>
        )}
      </header>

      {/* ====================================================================
          Section 1: Hero Section
          ==================================================================== */}
      <section className='krad-hero'>
        <div className='krad-container'>
          {/* Status Badge */}
          <div className='krad-hero-badge'>
            <span className='krad-pulse-dot' aria-hidden='true' />
            <span>Official Meta Tech Provider Setup · WhatsApp Cloud API v21.0</span>
          </div>

          <h1 className='krad-hero-title'>
            Grow Your Business on WhatsApp with <span className='krad-gradient-text'>KRAD SMS</span>.
          </h1>

          <p className='krad-hero-subtitle'>
            Connect with your customers on the world's most popular messaging platform.
            End-to-end WhatsApp Business API, Shared Inbox, and Smart Chatbots by KRAD Technology.
          </p>

          <div className='krad-hero-cta-group'>
            <button
              type='button'
              className='krad-btn-primary'
              style={{ padding: '0.8rem 1.75rem', fontSize: '0.95rem' }}
              onClick={() => setDemoModalOpen(true)}
            >
              <span>Get Started Today</span>
              <ArrowRight size={16} />
            </button>
            <Link
              to='/authentication'
              className='krad-btn-login'
              style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem' }}
            >
              <Zap size={16} color='#00e5ff' />
              <span>Enter Workspace Console</span>
            </Link>
          </div>

          {/* Official Brand Hero Visual */}
          <div className='krad-hero-banner-card'>
            <img
              src={kradBanner}
              alt='KRAD SMS - WhatsApp Business API | AI Chatbots | Automation | AI Voice by KRAD Technology'
            />
          </div>

          {/* Trust Signals */}
          <div className='krad-trust-bar'>
            <div className='krad-trust-item'>
              <Shield size={16} />
              <span>An Enterprise Solution by KRAD Technology</span>
            </div>
            <div className='krad-trust-item'>
              <Check size={16} />
              <span>Official Meta Tech Provider Setup</span>
            </div>
            <div className='krad-trust-item'>
              <Zap size={16} />
              <span>Sub-50ms Realtime Cloud Sync</span>
            </div>
            <div className='krad-trust-item'>
              <Lock size={16} />
              <span>256-Bit Envelope Encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 2: Why Choose Us? (The Benefits)
          ==================================================================== */}
      <section id='benefits' className='krad-section'>
        <div className='krad-container'>
          <div className='krad-section-header'>
            <span className='krad-section-badge'>The Advantage</span>
            <h2 className='krad-section-title'>Why Choose KRAD SMS?</h2>
            <p className='krad-section-desc'>
              Purpose-built for modern businesses looking for transparent billing, enterprise stability, and zero-headache onboarding.
            </p>
          </div>

          <div className='krad-benefits-grid'>
            <div className='krad-benefit-card'>
              <div className='krad-benefit-icon'>
                <BarChart2 size={24} />
              </div>
              <h3 className='krad-benefit-title'>Transparent Pricing</h3>
              <p className='krad-benefit-text'>
                Simple rates combining Meta charges and a minimal flat {formatMoney(0.05, true)} platform fee. You only pay for successfully delivered messages with zero hidden markups.
              </p>
            </div>

            <div className='krad-benefit-card'>
              <div className='krad-benefit-icon'>
                <Layers size={24} />
              </div>
              <h3 className='krad-benefit-title'>Start Small, Scale Anytime</h3>
              <p className='krad-benefit-text'>
                Begin with the Starter package and upgrade to multi-user shared inboxes or autonomous AI chatbots without ever changing your WhatsApp number or losing chat history.
              </p>
            </div>

            <div className='krad-benefit-card'>
              <div className='krad-benefit-icon'>
                <Shield size={24} />
              </div>
              <h3 className='krad-benefit-title'>End-to-End Onboarding</h3>
              <p className='krad-benefit-text'>
                We handle the complete Meta Business Manager verification, green tick readiness, Cloud API configuration, and compliance for your brand from start to finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 3: Platform Features (What Users Get)
          ==================================================================== */}
      <section id='features' className='krad-section'>
        <div className='krad-container'>
          <div className='krad-section-header'>
            <span className='krad-section-badge'>Platform Features</span>
            <h2 className='krad-section-title'>Engineered for High-Impact Messaging</h2>
            <p className='krad-section-desc'>
              Everything your team needs to broadcast, automate, and resolve customer conversations at scale.
            </p>
          </div>

          <div className='krad-features-grid'>
            <div className='krad-feature-card'>
              <div className='krad-feature-header'>
                <div className='krad-feature-icon-box'>
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h3 className='krad-feature-title'>Bulk Messaging</h3>
                  <span className='krad-feature-tag'>Marketing Campaigns</span>
                </div>
              </div>
              <p className='krad-feature-desc'>
                Broadcast personalized Meta-approved template messages to thousands of opted-in customers in seconds. Ideal for festive sales, product launches, newsletters, and announcements with full delivery logs.
              </p>
            </div>

            <div className='krad-feature-card'>
              <div className='krad-feature-header'>
                <div className='krad-feature-icon-box'>
                  <Users size={22} />
                </div>
                <div>
                  <h3 className='krad-feature-title'>Unified Shared Inbox</h3>
                  <span className='krad-feature-tag'>Multi-Agent Support</span>
                </div>
              </div>
              <p className='krad-feature-desc'>
                Let your entire sales and support staff collaborate on customer queries simultaneously from a single central console. Assign tickets, leave internal notes, track agent response times, and prevent collision.
              </p>
            </div>

            <div className='krad-feature-card'>
              <div className='krad-feature-header'>
                <div className='krad-feature-icon-box'>
                  <Cpu size={22} />
                </div>
                <div>
                  <h3 className='krad-feature-title'>Smart Automation & Chatbots</h3>
                  <span className='krad-feature-tag'>24/7 Availability</span>
                </div>
              </div>
              <p className='krad-feature-desc'>
                Deploy intelligent 24/7 lead capture bots, instant automated welcome replies, off-hours routing, and advanced AI-powered FAQ resolution that seamlessly hand off to human agents when required.
              </p>
            </div>

            <div className='krad-feature-card'>
              <div className='krad-feature-header'>
                <div className='krad-feature-icon-box'>
                  <Check size={22} />
                </div>
                <div>
                  <h3 className='krad-feature-title'>Complete Meta Setup</h3>
                  <span className='krad-feature-tag'>Zero Technical Stress</span>
                </div>
              </div>
              <p className='krad-feature-desc'>
                Full white-glove assistance with official Meta Business Manager verification, WhatsApp Cloud API provisioning, and template registration so you are up and running in days instead of weeks.
              </p>
            </div>

            <div className='krad-feature-card'>
              <div className='krad-feature-header'>
                <div className='krad-feature-icon-box'>
                  <BarChart2 size={22} />
                </div>
                <div>
                  <h3 className='krad-feature-title'>Analytics & CRM Ready</h3>
                  <span className='krad-feature-tag'>Deep Visibility</span>
                </div>
              </div>
              <p className='krad-feature-desc'>
                Granular sent, delivered, read, and failed message analytics. Export CSVs, connect your CRM through REST webhooks, and monitor real-time credit consumption with zero surprises.
              </p>
            </div>

            <div className='krad-feature-card'>
              <div className='krad-feature-header'>
                <div className='krad-feature-icon-box'>
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className='krad-feature-title'>Prepaid Credit Flexibility</h3>
                  <span className='krad-feature-tag'>Pay-as-you-go</span>
                </div>
              </div>
              <p className='krad-feature-desc'>
                Straightforward top-up model where 1 credit equals 1 INR (or international equivalent). Recharge anytime, monitor balance deductions live, and enjoy auto-low-balance alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 4: Industry Use Cases
          ==================================================================== */}
      <section id='usecases' className='krad-section'>
        <div className='krad-container'>
          <div className='krad-section-header'>
            <span className='krad-section-badge'>Proven Solutions</span>
            <h2 className='krad-section-title'>How Businesses Use KRAD SMS</h2>
            <p className='krad-section-desc'>
              Tailored workflows delivering 4x higher open rates and 60% faster resolution across verticals.
            </p>
          </div>

          <div className='krad-usecases-grid'>
            <div className='krad-usecase-card'>
              <div className='krad-usecase-pill'>E-Commerce & Retail</div>
              <h3 className='krad-usecase-title'>Order Updates & Flash Sales</h3>
              <p className='krad-usecase-text'>
                Automate real-time dispatch tracking, COD confirmations, abandoned cart recovery nudges, and festival discounts straight into WhatsApp with rich media buttons.
              </p>
            </div>

            <div className='krad-usecase-card'>
              <div className='krad-usecase-pill'>Education & Coaching</div>
              <h3 className='krad-usecase-title'>Admissions & Batch Reminders</h3>
              <p className='krad-usecase-text'>
                Instantly capture student inquiry leads, send automated test schedules, share fee receipts, and broadcast urgent academic notifications directly to parents.
              </p>
            </div>

            <div className='krad-usecase-card'>
              <div className='krad-usecase-pill'>Healthcare & Clinics</div>
              <h3 className='krad-usecase-title'>Appointments & Diagnostic Reports</h3>
              <p className='krad-usecase-text'>
                Automate appointment booking confirmations, dispatch digital lab test reports as secure PDFs, and send medicine intake alerts with encrypted delivery.
              </p>
            </div>

            <div className='krad-usecase-card'>
              <div className='krad-usecase-pill'>Real Estate & Finance</div>
              <h3 className='krad-usecase-title'>Lead Qualification & Document Exchange</h3>
              <p className='krad-usecase-text'>
                Pre-qualify buyers through automated multi-step questionnaires, share property brochures, and securely send transaction alerts and OTP verifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 5: Interactive Credit Calculator Widget (Deliverable 3)
          ==================================================================== */}
      <section id='calculator' className='krad-section'>
        <div className='krad-container'>
          <div className='krad-calculator-card'>
            <div className='krad-calc-header'>
              <div className='krad-calc-badge'>
                <Sliders size={14} />
                <span>Interactive Cost & Volume Estimator</span>
              </div>
              <h2 className='krad-calc-title'>Estimate Your Monthly WhatsApp Billing</h2>
              <p className='krad-calc-subtitle'>
                Slide or type your anticipated volumes of Marketing, Utility, and Service messages.
                See real-time cost breakdown with official Meta base rates and the transparent {formatMoney(0.05, true)} KRAD platform fee.
              </p>
            </div>

            <div className='krad-calc-layout'>
              {/* Sliders & Volume Inputs */}
              <div className='krad-calc-controls'>
                {/* 1. Marketing Messages Slider */}
                <div className='krad-calc-group'>
                  <div className='krad-calc-group-header'>
                    <div className='krad-calc-label-wrap'>
                      <span className='krad-calc-label'>1. Marketing Messages</span>
                      <span className='krad-calc-rate-tag'>
                        Rate: {formatMoney(0.9131, true)} / msg (Meta + {formatMoney(0.05, true)} fee)
                      </span>
                    </div>
                    <div className='krad-calc-number-box'>
                      <input
                        type='number'
                        min={0}
                        max={1000000}
                        step={1000}
                        value={mktVol}
                        onChange={e => setMktVol(Math.max(0, parseInt(e.target.value) || 0))}
                        className='krad-calc-input-val'
                        aria-label='Marketing volume'
                      />
                      <span className='krad-calc-input-unit'>msgs</span>
                    </div>
                  </div>

                  <div className='krad-calc-slider-wrap'>
                    <input
                      type='range'
                      min={0}
                      max={250000}
                      step={1000}
                      value={mktVol}
                      onChange={e => setMktVol(parseInt(e.target.value))}
                      className='krad-calc-slider'
                      aria-label='Marketing messages range'
                    />
                  </div>

                  <div className='krad-calc-presets'>
                    <span className='krad-calc-preset-tag'>Presets:</span>
                    {[5000, 10000, 25000, 50000, 100000].map(val => (
                      <button
                        key={val}
                        type='button'
                        className='krad-calc-preset-btn'
                        onClick={() => setMktVol(val)}
                      >
                        {val >= 1000 ? `${val / 1000}k` : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Utility & Authentication (OTP) Slider */}
                <div className='krad-calc-group'>
                  <div className='krad-calc-group-header'>
                    <div className='krad-calc-label-wrap'>
                      <span className='krad-calc-label'>2. Utility & Authentication Messages (OTPs)</span>
                      <span className='krad-calc-rate-tag'>
                        Rate: {formatMoney(0.1650, true)} / msg (Meta + {formatMoney(0.05, true)} fee)
                      </span>
                    </div>
                    <div className='krad-calc-number-box'>
                      <input
                        type='number'
                        min={0}
                        max={500000}
                        step={500}
                        value={utilVol}
                        onChange={e => setUtilVol(Math.max(0, parseInt(e.target.value) || 0))}
                        className='krad-calc-input-val'
                        aria-label='Utility volume'
                      />
                      <span className='krad-calc-input-unit'>msgs</span>
                    </div>
                  </div>

                  <div className='krad-calc-slider-wrap'>
                    <input
                      type='range'
                      min={0}
                      max={100000}
                      step={500}
                      value={utilVol}
                      onChange={e => setUtilVol(parseInt(e.target.value))}
                      className='krad-calc-slider'
                      aria-label='Utility messages range'
                    />
                  </div>

                  <div className='krad-calc-presets'>
                    <span className='krad-calc-preset-tag'>Presets:</span>
                    {[2000, 5000, 15000, 30000, 50000].map(val => (
                      <button
                        key={val}
                        type='button'
                        className='krad-calc-preset-btn'
                        onClick={() => setUtilVol(val)}
                      >
                        {val >= 1000 ? `${val / 1000}k` : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Service (Replies) Slider */}
                <div className='krad-calc-group'>
                  <div className='krad-calc-group-header'>
                    <div className='krad-calc-label-wrap'>
                      <span className='krad-calc-label'>3. Customer Service Messages (User-Initiated)</span>
                      <span className='krad-calc-rate-tag'>
                        Rate: {formatMoney(0.1650, true)} / msg (Meta + {formatMoney(0.05, true)} fee)
                      </span>
                    </div>
                    <div className='krad-calc-number-box'>
                      <input
                        type='number'
                        min={0}
                        max={500000}
                        step={500}
                        value={svcVol}
                        onChange={e => setSvcVol(Math.max(0, parseInt(e.target.value) || 0))}
                        className='krad-calc-input-val'
                        aria-label='Service volume'
                      />
                      <span className='krad-calc-input-unit'>msgs</span>
                    </div>
                  </div>

                  <div className='krad-calc-slider-wrap'>
                    <input
                      type='range'
                      min={0}
                      max={50000}
                      step={500}
                      value={svcVol}
                      onChange={e => setSvcVol(parseInt(e.target.value))}
                      className='krad-calc-slider'
                      aria-label='Service messages range'
                    />
                  </div>

                  <div className='krad-calc-presets'>
                    <span className='krad-calc-preset-tag'>Presets:</span>
                    {[1000, 2000, 5000, 10000, 25000].map(val => (
                      <button
                        key={val}
                        type='button'
                        className='krad-calc-preset-btn'
                        onClick={() => setSvcVol(val)}
                      >
                        {val >= 1000 ? `${val / 1000}k` : val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Cost Summary & CTA Card */}
              <div className='krad-calc-summary-card'>
                <div>
                  <div className='krad-calc-summary-title'>
                    <span>Monthly Estimate Breakdown</span>
                    <label className='krad-calc-gst-toggle'>
                      <input
                        type='checkbox'
                        checked={includeGst}
                        onChange={e => setIncludeGst(e.target.checked)}
                      />
                      <span>Incl. 18% GST</span>
                    </label>
                  </div>

                  {/* Main Highlight Total Box */}
                  <div className='krad-calc-total-box'>
                    <div className='krad-calc-total-label'>Estimated Monthly Cost ({currency})</div>
                    <div className='krad-calc-total-amount'>{formatMoney(grandTotalInr)}</div>
                    <div className='krad-calc-total-avg'>
                      Avg: {formatMoney(avgCostPerMsgInr, true)} / message · {totalMessages.toLocaleString()} msgs total
                    </div>
                  </div>

                  {/* Line Item Breakdown */}
                  <div className='krad-calc-breakdown-list'>
                    <div className='krad-calc-breakdown-row'>
                      <span>Marketing ({mktVol.toLocaleString()} msgs):</span>
                      <strong>{formatMoney(costMkt)}</strong>
                    </div>
                    <div className='krad-calc-breakdown-row'>
                      <span>Utility & OTP ({utilVol.toLocaleString()} msgs):</span>
                      <strong>{formatMoney(costUtil)}</strong>
                    </div>
                    <div className='krad-calc-breakdown-row'>
                      <span>Service ({svcVol.toLocaleString()} msgs):</span>
                      <strong>{formatMoney(costSvc)}</strong>
                    </div>
                    <div className='krad-calc-breakdown-row'>
                      <span>Meta Official Base Charges:</span>
                      <span>{formatMoney(metaChargesInr)}</span>
                    </div>
                    <div className='krad-calc-breakdown-row'>
                      <span>Flat KRAD Platform Fee ({formatMoney(0.05, true)}/msg):</span>
                      <strong style={{ color: '#00e5ff' }}>{formatMoney(platformFeeInr)}</strong>
                    </div>
                    {includeGst && (
                      <div className='krad-calc-breakdown-row'>
                        <span>GST (18% Applicable Extra):</span>
                        <span>{formatMoney(gstAmountInr)}</span>
                      </div>
                    )}
                  </div>

                  {/* Recommended Setup Plan */}
                  <div className='krad-calc-plan-box'>
                    <div className='krad-plan-icon'>
                      <Check size={20} />
                    </div>
                    <div className='krad-plan-text'>
                      <span className='krad-plan-heading'>Recommended Onboarding Tier:</span>
                      <span className='krad-plan-val'>{recommendedPlan.title}</span>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                        {recommendedPlan.desc}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp CTA Button */}
                <button
                  type='button'
                  className='krad-btn-primary'
                  style={{ width: '100%', justifyContent: 'center', height: '48px' }}
                  onClick={handleCalculatorWhatsAppCTA}
                >
                  <MessageSquare size={17} />
                  <span>Lock in this Estimate on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 6: Packages & Transparent Rates
          ==================================================================== */}
      <section id='pricing' className='krad-section'>
        <div className='krad-container'>
          <div className='krad-section-header'>
            <span className='krad-section-badge'>Implementation Packages</span>
            <h2 className='krad-section-title'>Clear Packages. Predictable Costs.</h2>
            <p className='krad-section-desc'>
              One-time implementation setup with transparent per-message billing. No hidden platform markup.
            </p>

            {/* Currency selector above cards */}
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
              <div className='krad-currency-bar' role='tablist' aria-label='Select pricing currency'>
                {(['INR', 'USD', 'EUR', 'AED'] as CurrencyCode[]).map(curCode => (
                  <button
                    key={curCode}
                    type='button'
                    role='tab'
                    aria-selected={currency === curCode}
                    className={`krad-currency-btn ${currency === curCode ? 'active' : ''}`}
                    onClick={() => setCurrency(curCode)}
                  >
                    {CURRENCIES[curCode].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3 Packages Cards */}
          <div className='krad-pricing-grid'>
            {/* Starter */}
            <div className='krad-pricing-card'>
              <div>
                <div className='krad-plan-name'>Starter</div>
                <div className='krad-plan-bestfor'>Best for: New to WhatsApp API</div>
                <div className='krad-plan-price-box'>
                  <span className='krad-plan-price'>{formatMoney(15000)}</span>
                  <span className='krad-plan-period'>one-time setup</span>
                </div>
                <ul className='krad-plan-features'>
                  <li className='krad-plan-feature-item'><Check size={15} /> Official WABA Account Setup</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Meta Business Verification Help</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> WhatsApp Cloud API Configuration</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Message Template Approvals</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Bulk Broadcast Campaign Tools</li>
                  <li className='krad-plan-feature-item' style={{ color: '#64748b' }}>✕ Shared Team Inbox (Not included)</li>
                  <li className='krad-plan-feature-item' style={{ color: '#64748b' }}>✕ Automation Bot (Not included)</li>
                </ul>
              </div>
              <button
                type='button'
                className='krad-btn-login'
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setDemoForm(prev => ({ ...prev, package: `Starter (${formatMoney(15000)})` }))
                  setDemoModalOpen(true)
                }}
              >
                Choose Starter
              </button>
            </div>

            {/* Business (Most Popular) */}
            <div className='krad-pricing-card featured'>
              <div className='krad-popular-badge'>Most Popular</div>
              <div>
                <div className='krad-plan-name'>Business</div>
                <div className='krad-plan-bestfor'>Best for: Inbox + Basic Automation</div>
                <div className='krad-plan-price-box'>
                  <span className='krad-plan-price'>{formatMoney(30000)}</span>
                  <span className='krad-plan-period'>one-time setup</span>
                </div>
                <ul className='krad-plan-features'>
                  <li className='krad-plan-feature-item'><Check size={15} /> <strong>Everything in Starter</strong></li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Multi-Agent Unified Shared Inbox</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Multi-User Team Roles & Access</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Instant Auto-Replies & Welcome Flow</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Business Hours & Out-of-Office Routing</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Basic Lead Capture & Tagging</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Delivery Analytics & Export Reports</li>
                </ul>
              </div>
              <button
                type='button'
                className='krad-btn-primary'
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setDemoForm(prev => ({ ...prev, package: `Business (${formatMoney(30000)})` }))
                  setDemoModalOpen(true)
                }}
              >
                Choose Business
              </button>
            </div>

            {/* Automation */}
            <div className='krad-pricing-card'>
              <div>
                <div className='krad-plan-name'>Automation</div>
                <div className='krad-plan-bestfor'>Best for: Full Automated Journey</div>
                <div className='krad-plan-price-box'>
                  <span className='krad-plan-price'>{formatMoney(40000)}+</span>
                  <span className='krad-plan-period'>one-time setup</span>
                </div>
                <ul className='krad-plan-features'>
                  <li className='krad-plan-feature-item'><Check size={15} /> <strong>Everything in Business</strong></li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Custom Multi-Step Decision Chatbots</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Seamless Human-Agent Handover</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Advanced Flow Configuration ({formatMoney(50000)})</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> AI-Powered Autonomous FAQ Bots ({formatMoney(50000)}+)</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Custom Webhooks & CRM Sync</li>
                  <li className='krad-plan-feature-item'><Check size={15} /> Priority SLA Technical Support</li>
                </ul>
              </div>
              <button
                type='button'
                className='krad-btn-login'
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setDemoForm(prev => ({ ...prev, package: `Automation (${formatMoney(40000)}+)` }))
                  setDemoModalOpen(true)
                }}
              >
                Choose Automation
              </button>
            </div>
          </div>

          {/* Rate Breakdown Table */}
          <div className='krad-rates-card'>
            <div className='krad-rates-header'>
              <h3>Per-Message Rates (Transparent Billing in {currency})</h3>
              <p>Meta Official Base Rate + {formatMoney(0.05, true)} KRAD Platform Fee. You only pay for delivered messages.</p>
            </div>
            <div className='krad-table-wrapper'>
              <table className='krad-rates-table'>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Rate per Message ({currency})</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Marketing</strong></td>
                    <td><strong style={{ color: '#00e5ff' }}>{formatMoney(0.9131, true)}</strong> / message</td>
                    <td>Promotions, announcements, seasonal discounts, and opt-in newsletters.</td>
                  </tr>
                  <tr>
                    <td><strong>Utility & Authentication</strong></td>
                    <td><strong style={{ color: '#00e5ff' }}>{formatMoney(0.1650, true)}</strong> / message</td>
                    <td>Order confirmations, tracking updates, alerts, and one-time passwords (OTP).</td>
                  </tr>
                  <tr>
                    <td><strong>Service (Replies)</strong></td>
                    <td><strong style={{ color: '#00e5ff' }}>{formatMoney(0.1650, true)}</strong> / message</td>
                    <td>User-initiated customer service conversations within the standard 24h window.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className='krad-rates-note'>
              * Note: Rates include Meta official charges + {formatMoney(0.05, true)} flat platform fee. GST (18%) applicable extra on all charges.
            </p>
          </div>

          {/* Prepaid Credits Card */}
          <div className='krad-prepaid-card'>
            <div className='krad-prepaid-title'>
              <Zap size={18} />
              <span>Prepaid Credit System (1 Credit = 1 {currency === 'INR' ? 'INR' : currency})</span>
            </div>
            <p className='krad-prepaid-text'>
              Recharge your messaging balance as you go. Start with <strong>{formatMoney(5000)} (Starter)</strong>, <strong>{formatMoney(10000)} (Growth)</strong>, or <strong>{formatMoney(20000)} (Scale)</strong> recharge packs. Full real-time balance tracking in your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 7: How It Works (The 4-Step Process)
          ==================================================================== */}
      <section id='process' className='krad-section'>
        <div className='krad-container'>
          <div className='krad-section-header'>
            <span className='krad-section-badge'>Seamless Onboarding</span>
            <h2 className='krad-section-title'>How It Works in 4 Simple Steps</h2>
            <p className='krad-section-desc'>
              We handle the compliance heavy lifting so you can focus on building relationships.
            </p>
          </div>

          <div className='krad-steps-grid'>
            <div className='krad-step-card'>
              <div className='krad-step-num'>01</div>
              <h3 className='krad-step-title'>Choose Your Package</h3>
              <p className='krad-step-desc'>
                Select Starter, Business, or Automation based on whether you need simple broadcasts, team collaboration, or custom bots.
              </p>
            </div>

            <div className='krad-step-card'>
              <div className='krad-step-num'>02</div>
              <h3 className='krad-step-title'>Meta Onboarding</h3>
              <p className='krad-step-desc'>
                Our compliance team assists with Meta Business Manager verification, phone number binding, and display name approval.
              </p>
            </div>

            <div className='krad-step-card'>
              <div className='krad-step-num'>03</div>
              <h3 className='krad-step-title'>Dashboard Setup</h3>
              <p className='krad-step-desc'>
                We configure your shared inbox, invite team agents, register your broadcast templates, and build your auto-reply flows.
              </p>
            </div>

            <div className='krad-step-card'>
              <div className='krad-step-num'>04</div>
              <h3 className='krad-step-title'>Start Messaging</h3>
              <p className='krad-step-desc'>
                Recharge credits, broadcast high-converting campaigns, and manage customer replies live from your unified workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 8: Testimonials
          ==================================================================== */}
      <section id='testimonials' className='krad-section'>
        <div className='krad-container'>
          <div className='krad-section-header'>
            <span className='krad-section-badge'>Client Success</span>
            <h2 className='krad-section-title'>Trusted by Growing Enterprises</h2>
            <p className='krad-section-desc'>
              See how modern brands rely on KRAD SMS for high-converting customer engagement.
            </p>
          </div>

          <div className='krad-testimonials-grid'>
            <div className='krad-testimonial-card'>
              <div className='krad-stars'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill='#00e5ff' color='#00e5ff' />
                ))}
              </div>
              <p className='krad-testimonial-text'>
                "Switching to KRAD SMS was effortless. Their team guided us through Meta verification within 3 days. Our broadcast open rates jumped to 94% with zero message delivery failures."
              </p>
              <div className='krad-testimonial-author'>
                <div className='krad-author-avatar'>RK</div>
                <div>
                  <div className='krad-author-name'>Rohit Kapoor</div>
                  <div className='krad-author-role'>Founder, UrbanKart Retail</div>
                </div>
              </div>
            </div>

            <div className='krad-testimonial-card'>
              <div className='krad-stars'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill='#00e5ff' color='#00e5ff' />
                ))}
              </div>
              <p className='krad-testimonial-text'>
                "The Shared Team Inbox transformed our customer service. Four counselors manage student admissions simultaneously with zero overlap. The flat ₹0.05 platform fee saves us thousands every month."
              </p>
              <div className='krad-testimonial-author'>
                <div className='krad-author-avatar'>PS</div>
                <div>
                  <div className='krad-author-name'>Pooja Sharma</div>
                  <div className='krad-author-role'>Director of Admissions, Apex Academy</div>
                </div>
              </div>
            </div>

            <div className='krad-testimonial-card'>
              <div className='krad-stars'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill='#00e5ff' color='#00e5ff' />
                ))}
              </div>
              <p className='krad-testimonial-text'>
                "Their automated lead qualification bot pre-screens property buyers before routing them to our real estate agents. Our conversion speed has doubled. KRAD SMS is an essential tool in our stack."
              </p>
              <div className='krad-testimonial-author'>
                <div className='krad-author-avatar'>AM</div>
                <div>
                  <div className='krad-author-name'>Anand Mehta</div>
                  <div className='krad-author-role'>VP Sales, Skyline Infra</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 9: Frequently Asked Questions (FAQ)
          ==================================================================== */}
      <section id='faq' className='krad-section'>
        <div className='krad-container'>
          <div className='krad-section-header'>
            <span className='krad-section-badge'>Common Queries</span>
            <h2 className='krad-section-title'>Frequently Asked Questions</h2>
            <p className='krad-section-desc'>
              Everything you need to know about setup, Meta verification, and billing.
            </p>
          </div>

          <div className='krad-faq-list'>
            <div className='krad-faq-item'>
              <button
                type='button'
                className='krad-faq-question'
                onClick={() => toggleFaq(0)}
                aria-expanded={openFaq === 0}
              >
                <span>Do I need a new phone number for the WhatsApp Business API?</span>
                {openFaq === 0 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openFaq === 0 && (
                <div className='krad-faq-answer'>
                  You can use an existing phone number or a brand new one. However, the number must not be currently registered on the standard WhatsApp or WhatsApp Business mobile app. If it is, you will simply delete that consumer account before we link it to the Cloud API.
                </div>
              )}
            </div>

            <div className='krad-faq-item'>
              <button
                type='button'
                className='krad-faq-question'
                onClick={() => toggleFaq(1)}
                aria-expanded={openFaq === 1}
              >
                <span>What documents are required for Meta Business Verification?</span>
                {openFaq === 1 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openFaq === 1 && (
                <div className='krad-faq-answer'>
                  Meta requires official legal registration proof (e.g., GST certificate, MSME/Udyam, Certificate of Incorporation) matching your legal business name, along with a utility bill or bank statement showing your registered business address and website domain email. Our team assists you throughout this entire submission.
                </div>
              )}
            </div>

            <div className='krad-faq-item'>
              <button
                type='button'
                className='krad-faq-question'
                onClick={() => toggleFaq(2)}
                aria-expanded={openFaq === 2}
              >
                <span>How does the credit billing and payment system work?</span>
                {openFaq === 2 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openFaq === 2 && (
                <div className='krad-faq-answer'>
                  We operate on a transparent prepaid credit model where 1 credit equals 1 INR (or international equivalent). When you broadcast messages or reply to customers, exact per-message charges (Meta base rate + {formatMoney(0.05, true)} platform fee) are deducted in real-time. You only pay for successfully delivered messages.
                </div>
              )}
            </div>

            <div className='krad-faq-item'>
              <button
                type='button'
                className='krad-faq-question'
                onClick={() => toggleFaq(3)}
                aria-expanded={openFaq === 3}
              >
                <span>Can multiple team members use the same WhatsApp number?</span>
                {openFaq === 3 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openFaq === 3 && (
                <div className='krad-faq-answer'>
                  Yes! With the Business and Automation packages, you get our Unified Shared Inbox. Unlimited agents can log into your workspace console simultaneously, view assigned chats, tag conversations, and reply to customers from your single verified WhatsApp business number.
                </div>
              )}
            </div>

            <div className='krad-faq-item'>
              <button
                type='button'
                className='krad-faq-question'
                onClick={() => toggleFaq(4)}
                aria-expanded={openFaq === 4}
              >
                <span>How do message templates get approved by Meta?</span>
                {openFaq === 4 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openFaq === 4 && (
                <div className='krad-faq-answer'>
                  All outgoing broadcast messages (Marketing, Utility, Authentication) must follow Meta's template guidelines. You submit templates directly from your KRAD SMS console, and Meta's automated AI approves them typically within 1 to 5 minutes.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 10: Final CTA Banner ("Ready to Transform Your Customer Communication?")
          ==================================================================== */}
      <section className='krad-cta-banner'>
        <div className='krad-container'>
          <div className='krad-cta-card'>
            <div className='krad-cta-glow-bg' aria-hidden='true' />
            <h2 className='krad-cta-title'>
              Ready to Transform Your Customer Communication?
            </h2>
            <p className='krad-cta-desc'>
              Join high-growth brands delivering instant value on WhatsApp. Get started with official Meta Cloud API setup in under 48 hours.
            </p>
            <div className='krad-cta-btn-group'>
              <button
                type='button'
                className='krad-btn-primary krad-cta-btn-main'
                onClick={() => setDemoModalOpen(true)}
              >
                <MessageSquare size={18} />
                <span>Talk to a WhatsApp Specialist</span>
              </button>
              <Link
                to='/authentication'
                className='krad-btn-login krad-cta-btn-sub'
              >
                <span>Console Sign In</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 11: Footer (Official KRAD Technology Logo)
          ==================================================================== */}
      <footer className='krad-footer'>
        <div className='krad-container'>
          <div className='krad-footer-grid'>
            <div className='krad-footer-col'>
              <div style={{ marginBottom: '1.25rem' }}>
                <img
                  src={isDarkTheme ? kradTechDarkSvg : kradTechLightSvg}
                  alt='KRAD Technology - Custom Software, AI Services, Mobile Apps, Digital Marketing'
                  className='krad-footer-logo-img'
                />
              </div>
              <p className='krad-footer-desc'>
                Official Meta WhatsApp Business Cloud API provider for high-growth enterprises.
                Unified Shared Inbox, High-Throughput Bulk Campaigns, and Autonomous AI Chatbots by KRAD Technology.
              </p>
            </div>

            <div className='krad-footer-col'>
              <h4>Quick Links</h4>
              <ul className='krad-footer-contacts'>
                <li><a href='#features'>Platform Features</a></li>
                <li><a href='#calculator' className='krad-footer-link-highlight'>Credit Calculator</a></li>
                <li><a href='#pricing'>Packages & Rates</a></li>
                <li><a href='#usecases'>Industry Solutions</a></li>
                <li><Link to='/authentication' className='krad-footer-link-highlight'>Console Login</Link></li>
              </ul>
            </div>

            <div className='krad-footer-col'>
              <h4>Contact & Support</h4>
              <ul className='krad-footer-contacts'>
                <li>
                  <Phone size={14} />
                  <span>+91 9516871900</span>
                </li>
                <li>
                  <Mail size={14} />
                  <span>sms@kradtech.com</span>
                </li>
                <li>
                  <MapPin size={14} />
                  <span>Bhopal, Madhya Pradesh, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className='krad-footer-bottom'>
            <div>
              KRAD Technology © 2026. All rights reserved.
            </div>
            <div className='krad-legal-links'>
              <Link to='/terms-conditions'>Terms & Conditions</Link>
              <Link to='/privacy-policy'>Privacy Policy</Link>
              <Link to='/whatsapp-policy'>Meta WhatsApp Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          Deliverable 4: Live Chat Widget (Floating WhatsApp Bubble)
          ==================================================================== */}
      <aside className='krad-chat-floating-wrap' aria-label='WhatsApp Live Support'>
        {/* Floating Bubble FAB with WhatsApp Styling and Live Notification Badge */}
        <button
          type='button'
          className={`krad-chat-fab ${chatWidgetOpen ? 'open' : ''}`}
          onClick={() => {
            setChatWidgetOpen(prev => {
              const next = !prev
              if (next && unreadChatCount > 0) {
                setUnreadChatCount(0)
                setFaviconBadge(0)
              }
              return next
            })
          }}
          aria-label='Chat with KRAD WhatsApp Specialist'
          title='Chat with KRAD WhatsApp Specialist'
        >
          {!chatWidgetOpen && <div className='krad-chat-fab-ripple' aria-hidden='true' />}
          {!chatWidgetOpen && unreadChatCount > 0 && (
            <div className='krad-chat-fab-badge'>{unreadChatCount}</div>
          )}
          {chatWidgetOpen ? (
            <X size={24} />
          ) : (
            <svg
              className='krad-whatsapp-fab-icon'
              width='30'
              height='30'
              viewBox='0 0 24 24'
              fill='currentColor'
              aria-hidden='true'
            >
              <path d='M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.587 1.956.884 3.057.884l.004-.001c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.769-5.768-5.769zm3.364 8.167c-.14.394-.789.754-1.096.799-.281.04-.647.06-2.124-.551-1.89-.783-3.109-2.709-3.204-2.834-.093-.125-.761-1.012-.761-1.93 0-.918.481-1.37.652-1.558.172-.187.376-.234.502-.234.125 0 .251.002.361.007.116.006.271-.044.423.323.156.376.533 1.3.579 1.395.047.094.078.204.016.329-.062.125-.094.204-.188.313-.094.109-.197.243-.282.327-.094.094-.192.196-.083.383.109.188.486.802 1.042 1.297.717.639 1.321.837 1.509.931.188.094.298.078.408-.047.109-.125.47-.547.595-.734.125-.188.251-.157.423-.094.172.063 1.097.517 1.285.611.188.094.313.141.36.219.047.078.047.453-.093.847z' />
              <path d='M12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.174L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.616 0-3.136-.452-4.437-1.237l-.318-.19-3.284.861.877-3.202-.208-.332A8.136 8.136 0 013.833 12C3.833 7.498 7.498 3.833 12 3.833S20.167 7.498 20.167 12 16.502 20.167 12 20.167z' />
            </svg>
          )}
        </button>

        {/* Expanded WhatsApp Live Chat Window */}
        {chatWidgetOpen && (
          <div className='krad-chat-panel' role='dialog' aria-modal='true' aria-labelledby='krad-chat-title-heading'>
            {/* Header */}
            <header className='krad-chat-header'>
              <div className='krad-chat-header-info'>
                <div className='krad-chat-avatar'>
                  <img src={logoIconSvg} alt='KRAD SMS Support' />
                  <span className='krad-chat-online-dot' aria-hidden='true' />
                </div>
                <div>
                  <div id='krad-chat-title-heading' className='krad-chat-title'>
                    KRAD SMS Specialist
                  </div>
                  <div className='krad-chat-status'>
                    Online · Typically replies in seconds
                  </div>
                </div>
              </div>
              <button
                type='button'
                className='krad-chat-close-btn'
                onClick={() => setChatWidgetOpen(false)}
                aria-label='Close chat'
              >
                <X size={16} />
              </button>
            </header>

            {/* Chat Body */}
            <div className='krad-chat-body'>
              <div className='krad-chat-bubble-received'>
                <div>
                  👋 <strong>Hello! Welcome to KRAD SMS.</strong>
                  <br /><br />
                  Looking for official Meta WhatsApp Cloud API setup, bulk broadcasts, or custom AI chatbots?
                  Tap a quick option below to chat directly with our specialists:
                </div>
                <span className='krad-chat-time'>Just now</span>
              </div>

              {/* Quick Inquiry Chips */}
              <div className='krad-chat-chips-label'>Popular Inquiries</div>
              <div className='krad-chat-chips'>
                <button
                  type='button'
                  className='krad-chat-chip-btn'
                  onClick={() => handleLiveChatAction('I want to schedule a live demo of KRAD SMS')}
                >
                  <span>🚀 Request a Live Demo</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type='button'
                  className='krad-chat-chip-btn'
                  onClick={() => handleLiveChatAction('I need pricing and custom credit quote for my business')}
                >
                  <span>💰 Pricing & Volume Estimation</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type='button'
                  className='krad-chat-chip-btn'
                  onClick={() => handleLiveChatAction('I need assistance with Meta Business Verification and API setup')}
                >
                  <span>⚡ Meta Cloud API Setup Assistance</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type='button'
                  className='krad-chat-chip-btn'
                  onClick={() => handleLiveChatAction('I want to explore AI Chatbots and CRM automation for WhatsApp')}
                >
                  <span>🤖 Autonomous AI Chatbots Consultation</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Footer Text Input Bar */}
            <form
              className='krad-chat-footer'
              onSubmit={e => {
                e.preventDefault()
                handleLiveChatAction()
              }}
            >
              <input
                type='text'
                placeholder='Type your message...'
                className='krad-chat-input'
                value={chatInputText}
                onChange={e => setChatInputText(e.target.value)}
              />
              <button
                type='submit'
                className='krad-chat-send-btn'
                aria-label='Send message on WhatsApp'
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </aside>

      {/* ====================================================================
          Interactive Demo & Inquiry Modal
          ==================================================================== */}
      {demoModalOpen && (
        <div className='krad-modal-backdrop' onClick={() => setDemoModalOpen(false)}>
          <div className='krad-modal-card' onClick={e => e.stopPropagation()}>
            <button
              type='button'
              className='krad-modal-close'
              onClick={() => setDemoModalOpen(false)}
              aria-label='Close modal'
            >
              <X size={18} />
            </button>

            <h3 className='krad-modal-title'>Get Started with KRAD SMS</h3>
            <p className='krad-modal-desc'>
              Connect with our WhatsApp specialists for onboarding assistance and live platform demonstration.
            </p>

            <form onSubmit={handleDemoSubmit}>
              <div className='krad-form-group'>
                <label className='krad-form-label'>Full Name *</label>
                <input
                  type='text'
                  required
                  placeholder='Enter your name'
                  className='krad-form-input'
                  value={demoForm.name}
                  onChange={e => setDemoForm({ ...demoForm, name: e.target.value })}
                />
              </div>

              <div className='krad-form-group'>
                <label className='krad-form-label'>WhatsApp Phone Number *</label>
                <input
                  type='tel'
                  required
                  placeholder='+91 98765 43210'
                  className='krad-form-input'
                  value={demoForm.phone}
                  onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                />
              </div>

              <div className='krad-form-group'>
                <label className='krad-form-label'>Company / Business Name *</label>
                <input
                  type='text'
                  required
                  placeholder='Your business name'
                  className='krad-form-input'
                  value={demoForm.company}
                  onChange={e => setDemoForm({ ...demoForm, company: e.target.value })}
                />
              </div>

              <div className='krad-form-group'>
                <label className='krad-form-label'>Interested Package</label>
                <select
                  className='krad-form-input'
                  value={demoForm.package}
                  onChange={e => setDemoForm({ ...demoForm, package: e.target.value })}
                  style={{ background: '#091329', color: '#fff' }}
                >
                  <option value={`Starter (${formatMoney(15000)})`}>Starter ({formatMoney(15000)}) - API & Setup</option>
                  <option value={`Business (${formatMoney(30000)})`}>Business ({formatMoney(30000)}) - Inbox + Automation</option>
                  <option value={`Automation (${formatMoney(40000)}+)`}>Automation ({formatMoney(40000)}+) - Full Chatbots</option>
                </select>
              </div>

              <button
                type='submit'
                className='krad-btn-primary'
                style={{ width: '100%', justifyContent: 'center', height: '46px', marginTop: '1rem' }}
                disabled={demoSubmitted}
              >
                {demoSubmitted ? (
                  <span>Opening WhatsApp...</span>
                ) : (
                  <>
                    <MessageSquare size={16} />
                    <span>Connect on WhatsApp (+91 9516871900)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
