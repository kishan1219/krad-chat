// @ts-nocheck
import React, { useState } from 'react'
import { Col, Row, TabContent, TabPane } from 'reactstrap'
// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import '@styles/react/pages/page-account-settings.scss'
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

const AppSetting = () => {

    const loginUser = useSelector(state => state.navbar.activeTab)
    const [activeTab, setActiveTab] = useState(loginUser)
    const user = useUser()


    const toggleTab = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab)
        }
    }


    return (
        <>
            <Row>
                <Col xs={12}>
                    <Tabs className='mb-2' activeTab={activeTab} toggleTab={toggleTab} />

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
                        <Show IF={Permissions?.userAccessDocument} >
                            <TabPane tabId='6'>
                                <Document activeTab={activeTab} />
                            </TabPane>
                        </Show>
                        <TabPane tabId='8'>
                            <WhatsappAndSmsCharges activeTab={activeTab} />
                        </TabPane>
                        <TabPane tabId='7'>
                            <AdditionalSecurity user={user} activeTab={activeTab} />
                        </TabPane>
                        
                    </TabContent>
                </Col>
            </Row>
        </>
    )
}

export default AppSetting
