// @ts-nocheck
// ** React Imports
import { lazy } from 'react'

const PrimaryRoute = lazy(() => import('../../views/Primary/PrimaryRoute'))
const Login = lazy(() => import('../../views/examples/pages/authentication/Login'))
const Authentication = lazy(() => import('../../views/auth/Login'))
const AuthenticationModern = lazy(() => import('../../views/auth/LoginModern'))
const ForgotPassword1 = lazy(() => import('../../views/auth/ForgetPassword'))
const ForgotPasswordModern = lazy(() => import('../../views/auth/ForgetPasswordModern'))
const LoginBasic = lazy(() => import('../../views/examples/pages/authentication/LoginBasic'))
const LoginCover = lazy(() => import('../../views/examples/pages/authentication/LoginCover'))
const UpdatePassword = lazy(() => import('../../views/auth/UpdatePassword'))
const Register = lazy(() => import('../../views/examples/pages/authentication/Register'))
const RegisterBasic = lazy(() => import('../../views/examples/pages/authentication/RegisterBasic'))
const RegisterCover = lazy(() => import('../../views/examples/pages/authentication/RegisterCover'))
const RegisterMultiSteps = lazy(() => import('../../views/examples/pages/authentication/register-multi-steps'))
const ForgotPassword = lazy(() => import('../../views/examples/pages/authentication/ForgotPassword'))
const ForgotPasswordBasic = lazy(() => import('../../views/examples/pages/authentication/ForgotPasswordBasic'))
const ForgotPasswordCover = lazy(() => import('../../views/examples/pages/authentication/ForgotPasswordCover'))
const ResetPasswordBasic = lazy(() => import('../../views/examples/pages/authentication/ResetPasswordBasic'))
const ResetPasswordCover = lazy(() => import('../../views/examples/pages/authentication/ResetPasswordCover'))
const VerifyEmailBasic = lazy(() => import('../../views/examples/pages/authentication/VerifyEmailBasic'))
const VerifyEmailCover = lazy(() => import('../../views/examples/pages/authentication/VerifyEmailCover'))
const TwoStepsBasic = lazy(() => import('../../views/examples/pages/authentication/TwoStepsBasic'))
const TwoStepsCover = lazy(() => import('../../views/examples/pages/authentication/TwoStepsCover'))
const IdleUser = lazy(() => import('../../views/auth/IdleUser'))
const RegisterUser = lazy(() => import('../../views/auth/RegisterPage'))
const RegisterUserModern = lazy(() => import('../../views/auth/RegisterUserModern'))
const TwoFactorAuthentication = lazy(() => import('../../views/auth/TwoFactorAuthentication'))
const TermsConditions = lazy(() => import('../../views/auth/TermsConditions'))
const FbCallback = lazy(() => import('../../views/auth/FbCallback'))
const WhatsappPolicy = lazy(() => import('../../views/auth/WhatsappPolicy'))

const AuthenticationRoutes = [

    // {
    //     path: '/login',
    //     element: <Login />,
    //     meta: {
    //         layout: 'blank',
    //         publicRoute: true,
    //         restricted: true
    //     }
    // },
    {
        path: '/idle-user',
        element: <IdleUser />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },
    {
        path: '/register-user',
        element: <RegisterUser />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },
    {
        path: '/register-user-modern',
        element: <RegisterUserModern />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },
    {
        path: '/whatsapp-policy',
        element: <WhatsappPolicy />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },
    {
        path: '/two-factor-authentication',
        element: <TwoFactorAuthentication />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },

    {
        path: '/authentication',
        element: <Authentication />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },
    {
        path: '/authentication-modern',
        element: <AuthenticationModern />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },

    {
        path: '/reset-password/:token',
        element: <UpdatePassword />,
        name: "updatePassword",
        // name: "forgotPassword",
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },

    {
        path: '/forgot/password',
        element: <ForgotPassword1 />,
        name: "forgotPassword",
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },
    {
        path: '/forgot/password-modern',
        element: <ForgotPasswordModern />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },

    {
        path: '/pages/login-basic',
        element: <LoginBasic />,
        meta: {
            layout: 'blank'
        }
    },

    {
        path: '/pages/login-cover',
        element: <LoginCover />,
        meta: {
            layout: 'blank'
        }
    },

    {
        path: '/register',
        element: <Register />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },
    {
        path: '/pages/register-basic',
        element: <RegisterBasic />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/pages/register-cover',
        element: <RegisterCover />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/pages/register-multi-steps',
        element: <RegisterMultiSteps />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordModern />,
        layout: 'BlankLayout',
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },
    {
        path: '/pages/forgot-password-basic',
        element: <ForgotPasswordBasic />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/pages/forgot-password-cover',
        element: <ForgotPasswordCover />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/pages/reset-password-basic',
        element: <ResetPasswordBasic />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/pages/reset-password-cover',
        element: <ResetPasswordCover />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/pages/verify-email-basic',
        element: <VerifyEmailBasic />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/pages/verify-email-cover',
        element: <VerifyEmailCover />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/pages/two-steps-basic',
        element: <TwoStepsBasic />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/pages/two-steps-cover',
        element: <TwoStepsCover />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: '/terms-conditions',
        element: <TermsConditions type="terms_and_conditions" />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: false
        }
    },
    {
        path: '/terms-of-service',
        element: <TermsConditions type="terms_and_conditions" />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: false
        }
    },
    {
        path: '/privacy-policy',
        element: <TermsConditions type="privacy_policy" />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: false
        }
    },
    {
        path: '/data-deletion',
        element: <TermsConditions type="data_deletion" />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: false
        }
    },
    {
        path: '/fb-callback',
        element: <FbCallback />,
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: false
        }
    }
]

export default AuthenticationRoutes
