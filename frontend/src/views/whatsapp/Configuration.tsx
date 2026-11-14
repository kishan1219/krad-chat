// @ts-nocheck
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { Card, Row, Col, Form, ButtonGroup, Button, UncontrolledTooltip } from 'reactstrap'
import { Plus, Users, Sliders, RefreshCcw, Search } from 'react-feather'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'

import Header from '../components/header'
import FormGroupCustom from '../components/formGroupCustom'
import LoadingButton from '../components/buttons/LoadingButton'
import Show from '../../utility/Show'
import { Permissions } from '../../utility/Permissions'
import {
    loadWhatsappConfig,
    deleteWhatsappConfig,
    waPhoneNumberRequest,
    waAccountQualityCheck,
    waSubscribeApps
} from '../../utility/apis/whatsappConfig'
import { whatsappConfigDelete } from '../../redux/reducers/whatsappConfig'

import VerificationModal from '../components/VerificationModal'
import CheckPhoneStatus from './CheckPhoneStatus'
import WhatsappPhoneNumberRegister from './WhatsappPhoneNumberRegister'
import WhatsappEcommerce from './WhatsappEcommerce'
import WhatsappCallingModal from './WhatsappCallingModal'
import AddWhatsappConfigModal from './AddWhatsappConfigModal'
import AgentPodsManagementModal from './components/AgentPodsManagementModal'
import ConfigFilter from './Filter/ConfigFilter'
import { ConfigDataTable } from './components/configuration/ConfigDataTable'

