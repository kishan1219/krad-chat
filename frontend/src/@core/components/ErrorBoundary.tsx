import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardBody, Button } from 'reactstrap'
import { AlertTriangle, RefreshCw } from 'react-feather'

interface Props {
    children: ReactNode
    fallbackTitle?: string
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an unhandled error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex align-items-center justify-content-center p-3 p-sm-5" style={{ minHeight: '60vh' }}>
                    <Card className="border shadow-sm rounded-3 text-center p-4" style={{ maxWidth: '540px', borderColor: '#e2e8f0' }}>
                        <CardBody className="d-flex flex-column align-items-center">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                                style={{ width: '56px', height: '56px', backgroundColor: '#fef2f2', color: '#ef4444' }}
                            >
                                <AlertTriangle size={28} />
                            </div>
                            <h4 className="fw-bolder mb-1 text-dark" style={{ fontSize: '1.25rem' }}>
                                {this.props.fallbackTitle || 'Component Encountered an Issue'}
                            </h4>
                            <p className="text-muted small mb-3">
                                {this.state.error?.message || 'An unexpected rendering error occurred. Please refresh or try again.'}
                            </p>
                            <Button
                                type="button"
                                onClick={() => {
                                    this.setState({ hasError: false, error: null })
                                    window.location.reload()
                                }}
                                style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff', borderRadius: '6px' }}
                                className="d-inline-flex align-items-center gap-1 shadow-sm px-3 py-2 fw-semibold"
                            >
                                <RefreshCw size={15} />
                                <span>Reload Page</span>
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary

