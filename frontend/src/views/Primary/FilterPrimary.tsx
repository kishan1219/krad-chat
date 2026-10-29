// @ts-nocheck
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Col, Form, Row } from 'reactstrap'
import { status } from '../../utility/Const'
import { createConstSelectOptions } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import SideModal from '../components/sideModal/sideModal'

const FilterPrimary = ({ show, handleFilterModal, setFilterData, filterData }) => {

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
            ...d
            // filterData
        })

        setOpen(false)
        handleFilterModal(false)
        // reset()
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
            title={'SMPP Filter'}
            done='filter'>

            <Form>

                <FormGroupCustom
                    name={"route_name"}
                    type={"text"}
                    errors={errors}
                    label="Route Name"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />
                <FormGroupCustom
                    name={"smsc_id"}
                    type={"text"}
                    errors={errors}
                    label="SMSC ID"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />
                <FormGroupCustom
                    name={"ip_address"}
                    type={"text"}
                    errors={errors}
                    label="IP Address"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />

                <FormGroupCustom
                    name={"port"}
                    type={"number"}
                    errors={errors}
                    label="Port"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />
                <FormGroupCustom
                    name={"smsc_username"}
                    type={"text"}
                    errors={errors}
                    label="SMSC Username"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />
              
            </Form>
        </SideModal>
    )
}

export default FilterPrimary
