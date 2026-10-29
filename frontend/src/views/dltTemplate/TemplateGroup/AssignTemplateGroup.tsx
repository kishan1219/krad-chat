// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { X } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Form, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import { loadDlt } from '../../../utility/apis/dlt'
import { createAsyncSelectMultiMessageOptions, createAsyncSelectMultiOptions, createAsyncSelectMultiUserOptions, createAsyncSelectOptions } from '../../../utility/Utils'
import { assignTemplateGroupToUser, loadGroup } from '../../../utility/apis/templateGroup'
import FormGroupCustom from '../../components/formGroupCustom'
import LoadingButton from '../../components/buttons/LoadingButton'
import { loadUserChild } from '../../../utility/apis/userManagement'
import Hide from '../../../utility/Hide'

const AssignTemplateGroup = ({ templateModal, setTemplateModal, handleTemplateModal, open }) => {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [reportData, setReportData] = useState({

        dlt_template_ids: []
    })
    const [template, setTemplate] = useState(null)
    const [group, setGroup] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const loginUser = useSelector(state => state?.auth?.userData)
    const [rowsPerPage, setRowsPerPage] = useState(2)
    const [filterData, setFilterData] = useState({

    })

    const dispatch = useDispatch()
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleTemplateModal} />

    const listUser = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { search, is_visible_dlt_template_group: 1 }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }


    const listTemplate = async (search, loadedOptions, { page }) => {

        const res = await loadDlt({
            async: true,
            page,
            perPage: 25,
            jsonData: { search, user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : watch("user_id") }
        })
        return createAsyncSelectMultiOptions(res, page, "xName", "id", setTemplate)

    }

    const listTemplateGroup = async (search, loadedOptions, { page }) => {

        const res = await loadGroup({
            async: true,
            page,
            perPage: 25,
            jsonData: { search, user_id: watch("user_id") }
        })
        return createAsyncSelectOptions(res, page, "group_name", "id", setGroup)

    }

    const submitHandler = (data) => {
        assignTemplateGroupToUser({
            jsonData: {
                ...data
                // user_ids: data?.user_ids
                // dlt_template_ids: data?.dlt_template_ids

            },
            loading: setLoading,
            dispatch,
            success: (e) => {

                handleTemplateModal()
                // SuccessToast(null, {}, <div
                //     dangerouslySetInnerHTML={{ __html: e }}
                // />)
            }
        })
    }

    useEffect(() => {
        reset()
    }, [templateModal])

    return (
        <Modal
            isOpen={open}
            toggle={() => setTemplateModal(!templateModal)}
            className='sidebar-sm'
            size="lg" style={{ maxWidth: '450px', width: '100%' }} >

            <ModalHeader toggle={() => setTemplateModal(!templateModal)} tag='div'>
                <h5 className='modal-title text-primary'>Assign DLT Template Group</h5>
            </ModalHeader>

            <ModalBody>

                <>
                    <Form onSubmit={handleSubmit(submitHandler)}>
                        <Row>
                            {/* <Hide IF={} */}
                            <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2}>
                                <Col md="12">
                                    <FormGroupCustom
                                        async
                                        // defaultOptions
                                        loadOptions={listUser}
                                        label={"User"}
                                        type={"select"}
                                        control={control}
                                        name="user_id"
                                        isClearable
                                        // isMulti
                                        className='mb-1'
                                        errors={errors}
                                        options={user}
                                        rules={{ required: true }}
                                    />
                                </Col>

                            </Hide>
                            <Col md="12">

                                <FormGroupCustom
                                    async
                                    key={watch("user_id")}
                                    // defaultOptions
                                    loadOptions={listTemplate}
                                    label={"DLT Template"}
                                    type={"select"}
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
                            <Col md="12">

                                <FormGroupCustom
                                    async
                                    key={watch("user_id")}
                                    label={"Template Group"}
                                    type={"select"}
                                    loadOptions={listTemplateGroup}
                                    control={control}
                                    name="dlt_template_group_id"
                                    isClearable
                                    // isMulti
                                    className='mb-1'
                                    errors={errors}
                                    options={group}
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

export default AssignTemplateGroup
