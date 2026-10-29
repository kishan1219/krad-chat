// @ts-nocheck
import React from 'react'
import { Card, CardBody } from 'reactstrap'
import MessageReport from '../../whatsapp/MessageReport'

const WhatsAppReport = () => {
    return (
        <>
            <Card>
                <CardBody className='text-center'>
                   <MessageReport />
                </CardBody>
            </Card>
        </>
    )
}

export default WhatsAppReport
