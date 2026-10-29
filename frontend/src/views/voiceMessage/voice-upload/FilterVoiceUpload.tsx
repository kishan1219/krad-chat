// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Form } from 'reactstrap'


import { createAsyncSelectVoiceTemplateOptions } from '../../../utility/Utils'
import { loadUploadVoice } from '../../../utility/apis/voiceUpload'
import SideModal from '../../components/sideModal/sideModal'
import FormGroupCustom from '../../components/formGroupCustom'

const FilterVoiceUpload = ({ show, handleFilterModal, setFilterData, filterData }) => {

    const [open, setOpen] = useState(show)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [template, setTemplate] = useState([])
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
            voice_id: d.voice_id?.id
        })
        // console.log(d)
        setOpen(false)
        handleFilterModal(false)
    }

    const listVoiceTemplate = async (search, loadedOptions, { page }) => {

        const res = await loadUploadVoice({
            async: true,
            page,
            perPage: 100,
            jsonData: {

                sender_id_type: 1,
                file_status: 1,
                search
            }
        })
        return createAsyncSelectVoiceTemplateOptions(res, page, "xName", null, setTemplate)


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
                    defaultOptions
                    async
                    control={control}
                    type={"select"}
                    errors={errors}
                    name={"voice_id"}
                    key={`templte-form`}
                    // key={`templte-form-${watch('user_id')?.id}-${rSelected}`}
                    isClearable
                    className='mb-1'
                    loadOptions={listVoiceTemplate}
                    options={template}

                    label="Voice Template"
                    rules={{ required: false }}

                />


            </Form>
        </SideModal>
    )
}

export default FilterVoiceUpload
