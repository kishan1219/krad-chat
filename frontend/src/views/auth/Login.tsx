import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  Check,
  AlertCircle,
  Loader,
  Sun,
  Moon,
  ArrowLeft
} from 'react-feather'
import { AbilityContext } from '@src/utility/context/Can'
import { handleSkin } from '@src/redux/layout'
import { login } from '../../utility/apis/authentication'
import KradLogo from '@src/@core/components/krad-logo'
import './login-redesign.scss'

interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

const STORAGE_REMEMBERED_EMAIL = 'talkrad_remembered_email'

const Login: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const ability = useContext(AbilityContext)
  const skin = useSelector((state: any) => state?.layout?.skin) || 'dark'
  const isLight = skin === 'light'

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [demoLoaded, setDemoLoaded] = useState(false)

  const toggleTheme = () => {
    const nextSkin = isLight ? 'dark' : 'light'
    dispatch(handleSkin(nextSkin))
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true
    }
  })

  // Prepopulate saved email if user previously enabled Remember Me
  useEffect(() => {
    const savedEmail = localStorage.getItem(STORAGE_REMEMBERED_EMAIL)
    if (savedEmail) {
      setValue('email', savedEmail, { shouldValidate: true })
      setValue('rememberMe', true)
    }
  }, [setValue])

  // One-click quick fill for local development, demo environments, and testing
  const handleQuickDemoFill = () => {
    setValue('email', 'admin@example.com', { shouldValidate: true, shouldDirty: true })
    setValue('password', '', { shouldValidate: false, shouldDirty: false })
    setErrorText('')
    setDemoLoaded(true)
    setTimeout(() => setDemoLoaded(false), 2500)
  }

  const onSubmit = (formData: LoginFormValues) => {
    setErrorText('')

    // Persist or clear remembered email
    if (formData.rememberMe && formData.email) {
      localStorage.setItem(STORAGE_REMEMBERED_EMAIL, formData.email.trim())
    } else {
      localStorage.removeItem(STORAGE_REMEMBERED_EMAIL)
    }

    login({
      formData: {
        email: formData.email.trim(),
        password: formData.password
      },
      loading: setLoading,
      dispatch,
      ability,
      navigate,
      error: (err: any) => {
        const message =
          err?.data?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Invalid work email or password. Please check your credentials.'
        setErrorText(message)
      }
    })
  }

  return (
    <main className={`login-page-wrapper ${isLight ? 'theme-light' : 'theme-dark'}`}>
      {/* Ambient background glows */}
      <div className='login-ambient-glow login-ambient-glow-top' aria-hidden='true' />
      <div className='login-ambient-glow login-ambient-glow-bottom' aria-hidden='true' />

      {/* Top utility bar: Back to Home + Theme Toggle */}
      <div className='login-top-bar'>
        <Link to='/' className='login-back-link'>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <button
          type='button'
          className='login-theme-toggle-btn'
          onClick={toggleTheme}
          aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Theme`}
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Theme`}
        >
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
          <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>

      <div className='login-container'>
        {/* Status indicator pill */}
        <div className='login-status-badge' role='status'>
          <span className='login-pulse-dot' aria-hidden='true' />
          <span>Meta WhatsApp Cloud API v21.0 · Active</span>
        </div>

        {/* Minimalistic Card */}
        <section className='login-card' aria-labelledby='login-heading'>
          {/* Header with Official KRAD SMS Logo */}
          <header className='login-header'>
            <Link to='/' className='login-logo-link' title='KRAD SMS Home'>
              <KradLogo
                variant={isLight ? 'light' : 'dark'}
                size='md'
                alt='KRAD SMS by KRAD Technology'
              />
            </Link>
            <h1 id='login-heading' className='login-title' style={{ marginTop: '0.85rem' }}>
              Welcome back
            </h1>
            <p className='login-subtitle'>
              Sign in to manage conversations, campaigns, and automations.
            </p>
          </header>

          {/* Local Developer / Onboarding Demo Helper */}
          <div className='login-demo-bar'>
            <div className='login-demo-info'>
              <Zap size={14} />
              <span>Developer Demo Mode</span>
            </div>
            <button
              type='button'
              className='login-demo-btn'
              onClick={handleQuickDemoFill}
              aria-label='Quick fill demo credentials'
            >
              {demoLoaded ? (
                <>
                  <Check size={12} style={{ marginRight: '4px' }} />
                  Loaded!
                </>
              ) : (
                'Quick Fill Demo'
              )}
            </button>
          </div>

          {/* Error Alert Banner */}
          {errorText && (
            <div className='login-alert-error' role='alert'>
              <AlertCircle size={16} />
              <span>{errorText}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='login-form' noValidate>
            {/* Email Field */}
            <div className='login-field'>
              <label htmlFor='login-email' className='login-label'>
                Work Email Address
              </label>
              <div className='login-input-box'>
                <span className='login-input-icon' aria-hidden='true'>
                  <Mail size={16} />
                </span>
                <input
                  id='login-email'
                  type='email'
                  inputMode='email'
                  autoComplete='email'
                  placeholder='admin@example.com'
                  className={`login-input ${errors.email ? 'has-error' : ''}`}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Enter a valid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <div id='email-error' className='login-field-error' role='alert'>
                  <AlertCircle size={13} />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className='login-field'>
              <div className='login-label-row'>
                <label htmlFor='login-password' className='login-label'>
                  Password
                </label>
                <Link to='/forgot-password' className='login-forgot-link'>
                  Forgot password?
                </Link>
              </div>
              <div className='login-input-box'>
                <span className='login-input-icon' aria-hidden='true'>
                  <Lock size={16} />
                </span>
                <input
                  id='login-password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  placeholder='Enter your password'
                  className={`login-input ${errors.password ? 'has-error' : ''}`}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password', {
                    required: 'Password is required'
                  })}
                />
                <button
                  type='button'
                  className='login-pw-toggle'
                  onClick={() => setShowPassword(prev => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <div id='password-error' className='login-field-error' role='alert'>
                  <AlertCircle size={13} />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Remember Me Option */}
            <label className='login-remember-row' htmlFor='login-remember'>
              <input
                id='login-remember'
                type='checkbox'
                {...register('rememberMe')}
              />
              <span className='login-remember-label'>Remember me on this device</span>
            </label>

            {/* Submit Action Button */}
            <button
              type='submit'
              className='login-submit-btn'
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader size={17} className='login-spinner' aria-hidden='true' />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} aria-hidden='true' />
                </>
              )}
            </button>
          </form>

          {/* Account Creation Callout */}
          <footer className='login-footer'>
            <span>Don't have an account?</span>
            <Link to='/register-user'>Create an account</Link>
          </footer>
        </section>

        {/* Security Trust & Regulatory Compliance Footer */}
        <aside className='login-trust-footer'>
          <div className='login-trust-pill'>
            <Shield size={13} aria-hidden='true' />
            <span>256-bit SSL · Meta WhatsApp Business Tech Provider</span>
          </div>
          <div className='login-legal-links'>
            <Link to='/terms-conditions'>Terms of Service</Link>
            <span aria-hidden='true'>•</span>
            <Link to='/privacy-policy'>Privacy Policy</Link>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default Login
