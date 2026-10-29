// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { X } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Button, Card, CardBody, Col, Form, FormGroup, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { assignDltToUser, dltAction, loadDlt } from '../../utility/apis/dlt'
import { assignSenderID, loadSenderIds } from '../../utility/apis/senderIds'
import { loadUser, loadUserChild } from '../../utility/apis/userManagement'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions, createSelectOptions } from '../../utility/Utils'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'

const ActionSenderID = ({ userModal, setUserModal, handleModal, open, preload }) => {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [reportData, setReportData] = useState({

        dlt_template_ids: []
    })
    const [template, setTemplate] = useState(null)
    const [sender, setSender] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(2)
    const [filterData, setFilterData] = useState({

    })

    const dispatch = useDispatch()
   

    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }
   

    useEffect(() => {
        reset()
    }, [userModal])

    const listSenderId = async (search, loadedOptions, { page }) => {

        const res = await loadSenderIds({
            async: true,
            page,
            perPage: 25,
            jsonData: { sender_id: search }
        })
        return createAsyncSelectOptions(res, page, "sender_id", "id", setSender)

    }


    const submitHandler = (data) => {
        assignSenderID({
            jsonData: {
                ...data
                // user_ids: data?.user_ids,
                // dlt_template_ids : data?.dlt_template_ids

            },
            loading: setLoading,
            success: (e) => {

                handleModal()
                preload()
                // SuccessToast(null, {}, <div
                //     dangerouslySetInnerHTML={{ __html: e }}
                // />)
            }
        })
    }
    return (
        <Modal
            isOpen={userModal}
            toggle={() => setUserModal(!userModal)}
            // toggle={() => setUserModal(!userModal)}
            className='sidebar-sm'
            size="lg" style={{ maxWidth: '450px', width: '100%' }} >

            <ModalHeader toggle={() => setUserModal(!userModal)}> Assign Sender ID</ModalHeader>
            <ModalBody>

                <>
                    <Form onSubmit={handleSubmit(submitHandler)}>
                        <Row>
                            <Col md="12">

                                <FormGroupCustom
                                    async
                                    loadOptions={listUser}
                                    label={"Select User"}
                                    type={"select"}
                                    control={control}
                                    name="user_ids"
                                    isClearable
                                    isMulti
                                    defaultOptions
                                    className='mb-1'

                                    errors={errors}
                                    rules={{ required: true }}
                                // options={user}


                                />
                            </Col>
                            <Col md="12">

                                <FormGroupCustom
                                    async
                                    loadOptions={listSenderId}
                                    label={"Select Sender ID"}
                                    type={"select"}
                                    control={control}
                                    name="sender_ids"
                                    isClearable
                                    isMulti

                                    className='mb-1'

                                    errors={errors}
                                    options={sender}
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

export default ActionSenderID
