// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'reactstrap'
import { actionFor, messageType, onlyCampaign, scheduleCampaignFilter, smsType } from '../../utility/Const'
import Hide from '../../utility/Hide'
import { createAsyncSelectOptions, createConstSelectOptions } from '../../utility/Utils'
import { loadDlt } from '../../utility/apis/dlt'
import { loadUser } from '../../utility/apis/userManagement'
import FormGroupCustom from '../components/formGroupCustom'
import SideModal from '../components/sideModal/sideModal'

const FilterCampaign = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [dlt, setDlt] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)

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

    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUser({
            async: true,
            page,
            perPage: 25,
            jsonData: { name: search }
        })
        return createAsyncSelectOptions(res, page, "name", "id", setUser)

    }

    const listDLT = async (search, loadedOptions, { page }) => {

        const res = await loadDlt({
            async: true,
            page,
            perPage: 25,
            jsonData: { template_name: search }
        })
        return createAsyncSelectOptions(res, page, "template_name", "id", setDlt)

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
                    type={"select"}
                    control={control}
                    name="only_campaign"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Only Campaign"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(onlyCampaign)}
                />

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
                    type={"select"}
                    control={control}
                    name="route_type"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Route Type"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(actionFor)}
                />

                <FormGroupCustom
                    name={"sender_id"}
                    type={"text"}
                    errors={errors}
                    label="Sender Id"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />

                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="message_type"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Message Type"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(messageType)}
                />
                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="sms_type"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Sms Type"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(smsType)}
                />
                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="is_campaign_scheduled"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Campaign Type"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(scheduleCampaignFilter)}
                />

                <FormGroupCustom
                    name={"campaign_send_date_time"}
                    type={"date"}
                    errors={errors}
                    label="Schedule Date"
                    dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />
            </Form>
        </SideModal>
    )
}

export default FilterCampaign
