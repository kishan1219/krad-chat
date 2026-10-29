// @ts-nocheck
import React, { useContext, useEffect, useState } from 'react'
import { Lock, User } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap'
import { getWhatsappCampaignStatus1, getWhatsappReport } from '../../utility/apis/whatsappConfig'
import { isValid, log } from '../../utility/helpers/common'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import Shimmer from '../components/shimmers/Shimmer'
import CenteredModal from '../components/modal/CenteredModal'
import WaNumberLog from './WaNumberLog'
import WaCharts from './WaCharts'
import WaBasicDetails from './WaBasicDetails'
import { getCampaignStatus1 } from '../../utility/apis/campaign'
import toast from 'react-hot-toast'

// export default function WaCampaignInfo({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {
export default function WaCampaignInfo({ edit = null, noView = false, modal = false, setModal = () => { }, forceStatusCheck = false, Component = "span", showModal = false, setShowModal = () => { }, setForceStatusCheck = () => { }, children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [list, setList] = useState(null)
    const users = useSelector(state => state.auth.userData)
    const dispatch = useDispatch()
    const [currentPage, setCurrentPage] = useState("1")
    const [formVisible, setFormVisible] = useState(false)
    const context = useContext(ThemeColors)
    const [campaign, setCampaign] = useState(null)
    const form = useForm()
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState("2")
    const [perPage, setPerPage] = useState(15)
    const [id, setId] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        search: ""
    })
    const [activeTab, setActiveTab] = useState('1')
    const [user, setUser] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    // const handleShow = () => {
    //     reset()
    //     setOpen(!open)
    //     setModal(!open)
    //     if (edit === null) setEditData(null)
    // }

    // const handleClose = (from = null) => {
    //     handleShow()
    //     setShowModal(false)
    //     setActiveTab('1')

    // }
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
        setCampaign(null)
        setForceStatusCheck(false)

    }

    useEffect(() => {
        setId(edit?.id)
    }, [edit])

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])


    const handleSave = () => {

    }

    const toggleTab = tab => {
        setActiveTab(tab)
    }

    const loadDetails = () => {
        // if (isValid(id)) {
        if (isValid(edit?.id)) {
            getWhatsappReport({
                id: edit?.id,
                loading: setLoading,
                success: (e) => {
                    setCampaign(e)
                }
            })
        }

        // }
    }
    const getStatusMethod = (edit, loadDetail = false) => {
        log('called')
        getWhatsappCampaignStatus1({
            id: edit?.id,
            loading: setLoading,
            success: (e) => {
                toast.success('Campaign Status Updated Successfully')
                // setCampaignStatus(e)
                if (loadDetail === true) {
                    loadDetails()
                }
                // setDetailModal(true)
                // setEditData(row)
            }
        })

    }


    // useEffect(() => {
    //     if (open && activeTab === '1') {
    //         loadDetails()
    //     }

    // }, [open, edit, activeTab])
    useEffect(() => {
        log(edit, 'edit')
        log(forceStatusCheck, 'forceStatusCheck')
        if (open && activeTab === '1') {
            if (forceStatusCheck === false) {
                log(edit?.total_delivered, 'edit?.total_delivered')
                log(edit?.total_failed, 'edit?.total_failed')
                if (edit?.total_delivered > 0 || edit?.total_failed > 0) {
                    log('not equal')
                    loadDetails()
                    setCampaign(null)
                    // callCheckStatusAndInfo(edit)
                } else if (edit?.total_delivered === 0 && edit?.total_failed === 0) {
                    log('equal')
                    getStatusMethod(edit, true)
                    setCampaign(null)
                }

            } else if (forceStatusCheck === true && edit?.status !== 'Completed') {
                log('forceStatusCheck')
                getStatusMethod(edit, true)
                setCampaign(null)
            }
        }

    }, [open, edit, activeTab, forceStatusCheck])


    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                // disabled={disableSave}
                disableFooter={true}
                modalClass="modal-xl"
                handleSave={handleSubmit(handleSave)}
                title={edit?.campaign}>
                <form>
                    {loading ? <>
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    </> : <>
                        <Row>
                            <Col md="12">
                                <Card className='white p-2'>
                                    <Nav pills>
                                        <NavItem>
                                            <NavLink active={activeTab === '1'} onClick={() => toggleTab('1')}>
                                                <User size={18} className='me-50' />
                                                <span className='fw-bold'>Basic Detail</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink active={activeTab === '2'} onClick={() => toggleTab('2')}>
                                                <Lock size={18} className='me-50' />
                                                <span className='fw-bold'>Sent Number Log</span>
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                    <TabContent activeTab={activeTab} className="">

                                        <TabPane tabId='1' >
                                            <Card className=''>
                                                <Row>
                                                    <Col md="6">
                                                        <WaBasicDetails edit={campaign}
                                                        />
                                                    </Col>
                                                    <Col md="6">
                                                        <WaCharts edit={campaign} success={'#128C7E'}
                                                            // warning={context.colors.warning.main}
                                                            // danger={context.colors.danger.main}
                                                            // info={context.colors.info.main}
                                                            // info={'#128C7E'}
                                                            // secondary={context.colors.secondary.main}
                                                            // primary={context.colors.primary.main}
                                                            // read={'#34B7F1'}
                                                            // delivered={'#128C7E'}
                                                            block={'#FF5722'}
                                                            failed={'#F44336'}
                                                            read={'#25D366'}
                                                            invalid={'#9E9E9E'}
                                                            other={'#075E54'}
                                                            sent={'#34B7F1'}
                                                            processing={'#63C1A0'}
                                                            key={campaign?.total_delivered}
                                                        />
                                                    </Col>
                                                </Row>

                                            </Card>

                                        </TabPane>
                                        <TabPane tabId='2'>
                                            <Card>
                                                <WaNumberLog edit={edit} activeTab={activeTab} />
                                            </Card>

                                        </TabPane>

                                    </TabContent>
                                </Card>
                            </Col>
                        </Row>
                    </>
                    }
                </form>
            </CenteredModal >

        </>
    )
}
