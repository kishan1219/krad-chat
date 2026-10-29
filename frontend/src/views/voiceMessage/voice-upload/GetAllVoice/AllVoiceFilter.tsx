// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Form } from 'reactstrap'
import { loadUploadVoice } from '../../../../utility/apis/voiceUpload'
import { createAsyncSelectOptions, createAsyncSelectVoiceTemplateOptions } from '../../../../utility/Utils'
import SideModal from '../../../components/sideModal/sideModal'
import FormGroupCustom from '../../../components/formGroupCustom'
import { loadSecondaryRoute } from '../../../../utility/apis/seconday'

const AllVoiceFilter = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [secondary, setSecondary] = useState([])
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
            ...d,
            primary_routes_id: d.primary_routes_id?.id
        })
        // console.log(d)
        setOpen(false)
        handleFilterModal(false)
    }

    const listSecondary = async (search, loadedOptions, { page }) => {

        const res = await loadSecondaryRoute({
            async: true,
            page,
            perPage: 25,
            jsonData: { name: search, status: 1, gateway_type: 4 }
        })
        return createAsyncSelectOptions(res, page, "sec_route_name", "id", setSecondary)

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
            title={'Voice Filter'}
            done='filter'>
            <Form>

                <FormGroupCustom
                    name={"title"}
                    type={"text"}
                    errors={errors}
                    label="Title"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />
                <FormGroupCustom
                    name={"file_status"}
                    type={"text"}
                    errors={errors}
                    label="Status"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />


                <FormGroupCustom
                    async
                    // defaultOptions
                    control={control}
                    type={"select"}
                    errors={errors}
                    name={"primary_routes_id"}
                    isClearable
                    className='mb-1'
                    loadOptions={listSecondary}
                    options={secondary}
                    label="Route"
                    rules={{ required: false }}
                />

            </Form>
        </SideModal>
    )
}

export default AllVoiceFilter
