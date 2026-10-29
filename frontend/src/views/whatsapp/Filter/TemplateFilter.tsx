// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'reactstrap'
import { loadUser } from '../../../utility/apis/userManagement'
import { createAsyncSelectOptions, createConstSelectOptions } from '../../../utility/Utils'
import SideModal from '../../components/sideModal/sideModal'
import Hide from '../../../utility/Hide'
import FormGroupCustom from '../../components/formGroupCustom'
import { categoryType, templateType, whatsAppLanguages } from '../../../utility/Const'

const TemplateFilter = ({ show, handleFilterModal, setFilterData, filterData }) => {

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

    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUser({
            async: true,
            page,
            perPage: 25,
            jsonData: { name: search }
        })
        return createAsyncSelectOptions(res, page, "name", "id", setUser)

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
            title={'Template Filter'}
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
                    name={"template_name"}
                    type={"number"}
                    errors={errors}
                    label="Template Name"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />


                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="template_language"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Template Language"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(whatsAppLanguages)}
                />
                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="template_type"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Template Type"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(templateType)}
                />
                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="category"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="Category"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(categoryType)}
                />

            </Form>
        </SideModal>
    )
}

export default TemplateFilter
