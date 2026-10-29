// @ts-nocheck
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Col, Row, TabContent, TabPane } from 'reactstrap'
import { Permissions } from '../../utility/Permissions'
import Show from '../../utility/Show'
import { isValid } from '../../utility/helpers/common'
import AdditionalSecurity from '../AppSetting/tab/AdditionalSecurity'
import AppInfo from '../AppSetting/tab/AppInfo'
import CenteredModal from '../components/modal/CenteredModal'
import Credit from './tabs/Credit'
import OtherInfo from './tabs/OtherInfo'
import RouteSetting from './tabs/RouteSetting'
import Tabs from './tabs/Tabs'
import UserDocs from './tabs/UserDocs'
import WhatsappCharge from './tabs/WhatsappCharge'
import WebhookTab from './tabs/WebhookTab'


const ViewUser = ({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) => {

    const [open, setOpen] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [activeTab, setActiveTab] = useState('1')

    const toggleTab = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab)
        }
    }

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
        setShowModal(false)
        setActiveTab('1')
    }
    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

    const getName = (edit) => {
        <p>User Details {edit?.name}</p>
    }

    // const viewIT = (id) => {
    //     if (edit?.id) {
    //         readDlr({
    //             id: edit?.id,
    //             success: d => {

    //                 setEditData()
    //             }
    //         })
    //     }
    // }

    // useEffect(() => {
    //     viewIT()
    // }, [])
    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                disableFooter={true}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-xl"
                // handleSave={handleSubmit(handleSave)}
                title={isValid(edit) ? edit?.name : "User Details"}>

                {/* // title={getName(edit)}
            > */}

                <>

                    {/* <Card className='m-2'>
                      <OtherInfo edit = {edit} />

                        </Card> */}
                    <Card className='m-2 p-2'>
                        <Tabs className="mb-2" edit={edit} activeTab={activeTab} toggleTab={toggleTab} />
                        <TabContent activeTab={activeTab}>
                            <TabPane tabId='1'>
                                <OtherInfo edit={edit} />
                            </TabPane>
                            <Show IF={Permissions?.userApiKey}>
                                <TabPane tabId='4' >
                                    <AppInfo activeTab={activeTab} />
                                </TabPane>
                            </Show>
                            {/* <Show IF={Permissions?.userApiKey}>
                                <TabPane tabId='7'>
                                    <AdditionalSecurity user={edit} activeTab={activeTab} />
                                </TabPane>
                            </Show> */}
                            <TabPane tabId='5'>
                                <Credit activeTab={activeTab} edit={edit} />
                            </TabPane>
                            <Show IF={Permissions?.userRouteSetting} >

                                <TabPane tabId='8'>
                                    <RouteSetting edit={edit} activeTab={activeTab} />
                                </TabPane>
                            </Show>

                            <TabPane tabId='6'>
                                <UserDocs edit={edit} activeTab={activeTab} />
                            </TabPane>
                            <Show IF={Permissions?.whatsappChargesList}>
                                <TabPane tabId='9'>
                                    <WhatsappCharge edit={edit} activeTab={activeTab} />
                                </TabPane>
                            </Show>
                            <Show IF={edit?.allow_to_add_webhook === 1}>
                                <TabPane tabId='10'>
                                    <WebhookTab edit={edit} activeTab={activeTab} />
                                </TabPane>
                            </Show>
                        </TabContent>
                    </Card>
                </>

            </CenteredModal>
        </>
    )
}

export default ViewUser
