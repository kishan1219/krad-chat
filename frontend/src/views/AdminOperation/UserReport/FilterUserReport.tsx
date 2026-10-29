// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'reactstrap'
import { loadGroup } from '../../../utility/apis/templateGroup'
import { loadUser } from '../../../utility/apis/userManagement'
import { createAsyncSelectOptions, createConstSelectOptions } from '../../../utility/Utils'
import Hide from '../../../utility/Hide'
import { Months, getUserMonthlyReportMessageType, getYearList } from '../../../utility/Const'
import SideModal from '../../components/sideModal/sideModal'
import FormGroupCustom from '../../components/formGroupCustom'

const FilterUserReport = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const loginUser = useSelector(state => state.auth.userData)
    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [group, setGroup] = useState(null)

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

    const listGroup = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadGroup({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { search }
        })
        return createAsyncSelectOptions(res, page, "group_name", "group_name", setGroup)
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
            title={'Filter Monthly Report'}
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
                    type={"select"}
                    control={control}
                    name="group_name"
                    isClearable
                    defaultOptions
                   
                    loadOptions={listGroup}
                    className='mb-1'
                    label="Template Group"
                    errors={errors}
                    options={group}
                    rules={{ required: false }}

                />
                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="month"                   
                    isClearable
                    className='mb-1'
                    label="Month"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(Months)}
                    rules={{ required: false }}
                />

                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="year"
                   
                    isClearable
                    className='mb-1'
                    label="Year"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={getYearList()}
                    rules={{ required: false }}

                />
                 <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="message_type"                   
                    isClearable
                    className='mb-1'
                    label="Message Type"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(getUserMonthlyReportMessageType)}
                    rules={{ required: false }}
                />

            </Form>
        </SideModal>
    )
}

export default FilterUserReport