export default function Configuration() {
    const config = useSelector((state) => state.whatsappConfig.whatsappConfig)
    const { colors } = useContext(ThemeColors)
    const dispatch = useDispatch()

    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [showPodsModal, setShowPodsModal] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [filterData, setFilterData] = useState({ per_page_record: 15 })
    const [currentPage, setCurrentPage] = useState('1')
    const [rowsPerPage] = useState('15')
    const [resetIt, setResetIt] = useState(new Date())

    // Modal sub-states
    const [configData, setConfigData] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [registerUserId, setRegisterUserId] = useState(null)
    const [ecommerceModal, setEcommerceModal] = useState(false)
    const [callingModal, setCallingModal] = useState(false)
    const [rowId, setRowId] = useState(null)
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [verificationModalItem, setVerificationModalItem] = useState(null)

    // Deletion confirmation states
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)

    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm()

    const preload = () => {
        loadWhatsappConfig({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            loading: setLoading,
            jsonData: {
                ...filterData,
                search: filterData?.search
            }
        })
    }

    useEffect(() => {
        preload()
    }, [filterData])

    // Real-time polling for display name approval (e.g. KRAD Technology name approval)
    useEffect(() => {
        const interval = setInterval(() => {
            const hasPending = config?.data?.some((r: any) => r?.name_status === 'PENDING_REVIEW' || r?.status === 0 || !r?.verified_name)
            if (hasPending) {
                preload()
            }
        }, 12000)
        return () => clearInterval(interval)
    }, [config])

    const handlePagination = (page) => {
        const next = page?.selected + 1
        setCurrentPage(String(next))
        loadWhatsappConfig({
            page: next,
            perPage: rowsPerPage,
            jsonData: filterData,
            dispatch,
            loading: setLoading
        })
    }

    const handleDelete = (row) => {
        deleteWhatsappConfig({
            id: row?.id,
            loading: setLoading,
            success: (e) => {
                setDeletedId(row?.id)
                setDeleted(e)
            },
            error: setFailed
        })
    }

    const handleCloseConfirmAlert = (confirmed, row) => {
        if (confirmed && deletedId) {
            dispatch(whatsappConfigDelete(deletedId))
        }
        setDeleted(null)
        setFailed(null)
    }

    return (
        <>
            {/* Action Modals */}
            <VerificationModal
                isOpen={showVerificationModal}
                toggle={() => setShowVerificationModal(!showVerificationModal)}
                onSMS={(payload) => {
                    waPhoneNumberRequest({
                        id: payload?.id,
                        otp_method: payload?.otp_method,
                        language: payload?.language,
                        success: () => {
                            setShowModal(true)
                            setConfigData(payload?.id)
                        }
                    })
                }}
                onVoice={(payload) => {
                    waPhoneNumberRequest({
                        id: payload?.id,
                        otp_method: payload?.otp_method,
                        language: payload?.language,
                        success: () => {
                            setShowModal(true)
                            setConfigData(payload?.id)
                        }
                    })
                }}
                item={verificationModalItem}
                setConfigData={setConfigData}
            />

            <CheckPhoneStatus Component={Button.Ripple} showModal={showModal} edit={configData} setConfigData={setConfigData} preload={preload} setShowModal={() => setShowModal(false)} noView />
            <WhatsappPhoneNumberRegister Component={Button.Ripple} color="secondary" showModal={showRegisterModal} edit={registerUserId} preload={preload} setShowModal={() => setShowRegisterModal(false)} noView />
            <WhatsappEcommerce Component={Button.Ripple} color="secondary" showModal={ecommerceModal} edit={rowId} preload={preload} setShowModal={() => setEcommerceModal(false)} noView />
            <WhatsappCallingModal Component={Button.Ripple} color="secondary" showModal={callingModal} edit={rowId} preload={preload} setShowModal={() => setCallingModal(false)} noView />
            <AddWhatsappConfigModal isOpen={modal} toggle={() => setModal(!modal)} onClose={() => setModal(false)} onSuccess={preload} />
            <AgentPodsManagementModal isOpen={showPodsModal} toggle={() => setShowPodsModal(!showPodsModal)} />

            {/* Header with Title and Control Buttons */}
            <Header icon="" title={<span style={{ color: '#ff8c21', fontWeight: 600 }}>Whatsapp Configuration</span>}>
                <ButtonGroup className="d-flex flex-wrap gap-1">
                    <Show IF={Permissions?.whatsappConfigCreate || true}>
                        <Button.Ripple
                            size="sm"
                            style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', borderRadius: '6px', fontWeight: 600 }}
                            className="d-flex align-items-center gap-1 text-white shadow-sm"
                            onClick={() => setModal(true)}
                        >
                            <Plus size={14} />
                            <span>Add Whatsapp</span>
                        </Button.Ripple>

                        <Button.Ripple
                            size="sm"
                            color="info"
                            style={{ borderRadius: '6px', fontWeight: 600 }}
                            className="d-flex align-items-center gap-1 shadow-sm"
                            onClick={() => setShowPodsModal(true)}
                        >
                            <Users size={14} />
                            <span>Agent Pods</span>
                        </Button.Ripple>
                    </Show>

                    <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                    <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" id="filteree" style={{ backgroundColor: '#5e5873', borderColor: '#5e5873', color: '#fff', borderRadius: '6px' }} onClick={() => setShowFilter(true)}>
                        <Sliders size={14} />
                    </Button.Ripple>
                    <Button.Ripple size="sm" id="reload" style={{ backgroundColor: '#4b465c', borderColor: '#4b465c', color: '#fff', borderRadius: '6px' }} onClick={() => { setFilterData({ per_page_record: 15 }); setResetIt(new Date()); reset(); preload() }}>
                        <RefreshCcw size={14} />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>

            {/* Main Content Card */}
            <Card className="shadow-sm border-0 rounded-3">
                <Row className="justify-content-end mx-0 p-2">
                    <Col className="d-flex align-items-center justify-content-end" md="4" sm="12">
                        <Form onSubmit={handleSubmit((d) => setFilterData({ ...filterData, ...d }))} className="w-100">
                            <FormGroupCustom
                                key={resetIt.toISOString()}
                                name="search"
                                type="text"
                                errors={errors}
                                label="Search"
                                noLabel
                                setValue={setValue}
                                className="mb-0"
                                control={control}
                                append={
                                    <LoadingButton
                                        loading={loading}
                                        className="btn"
                                        style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff' }}
                                        type="submit"
                                        size="sm"
                                    >
                                        <Search size={15} />
                                    </LoadingButton>
                                }
                            />
                        </Form>
                    </Col>
                </Row>

                <ConfigDataTable
                    loading={loading}
                    config={config}
                    currentPage={currentPage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handlePagination}
                    colors={colors}
                    onQualityCheck={(row) => waAccountQualityCheck({ id: row?.id, success: preload })}
                    onOpenVerificationModal={(row) => { setVerificationModalItem(row); setShowVerificationModal(true) }}
                    onRegisterPhone={(row) => { setRegisterUserId(row); setShowRegisterModal(true) }}
                    onSubscribeApps={(row) => waSubscribeApps({ id: row?.id, jsonData: { user_id: row?.user_id }, success: preload })}
                    onOpenEcommerce={(row) => { setRowId(row); setEcommerceModal(true) }}
                    onOpenCalling={(row) => { setRowId(row); setCallingModal(true) }}
                    onDelete={handleDelete}
                    preload={preload}
                    deletedState={deleted}
                    failedState={failed}
                    onCloseConfirmAlert={handleCloseConfirmAlert}
                    onSelectedRowsChange={() => {}}
                />
            </Card>

            <ConfigFilter
                show={showFilter}
                filterData={filterData}
                setFilterData={(e) => { setCurrentPage('1'); setFilterData(e) }}
                handleFilterModal={() => setShowFilter(false)}
            />
        </>
    )
}
