// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Col, Form, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import { integrateResponse } from '../../../utility/Const'
import { createConstSelectOptions } from '../../../utility/Utils'
import { reportLogExportByCampaignResponse } from '../../../utility/apis/report'
import { isValidArray } from '../../../utility/helpers/common'
import httpConfig from '../../../utility/http/httpConfig'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'

const ExportResponse = ({ open, handleModal, setModal, modal, edit }) => {
    const [loading, setLoading] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form


    const submitHandler = (data) => {
        reportLogExportByCampaignResponse({
            jsonData: {
                ...data,
                campaign_id: edit?.id
            },
            loading: setLoading,
            success: (e) => {

                window.open(httpConfig?.baseUrl2 + e?.file_path, "_blank")
                handleModal()
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
    }, [modal])

    return (
        <>
            <div className='demo-inline-spacing'>
                <div className='basic-modal'>

                    <Modal isOpen={modal} toggle={() => setModal(!modal)}>
                        <ModalHeader toggle={() => setModal(!modal)}>Export Two Way Response</ModalHeader>
                        <ModalBody>
                            <>
                                <Form onSubmit={handleSubmit(submitHandler)}>
                                    <Row>

                                        <Col md="12">
                                            <FormGroupCustom
                                                // defaultOptions
                                                name={'take_response'}
                                                type={"select"}
                                                label={'Select Response Type'}
                                                className='mb-1'
                                                // key={resetIt}
                                                // value={details?.take_response}
                                                control={control}
                                                rules={{ required: true }}
                                                options={createConstSelectOptions(integrateResponse)}
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

export default ExportResponse
