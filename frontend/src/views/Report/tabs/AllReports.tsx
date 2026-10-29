// @ts-nocheck
import React, { useState } from 'react'
import { Button, ButtonGroup, Card, Col, Row, TabContent, TabPane } from 'reactstrap'
import ReportList from '../ReportList'
import TwoWayReportList from '../TwoWayReportList'
import Tab from './Tab'
import VoiceReport from './VoiceReport'
import WhatsAppReport from './WhatsappReport'
import Header from '../../components/header'
import { Campaign } from '@mui/icons-material'
import { Sliders } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import ExportBySender from '../ExportBySender'
import ExportByMobile from '../ExportByMobile'
import { useDispatch, useSelector } from 'react-redux'
import Hide from '../../../utility/Hide'


const AllReports = () => {
    const [activeTab, setActiveTab] = useState('1')
    const [mobile, setMobile] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)

    const [senderID, setSenderID] = useState(false)
    const navigate = useNavigate()
    const handleSender = () => setSenderID(!senderID)

    const handleMobile = () => setMobile(!mobile)
    const toggleTab = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab)
        }
    }
    return (
       <>
            <Header>
                <ButtonGroup color='primary' className='me-25'>
                    <Button.Ripple size="sm" color="dark" id="filter" onClick={() => { navigate('/scheduled-campaign-report') }} >
                        <Campaign fontSize='small' /> Upcoming Campaign
                    </Button.Ripple>
                </ButtonGroup>
                <Hide IF={loginUser?.account_type === 2}>

                    <ButtonGroup color='primary' className='me-25'>
                        <Button.Ripple size="sm" color="primary" id="filter" onClick={() => handleSender()}>
                            <Sliders size="14" /> Export By Sender ID
                        </Button.Ripple>
                    </ButtonGroup>
                </Hide>
                <ButtonGroup color='info' className='me-25'>
                    <Button.Ripple size="sm" color="dark" id="filter" onClick={() => handleMobile()}>
                        <Sliders size="14" /> Export By Mobile Number
                    </Button.Ripple>
                </ButtonGroup>
            </Header>
       <Card className='border p-2'>

      
                <Row>
                    <Col xs={12}>
                        <Tab className='mb-2' activeTab={activeTab} toggleTab={toggleTab} />

                        <TabContent activeTab={activeTab}>
                       
                            <TabPane tabId='1'>
                                <ReportList activeTab={activeTab} />
                            </TabPane>
                            
                            <TabPane tabId='2'>
                                <TwoWayReportList activeTab={activeTab} />
                            </TabPane>
                            <TabPane tabId='3'>
                                <VoiceReport activeTab={activeTab} />
                            </TabPane>
                            <TabPane tabId='4'>
                                <WhatsAppReport activeTab={activeTab} />
                            </TabPane>

                        </TabContent>
                    </Col>
                </Row>
       </Card>
            <ExportBySender
                handleSender={handleSender}
                setSenderID={setSenderID}
                senderID={senderID}
            />
            <ExportByMobile
                handleMobile={handleMobile}
                setMobile={setMobile}
                mobile={mobile}
            />
          
       </>
    )
}

export default AllReports
