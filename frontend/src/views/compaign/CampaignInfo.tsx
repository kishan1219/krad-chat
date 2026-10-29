// @ts-nocheck
import React, { useContext, useEffect, useState } from 'react'
import { Lock, User } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap'
import Hide from '../../utility/Hide'
import CenteredModal from '../components/modal/CenteredModal'
import BasicDetails from './tab/BasicDetails'
import SendNumberLog from './tab/SendNumberLog'
import Tabs from './tab/Tabs'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/charts/apex-charts.scss'
import Charts from './tab/Charts'
import TwoWayReportClickReport from './tab/TwoWayReportClickReport'
import LoopIcon from '@mui/icons-material/Loop'
import TwoWayResponseReport from './tab/TwoWayResponseReport'
import { getAllDetailsOfCampaign, getCampaignStatus, getCampaignStatus1 } from '../../utility/apis/campaign'
import { isValid, log } from '../../utility/helpers/common'
import Show from '../../utility/Show'
import Shimmer from '../components/shimmers/Shimmer'
import toast from 'react-hot-toast'


export default function CampaignInfo({ edit = null, noView = false, modal = false, setModal = () => { }, forceStatusCheck = false, Component = "span", showModal = false, setShowModal = () => { }, setForceStatusCheck = () => { }, children = null, ...rest }) {

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
    const [campaignStatus, setCampaignStatus] = useState(null)
    const [id, setId] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        search: ""
    })
    const [activeTab, setActiveTab] = useState('1')

    const [user, setUser] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form

    // const handleClose = (from = null) => {
    //     handleShow()
    // }
    const showForm = () => {
        setFormVisible(!formVisible)
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
        setCampaign(null)
        setForceStatusCheck(false)

    }

    const onSubmitNew = () => {

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

    const getInfo = () => {
        getAllDetailsOfCampaign({
            id: edit?.id
        })
    }

    const loadDetails = () => {
        // if (isValid(id)) {
        if (isValid(edit?.id)) {
            getAllDetailsOfCampaign({
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
        getCampaignStatus1({
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

    const callApi = () => {

    }

    const callCheckStatusAndInfo = (edit) => {
        if (edit?.total_delivered === 0 && edit?.total_failed === 0) {
            getStatusMethod(edit)
        }
    }

    // useEffect(() => {
    //     if (open && activeTab === '1') {
    //         // loadDetails()
    //         setCampaign(null)
    //         callCheckStatusAndInfo(edit)
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

            } else if (forceStatusCheck === true) {
                log('forceStatusCheck')
                getStatusMethod(edit, true)
                setCampaign(null)
            }
        }

    }, [open, edit, activeTab, forceStatusCheck])
    // log(edit, 'edit')

    // useEffect(() => {
    //     if (forceStatusCheck === true) {
    //         getStatusMethod(edit)
    //         setForceStatusCheck(false)
    //         setCampaign(null)
    //     }
    // }, [forceStatusCheck, edit, activeTab])


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
                            <Col xs={12}>
                                <Card className='white p-2'>
                                    <Nav pills className=''>
                                        <NavItem>
                                            <NavLink active={activeTab === '1'} onClick={() => toggleTab('1')}>
                                                <User size={18} className='me-50' />
                                                <span className='fw-bold'>Basic Detail</span>
                                            </NavLink>
                                        </NavItem>
                                        <Hide IF={campaign?.route_type === 3} >
                                            <NavItem>
                                                <NavLink active={activeTab === '2'} onClick={() => toggleTab('2')}>
                                                    <Lock size={18} className='me-50' />
                                                    <span className='fw-bold'>Sent Number Log</span>
                                                </NavLink>
                                            </NavItem>
                                        </Hide>
                                        <Show IF={campaign?.route_type === 3} >
                                            <NavItem>
                                                <NavLink active={activeTab === '3'} onClick={() => toggleTab('3')}>
                                                    <LoopIcon size={18} className='me-50' />
                                                    <span className='fw-bold'>Two Way Click Report</span>
                                                </NavLink>
                                            </NavItem>
                                        </Show>
                                        <Show IF={campaign?.route_type === 3} >
                                            <NavItem>
                                                <NavLink active={activeTab === '4'} onClick={() => toggleTab('4')}>
                                                    <LoopIcon size={18} className='me-50' />
                                                    <span className='fw-bold'>Two Way Response Report</span>
                                                </NavLink>
                                            </NavItem>
                                        </Show>
                                    </Nav>

                                    <TabContent activeTab={activeTab} className="">

                                        <TabPane tabId='1' >
                                            <Card className=''>
                                                <Row>
                                                    <Col md="6">
                                                        <BasicDetails campaign={campaign}
                                                        />
                                                    </Col>
                                                    <Col md="6">
                                                        <Charts edit={campaign} success={context.colors.success.main}
                                                            warning={context.colors.warning.main}
                                                            danger={context.colors.danger.main}
                                                            info={context.colors.info.main}
                                                            secondary={context.colors.secondary.main}
                                                            primary={context.colors.primary.main}
                                                            key={campaign?.total_delivered}
                                                        />
                                                    </Col>
                                                </Row>

                                            </Card>

                                        </TabPane>
                                        <Hide IF={campaign?.route_type === 3} >
                                            <TabPane tabId='2'>
                                                <Card>
                                                    <SendNumberLog edit={edit} activeTab={activeTab} />
                                                </Card>

                                            </TabPane>
                                        </Hide>
                                        <Show IF={campaign?.route_type === 3} >
                                            <TabPane tabId='3'>
                                                <Card>
                                                    <TwoWayReportClickReport edit={edit} activeTab={activeTab} />
                                                </Card>

                                            </TabPane>
                                        </Show>
                                        <Show IF={campaign?.route_type === 3} >
                                            <TabPane tabId='4'>
                                                <Card>
                                                    <TwoWayResponseReport edit={edit} activeTab={activeTab} />
                                                </Card>

                                            </TabPane>
                                        </Show>

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
