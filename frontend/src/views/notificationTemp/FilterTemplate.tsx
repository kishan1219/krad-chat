// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Form } from 'reactstrap'
import { trueFalseFilter } from '../../utility/Const'
import { createConstSelectOptions } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import SideModal from '../components/sideModal/sideModal'

const FilterTemplate = ({ show, handleFilterModal, setFilterData, filterData }) => {

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
            title={'User Filter'}
            done='filter'>
            <Form>

                <FormGroupCustom
                    name={"notification_for"}
                    type={"text"}
                    errors={errors}
                    label="Notification For"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                />
                <FormGroupCustom
                    name={"mail_subject"}
                    type={"text"}
                    errors={errors}
                    label="Mail Subject"
                    // dateFormat={"YYYY-MM-DD"}
                    setValue={setValue}
                    className="mb-2"
                    control={control}
                    rules={{ required: false }}
                />
           
                <FormGroupCustom
                    type={"select"}
                    control={control}
                    name="is_deletable"
                    setValue={setValue}
                    // value={edit?.priority}
                    isClearable
                    className="mb-2"
                    label="is Deletable?"
                    errors={errors}
                    // label={FM("vacation-trip")}
                    options={createConstSelectOptions(trueFalseFilter)}
                />
              
            </Form>
        </SideModal>
    )
}

export default FilterTemplate
