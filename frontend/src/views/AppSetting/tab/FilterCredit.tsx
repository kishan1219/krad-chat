// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Form } from 'reactstrap'
import { actionFor } from '../../../utility/Const'
import { createConstSelectOptions } from '../../../utility/Utils'
import FormGroupCustom from '../../components/formGroupCustom'
import SideModal from '../../components/sideModal/sideModal'

const FilterCredit = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)

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
            title={'Credit Filter'}
            done='filter'>
            <Form>
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
                    options={createConstSelectOptions(actionFor)}
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
                    name={"email"}
                    type={"text"}
                    errors={errors}
                    label="Email"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />
                <FormGroupCustom
                    name={"mobile"}
                    type={"number"}
                    errors={errors}
                    label="Mobile Number"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />
                <FormGroupCustom
                    name={"username"}
                    type={"text"}
                    errors={errors}
                    label="User Name"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
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
                    options={createConstSelectOptions(status)}
                />

            </Form>
        </SideModal>
    )
}

export default FilterCredit
