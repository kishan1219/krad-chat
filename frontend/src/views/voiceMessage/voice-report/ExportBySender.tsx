// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Download } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Col, Form, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import { createAsyncSelectOptions } from '../../../utility/Utils'
import { exportBySender } from '../../../utility/apis/report'
import { loadSenderIds } from '../../../utility/apis/senderIds'
import { isValidArray } from '../../../utility/helpers/common'
import httpConfig from '../../../utility/http/httpConfig'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'

const ExportBySender = ({ open, handleSender, setSenderID, senderID }) => {
    const [loading, setLoading] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [sender, setSender] = useState(null)
    const dispatch = useDispatch()


    const listSenderID = async (search, loadedOptions, { page }) => {

        const res = await loadSenderIds({
            async: true,
            page,
            perPage: 25,
            jsonData: { sender_id: search }
        })
        return createAsyncSelectOptions(res, page, "sender_id", "sender_id", setSender)

    }
    

    const submitHandler = (data) => {
        exportBySender({
            jsonData: {
                ...data

            },
            loading: setLoading,
            success: (e) => {
                window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
                handleSender()
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

    useEffect(() => {
        reset()
    }, [senderID])

    return (
        <>
            <div className='demo-inline-spacing'>
                <div className='basic-modal'>

                    <Modal isOpen={senderID} toggle={() => setSenderID(!senderID)}>
                        <ModalHeader toggle={() => setSenderID(!senderID)}>Export By Sender ID</ModalHeader>
                        <ModalBody>
                            <>
                                <Form onSubmit={handleSubmit(submitHandler)}>
                                    <Row>
                                        <Col md="12">

                                            <FormGroupCustom
                                                async
                                                loadOptions={listSenderID}
                                                type={"select"}
                                                control={control}
                                                name="sender_id"
                                                isClearable
                                                className='mb-1'
                                                label="Sender ID "
                                                errors={errors}
                                                options={sender}
                                                rules={{ required: true }}

                                            />
                                        </Col>
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

export default ExportBySender
