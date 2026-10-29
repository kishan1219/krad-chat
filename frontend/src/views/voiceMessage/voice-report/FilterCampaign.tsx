// @ts-nocheck
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Form, Row } from 'reactstrap'
import { loadDlt } from '../../../utility/apis/dlt'
import { createAsyncSelectOptions, createConstSelectOptions } from '../../../utility/Utils'
import { loadUser } from '../../../utility/apis/userManagement'
import { actionFor, messageType, smsType } from '../../../utility/Const'
import FormGroupCustom from '../../components/formGroupCustom'
import Hide from '../../../utility/Hide'
import SideModal from '../../components/sideModal/sideModal'


const FilterCampaign = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const loginUser = useSelector(state => state.auth.userData)


    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
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

    const listDLT = async (search, loadedOptions, { page }) => {

        const res = await loadDlt({
            async: true,
            page,
            perPage: 25,
            jsonData: { template_name: search }
        })
        return createAsyncSelectOptions(res, page, "template_name", "id", setDlt)

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


    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)
        setOpen(false)
        handleFilterModal(false)
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
            title={'Filter Campaign'}
            done='filter'>
            <Form>

                <Hide IF={loginUser?.userType === 2}>
                    <FormGroupCustom

                        // defaultOptions
                        async
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
                    name={"campaign"}
                    type={"text"}
                    errors={errors}
                    label="Campaign"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />
                <FormGroupCustom
                    name={"voice_id"}
                    type={"text"}
                    errors={errors}
                    label="Voice ID"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />
                {/* 
                <FormGroupCustom
                    // defaultOptions
                    async
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
                /> */}


                <FormGroupCustom
                    name={"campaign_send_date"}
                    type={"date"}
                    errors={errors}
                    label={"Campaign Send Date"}
                    options={{
                        // enableTime: true,
                        // minDate: Date.now()
                    }}
                    dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                // values={edit?.out_time}
                />
                {/* <FormGroupCustom
                    name={"to_date"}
                    type={"date"}
                    errors={errors}
                    label={"To"}
                    options={{
                        // enableTime: true,
                        // minDate: Date.now()
                    }}
                    dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}

                /> */}

            </Form>
        </SideModal>
    )
}

export default FilterCampaign
