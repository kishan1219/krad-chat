// @ts-nocheck
import { useEffect, useState } from 'react'
import { Download, Eye } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Col, Form, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import { createAsyncSelectConfigOptions, createAsyncSelectMultiUserOptions, createAsyncSelectMultiWaTempOptions, createAsyncSelectOptions, createConstSelectOptions } from '../../utility/Utils'
import { isValidArray, log } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import { loadWhatsappTemplate } from '../../utility/apis/whatsappTemplate'
import { exportWhatsappReport, exportWhatsappSummaryReportDownload, loadWhatsappConfig, whatsappSummaryReport } from '../../utility/apis/whatsappConfig'
import { loadUserChild } from '../../utility/apis/userManagement'
import Hide from '../../utility/Hide'
import { categoryType, onlyCampaign } from '../../utility/Const'


const ExportWhatsappSummaryReport = ({ open, handleSummaryExport, setSummaryExport, summaryExport }) => {
    const loginUser = useSelector(state => state.auth.userData)
    const [loading, setLoading] = useState(false)
    const [loadings, setLoadings] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [sender, setSender] = useState(null)
    const [template, setTemplate] = useState(null)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loadConfig, setLoadConfig] = useState(null)
    const [configData, setConfigData] = useState(null)
    const [fileDownload, setFileDownload] = useState(null)

    const [resetIt, setResetIt] = useState(new Date())

    const loadUsers = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }
    log(configData, "config")

    // {
    //     "user_id": 3,
    //         "configuration_id": null,
    //             "whats_app_template_id": null,
    //                 "message_category": null,
    //                     "campaign_send_date_time_from": null,
    //                         "campaign_send_date_time_to": null,
    //                             "date_wise": ""

    // }

    // const listWhatsappTemplate = async (search, loadedOptions, { page }) => {
    //     // if (user_id)
    //     const res = await loadWhatsappTemplate({
    //         async: true,
    //         page,
    //         perPage: 25,
    //         // dispatch,
    //         jsonData: { user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? watch("user_id") : loginUser?.id ?? "", search }
    //     })
    //     return createAsyncSelectMultiWaTempOptions(res, page, "xName", null, setTemplate)

    // }

    const listWhatsappTemplate = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadWhatsappTemplate({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            // jsonData: { wa_configuration_id: watch("configuration_id")?.id, user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? watch("user_id") : loginUser?.id ?? "",  search }
            jsonData: { wa_configuration_id: watch("configuration_id")?.id, user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? watch("user_id") : loginUser?.id ?? "", search }
        })
        return createAsyncSelectMultiWaTempOptions(res, page, "xName", null, setTemplate)

    }

    const listWhatsappConfig = async (search, loadedOptions, { page }) => {

        const res = await loadWhatsappConfig({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            // jsonData: { user_id: loginUser?.userType === 2 || loginUser?.userType === 1 ? loginUser?.id : watch('user_id'), search }
            jsonData: { user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? watch("user_id") : loginUser?.id ?? "", search }

        })
        return createAsyncSelectConfigOptions(res, page, "xName", null, setLoadConfig)

    }

    const submitHandler = (data) => {

        if (fileDownload === 1) {
            whatsappSummaryReport({
                jsonData: {
                    ...data,
                    whats_app_template_id: watch("whats_app_template_id")?.id,
                    configuration_id: watch("configuration_id")?.id

                },
                loading: setLoading,
                success: (e) => {
                    navigate('/whatsapp-summary-report', { state: { summaryReportData: e?.data || [] } })
                    handleSummaryExport()
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
        } else if (fileDownload === 2) {
            exportWhatsappSummaryReportDownload({
                jsonData: {
                    ...data,
                    whats_app_template_id: watch("whats_app_template_id")?.id,
                    configuration_id: watch("configuration_id")?.id

                },
                loadings: setLoadings,
                success: (e) => {
                    window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
                    handleSummaryExport()
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

    return (
        <>
            <div className='demo-inline-spacing'>
                <div className='basic-modal'>

                    <Modal isOpen={summaryExport} toggle={() => setSummaryExport(!summaryExport)}>
                        <ModalHeader toggle={() => setSummaryExport(!summaryExport)}>Export Summary Report</ModalHeader>
                        <ModalBody>
                            <>
                                <Form onSubmit={handleSubmit(submitHandler)}>
                                    <Row>

                                        <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2}>
                                            <Col md="12">
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

                                        {loginUser?.userType === 1 || loginUser?.userType === 2 ? <Col md="12">
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
                                        </Col> : <Col md="12">
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
                                        }

                                        <Col md="12">
                                            <FormGroupCustom
                                                key={resetIt}
                                                name={"campaign_send_date_time_from"}
                                                type={"date"}
                                                errors={errors}
                                                label={"From"}
                                                options={{
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
                                        <LoadingButton onClick={() => { setFileDownload(2) }} loading={loadings} type='submit' className='btn-icon mt-2 btn-md' color='primary'  >
                                            <Download size={14} />
                                            <span className='align-middle ms-25'>Export</span>
                                        </LoadingButton>
                                        <LoadingButton onClick={() => { setFileDownload(1) }} loading={loading} type='submit' className='btn-icon mt-2 btn-md' style={{ marginLeft: '5px' }} color='primary'  >
                                            <Eye size={14} />
                                            <span className='align-middle ms-25'>View</span>
                                        </LoadingButton>

                                    </div>
                                </Form>
                            </>
                        </ModalBody>

                    </Modal>
                </div>
            </div>
        </>
    )

}

export default ExportWhatsappSummaryReport
