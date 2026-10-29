// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions, createSelectOptions } from '../../utility/Utils'
import { assignRoute } from '../../utility/apis/adminOperation'
import { loadSecondaryRoute } from '../../utility/apis/seconday'
import { loadUser, readUser } from '../../utility/apis/userManagement'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

export default function AdminAssignRoute({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [secondary, setSecondary] = useState(null)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const [details, setDetails] = useState(null)
    const [sec, setSec] = useState(null)
    const dispatch = useDispatch()
    const [resetIt, setResetIt] = useState(new Date())
    const form = useForm({
        defaultValues: {
            user_id: null,
            promotional_route: null,
            transaction_route: null,
            two_waysms_route: null,
            voice_sms_route: null,
            otp_route: null
        }
    })
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form
    const [filterData, setFilterData] = useState({
        per_page_record: 10000
        // status: 1
    })

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
    }


    // const listSecondary = () => {
    //     loadSecondaryRoute({
    //         perPage: 15,
    //         loading: setLoading,
    //         dispatch,
    //         success: (e) => {
    //             setSecondary(createSelectOptions(e?.data?.data, "sec_route_name", "id"))

    //         }
    //     })
    // }

    // const listSecondary = async (search, loadedOptions, { page }) => {

    //     const res = await loadSecondaryRoute({
    //         async: true,
    //         page,
    //         perPage: 25,
    //         jsonData: { name: search, status: 1 }
    //     })
    //     return createAsyncSelectOptions(res, page, "sec_route_name", "id", setSecondary)

    // }

    const listSecondary = () => {
        loadSecondaryRoute({

            loading: setLoading,
            dispatch,
            success: (e) => {
                setSecondary(createSelectOptions(e?.data?.data, "sec_route_name", "id"))
                // setSec(e)
            },
            jsonData: filterData
        })
    }

    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUser({
            async: true,
            page,
            perPage: 10,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }

    const viewUser = (id) => {
        // if (edit?.id) {
        if (isValid(watch('user_id'))) {
            readUser({
                id: watch('user_id'),
                success: d => {
                    setDetails(d)
                    setValue('promotional_route', d?.promotional_route)
                    setValue('voice_sms_route', d?.voice_sms_route)
                    setValue('transaction_route', d?.transaction_route)
                    setValue('two_waysms_route', d?.two_waysms_route)
                    setValue('otp_route', d?.otp_route)
                }
            })
        }
        // }
    }

    log("details", details?.transaction_route)

    useEffect(() => {
        viewUser()
    }, [watch('user_id')])

    useEffect(() => {
        listSecondary()
    }, [])

    const handleSave = (data) => {

        assignRoute({
            jsonData: {
                ...data

            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                setResetIt(new Date()); reset()
                setDetails(null)
                setValue('promotional_route', null)
                setValue('voice_sms_route', null)
                setValue('transaction_route', null)
                setValue('two_waysms_route', null)
                setValue('otp_route', null)
                handleClose()
            },
            errors: (e) => {
                const d = e?.data?.data
                for (const key in d) {
                    if (Object.hasOwnProperty.call(d, key)) {
                        if (isValidArray(d[key])) {
                            const message = d[key]?.map(a => `${a} \n`)
                            setError(key, { message, type: "validate" })
                        }
                    }
                }

            }
        })
        // }
    }
    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                // modalClass="modal-lg"
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title="Assign Route">
                <form>
                    <CardBody>
                        <Row>

                            <Col md="12">
                                <FormGroupCustom

                                    // defaultOptions
                                    key={resetIt}
                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"user_id"}
                                    isClearable
                                    placeholder="Select User"
                                    className='mb-1'

                                    loadOptions={listUser}
                                    options={user}
                                    label="User"
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md="12">
                                {/* <FormGroupCustom

                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"promotional_route"}
                                    isClearable
                                    value={details?.promotional_route}
                                    placeholder="Select Promotional Route"
                                    className='mb-1'
                                    loadOptions={listSecondary}
                                    options={secondary}
                                    label="Promotional Route"
                                    rules={{ required: true }}
                                /> */}
                                <FormGroupCustom
                                    // key={resetIt}
                                    key={resetIt}
                                    defaultOptions
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"promotional_route"}
                                    isClearable
                                    value={details?.promotional_route}
                                    placeholder="Select Promotional Route"
                                    className='mb-1'
                                    loadOptions={listSecondary}
                                    options={secondary}
                                    label="Promotional Route"
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="12">
                                {/* <FormGroupCustom

                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"transaction_route"}
                                    isClearable
                                    value={details?.transaction_route}
                                    placeholder="Select Transaction Route"
                                    className='mb-1'
                                    loadOptions={listSecondary}
                                    options={secondary}
                                    label="Transaction Route"
                                    rules={{ required: true }}
                                /> */}
                                <FormGroupCustom
                                    key={resetIt}
                                    defaultOptions
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"transaction_route"}
                                    isClearable
                                    value={details?.transaction_route}
                                    placeholder="Select Transaction Route"
                                    className='mb-1'
                                    loadOptions={listSecondary}
                                    options={secondary}
                                    label="Transaction Route"
                                    rules={{ required: true }}
                                />

                            </Col>
                            <Col md="12">
                                {/* <FormGroupCustom
                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"two_waysms_route"}
                                    isClearable
                                    value={details?.two_waysms_route}
                                    className='mb-1'
                                    loadOptions={listSecondary}
                                    options={secondary}
                                    label="Two Way Sms Route"
                                    rules={{ required: false }}
                                /> */}
                                <FormGroupCustom
                                    key={resetIt}
                                    defaultOptions
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    value={details?.two_waysms_route}
                                    name={"two_waysms_route"}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={listSecondary}
                                    options={secondary}
                                    label="Two Way Sms Route"
                                    rules={{ required: false }}
                                // key={resetIt}
                                />
                            </Col>
                            <Col md="12">
                                {/* <FormGroupCustom

                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"voice_sms_route"}
                                    isClearable
                                    value={details?.voice_sms_route}
                                    className='mb-1'
                                    loadOptions={listSecondary}
                                    options={secondary}
                                    label="Voice Sms Route"
                                    rules={{ required: false }}
                                /> */}
                                <FormGroupCustom
                                    key={resetIt}

                                    defaultOptions
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"voice_sms_route"}
                                    isClearable
                                    value={details?.voice_sms_route}
                                    className='mb-1'
                                    loadOptions={listSecondary}
                                    options={secondary}
                                    label="Voice Sms Route"
                                    rules={{ required: false }}
                                // key={resetIt - `sfsdfsdfs${user?.voice_sms_route}-kmlskm`}
                                />
                            </Col>
                            <Col md="12">
                                {/* <FormGroupCustom

                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"otp_route"}
                                    value={details?.otp_route}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={listSecondary}
                                    options={secondary}
                                    label="OTP Route"
                                    rules={{ required: false }}
                                /> */}
                                <FormGroupCustom
                                    key={resetIt}

                                    defaultOptions
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"otp_route"}
                                    isClearable
                                    value={details?.otp_route}
                                    className='mb-1'
                                    loadOptions={listSecondary}
                                    options={secondary}
                                    label="OTP Route"
                                    rules={{ required: false }}
                                // key={resetIt - `sfsdfsdfs${user?.voice_sms_route}-kmlskm`}
                                />
                            </Col>

                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
