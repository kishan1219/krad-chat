// @ts-nocheck
import React, { useState } from 'react'
import { Badge, Card, CardBody, Col, Row, TabContent, TabPane } from 'reactstrap'
import { Settings, Shield } from 'react-feather'
import { useSelector } from 'react-redux'
import useUser from '../../utility/hooks/useUser'
import { Permissions } from '../../utility/Permissions'
import Show from '../../utility/Show'
import AdditionalSecurity from './tab/AdditionalSecurity'
import AppInfo from './tab/AppInfo'
import CreditInfo from './tab/CreditInfo'
import Document from './tab/Document'
import Info from './tab/Info'
import Password from './tab/Password'
import Tabs from './tab/Tabs'
import WhatsappAndSmsCharges from './tab/WhatsappAndSmsCharges'
import WhatsAppCloudApi from './tab/WhatsAppCloudApi'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import '@styles/react/pages/page-account-settings.scss'

const AppSetting = () => {
    const navbarTab = useSelector(state => state.navbar.activeTab)
    const [activeTab, setActiveTab] = useState(navbarTab || '1')
    const user = useUser()

    const toggleTab = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab)
        }
    }

    const roleLabel = user?.userType === 0 ? 'Super Administrator' : (user?.userType === 1 ? 'Reseller Partner' : (user?.userType === 2 ? 'Client' : 'Team Member'))

    return (
        <div className='app-settings-page'>
            {/* Header Banner */}
            <div className='d-flex flex-wrap align-items-center justify-content-between mb-3 pb-2 border-bottom'>
                <div className='d-flex align-items-center gap-2'>
                    <div className='p-2 rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center'>
                        <Settings size={26} />
                    </div>
                    <div>
                        <div className='d-flex align-items-center gap-2'>
                            <h3 className='fw-bolder mb-0 text-dark'>Settings & Configuration</h3>
                            <Badge color='light-primary' pill className='px-2 py-1'>
                                {roleLabel}
                            </Badge>
                        </div>
                        <p className='text-muted mb-0 small'>
                            Manage your profile details, security credentials, developer API keys, and messaging parameters.
                        </p>
                    </div>
                </div>
            </div>

            <Row>
                <Col xs={12}>
                    <Tabs activeTab={activeTab} toggleTab={toggleTab} />

                    <TabContent activeTab={activeTab}>
                        <TabPane tabId='1'>
                            <Info activeTab={activeTab} />
                        </TabPane>

                        <TabPane tabId='3'>
                            <Password activeTab={activeTab} />
                        </TabPane>

                        <TabPane tabId='4'>
                            <AppInfo activeTab={activeTab} />
                        </TabPane>

                        <Show IF={Permissions?.userCreditAdd}>
                            <TabPane tabId='5'>
                                <CreditInfo activeTab={activeTab} />
                            </TabPane>
                        </Show>

                        <TabPane tabId='6'>
                            <WhatsAppCloudApi activeTab={activeTab} />
                        </TabPane>

                        <TabPane tabId='8'>
                            <WhatsappAndSmsCharges activeTab={activeTab} />
                        </TabPane>

                        <TabPane tabId='7'>
                            <AdditionalSecurity user={user} activeTab={activeTab} />
                        </TabPane>
                    </TabContent>
                </Col>
            </Row>
        </div>
    )
}

export default AppSetting
