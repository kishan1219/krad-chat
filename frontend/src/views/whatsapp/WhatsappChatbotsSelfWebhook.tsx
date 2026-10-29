// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'

import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Badge, Button, ButtonGroup, Card, Col, Form, Row, UncontrolledTooltip, Modal, ModalHeader, ModalBody, Table } from 'reactstrap'
import { ChevronDown, RefreshCcw, Search, Sliders, Eye } from 'react-feather'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import { createAsyncSelectConfigOptions, createAsyncSelectMultiUserOptions, formatDate } from '../../utility/Utils'
import { loadUserChild } from '../../utility/apis/userManagement'
import { loadWhatsappConfig, whatsappChatbotsSelfWebhook } from '../../utility/apis/whatsappConfig'
import Hide from '../../utility/Hide'

const WhatsappChatbotsSelfWebhook = () => {
    const { colors } = useContext(ThemeColors)
    const [loading, setLoading] = useState(false)
    const [dataList, setDataList] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(10)
    const [showFilter, setShowFilter] = useState(false)
    const [reload, setReload] = useState(false)
    const [resetIt, setResetIt] = useState(new Date())
    const [userDetails, setUserDetails] = useState(null)
    const [waConfigDetails, setWaConfigDetails] = useState(null)
    const users = useSelector(state => state.auth.userData)


    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm()

    const [filterData, setFilterData] = useState({
        per_page_record: 10
    })
    const [showModal, setShowModal] = useState(false)
    const [selectedPayload, setSelectedPayload] = useState(null)

    const preload = () => {
        whatsappChatbotsSelfWebhook({
            page: currentPage,
            perPage: rowsPerPage,
            jsonData: filterData,
            loading: setLoading,
            success: (e) => {
                setDataList(e?.data)
            }
        })
    }

    useEffect(() => {
        preload()
    }, [filterData, currentPage, reload])

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
    }

    const submitFilter = (d) => {
        setFilterData({ ...filterData, ...d })
        setCurrentPage(1)
    }

    const loadUserOptions = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", null, setUserDetails)

    }
    const loadWaConfigOptions = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadWhatsappConfig({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            // jsonData: { search }
            jsonData: { user_id: users?.userType === 2 || users?.userType === 1 ? users?.id : watch('user_id')?.id, search }

        })
        return createAsyncSelectConfigOptions(res, page, "xName", null, setWaConfigDetails)

    }

    // const loadWaConfigOptions = async (search, loadedOptions, { page }) => {
    //     const res = await loadWhatsappConfig({
    //         async: true,
    //         page,
    //         perPage: 10,
    //         jsonData: { name: search }
    //     })
    //     return {
    //         options: res?.data?.data?.map(i => ({ value: i?.id, label: i?.name ? `${i?.name} (${i?.mobile_number})` : i?.mobile_number })),
    //         hasMore: res?.data?.current_page < res?.data?.last_page,
    //         additional: { page: page + 1 }
    //     }
    // }

    const columns = [
        {
            name: "#",
            cell: (row, index) => (rowsPerPage * (currentPage - 1)) + (index + 1),
            maxWidth: "50px"
        },
        {
            name: "Name",
            selector: row => row.name,
            sortable: true,
            minWidth: "150px"
        },
        {
            name: "Phone Number",
            selector: row => row.display_phone_number,
            sortable: true,
            minWidth: "180px"
        },
        {
            name: "Patient Name",
            selector: row => row?.request_payload?.patient_name || "-",
            sortable: true,
            minWidth: "150px"
        },
        {
            name: "WA Profile Name",
            selector: row => row?.request_payload?.wa_user_profile_name || "-",
            sortable: true,
            minWidth: "150px"
        },

        {
            name: "Created At",
            selector: cell => formatDate(cell?.created_at, "DD-MM-YYYY"),
            sortable: true,
            minWidth: "200px"
        },
        {
            name: "Actions",
            cell: row => (
                <Button.Ripple
                    color='transparent'
                    className='btn btn-icon'
                    onClick={() => {
                        setSelectedPayload(row.request_payload)
                        setShowModal(true)
                    }}
                >
                    <Eye size={20} />
                </Button.Ripple>
            )
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(dataList?.total / dataList?.per_page) || 1
        return (
            <ReactPaginate
                initialPage={currentPage - 1}
                disableInitialCallback
                previousLabel={''}
                nextLabel={''}
                breakLabel='...'
                pageCount={count}
                activeClassName='active'
                onPageChange={page => handlePagination(page)}
                pageClassName={'page-item'}
                nextLinkClassName={'page-link'}
                nextClassName={'page-item next'}
                previousClassName={'page-item prev'}
                previousLinkClassName={'page-link'}
                pageLinkClassName={'page-link'}
                breakClassName='page-item'
                breakLinkClassName='page-link'
                containerClassName={
                    'pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
                }
            />
        )
    }

    return (
        <>
            <Header icon={""} title="Chatbot Response">
                <ButtonGroup>

                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({ per_page_record: rowsPerPage }); setResetIt(new Date()); reset(); setReload(!reload) }}>
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>

            <Card>

                <Row className='justify-content-start mx-0 mb-1'>
                    <Col md='12'>
                        <Form onSubmit={handleSubmit(submitFilter)} className="d-flex align-items-center gap-1 mt-1">
                          <Hide IF={users?.userType === 2 || users?.userType === 1}>
                            <Col md="3">

                                <FormGroupCustom
                                    // defaultOptions
                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"user_id"}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={loadUserOptions}
                                    // value={loadUserOther}
                                    // onChangeValue={(e) => { setGetTemplate(e?.id); setTrans(e?.transaction_credit); setPro(e?.promotional_credit); setGetMessageType(e?.is_unicode); setTwo(e?.two_waysms_credit); setVoice(e?.voice_sms_credit); setGroup(e?.id) }}
                                    // onChangeValue={(e) => { setGroup(e?.id); setUserData(e); setWhatsappAmount(e?.wa_amount) }}
                                    options={userDetails}
                                    label="User"
                                    rules={{ required: false }}
                                />
                            </Col>
                            </Hide>
                            <Col md="3">
                                {/* <FormGroupCustom
                                    label="Wa Config ID"
                                    name="whats_app_configuration_id"
                                    type="select"
                                    control={control}
                                    errors={errors}
                                    loadOptions={loadWaConfigOptions}
                                    async
                                    placeholder="Select Wa Config"
                                    noGroup
                                /> */}
        
                                <FormGroupCustom
                                    // defaultOptions
                                    key={`qfo2pfsdfs${watch('user_id')?.id}-kmlkm`}
                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"whats_app_configuration_id"}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={loadWaConfigOptions}
                                    // value={loadUserOther}
                                    // onChangeValue={(e) => { setGetTemplate(e?.id); setTrans(e?.transaction_credit); setPro(e?.promotional_credit); setGetMessageType(e?.is_unicode); setTwo(e?.two_waysms_credit); setVoice(e?.voice_sms_credit); setGroup(e?.id) }}
                                    // onChangeValue={(e) => { setGroup(e?.id); setUserData(e); setWhatsappAmount(e?.wa_amount) }}
                                    options={waConfigDetails}
                                    label="Wa Config"
                                    rules={{ required: false }}
                                />
                            </Col>
                          
                            <Col md="2" className='mt-1'>
                                <LoadingButton
                                    loading={loading}
                                    className="btn btn-primary"
                                    color="primary"
                                    type="submit"
                                    size="md"
                                >
                                    <Search size={15} /> Apply
                                </LoadingButton>
                            </Col>
                        </Form>
                    </Col>
                </Row>


                {loading ? (
                    <>
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    </>
                ) : (
                    <div className='card-datatable app-user-list table-responsive'>
                        <div className='react-dataTable'>
                            <DataTable
                                noHeader
                                pagination
                                paginationServer
                                className='react-dataTable'
                                columns={columns}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>No Record Found</div>}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={dataList?.data || []}
                            />
                        </div>
                    </div>
                )}
            </Card>

            <Modal isOpen={showModal} toggle={() => setShowModal(!showModal)} className='modal-dialog-centered'>
                <ModalHeader toggle={() => setShowModal(!showModal)}>Request Payload</ModalHeader>
                <ModalBody>
                    {selectedPayload ? (
                        <Table striped bordered responsive>
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(selectedPayload).map(([key, value]) => (
                                    <tr key={key}>
                                        <td style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                            {key.replace(/_/g, ' ')}
                                        </td>
                                        <td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center p-3">No Data Available</div>
                    )}
                </ModalBody>
            </Modal>

        </>
    )
}

export default WhatsappChatbotsSelfWebhook
