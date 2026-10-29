// @ts-nocheck
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Col, Form, Row } from 'reactstrap'
import { loadPrimaryRoute } from '../../utility/apis/primaryRoutes'
import { status } from '../../utility/Const'
import { createAsyncSelectOptions, createConstSelectOptions, createSelectOptions } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import SideModal from '../components/sideModal/sideModal'

const FilterSecondary = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [primary, setPrimary] = useState(null

    )
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

    // useEffect(() => {
    //     if (open) {
    //         listPrimary()

    //     }
    // }, [open])

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
            title={'Filter Secondary '}
            done='filter'>
            <Form>
                <FormGroupCustom

                    // defaultOptions
                    async
                    setValue={setValue}
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
                    name={"sec_route_name"}
                    type={"text"}
                    errors={errors}
                    label="Secondary Route Name"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
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

export default FilterSecondary
