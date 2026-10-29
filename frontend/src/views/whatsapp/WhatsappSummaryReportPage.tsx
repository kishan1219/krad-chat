// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Input, Label, Badge, Modal, ModalBody, ModalHeader, Form } from 'reactstrap'
import DataTable from 'react-data-table-component'
import { ArrowLeft, ChevronDown, Download, Eye } from 'react-feather'
import Header from '../components/header'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { createAsyncSelectConfigOptions, createAsyncSelectMultiUserOptions, createAsyncSelectMultiWaTempOptions, createConstSelectOptions } from '../../utility/Utils'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import { loadWhatsappTemplate } from '../../utility/apis/whatsappTemplate'
import { exportWhatsappSummaryReportDownload, loadWhatsappConfig, whatsappSummaryReport } from '../../utility/apis/whatsappConfig'
import { loadUserChild } from '../../utility/apis/userManagement'
import Hide from '../../utility/Hide'
import { categoryType, onlyCampaign } from '../../utility/Const'
import { isValidArray } from '../../utility/helpers/common'

const WhatsappSummaryReportPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const loginUser = useSelector(state => state.auth.userData)

    const [reportData, setReportData] = useState([]) // Raw data from location.state or API
    const [userNameFilter, setUserNameFilter] = useState('')
    const [statFilter, setStatFilter] = useState('')
    const [templateCategoryFilter, setTemplateCategoryFilter] = useState('')

    // State for ExportWhatsappSummaryReport functionality
    const [summaryExportModal, setSummaryExportModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadings, setLoadings] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [sender, setSender] = useState(null)
    const [template, setTemplate] = useState(null)
    const [user, setUser] = useState(null)
    const [loadConfig, setLoadConfig] = useState(null)
    const [configData, setConfigData] = useState(null)
    const [fileDownload, setFileDownload] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())

    const getStatColor = (stat) => {
        switch (stat.toLowerCase()) {
            case 'read': return 'light-success'
            case 'sent': return 'light-info'
            case 'delivered': return 'light-primary'
            case 'failed': return 'light-danger'
            default: return 'light-secondary'
        }
    }

    const getCategoryColor = (category) => {
        switch (category.toLowerCase()) {
            case 'marketing': return 'light-warning'
            case 'utility': return 'light-secondary'
            case 'transactional': return 'light-info'
            case 'authentication': return 'light-success'
            default: return 'light-dark'
        }
    }

    // Function to group data by user_name and include details
    const groupDataByUserWithDetails = (data) => {
        const grouped = {}
        data.forEach(item => {
            if (!grouped[item.user_name]) {
                grouped[item.user_name] = {
                    user_name: item.user_name,
                    totals: 0,
                    used_credit: 0,
                    details: []
                }
            }
            grouped[item.user_name].totals += item.totals
            grouped[item.user_name].used_credit += item.used_credit
            grouped[item.user_name].details.push(item)
        })
        return Object.values(grouped)
    }

    useEffect(() => {
        if (location.state && location.state.summaryReportData) {
            setReportData(location.state.summaryReportData)
        }
    }, [location.state])

    // Filter data based on user input and then group
    const filteredAndGroupedData = useMemo(() => {
        let tempFilteredData = reportData

        if (userNameFilter) {
            tempFilteredData = tempFilteredData.filter(row => row.user_name.toLowerCase().includes(userNameFilter.toLowerCase()))
        }

        if (statFilter) {
            tempFilteredData = tempFilteredData.filter(row => row.stat.toLowerCase() === statFilter.toLowerCase())
        }

        if (templateCategoryFilter) {
            tempFilteredData = tempFilteredData.filter(row => row.template_category.toLowerCase() === templateCategoryFilter.toLowerCase())
        }

        return groupDataByUserWithDetails(tempFilteredData)
    }, [reportData, userNameFilter, statFilter, templateCategoryFilter])

    // Export form related functions
    const loadUsers = async (search, loadedOptions, { page }) => {
        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)
    }

    const listWhatsappTemplate = async (search, loadedOptions, { page }) => {
        const res = await loadWhatsappTemplate({
            async: true,
            page,
            perPage: 25,
            jsonData: { wa_configuration_id: watch("configuration_id")?.id, user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? watch("user_id") : loginUser?.id ?? "", search }
        })
        return createAsyncSelectMultiWaTempOptions(res, page, "xName", null, setTemplate)
    }

    const listWhatsappConfig = async (search, loadedOptions, { page }) => {
        const res = await loadWhatsappConfig({
            async: true,
            page,
            perPage: 25,
            jsonData: { user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? watch("user_id") : loginUser?.id ?? "", search }
        })
        return createAsyncSelectConfigOptions(res, page, "xName", null, setLoadConfig)
    }

    const submitHandler = (data) => {
        if (fileDownload === 1) { // View Report
            whatsappSummaryReport({
                jsonData: {
                    ...data,
                    whats_app_template_id: watch("whats_app_template_id")?.id,
                    configuration_id: watch("configuration_id")?.id
                },
                loading: setLoading,
                success: (e) => {
                    setReportData(e?.data || []) // Update reportData with new data from API
                    setSummaryExportModal(false) // Close modal
                    setResetIt(new Date())
                    reset()
                },
                errors: (e) => {
                    const d = e?.data?.data
                    for (const key in d) {
                        if (Object.hasOwnProperty.call(d, key)) {
                            if (isValidArray(d[key])) {
                                const message = d[key]?.map(a => `${a} \n`)
                                setError(key, { message, type: "validate" })
                            }
                        }
                    }
                }
            })
        } else if (fileDownload === 2) { // Export Download
            exportWhatsappSummaryReportDownload({
                jsonData: {
                    ...data,
                    whats_app_template_id: watch("whats_app_template_id")?.id,
                    configuration_id: watch("configuration_id")?.id
                },
                loadings: setLoadings,
                success: (e) => {
                    window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
                    setSummaryExportModal(false) // Close modal
                    setResetIt(new Date())
                    reset()
                },
                errors: (e) => {
                    const d = e?.data?.data
                    for (const key in d) {
                        if (Object.hasOwnProperty.call(d, key)) {
                            if (isValidArray(d[key])) {
                                const message = d[key]?.map(a => `${a} \n`)
                                setError(key, { message, type: "validate" })
                            }
                        }
                    }
                }
            })
        }
    }

    // Expanded Component to show details
    const ExpandedComponent = ({ data }) => {
        const detailColumns = [
            {
                name: "Template Category",
                selector: row => (
                    <Badge color={getCategoryColor(row?.template_category)} pill>
                        {row?.template_category}
                    </Badge>
                ),
                sortable: true,
                minWidth: '150px'
            },
            {
                name: "Status",
                selector: row => (
                    <Badge color={getStatColor(row.stat)} pill>
                        {row.stat}
                    </Badge>
                ),
                sortable: true,
                minWidth: '150px'
            },
            {
                name: "Total Count",
                selector: row => row.totals,
                sortable: true,
                minWidth: '150px'
            },

            {
                name: "Credit Used",
                selector: row => {
                    const raw = row?.used_credit
                    if (raw === null || raw === undefined || raw === '') return '₹0.00'
                    const n = Number(String(raw).replace(/[^0-9.-]+/g, ''))
                    if (isNaN(n)) return '₹0.00'
                    return `₹${n.toFixed(2)}`
                },
                sortable: true,
                minWidth: '120px'
            }
        ]
        return (
            <div style={{ padding: '15px', backgroundColor: '#f8f8f8' }}>
                <h5 className='mt-1 mb-1 fw-bolder'>Details for {data.user_name}</h5>
                <DataTable
                    noHeader
                    columns={detailColumns}
                    data={data.details}
                    sortIcon={<ChevronDown size={10} />}
                    dense
                />
            </div>
        )
    }

    const dataTableColumns = [
        {
            name: "User Name",
            selector: row => {
                return (
                    <span className='fw-bolder'>{row.user_name}</span>
                )
            },
            sortable: true,
            minWidth: '150px'
        },
        {
            name: "Credit Used",
            selector: row => {
                const raw = row?.used_credit
                if (raw === null || raw === undefined || raw === '') return '₹0.00'
                const n = Number(String(raw).replace(/[^0-9.-]+/g, ''))
                if (isNaN(n)) return '₹0.00'
                return `₹${n.toFixed(2)}`
            },
            sortable: true,
            minWidth: '120px'
        },
        {
            name: "Total Count",
            selector: row => row.totals,
            sortable: true,
            minWidth: '150px'
        }
    ]

    return (
        <>
            <Header icon={<ArrowLeft onClick={() => { navigate(-1) }} style={{ cursor: "pointer" }} />} title={"Whatsapp Summary Report"} />
            <Row>
                <Col sm='12'>
                    <Card>
                        <CardHeader className='border-bottom'>
                            <CardTitle tag='h4'>Summary Report Details</CardTitle>
                            <div className='d-flex align-items-center'>
                                <LoadingButton onClick={() => setSummaryExportModal(true)} className='btn-icon' color='primary' size='sm'>
                                    <Download size={14} />
                                    <span className='align-middle ms-25'>Export Summary</span>
                                </LoadingButton>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Row className='mb-2 mt-2'>
                                <Col md='4'>
                                    <Label for='userNameFilter'>User Name:</Label>
                                    <Input
                                        type='text'
                                        id='userNameFilter'
                                        value={userNameFilter}
                                        onChange={e => setUserNameFilter(e.target.value)}
                                        placeholder='Filter by User Name'
                                    />
                                </Col>
                                <Col md='4'>
                                    <Label for='templateCategoryFilter'>Template Category:</Label>
                                    <Input
                                        type='select'
                                        id='templateCategoryFilter'
                                        value={templateCategoryFilter}
                                        onChange={e => setTemplateCategoryFilter(e.target.value)}
                                    >
                                        <option value=''>All Categories</option>
                                        <option value='Marketing'>Marketing</option>
                                        <option value='Utility'>Utility</option>
                                        <option value='Transactional'>Transactional</option>
                                        <option value='Authentication'>Authentication</option>
                                    </Input>
                                </Col>
                                <Col md='4'>
                                    <Label for='statFilter'>Status:</Label>
                                    <Input
                                        type='select'
                                        id='statFilter'
                                        value={statFilter}
                                        onChange={e => setStatFilter(e.target.value)}
                                    >
                                        <option value=''>All Statuses</option>
                                        <option value='read'>Read</option>
                                        <option value='sent'>Sent</option>
                                        <option value='delivered'>Delivered</option>
                                        <option value='failed'>Failed</option>
                                    </Input>
                                </Col>
                            </Row>
                            {filteredAndGroupedData.length > 0 ? (
                                <div className='react-dataTable whatsapp-summary-table'>
                                    <DataTable
                                        noHeader
                                        className='react-dataTable'
                                        columns={dataTableColumns}
                                        data={filteredAndGroupedData}
                                        sortIcon={<ChevronDown size={10} />}
                                        expandableRows
                                        expandableRowsComponent={ExpandedComponent}
                                        expandableRowExpanded={row => filteredAndGroupedData.indexOf(row) === 0}
                                    />
                                </div>
                            ) : (
                                <h4 className='fw-bold d-flex justify-content-center mt-4 mb-4'>No summary report data available based on current filters.</h4>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Export Summary Report Modal */}
            <Modal isOpen={summaryExportModal} toggle={() => setSummaryExportModal(!summaryExportModal)}>
                <ModalHeader toggle={() => setSummaryExportModal(!summaryExportModal)}>Export Summary Report</ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit(submitHandler)}>
                        <Row>
                            <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2}>
                                <Col md="12">
                                    <FormGroupCustom
                                        key={resetIt}
                                        async
                                        loadOptions={loadUsers}
                                        type={"select"}
                                        control={control}
                                        name="user_id"
                                        isClearable
                                        className='mb-1'
                                        label="Select User"
                                        errors={errors}
                                        options={user}
                                        rules={{ required: false }}
                                    />
                                </Col>
                            </Hide>

                            <Col md="12">
                                <FormGroupCustom
                                    key={`12fs${watch('user_id')}-km3lkm-${resetIt}`}
                                    async
                                    type={"select"}
                                    control={control}
                                    name="configuration_id"
                                    isClearable
                                    defaultOptions
                                    loadOptions={listWhatsappConfig}
                                    onChangeValue={(e) => { setConfigData(e) }}
                                    className='mb-1'
                                    label="Whatsapp Configuration"
                                    errors={errors}
                                    options={loadConfig}
                                    rules={{ required: false }}
                                />
                            </Col>

                            {loginUser?.userType === 1 || loginUser?.userType === 2 ? (
                                <Col md="12">
                                    <FormGroupCustom
                                        key={`qfo456sdfs${watch('user_id')}-${watch("configuration_id")}-fd562saf`}
                                        async
                                        type={"select"}
                                        control={control}
                                        errors={errors}
                                        defaultOptions
                                        isClearable
                                        loadOptions={listWhatsappTemplate}
                                        name={"whats_app_template_id"}
                                        className='mb-1'
                                        label="Whatsapp Template"
                                        options={sender}
                                        rules={{ required: false }}
                                    />
                                </Col>
                            ) : (
                                <Col md="12">
                                    <FormGroupCustom
                                        key={`1opfsdfs${watch('user_id')}-${watch("configuration_id")}-fd3sa3f`}
                                        async
                                        type={"select"}
                                        control={control}
                                        errors={errors}
                                        defaultOptions
                                        isClearable
                                        loadOptions={listWhatsappTemplate}
                                        name={"whats_app_template_id"}
                                        className='mb-1'
                                        label="Whatsapp Template"
                                        options={sender}
                                        rules={{ required: false }}
                                    />
                                </Col>
                            )}

                            <Col md="12">
                                <FormGroupCustom
                                    key={resetIt}
                                    name={"campaign_send_date_time_from"}
                                    type={"date"}
                                    errors={errors}
                                    label={"From"}
                                    options={{}}
                                    dateFormat={"YYYY-MM-DD"}
                                    setValue={setValue}
                                    className="mb-2"
                                    control={control}
                                    rules={{ required: false }}
                                />
                            </Col>

                            <Col md="12">
                                <FormGroupCustom
                                    key={resetIt}
                                    name={"campaign_send_date_time_to"}
                                    type={"date"}
                                    errors={errors}
                                    label={"To"}
                                    options={{
                                        minDate: watch("campaign_send_date_time_from")
                                    }}
                                    dateFormat={"YYYY-MM-DD"}
                                    setValue={setValue}
                                    className="mb-2"
                                    control={control}
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md="12">
                                <FormGroupCustom
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"message_category"}
                                    isClearable
                                    className='mb-1'
                                    options={createConstSelectOptions(categoryType)}
                                    label="Category Type"
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md="12">
                                <FormGroupCustom
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"date_wise"}
                                    isClearable
                                    className='mb-1'
                                    options={createConstSelectOptions(onlyCampaign)}
                                    label="Record By Date"
                                    rules={{ required: false }}
                                />
                            </Col>
                        </Row>
                        <div className='text-center justify-content-between'>
                            <LoadingButton onClick={() => { setFileDownload(2) }} loading={loadings} type='submit' className='btn-icon mt-2 btn-md' color='primary'>
                                <Download size={14} />
                                <span className='align-middle ms-25'>Export</span>
                            </LoadingButton>
                            <LoadingButton onClick={() => { setFileDownload(1) }} loading={loading} type='submit' className='btn-icon mt-2 btn-md' style={{ marginLeft: '5px' }} color='primary'>
                                <Eye size={14} />
                                <span className='align-middle ms-25'>View</span>
                            </LoadingButton>
                        </div>
                    </Form>
                </ModalBody>
            </Modal>
        </>
    )
}

export default WhatsappSummaryReportPage
