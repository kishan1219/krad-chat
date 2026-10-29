// @ts-nocheck
import { useEffect, useState } from 'react'
import { Download } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Form, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import { detailedReportApi, exportByDetailedReport } from '../../utility/apis/report'
import { loadSenderIds } from '../../utility/apis/senderIds'
import { loadDlt } from '../../utility/apis/dlt'
import { loadUserChild } from '../../utility/apis/userManagement'
import { createAsyncSelectMultiMessageOptions, createAsyncSelectMultiUserOptions, createAsyncSelectOptions } from '../../utility/Utils'
import { isValidArray } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Hide from '../../utility/Hide'

const ExportDetailedReport = ({ open, toggle }) => {
    const [loading, setLoading] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError } = form
    const [sender, setSender] = useState(null)
    const [dlt, setDlt] = useState(null)
    const [user, setUser] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)
    const dispatch = useDispatch()

    const listSenderID = async (search, loadedOptions, { page, data }) => {
        const res = await loadSenderIds({
            async: true,
            page,
            perPage: 25,
            jsonData: { search, user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : watch("user_id")    }
        })
        return createAsyncSelectOptions(res, page, "sender_id", "sender_id", setSender)
    }

    const listDLT = async (search, loadedOptions, { page }) => {
        const res = await loadDlt({
            async: true,
            page,
            perPage: 25,
            jsonData: { search, user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : watch("user_id") }
        })
        // return createAsyncSelectOptions(res, page, "dlt_template_id", "dlt_template_id", setDlt)
        return createAsyncSelectMultiMessageOptions(res, page, "xName", "dlt_template_id", setDlt)
    }

    const loadUserData = async (search, loadedOptions, { page }) => {
        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })

        // Using createAsyncSelectOptions instead of createAsyncSelectMultiUserOptions as API expects single user_id usually, 
        // but if multi is needed we can adjustments. Based on payload user_id seems single.
        // Also referencing DetailedReport.js uses createAsyncSelectMultiUserOptions but maps to xName/id.
        // Let's stick to simple mapping for now.
        // return createAsyncSelectOptions(res, page, "name", "id", setUser)
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }

    const submitHandler = (data) => {
        exportByDetailedReport({
            jsonData: {
                ...data,
                user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : data?.user_id

            },
            loading: setLoading,
            success: (e) => {
                if (e?.data?.file_path) {
                    window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
                    toggle()
                } else {
                    // Fallback or maybe it just returns data? 
                    // behavior for now: toggle.
                    toggle()
                }
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

    useEffect(() => {
        if (open) {
            reset()
        }
    }, [open])

    return (
        <div className='demo-inline-spacing'>
            <div className='basic-modal'>
                <Modal isOpen={open} toggle={toggle}>
                    <ModalHeader toggle={toggle}>Export Detailed Report</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={handleSubmit(submitHandler)}>
                            <Row>
                                {/* <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2 ? false : true}> */}
                                <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2}>

                                    <Col md="12">
                                        <FormGroupCustom
                                            async
                                            loadOptions={loadUserData}
                                            type={"select"}
                                            control={control}
                                            name="user_id"
                                            isClearable
                                            className='mb-1'
                                            label="User"
                                            errors={errors}
                                            options={user}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                </Hide>
                                <Col md="12">
                                    <FormGroupCustom
                                        key={watch("user_id")}
                                        async
                                        loadOptions={listSenderID}
                                        type={"select"}
                                        control={control}
                                        name="sender_id"
                                        isClearable
                                        className='mb-1'
                                        label="Sender ID"
                                        errors={errors}
                                        options={sender}
                                        rules={{ required: false }}
                                    />
                                </Col>
                                <Col md="12">
                                    <FormGroupCustom
                                        key={watch("user_id")}
                                        async
                                        loadOptions={listDLT}
                                        type={"select"}
                                        control={control}
                                        name="dlt_template_id"
                                        isClearable
                                        className='mb-1'
                                        label="DLT Template ID"
                                        errors={errors}
                                        options={dlt}
                                        rules={{ required: false }}
                                    />
                                </Col>
                                <Col md="12">
                                    <FormGroupCustom
                                        name={"from_date"}
                                        type={"date"}
                                        errors={errors}
                                        label={"From"}
                                        dateFormat={"YYYY-MM-DD"}
                                        setValue={setValue}
                                        className="mb-2"
                                        control={control}
                                        rules={{ required: true }}
                                    />
                                </Col>
                                <Col md="12">
                                    <FormGroupCustom
                                        name={"to_date"}
                                        type={"date"}
                                        errors={errors}
                                        label={"To"}
                                        options={{
                                            minDate: watch("from_date")
                                        }}
                                        dateFormat={"YYYY-MM-DD"}
                                        setValue={setValue}
                                        className="mb-2"
                                        control={control}
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Row>
                            <div className='text-center'>
                                <LoadingButton loading={loading} type='submit' className='btn-icon mt-2 btn-md' color='primary'>
                                    <Download size={14} />
                                    <span className='align-middle ms-25'>Export</span>
                                </LoadingButton>
                            </div>
                        </Form>
                    </ModalBody>
                </Modal>
            </div>
        </div>
    )
}

export default ExportDetailedReport
