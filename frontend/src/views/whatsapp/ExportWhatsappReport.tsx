// @ts-nocheck
import { useEffect, useState } from 'react'
import { Download } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Form, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import { createAsyncSelectMultiUserOptions, createAsyncSelectMultiWaTempOptions, createAsyncSelectOptions } from '../../utility/Utils'
import { isValidArray } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import { loadWhatsappTemplate } from '../../utility/apis/whatsappTemplate'
import { exportWhatsappReport } from '../../utility/apis/whatsappConfig'
import { loadUserChild } from '../../utility/apis/userManagement'
import Hide from '../../utility/Hide'

const ExportWhatsappReport = ({ open, handleExport, setExportID, exportID }) => {
    const loginUser = useSelector(state => state.auth.userData)
    const [loading, setLoading] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [sender, setSender] = useState(null)
    const [template, setTemplate] = useState(null)
    const dispatch = useDispatch()
    const [user, setUser] = useState(null)
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
    const listWhatsappTemplate = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadWhatsappTemplate({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? watch("user_id") : loginUser?.id ?? "", search }
        })
        return createAsyncSelectMultiWaTempOptions(res, page, "xName", null, setTemplate)

    }

    const submitHandler = (data) => {
        exportWhatsappReport({
            jsonData: {
                ...data,
                whats_app_template_id: watch("whats_app_template_id")?.id

            },
            loading: setLoading,
            success: (e) => {
                window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
                handleExport()
                setResetIt(new Date())
                reset()
                // SuccessToast(null, {}, <div
                //     dangerouslySetInnerHTML={{ __html: e }}
                // />)
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

    return (
        <>
            <div className='demo-inline-spacing'>
                <div className='basic-modal'>

                    <Modal isOpen={exportID} toggle={() => setExportID(!exportID)}>
                        <ModalHeader toggle={() => setExportID(!exportID)}>Export WhatsApp Template</ModalHeader>
                        <ModalBody>
                            <>
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
                                                    // isMulti
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
                                                key={`1fs${watch('user_id')}-km1lkm-${resetIt}`}
                                                async
                                                loadOptions={listWhatsappTemplate}
                                                type={"select"}
                                                control={control}
                                                name="whats_app_template_id"
                                                isClearable
                                                className='mb-1'
                                                label="Whatsapp Template ID "
                                                errors={errors}
                                                options={sender}
                                                rules={{ required: false }}

                                            />
                                        </Col>

                                        <Col md="12">
                                            <FormGroupCustom
                                                key={resetIt}
                                                name={"from_date"}
                                                type={"date"}
                                                errors={errors}
                                                label={"From"}
                                                options={{
                                                    // enableTime: true,
                                                    // minDate: Date.now()
                                                }}
                                                dateFormat={"YYYY-MM-DD"}
                                                setValue={setValue}
                                                className="mb-2"
                                                control={control}
                                                rules={{ required: false }}
                                            // values={edit?.out_time}
                                            />
                                        </Col>

                                        <Col md="12">
                                            <FormGroupCustom
                                                key={resetIt}
                                                name={"to_date"}
                                                type={"date"}
                                                errors={errors}
                                                label={"To"}
                                                options={{
                                                    // enableTime: true,
                                                    minDate: watch("from_date")
                                                }}
                                                dateFormat={"YYYY-MM-DD"}
                                                setValue={setValue}
                                                className="mb-2"
                                                control={control}
                                                rules={{ required: false }}
                                            // values={edit?.out_time}
                                            />
                                        </Col>
                                    </Row>
                                    <div className='text-center'>
                                        <LoadingButton loading={loading} type='submit' className='btn-icon mt-2 btn-md' color='primary'  >
                                            <Download size={14} />
                                            <span className='align-middle ms-25'>Export</span>
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

export default ExportWhatsappReport
