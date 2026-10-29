// @ts-nocheck
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Form, Row } from 'reactstrap'
import { loadUser } from '../../utility/apis/userManagement'
import { activeInactiveFilter, status } from '../../utility/Const'
import Hide from '../../utility/Hide'
import { createAsyncSelectOptions, createConstSelectOptions, createSelectOptions } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import SideModal from '../components/sideModal/sideModal'

const FilterSender = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const loginUser = useSelector(state => state.auth.userData)
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
            title={'Filter Sender ID'}
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
                    name={"company_name"}
                    type={"text"}
                    errors={errors}
                    label="Company Name"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
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
                    name={"header_id"}
                    type={"number"}
                    errors={errors}
                    label="Header Id"
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />
                <FormGroupCustom
                    name={"entity_id"}
                    type={"number"}
                    errors={errors}
                    label="Entity Id"
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
                    options={createConstSelectOptions(activeInactiveFilter)}
                />
              
            </Form>
        </SideModal>
    )
}

export default FilterSender
