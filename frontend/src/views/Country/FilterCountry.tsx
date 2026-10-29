// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'reactstrap'
import FormGroupCustom from '../components/formGroupCustom'
import SideModal from '../components/sideModal/sideModal'


const FilterCountry = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const loginUser = useSelector(state => state.auth.userData)
    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [sender, setSender] = useState(null)
    const [template, setTemplate] = useState(null)

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
            title={'Country Filter'}
            done='filter'>
            
            <Form>
            
                <FormGroupCustom
                    name={"name"}
                    type={"text"}
                    errors={errors}
                    label="Country Name"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />
                <FormGroupCustom
                    name={"currency"}
                    type={"text"}
                    errors={errors}
                    label="Currency"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />
                <FormGroupCustom
                    name={"currency_code"}
                    type={"text"}
                    errors={errors}
                    label="Currency Code"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />
                <FormGroupCustom
                    name={"phonecode"}
                    type={"text"}
                    errors={errors}
                    label="Phone Code"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />
               

            </Form>
        </SideModal>
    )
}

export default FilterCountry
