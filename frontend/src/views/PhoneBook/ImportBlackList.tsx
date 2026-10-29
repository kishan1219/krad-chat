// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { Star, X } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Button, Col, CustomInput, Form, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap'
import { blacklistImport, blacklistSampleFile } from '../../utility/apis/blacklist'
import { dlrImport } from '../../utility/apis/dlr'
import { loadPrimaryRoute } from '../../utility/apis/primaryRoutes'
import { isValid, log } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import { createSelectOptions } from '../../utility/Utils'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'


const ImportBlackList = ({ importModal, setImportModal, handleImport, open }) => {
    const [loading, setLoading] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [primary, setPrimary] = useState(null)
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleImport} />

    const dispatch = useDispatch()

    const submitHandler = (form) => {

        blacklistImport({
            formData: {
                ...form,
                file_path: form?.file_path[0]

            },
            loading: setLoading,
            dispatch,
            success: (e) => {

                handleImport()
                   
            }
        })
    }

    const sampleFile = () => {
        blacklistSampleFile({
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
                <h5 className='modal-title text-primary'> Import BlackList </h5>
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

export default ImportBlackList
