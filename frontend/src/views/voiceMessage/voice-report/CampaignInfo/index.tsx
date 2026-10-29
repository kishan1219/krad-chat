// @ts-nocheck
import React, { useContext, useEffect, useState } from 'react'
import { Lock, User } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap'
import LoopIcon from '@mui/icons-material/Loop'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/charts/apex-charts.scss'
import { getVoiceSms } from '../../../../utility/apis/voiceSMS'
import { isValid } from '../../../../utility/helpers/common'
import CenteredModal from '../../../components/modal/CenteredModal'
import Hide from '../../../../utility/Hide'
import Show from '../../../../utility/Show'

import Charts from './Chart'
import SendNumberLog from './SendNumberLog'
import Shimmer from '../../../components/shimmers/Shimmer'
import BasicDetails from './BasicDetails'

export default function VoiceCampaignInfo({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {

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
        getVoiceSms({
            id: edit?.id
        })
    }

    const loadDetails = () => {
        // if (isValid(id)) {
        if (isValid(edit?.id)) {
            getVoiceSms({
                id: edit?.id,
                loading: setLoading,
                success: (e) => {
                    setCampaign(e)
                }
            })
        }

        // }
    }


    useEffect(() => {
        if (open && activeTab === '1') {
            loadDetails()
        }

    }, [open, edit, activeTab])
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
                                                        <BasicDetails edit={campaign}
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

                                        <TabPane tabId='2'>
                                            <Card>
                                                <SendNumberLog edit={edit} activeTab={activeTab} />
                                            </Card>

                                        </TabPane>

                                        {/* <Show IF={campaign?.route_type === 3} >
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
                                        </Show> */}

                                    </TabContent>
                                </Card>
                            </Col>
                        </Row>
                    </>
                    }
                </form>
            </CenteredModal>

        </>
    )
}
