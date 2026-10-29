// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { gatewayType, transceiverMode } from '../../utility/Const'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { createAsyncSelectOptions, createConstSelectOptions, createSelectOptions } from '../../utility/Utils'
import { addPrimaryRoute, editPrimaryRoute, getVoiceSmscList, loadPrimaryRoute, readPrimaryRoute } from '../../utility/apis/primaryRoutes'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'
import { data } from 'jquery'


export default function AddPrimaryRoute({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const [read, setRead] = useState(null)
    const [voiceList, setVoiceList] = useState(null)
    const dispatch = useDispatch()
    const [primary, setPrimary] = useState(null)
    const form = useForm({
        defaultValues: {
            transceiver_mode: 1
        }
    })

    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form


    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
    }

    const listPrimary = async (search, loadedOptions, { page }) => {

        const res = await loadPrimaryRoute({
            async: true,
            page,
            perPage: 25,
            jsonData: { route_name: search, status: 1, gateway_type: watch("gateway_type") }
        })
        return createAsyncSelectOptions(res, page, "route_name", "id", setPrimary)

    }
    // const listVoiceRoute = async (search, loadedOptions, { page }) => {

    //     const res = await getVoiceSmscList({
    //         async: true,
    //         page,
    //         perPage: 25,
    //         jsonData:  data 
    //     })
    //     return createAsyncSelectOptions(res, page, "name", setVoiceList)

    // }

    // const listPrimary = () => {
    //     loadPrimaryRoute({
    //         perPage: 100,
    //         jsonData: { status: 1, gateway_type: watch("gateway_type") },
    //         success: (d) => {

    //             setPrimary(createSelectOptions(d?.data?.data, "route_name", "id"))
    //         }
    //     })

    // }

    const getPrimaryRoute = (data) => {
        readPrimaryRoute({
            id: edit?.id,
            loading: setLoading,
            success: setRead,
            jsonData: data
        })
    }

    const getVoiceList = () => {
        getVoiceSmscList({
            loading: setLoading,
            success: setVoiceList
            // jsonData: data
        })
    }

    useEffect(() => {
        if (isValid(edit) && open) {

            // getPrimaryRoute()
            getVoiceList()
        }
        if (open) {
            getVoiceList()
        }
    }, [edit, open])

    // const getPrimary
    // useEffect(() => {
    //     if (open) {
    //         listPrimary()
    //     }
    // }, [open, watch("gateway_type")])
    useEffect(() => {
        if (isValidArray(read?.associted_routes)) {
            setValue("associated_routes", read?.associted_routes)
        }
        if (isValid(read?.transceiver_mode)) {
            setValue("transceiver_mode", read?.transceiver_mode)
        }
        // setValue("associated_routes", watch("gateway_type"))
    }, [read])

    useEffect(() => {
        setValue("associated_routes", "")
        setRead({
            ...read,
            associted_routes: []
        })
    }, [watch("gateway_type")])

    const handleSave = (data) => {
        if (edit?.id) {
            editPrimaryRoute({
                id: edit?.id,
                jsonData: {
                    ...data,
                    voice: data?.voice === 1 ? 1 : 0,
                    log_file: data?.log_file === 1 ? 1 : 0,
                    // port: data?.port === null ? 0 : data?.port
                    port: watch("gateway_type") === 4 ? 0 : data?.port
                    // transceiver_mode: data?.transceiver_mode === null ? "1" : data?.transceiver_mode
                },
                dispatch,
                loading: setLoading,
                success: (d) => {
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
        } else {
            addPrimaryRoute({
                jsonData: {
                    ...data,
                    voice: data?.voice === 1 ? 1 : 0,
                    log_file: data?.log_file === 1 ? 1 : 0,
                    port: watch("gateway_type") === 4 ? 0 : data?.port
                    // transceiver_mode: data?.transceiver_mode === null ? 1 : data?.transceiver_mode
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
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
        }
     
    }

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-xl"
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title="Primary Route">
                <form>
                    <CardBody>
                        <Row>
                            <Col md="3">
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="gateway_type"
                                    value={edit?.gateway_type ?? 1}
                                    isClearable
                                    label="Gateway Type"
                                    errors={errors}
                                    options={createConstSelectOptions(gatewayType)}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="route_name"
                                    value={edit?.route_name}
                                    className='mb-1'
                                    label="Route Name"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="smpp_credit"
                                    value={edit?.smpp_credit ?? 100000000}
                                    className='mb-1'
                                    label={watch("gateway_type") === 4 ? "Voice Credit" : "Smpp Credit"}
                                    errors={errors}
                                    min="1"
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Hide IF={watch("gateway_type") === 4}>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="smsc_id"
                                        value={edit?.smsc_id}
                                        className='mb-1'
                                        // label="Smsc ID"
                                        label={watch("gateway_type") === 4 ? "Voice ID" : "Smsc ID"}

                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Hide>

                            <Show IF={watch("gateway_type") === 4}>
                                <Col md="3">
                                    <FormGroupCustom
                                        // async
                                        defaultOptions
                                        type={"select"}
                                        control={control}
                                        name="smsc_id"
                                        value={edit?.smsc_id}
                                        isClearable
                                        label={watch("gateway_type") === 4 ? "Voice ID" : "Smsc ID"}
                                        errors={errors}
                                        // loadOptions={listVoiceRoute}
                                        options={createSelectOptions(voiceList ?? [], "name", "name")}

                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Show>

                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="ip_address"
                                    value={edit?.ip_address}
                                    className='mb-1'
                                    label="IP Address"
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Hide IF={watch("gateway_type") === 4}>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="port"
                                        min="1"
                                        value={edit?.port}
                                        className='mb-1'
                                        label="Port"
                                        errors={errors}
                                        rules={{ required: true, min: "1" }}

                                    />
                                </Col>
                            </Hide>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="smsc_username"
                                    value={edit?.smsc_username}
                                    className='mb-1'
                                    label={watch("gateway_type") === 4 ? "Voice Username" : "Smsc Username"}
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>

                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="smsc_password"
                                    value={edit?.smsc_password}
                                    className='mb-1'
                                    message={"Password must be of atleast 6 Character"}
                                    label={watch("gateway_type") === 4 ? "Voice Password" : "Smsc Password"}
                                    minLength="6"
                                    errors={errors}
                                    rules={{ required: true, minLength: "6" }}
                                />
                            </Col>

                            <Hide IF={watch("gateway_type") === 4}>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="system_type"
                                        value={edit?.system_type ?? "SMPP"}
                                        className='mb-1'
                                        label="System Type"
                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Hide>
                            <Show IF={watch("gateway_type") === 4}>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="system_type"
                                        value={edit?.system_type ?? "Voice"}
                                        className='mb-1'
                                        label="System Type"
                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Show>

                            <Hide IF={watch("gateway_type") === 4}>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="throughput"
                                        value={edit?.throughput ?? 50}
                                        className='mb-1'
                                        label="Throughput"
                                        errors={errors}
                                        min="1"
                                        rules={{ required: true, min: "1" }}

                                    />
                                </Col>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="reconnect_delay"
                                        value={edit?.reconnect_delay ?? 10}
                                        className='mb-1'
                                        label="Reconnect Delay"
                                        errors={errors}
                                        min="1"
                                        rules={{ required: true }}

                                    />
                                </Col>

                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="enquire_link_interval"
                                        value={edit?.enquire_link_interval ?? 30}
                                        className='mb-1'
                                        label="Enquire Link Interval"
                                        errors={errors}
                                        min="0"
                                        rules={{ required: true }}

                                    />
                                </Col>

                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="max_pending_submits"
                                        value={edit?.max_pending_submits ?? 100}
                                        className='mb-1'
                                        label="Max Pending Submits"
                                        errors={errors}
                                        min="0"
                                        rules={{ required: true, min: "0" }}

                                    />
                                </Col>

                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="source_addr_ton"
                                        value={edit?.source_addr_ton ?? '0'}
                                        className='mb-1'
                                        label="Source Addr Ton"
                                        // min="0"
                                        errors={errors}
                                        rules={{ required: true }}
                                    />
                                </Col>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="source_addr_npi"
                                        value={edit?.source_addr_npi ?? 1}
                                        className='mb-1'
                                        label="Source Addr Npi"
                                        min="0"
                                        errors={errors}
                                        rules={{ required: true, min: "0" }}
                                    />
                                </Col>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="dest_addr_ton"
                                        value={read?.dest_addr_ton ?? '0'}
                                        className='mb-1'
                                        label="Dest Addr Ton"
                                        // min="0"
                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>
                                <Col md="2" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="dest_addr_npi"
                                        value={edit?.dest_addr_npi ?? 1}
                                        className='mb-1'
                                        label="Dest Addr Npi"
                                        min="0"
                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>


                                <Col md="2" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="log_level"
                                        value={edit?.log_level ?? 3}
                                        className='mb-1'
                                        label="Log Level"
                                        min="0"
                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>
                                <Col md="2" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="instances"
                                        value={edit?.instances ?? 1}
                                        className='mb-1'
                                        label="Instances"
                                        min="0"
                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"select"}
                                        control={control}
                                        name="transceiver_mode"
                                        value={watch("transceiver_mode") ?? 1}

                                        isClearable
                                        label="Transceiver Mode"
                                        errors={errors}

                                        options={createConstSelectOptions(transceiverMode)}
                                        rules={{ required: false }}

                                    />
                                </Col>
                            </Hide>
                            <Show IF={watch("transceiver_mode") === 0}>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="receiver_port"
                                        value={edit?.receiver_port}
                                        className='mb-1'
                                        label="Receiver Port"
                                        // min="0"
                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Show>

                            <Show IF={watch("gateway_type") === 4}>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="receiver_port"
                                        value={edit?.api_url_for_voice}
                                        className='mb-1'
                                        label="API URL for Voice"
                                        // min="0"
                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Show>
                            <Hide IF={watch('gateway_type') === 4}>
                                <Col md="3">

                                    <FormGroupCustom
                                        isMulti
                                        async
                                        // defaultOptions
                                        key={`associate-routesad-${watch("gateway_type") ?? read?.associted_routes}`}
                                        // key={read?.associted_routes}
                                        value={read?.associted_routes}
                                        control={control}
                                        type={"select"}
                                        errors={errors}
                                        isOptionDisabled={(op, val) => {
                                            return (edit?.id === op?.value)
                                        }}
                                        // isDisabled={watch("transceiver_mode") === 1}
                                        name={"associated_routes"}
                                        isClearable
                                        className='mb-1'
                                        loadOptions={listPrimary}
                                        options={primary}
                                        label="Associated Routes"
                                        rules={{ required: false }}

                                    />
                                </Col>
                            </Hide>
                            <Hide IF={watch("gateway_type") === 4}>
                                <Col md="2" xs="12" >
                                    <FormGroupCustom
                                        type={"checkbox"}
                                        control={control}
                                        name="voice"
                                        value={edit?.voice}
                                        className='mb-1 mt-2'
                                        label="Voice"
                                        errors={errors}

                                    />

                                </Col>
                            </Hide>
                            <Show IF={watch("gateway_type") === 4}>
                                <Col md="2" xs="12" >
                                    <FormGroupCustom
                                        type={"checkbox"}
                                        control={control}
                                        name="voice"
                                        disabled
                                        value={1}
                                        className='mb-1 mt-2'
                                        label="Voice"
                                        errors={errors}

                                    />

                                </Col>
                            </Show>
                            <Hide IF={watch("gateway_type") === 4}>
                                <Col md="2" xs="12" >
                                    <FormGroupCustom
                                        type={"checkbox"}
                                        control={control}
                                        name="log_file"
                                        value={edit?.log_file}
                                        className='mb-1 mt-2'
                                        label="Log File"
                                        errors={errors}

                                    />
                                </Col>
                            </Hide>

                        </Row>

                        <Hide IF={isValid(edit)}>

                            <hr />

                            <Row className='mb-2'>

                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="sec_route_name"
                                        value={edit?.sec_route_name}
                                        className='mb-1'
                                        label="Secondary Route Name"
                                        errors={errors}
                                        rules={{ required: true }}
                                    />
                                </Col>

                            </Row>
                        </Hide>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
