// @ts-nocheck
import React, { useState } from 'react'
import { Card, Col, Row, TabContent, TabPane } from 'reactstrap'

import Tab from './Tab'
import VoiceSmsCampaignLists from '../VoiceSmsCampaignLists'

const VoiceReports = () => {
    const [activeTab, setActiveTab] = useState('1')
    const toggleTab = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab)
        }
    }
    return (
        <>
            <Card className='border p-2'>
                <Row>
                    <Col xs={12}>
                        <Tab className='mb-2' activeTab={activeTab} toggleTab={toggleTab} />

                        <TabContent activeTab={activeTab}>
                            <TabPane tabId='1'>
                                <VoiceSmsCampaignLists activeTab={activeTab} />
                            </TabPane>

                            {/* <TabPane tabId='2'>
                                <TwoWayReports activeTab={activeTab} />
                            </TabPane> */}
                        </TabContent>
                    </Col>
                </Row>
            </Card>

        </>
    )
}

export default VoiceReports
