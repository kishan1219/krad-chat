// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'reactstrap'
import { activeInactiveFilter, priority, senderIdMessageType, trueFalseFilter } from '../../utility/Const'
import Hide from '../../utility/Hide'
import { createAsyncSelectOptions, createConstSelectOptions } from '../../utility/Utils'
import { loadDlt } from '../../utility/apis/dlt'
import { loadSenderIds } from '../../utility/apis/senderIds'
import { loadUser } from '../../utility/apis/userManagement'
import FormGroupCustom from '../components/formGroupCustom'
import SideModal from '../components/sideModal/sideModal'

const FilterTemplate = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const loginUser = useSelector(state => state.auth.userData)
    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [sender, setSender] = useState(null)
    const [dlt, setDlt] = useState(null)

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        getValues,
        setError
    } = useForm()

    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)
        setOpen(false)
        handleFilterModal(false)
    }

    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUser({
            async: true,
            page,
            perPage: 25,
            jsonData: { name: search }
        })
        return createAsyncSelectOptions(res, page, "name", "id", setUser)

    }


    const listSender = async (search, loadedOptions, { page }) => {

        const res = await loadSenderIds({
            async: true,
            page,
            perPage: 25,
            jsonData: { sender_id: search },
            dispatch
        })
        return createAsyncSelectOptions(res, page, "sender_id", "sender_id", setSender)

    }


    const listDLT = async (search, loadedOptions, { page }) => {

        const res = await loadDlt({
            async: true,
            page,
            perPage: 25,
            jsonData: { dlt_template_id: search }
        })
        return createAsyncSelectOptions(res, page, "dlt_template_id", "dlt_template_id", setDlt)

    }

    // Show/Hide Modal
    useEffect(() => {
        if (show) setOpen(true)
        if (show) reset()
    }, [show])

    return (
        <SideModal
            loading={loading}
            handleSave={handleSubmit(submitFilter)}
            open={open}
            handleModal={() => {
                setOpen(false)
                handleFilterModal(false)

            }}
            title={'Filter DLT'}
            done='filter'>
            <Form>

                <Hide IF={loginUser?.userType === 2}>

                    <FormGroupCustom
                        async
                        // defaultOptions
                        setValue={setValue}
                        control={control}
                        type={"select"}
                        errors={errors}
                        name={"user_id"}
                        isClearable
                        className='mb-1'
                        loadOptions={listUser}
                        options={user}
                        label="User"


                    />

                </Hide>
                <FormGroupCustom
                    async
                    // defaultOptions
                    setValue={setValue}
                    control={control}
                    type={"select"}
                    errors={errors}
                    name={"sender_id"}
                    isClearable
                    className='mb-1'
                    loadOptions={listSender}
                    options={sender}
                    label="Sender ID"


                />
                <FormGroupCustom
                    name={"template_name"}
                    type={"text"}
                    errors={errors}
                    label="Template Name"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />

                <FormGroupCustom
                    async
                    // defaultOptions
                    setValue={setValue}
                    control={control}
                    type={"select"}
                    errors={errors}
                    name={"dlt_template_id"}
                    isClearable
                    className='mb-1'
                    loadOptions={listDLT}
                    options={dlt}
                    label="Dlt Template Id"
                />

                <FormGroupCustom
                    name={"header_id"}
                    type={"text"}
                    errors={errors}
                    label="Header Id"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />

                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="sender_id_type"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Message Type"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(senderIdMessageType)}
                />
                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="status"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Status"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(activeInactiveFilter)}
                />
                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="is_unicode"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Unicode"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(trueFalseFilter)}
                />
                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="priority"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Priority"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(priority)}
                />

            </Form>
        </SideModal>
    )
}

export default FilterTemplate
