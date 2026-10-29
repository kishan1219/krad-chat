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
import { whatsappFileType } from '../../../utility/Const'
import { getWhatsappTemplateLanguage } from '../../../utility/apis/whatsappTemplate'

const WhatsappReportFilter = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const loginUser = useSelector(state => state.auth.userData)
    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [sender, setSender] = useState(null)
    const [config, setConfig] = useState(null)
    const [loadLanguage, setLoadLanguage] = useState(null)
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

    const whatsappTemplateLanguage = () => {
        getWhatsappTemplateLanguage({
            loading: setLoading,
            success: (d) => {
                const drop = []
                const object = d
                // log('object', object)
                for (const key in object) {
                    if (Object.hasOwnProperty.call(object, key)) {
                        const element = object[key]
                        drop.push({ value: element, label: key })
                    }
                }
                setLoadLanguage(drop)
            }

        })
    }

    useEffect(() => {
        whatsappTemplateLanguage()
    }, [])


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
            title={'Whatsapp Media Filter'}
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
                    // key={resetIt}
                    // key={resetIt}
                    defaultOptions
                    control={control}
                    type={"select"}
                    errors={errors}
                    name={"template_language"}
                    isClearable
                    // value={'en'}
                    placeholder="Select Language"
                    className='mb-1'
                    loadOptions={whatsappTemplateLanguage}
                    options={loadLanguage}
                    label="Select Language"
                    rules={{ required: false }}
                />
                {/* 
            <FormGroupCustom
                type={"select"}
                control={control}
                name="file_type"
                isClearable
                className="mb-1"
                label={"File Type"}
                errors={errors}
                options={createConstSelectOptions(whatsappFileType)}
                rules={{ required: false }}
            /> */}
            </Form>
        </SideModal>
    )
}

export default WhatsappReportFilter
