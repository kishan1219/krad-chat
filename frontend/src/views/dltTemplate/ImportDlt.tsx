// @ts-nocheck
import React, { useState } from 'react'
import { Star, X } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Form, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import Show from '../../utility/Show'
import { createAsyncSelectMultiUserOptions } from '../../utility/Utils'
import { dltImport, dltSampleFile } from '../../utility/apis/dlt'
import { loadUserChild } from '../../utility/apis/userManagement'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'

const ImportDlt = ({ importModal, setImportModal, handleImport, open, preload }) => {
    const loginUser = useSelector(state => state.auth.userData)
    const [loading, setLoading] = useState(false)
    const { register, errors, handleSubmit, control } = useForm()
    const [user, setUser] = useState(null)
    const [dlt, setDlt] = useState(null)
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleImport} />

    const dispatch = useDispatch()


    const submitHandler = (form) => {

        dltImport({
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

    
    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 10,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }
   
    const sampleFile = () => {
        dltSampleFile({
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
                <h5 className='modal-title text-primary'> Import DLT Template </h5>
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
                            <Show IF={loginUser?.userType === 0 || loginUser === 3}>
                                <Col md="12">
                                    <FormGroupCustom
                                        async
                                        loadOptions={listUser}
                                        type={"select"}
                                        control={control}
                                        name="user_id"
                                        isClearable
                                        className='mb-1'
                                        label="User "
                                        errors={errors}
                                        options={user}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Show>

                            <Col md="12">
                                <FormGroupCustom
                                    type={"file"}
                                    control={control}
                                    errors={errors}
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

export default ImportDlt
