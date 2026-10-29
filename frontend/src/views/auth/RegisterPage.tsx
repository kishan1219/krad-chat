import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Briefcase,
  MapPin,
  Shield,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MessageSquare,
  Clock
} from 'react-feather'
import { signUp } from '../../utility/apis/authentication'
import './auth-v3.scss'

interface RegisterFormValues {
  name: string
  email: string
  username: string
  companyName: string
  mobile: string
  city: string
  password: string
  password_confirmation: string
  terms: boolean
  opt_in: boolean
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPolicyViewer, setShowPolicyViewer] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [successText, setSuccessText] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      username: '',
      companyName: '',
      mobile: '',
      city: '',
      password: '',
      password_confirmation: '',
      terms: false,
      opt_in: false
    }
  })

  const passwordValue = watch('password')

  const onSubmit = (formData: RegisterFormValues) => {
    setErrorText('')
    setSuccessText('')

    if (!formData.terms) {
      setErrorText('You must agree to the Terms and Privacy Policy to create an account.')
      return
    }

    signUp({
      formData: {
        ...formData,
        business_name: formData.companyName || `${formData.name}'s Workspace`
      },
      loading: setLoading,
      success: () => {
        setSuccessText('Registration successful! Redirecting to login...')
        setTimeout(() => {
          navigate('/authentication')
        }, 1200)
      },
      error: (err: any) => {
        const message =
          err?.data?.message || err?.message || 'Registration failed. Please check your information.'
        setErrorText(message)
      }
    })
  }

  return (
    <div className='auth-v3-container'>
      <div className='auth-v3-glow auth-v3-glow-1' />
      <div className='auth-v3-glow auth-v3-glow-2' />

      <div className='auth-v3-card auth-v3-card-wide'>
        {/* Left Showcase Panel */}
        <section className='auth-v3-showcase'>
          <div>
            <div className='auth-v3-brand'>
              <div className='auth-v3-logo-badge'>
                <MessageSquare size={24} />
              </div>
              <div className='auth-v3-brand-text'>
                <span>Messaging</span>
                <span className='auth-v3-brand-badge'>Tech Provider</span>
              </div>
            </div>

            <div className='auth-v3-hero-content'>
              <div className='auth-v3-partner-pill'>
                <Shield size={13} color='#10b981' />
                <span>Meta Tech Provider Onboarding</span>
              </div>
              <h1 className='auth-v3-title'>
                Create Your <span className='auth-v3-gradient-text'>WhatsApp Workspace</span>
              </h1>
              <p className='auth-v3-subtitle'>
                Deploy conversational automation, team inboxes, and high-volume marketing broadcasts in minutes with direct Meta Cloud API integration.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle size={18} color='#10b981' style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                    Zero Credit Risk Architecture
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Meta bills conversation charges directly to your Business Portfolio.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle size={18} color='#10b981' style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                    Multi-Agent Realtime Inbox
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Assign, tag, and respond to incoming chats with instant WebSocket updates.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle size={18} color='#10b981' style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                    Enterprise Security & Compliance
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Strict tenant isolation with AES-256-GCM envelope encryption.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='auth-v3-metrics-grid'>
            <div className='auth-v3-metric-item'>
              <div className='auth-v3-metric-value'>v21.0</div>
              <div className='auth-v3-metric-label'>Graph Cloud API</div>
            </div>
            <div className='auth-v3-metric-item'>
              <div className='auth-v3-metric-value'>Instant</div>
              <div className='auth-v3-metric-label'>Embedded Signup</div>
            </div>
          </div>
        </section>

        {/* Right Form Panel */}
        <section className='auth-v3-form-panel' style={{ padding: '2.5rem 2.5rem' }}>
          <div className='auth-v3-form-header'>
            <div className='auth-v3-partner-pill' style={{ marginBottom: '0.65rem' }}>
              <Shield size={13} color='#38bdf8' />
              <span>Get Started</span>
            </div>
            <h2>Register your organization</h2>
            <p>Set up your account and WhatsApp Business credentials.</p>
          </div>

          {errorText && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.84rem',
                marginBottom: '1.25rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{errorText}</span>
            </div>
          )}

          {successText && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
                fontSize: '0.84rem',
                marginBottom: '1.25rem'
              }}
            >
              <CheckCircle size={16} />
              <span>{successText}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* 2-Column Responsive Form Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}
            >
              {/* Name */}
              <div className='auth-v3-field-group' style={{ marginBottom: '0' }}>
                <label htmlFor='reg-name'>Full Name</label>
                <div className='auth-v3-input-wrapper'>
                  <span className='auth-v3-input-icon'>
                    <User size={15} />
                  </span>
                  <input
                    id='reg-name'
                    type='text'
                    className={`auth-v3-input ${errors.name ? 'is-invalid' : ''}`}
                    placeholder='Jane Doe'
                    {...register('name', { required: 'Full name is required' })}
                  />
                </div>
                {errors.name && (
                  <div className='auth-v3-error-text'>
                    <AlertCircle size={12} />
                    <span>{errors.name.message}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className='auth-v3-field-group' style={{ marginBottom: '0' }}>
                <label htmlFor='reg-email'>Work Email</label>
                <div className='auth-v3-input-wrapper'>
                  <span className='auth-v3-input-icon'>
                    <Mail size={15} />
                  </span>
                  <input
                    id='reg-email'
                    type='email'
                    className={`auth-v3-input ${errors.email ? 'is-invalid' : ''}`}
                    placeholder='jane@company.com'
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Enter a valid email'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <div className='auth-v3-error-text'>
                    <AlertCircle size={12} />
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>

              {/* Username */}
              <div className='auth-v3-field-group' style={{ marginBottom: '0' }}>
                <label htmlFor='reg-username'>Username</label>
                <div className='auth-v3-input-wrapper'>
                  <span className='auth-v3-input-icon'>
                    <User size={15} />
                  </span>
                  <input
                    id='reg-username'
                    type='text'
                    className={`auth-v3-input ${errors.username ? 'is-invalid' : ''}`}
                    placeholder='janedoe'
                    {...register('username', { required: 'Username is required' })}
                  />
                </div>
                {errors.username && (
                  <div className='auth-v3-error-text'>
                    <AlertCircle size={12} />
                    <span>{errors.username.message}</span>
                  </div>
                )}
              </div>

              {/* Company Name */}
              <div className='auth-v3-field-group' style={{ marginBottom: '0' }}>
                <label htmlFor='reg-company'>Company / Business Name</label>
                <div className='auth-v3-input-wrapper'>
                  <span className='auth-v3-input-icon'>
                    <Briefcase size={15} />
                  </span>
                  <input
                    id='reg-company'
                    type='text'
                    className={`auth-v3-input ${errors.companyName ? 'is-invalid' : ''}`}
                    placeholder='Acme Enterprises'
                    {...register('companyName', { required: 'Company name is required' })}
                  />
                </div>
                {errors.companyName && (
                  <div className='auth-v3-error-text'>
                    <AlertCircle size={12} />
                    <span>{errors.companyName.message}</span>
                  </div>
                )}
              </div>

              {/* Mobile Phone */}
              <div className='auth-v3-field-group' style={{ marginBottom: '0' }}>
                <label htmlFor='reg-mobile'>WhatsApp / Mobile Number</label>
                <div className='auth-v3-input-wrapper'>
                  <span className='auth-v3-input-icon'>
                    <Phone size={15} />
                  </span>
                  <input
                    id='reg-mobile'
                    type='tel'
                    className={`auth-v3-input ${errors.mobile ? 'is-invalid' : ''}`}
                    placeholder='+91 98765 43210'
                    {...register('mobile', { required: 'Mobile number is required' })}
                  />
                </div>
                {errors.mobile && (
                  <div className='auth-v3-error-text'>
                    <AlertCircle size={12} />
                    <span>{errors.mobile.message}</span>
                  </div>
                )}
              </div>

              {/* City */}
              <div className='auth-v3-field-group' style={{ marginBottom: '0' }}>
                <label htmlFor='reg-city'>City</label>
                <div className='auth-v3-input-wrapper'>
                  <span className='auth-v3-input-icon'>
                    <MapPin size={15} />
                  </span>
                  <input
                    id='reg-city'
                    type='text'
                    className={`auth-v3-input ${errors.city ? 'is-invalid' : ''}`}
                    placeholder='Mumbai'
                    {...register('city', { required: 'City is required' })}
                  />
                </div>
                {errors.city && (
                  <div className='auth-v3-error-text'>
                    <AlertCircle size={12} />
                    <span>{errors.city.message}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className='auth-v3-field-group' style={{ marginBottom: '0' }}>
                <label htmlFor='reg-password'>Password (12+ characters)</label>
                <div className='auth-v3-input-wrapper'>
                  <span className='auth-v3-input-icon'>
                    <Lock size={15} />
                  </span>
                  <input
                    id='reg-password'
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-v3-input ${errors.password ? 'is-invalid' : ''}`}
                    placeholder='At least 12 characters'
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 12,
                        message: 'Password must be at least 12 characters'
                      }
                    })}
                  />
                  <button
                    type='button'
                    className='auth-v3-toggle-pw'
                    onClick={() => setShowPassword(p => !p)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <div className='auth-v3-error-text'>
                    <AlertCircle size={12} />
                    <span>{errors.password.message}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className='auth-v3-field-group' style={{ marginBottom: '0' }}>
                <label htmlFor='reg-confirm-pw'>Confirm Password</label>
                <div className='auth-v3-input-wrapper'>
                  <span className='auth-v3-input-icon'>
                    <Lock size={15} />
                  </span>
                  <input
                    id='reg-confirm-pw'
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`auth-v3-input ${errors.password_confirmation ? 'is-invalid' : ''}`}
                    placeholder='Repeat your password'
                    {...register('password_confirmation', {
                      required: 'Please confirm password',
                      validate: val => val === passwordValue || 'Passwords do not match'
                    })}
                  />
                  <button
                    type='button'
                    className='auth-v3-toggle-pw'
                    onClick={() => setShowConfirmPassword(p => !p)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <div className='auth-v3-error-text'>
                    <AlertCircle size={12} />
                    <span>{errors.password_confirmation.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* EMBEDDED PRIVACY POLICY & TERMS ACCORDION VIEWER */}
            <div className='auth-v3-embedded-policy-box'>
              <div
                className='auth-v3-policy-header'
                onClick={() => setShowPolicyViewer(p => !p)}
                role='button'
                tabIndex={0}
              >
                <h6>
                  <Shield size={14} color='#10b981' />
                  <span>Legal Disclosures & WhatsApp Cloud API Policy</span>
                </h6>
                <button
                  type='button'
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showPolicyViewer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {showPolicyViewer && (
                <div className='auth-v3-policy-body'>
                  <h6>1. WhatsApp Business Cloud API Architecture</h6>
                  <p>
                    By registering, you acknowledge that WhatsApp Business messaging services are delivered
                    via Meta Platforms, Inc. Cloud API. Messages, customer numbers, and delivery metrics
                    are processed in accordance with Meta Business Messaging Policy and our security policies.
                  </p>

                  <h6>2. Tenant Data Isolation & Secret Storage</h6>
                  <p>
                    Your organization data is logically partitioned in a multi-tenant schema with
                    cryptographic envelope encryption (AES-256-GCM). System user access tokens and 2FA
                    PINs are never logged in plaintext or shared with third parties.
                  </p>

                  <h6>3. Anti-Spam & Customer Opt-In Guarantee</h6>
                  <p>
                    You agree strictly to dispatch WhatsApp marketing and template messages only to customers
                    who have provided verifiable opt-in consent. Spamming or unsolicited broadcasting will
                    result in immediate WABA disconnection by Meta.
                  </p>

                  <h6>4. Direct Meta Billing Notice</h6>
                  <p>
                    Under the Meta Tech Provider model, Meta conversation charges are billed directly by
                    Meta to your linked payment method in Meta Business Manager. Platform fees apply
                    strictly to platform software subscriptions and routing services.
                  </p>
                </div>
              )}
            </div>

            {/* Mandatory Regulatory Checkboxes */}
            <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
              <label className='auth-v3-checkbox-label'>
                <input
                  type='checkbox'
                  {...register('terms', {
                    required: 'You must agree to the Terms and Privacy Policy'
                  })}
                />
                <span>
                  I have reviewed and agree to the{' '}
                  <Link to='/terms-conditions' target='_blank' style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to='/privacy-policy' target='_blank' style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && (
                <div className='auth-v3-error-text' style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={12} />
                  <span>{errors.terms.message}</span>
                </div>
              )}

              <label className='auth-v3-checkbox-label'>
                <input type='checkbox' {...register('opt_in')} />
                <span>
                  I consent to receive operational, account verification, and security notifications via
                  the WhatsApp Business Cloud API.
                </span>
              </label>
            </div>

            {/* Submit Action */}
            <button type='submit' className='auth-v3-submit-btn' disabled={loading}>
              {loading ? (
                <>
                  <Clock size={16} className='animate-spin' />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Business Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className='auth-v3-footer-links'>
            <span>Already have an account?</span>
            <Link to='/authentication'>Sign In</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default RegisterPage
