// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Form, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import Hide from '../../../utility/Hide'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions } from '../../../utility/Utils'
import { exportByMobile } from '../../../utility/apis/report'
import { loadSenderIds } from '../../../utility/apis/senderIds'
import { loadUserChild } from '../../../utility/apis/userManagement'
import { isValidArray } from '../../../utility/helpers/common'
import httpConfig from '../../../utility/http/httpConfig'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'

const ExportByMobile = ({ open, handleMobile, setMobile, mobile }) => {
    const [loading, setLoading] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [sender, setSender] = useState(null)
    const dispatch = useDispatch()
    const [user, setUser] = useState(null)

    const loginUser = useSelector(state => state.auth.userData)


    const loadUsers = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }


    const listSenderID = async (search, loadedOptions, { page }) => {

        const res = await loadSenderIds({
            async: true,
            page,
            perPage: 25,
            jsonData: { name: search }
        })
        return createAsyncSelectOptions(res, page, "sender_id", "sender_id", setSender)

    }

    const submitHandler = (data) => {
        if (loginUser?.userType === 2) {
            exportByMobile({
                jsonData: {
                    ...data,
                    user_id: [loginUser?.userType === 2 ? loginUser?.id : data?.user_id]
                },
                loading: setLoading,
                success: (e) => {
                    window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
                    handleMobile()
                    
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
        } else {
            exportByMobile({
                jsonData: {
                    ...data
                    // user_id : [loginUser?.userType === 2 ? loginUser?.id : data?.user_id]
                },
                loading: setLoading,
                success: (e) => {
                    window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
                    handleMobile()
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
    }


    useEffect(() => {
        reset()
    }, [mobile])
    return (
        <>
            <div className='demo-inline-spacing'>
                <div className='basic-modal'>

                    <Modal isOpen={mobile} toggle={() => setMobile(!mobile)}>
                        <ModalHeader toggle={() => setMobile(!mobile)}>Export By Mobile Number</ModalHeader>
                        <ModalBody>
                            <>
                                <Form onSubmit={handleSubmit(submitHandler)}>
                                    <Row>
                                        <Hide IF={loginUser?.userType === 2}>

                                            <Col md="12">
                                                <FormGroupCustom
                                                    async
                                                    loadOptions={loadUsers}
                                                    type={"select"}
                                                    control={control}
                                                    name="user_id"
                                                    isClearable
                                                    isMulti
                                                    className='mb-1'
                                                    label="Select User "
                                                    errors={errors}
                                                    options={user}
                                                    rules={{ required: true }}

                                                />
                                            </Col>
                                        </Hide>
                                        <Col md="12">
                                            <FormGroupCustom
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
                                                rules={{ required: true }}
                                            // values={edit?.out_time}
                                            />
                                        </Col>
                                        <Col md="12">
                                            <FormGroupCustom
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
                                                rules={{ required: true }}
                                            // values={edit?.out_time}
                                            />
                                        </Col>

                                        <Col md="12">
                                    
                                            <FormGroupCustom
                                                type={"number"}
                                                control={control}
                                                name="mobile"
                                                className='mb-1'
                                                label="Mobile Number"
                                                errors={errors}
                                                rules={{ required: true, minLength : 10, maxLength : 12 }}

                                            />
                                        </Col>
                                    </Row>
                                    <div className='text-center'>
                                        <LoadingButton loading={loading} type='submit' color="primary">
                                            Export
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

export default ExportByMobile
