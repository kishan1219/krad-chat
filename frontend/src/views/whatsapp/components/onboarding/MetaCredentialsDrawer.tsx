import React from 'react'
import { Card, CardBody, Row, Col, Input, Label, Button, Badge } from 'reactstrap'
import { Key, ExternalLink } from 'react-feather'

interface MetaCredentialsDrawerProps {
    appId: string
    setAppId: (v: string) => void
    configId: string
    setConfigId: (v: string) => void
    appSecret: string
    setAppSecret: (v: string) => void
    graphVersion: string
    setGraphVersion: (v: string) => void
    saving: boolean
    onSave: (e: React.FormEvent) => void
    onCancel: () => void
}

export const MetaCredentialsDrawer: React.FC<MetaCredentialsDrawerProps> = ({
    appId,
    setAppId,
    configId,
    setConfigId,
    appSecret,
    setAppSecret,
    graphVersion,
    setGraphVersion,
    saving,
    onSave,
    onCancel
}) => {
    return (
        <Card className="border mb-3 shadow-none rounded-3" style={{ backgroundColor: '#fffaf5', borderColor: '#fed7aa' }}>
            <CardBody className="p-3">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-1 mb-2 pb-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <div className="p-1 rounded bg-orange-100 text-orange-600">
                            <Key size={16} />
                        </div>
                        <div>
                            <h6 className="fw-bolder mb-0" style={{ color: '#c2410c' }}>
                                Meta Developer App Credentials
                            </h6>
                            <small className="text-muted">Self-hosted Meta App & Configuration IDs</small>
                        </div>
                    </div>
                    <Badge color="light-warning" pill className="d-flex align-items-center gap-1 py-1 px-2">
                        <span>Graph {graphVersion || 'v22.0'}</span>
                    </Badge>
                </div>

                <form onSubmit={onSave}>
                    <Row className="g-2">
                        <Col xs="12" sm="6">
                            <Label className="small mb-1 fw-bold text-dark">Meta App ID *</Label>
                            <Input
                                bsSize="sm"
                                value={appId}
                                onChange={(e) => setAppId(e.target.value)}
                                placeholder="e.g. 1098765432109876"
                                required
                            />
                        </Col>
                        <Col xs="12" sm="6">
                            <Label className="small mb-1 fw-bold text-dark">Configuration ID *</Label>
                            <Input
                                bsSize="sm"
                                value={configId}
                                onChange={(e) => setConfigId(e.target.value)}
                                placeholder="e.g. 2098765432109876"
                                required
                            />
                        </Col>
                        <Col xs="12" sm="6">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <Label className="small mb-0 fw-bold text-dark">App Secret *</Label>
                                <a
                                    href="https://developers.facebook.com/apps/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="small text-decoration-none text-muted d-flex align-items-center gap-1"
                                    style={{ fontSize: '0.65rem' }}
                                >
                                    <span>Meta &gt; Basic Settings</span>
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                            <Input
                                bsSize="sm"
                                type="password"
                                value={appSecret}
                                onChange={(e) => setAppSecret(e.target.value)}
                                placeholder="32-character Meta App Secret"
                            />
                        </Col>
                        <Col xs="12" sm="6">
                            <Label className="small mb-1 fw-bold text-dark">Graph API Version</Label>
                            <Input
                                bsSize="sm"
                                value={graphVersion}
                                onChange={(e) => setGraphVersion(e.target.value)}
                                placeholder="v22.0"
                            />
                        </Col>

                        <Col xs="12" className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-2 pt-2 border-top">
                            <Button
                                type="button"
                                size="sm"
                                color="secondary"
                                outline
                                onClick={onCancel}
                                className="w-100 w-sm-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={saving}
                                style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff' }}
                                className="w-100 w-sm-auto fw-bold"
                            >
                                {saving ? 'Saving to Server...' : 'Save Meta Config'}
                            </Button>
                        </Col>
                    </Row>
                </form>
            </CardBody>
        </Card>
    )
}

export default MetaCredentialsDrawer

