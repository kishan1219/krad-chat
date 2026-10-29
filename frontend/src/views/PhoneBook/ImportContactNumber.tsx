// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Star, X } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Col, Form, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import { groupSampleFile } from '../../utility/apis/contactGroup'
import { contactNumberImport } from '../../utility/apis/contactNumber'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'


const ImportContactNumber = ({ importModal, setImportModal, handleImport, open, preload }) => {
    const [loading, setLoading] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, setError, reset, setValue, watch, getValues } = form

    const [primary, setPrimary] = useState(null)
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleImport} />


    const submitHandler = (form) => {

        contactNumberImport({
            formData: {
                ...form,
                file_path: form?.file_path[0]

            },
            loading: setLoading,
            success: (e) => {

                handleImport()

                preload()
               
            }
        })
    }


    const sampleFile = () => {
        groupSampleFile({
            success: (e) => {

                window.open(httpConfig?.baseUrl2 + e, "_blank")

            }
        })
    }

    useEffect(() => { 
        reset()
    }, [importModal])

    return (
        <Modal
            isOpen={importModal}
            toggle={() => setImportModal(!importModal)}
            className='sidebar-sm'

            size="lg" style={{ maxWidth: '450px', width: '100%' }} >

            <ModalHeader toggle={() => setImportModal(!importModal)} tag='div'>
                <h5 className='modal-title text-primary'> Import Contact Group </h5>
            </ModalHeader>

            <ModalBody >

                <>
                    <div className='text-center'>
                        <Star size={20} />
                        <p className='mt-2'> Please Download This Excel File And Fill All The Details Accordingly After That You Can Upload The File To Import Your Items."</p>
                    </div>
                    <div className='text-center mb-1'>
                        <u onClick={sampleFile} style={{ cursor: "pointer" }}> Download Sample File </u>
                    </div>

                    <Form onSubmit={handleSubmit(submitHandler)}>
                        <Row>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="group_name"
                                    // value={edit?.group_name}
                                    className='mb-1'
                                    label="Group Name"
                                    errors={errors}
                                    rules={{ required: true }}
                                />

                            </Col>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="description"
                                    // value={edit?.description}
                                    className='mb-1'
                                    label="Description"
                                    errors={errors}
                                    rules={{ required: true }}
                                />

                            </Col>
                            <Col md="12">

                                <FormGroupCustom
                                    type={"file"}
                                    control={control}
                                    errors={errors}
                                    rules={{ required: true }}
                                    name="file_path"
                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    className='mb-1'
                                    label={"File"}

                                />
                            </Col>
                        </Row>
                        <div className='text-center'>
                            <LoadingButton loading={loading} type='submit' color="primary">
                                Upload
                            </LoadingButton>
                        </div>
                    </Form>
                </>
            </ModalBody>
        </Modal>

    )
}

export default ImportContactNumber
