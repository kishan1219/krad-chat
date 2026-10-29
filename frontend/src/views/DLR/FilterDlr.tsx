// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Form } from 'reactstrap'
import { createAsyncSelectOptions } from '../../utility/Utils'
import { loadPrimaryRoute } from '../../utility/apis/primaryRoutes'
import FormGroupCustom from '../components/formGroupCustom'
import SideModal from '../components/sideModal/sideModal'

const FilterDlr = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [primary, setPrimary] = useState(null)

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

    const listPrimary = async (search, loadedOptions, { page }) => {

        const res = await loadPrimaryRoute({
            async: true,
            page,
            perPage: 25,
            jsonData: { route_name: search }
        })
        return createAsyncSelectOptions(res, page, "route_name", "id", setPrimary)

    }

    const submitFilter = (d) => {
        setFilterData({
            ...d,
            filterData
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
            title={'DLR Filter'}
            done='filter'>
            <Form>

                <FormGroupCustom

                    async
                    control={control}
                    type={"select"}
                    errors={errors}
                    name={"primary_route_id"}
                    isClearable
                    className='mb-1'
                    loadOptions={listPrimary}
                    options={primary}
                    label="Primary Route"

                />
                <FormGroupCustom
                    name={"name"}
                    type={"text"}
                    errors={errors}
                    label="Name"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />
                <FormGroupCustom
                    name={"dlr_code"}
                    type={"number"}
                    errors={errors}
                    label="DLR Code"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />

            </Form>
        </SideModal>
    )
}

export default FilterDlr
