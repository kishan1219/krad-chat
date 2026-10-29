// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { X } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Col, Form, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import { createAsyncSelectMultiOptions, createAsyncSelectMultiUserOptions } from '../../utility/Utils'
import { assignDltToUser, loadDlt } from '../../utility/apis/dlt'
import { loadUserChild } from '../../utility/apis/userManagement'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'

const AssignUser = ({ userModal, setUserModal, handleModal, open }) => {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [reportData, setReportData] = useState({

        dlt_template_ids: []
    })
    const [template, setTemplate] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(2)
    const [filterData, setFilterData] = useState({

    })

    const dispatch = useDispatch()
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }

    const listTemplate = async (search, loadedOptions, { page }) => {

        const res = await loadDlt({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiOptions(res, page, "xName", "id", setTemplate)

    }

    const submitHandler = (data) => {
        assignDltToUser({
            jsonData: {
                ...data,
                user_ids: data?.user_ids
                // dlt_template_ids: data?.dlt_template_ids

            },
            loading: setLoading,
            dispatch,
            success: (e) => {

                handleModal()
                // SuccessToast(null, {}, <div
                //     dangerouslySetInnerHTML={{ __html: e }}
                // />)
            }
        })
    }

useEffect(() => {
    reset()
}, [userModal])

    return (
        <Modal
            isOpen={open}
            toggle={() => setUserModal(!userModal)}
            className='sidebar-sm'
            size="lg" style={{ maxWidth: '450px', width: '100%' }} >

            <ModalHeader toggle={() => setUserModal(!userModal)} tag='div'>
                <h5 className='modal-title text-primary'>Assign DLT Template</h5>
            </ModalHeader>

            <ModalBody>

                <>
                    <Form onSubmit={handleSubmit(submitHandler)}>
                        <Row>
                            <Col md="12">

                                <FormGroupCustom
                                    async
                                    // defaultOptions
                                    loadOptions={listUser}
                                    label={"Select User"}
                                    type={"select"}
                                    control={control}
                                    name="user_ids"
                                    isClearable
                                    isMulti
                                    className='mb-1'
                                    errors={errors}
                                    options={user}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="12">

                                <FormGroupCustom
                                    async
                                    label={"Select Template"}
                                    type={"select"}
                                    loadOptions={listTemplate}
                                    control={control}
                                    name="dlt_template_ids"
                                    isClearable
                                    isMulti
                                    className='mb-1'
                                    errors={errors}
                                    options={template}
                                    rules={{ required: true }}

                                />
                            </Col>
                        </Row>
                        <div className='text-center'>
                            <LoadingButton loading={loading} type='submit' color="primary">
                                Assign
                            </LoadingButton>
                        </div>
                    </Form>
                </>
            </ModalBody>
        </Modal>

      
    )
}

export default AssignUser
