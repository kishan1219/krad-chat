// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { Star, X } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Button, Col, CustomInput, Form, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap'
import { dlrImport, dlrSampleFile } from '../../utility/apis/dlr'
import { loadPrimaryRoute } from '../../utility/apis/primaryRoutes'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import { createAsyncSelectOptions, createSelectOptions } from '../../utility/Utils'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'


const ImportDlr = ({ importModal, setImportModal, handleImport, open }) => {
    const [loading, setLoading] = useState(false)
    const { register, errors, handleSubmit, control, setError } = useForm()
    const [primary, setPrimary] = useState(null)
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleImport} />

    const dispatch = useDispatch()

    const submitHandler = (form) => {


        dlrImport({
            formData: {
                ...form,
                file_path: form?.file_path[0]

            },
            loading: setLoading,
            dispatch,
            success: (e) => {

                handleImport()
             
              
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


    const listPrimary = async (search, loadedOptions, { page }) => {

        const res = await loadPrimaryRoute({
            async: true,
            page,
            perPage: 25,
            jsonData: { route_name: search }
        })
        return createAsyncSelectOptions(res, page, "route_name", "id", setPrimary)

    }

    const sampleFile = () => {
        dlrSampleFile({
            success: (e) => {

                window.open(httpConfig?.baseUrl2 + e, "_blank")

            }
        })
    }

    return (
        <Modal
            isOpen={open}
            toggle={() => setImportModal(!importModal)}
            className='sidebar-sm'
            size="lg" style={{ maxWidth: '450px', width: '100%' }} >

            <ModalHeader toggle={() => setImportModal(!importModal)} tag='div'>
                <h5 className='modal-title text-primary'> Import Dlr </h5>
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
                                    async
                                    // defaultOptions
                                    // value={edit?.primary_route_id}
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"primary_route_id"}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={listPrimary}
                                    options={primary}
                                    label="Primary Route"
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md="12">

                                <FormGroupCustom
                                    type={"file"}
                                    control={control}
                                    errors={errors}
                                    message={"Please upload CSV & XLSX files Only."}
                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    rules={{ required: true }}
                                    name="file_path"
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

export default ImportDlr
