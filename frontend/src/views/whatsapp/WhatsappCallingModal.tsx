// @ts-nocheck
import { Remove } from '@mui/icons-material'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useEffect, useState } from 'react'
import { Plus } from 'react-feather'
import Flatpickr from 'react-flatpickr'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Select from 'react-select'
import {
    Button,
    Col,
    Form,
    FormGroup,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from 'reactstrap'
import { getAllTimeZone, getWhatsappCallSetting, waCalling } from '../../utility/apis/whatsappConfig'
import { callingStatusConst, iconVisibilIty } from '../../utility/Const'
import { isValidArray, log } from '../../utility/helpers/common'
import { createConstSelectOptions, formatDate } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'

const WhatsappCallingModal = ({ showModal, setShowModal, edit, preload }) => {
    
    const validateTimeRange = (startTime, endTime) => {
        if (!startTime || !endTime) return true // Allow empty for now, or add required validation separately

        const startMinutes = (parseInt(startTime.substring(0, 2), 10) * 60) + parseInt(startTime.substring(2, 4), 10)
        const endMinutes = (parseInt(endTime.substring(0, 2), 10) * 60) + parseInt(endTime.substring(2, 4), 10)

        // If end time is before or equal to start time, it's an invalid range within a 24-hour period.
        return endMinutes > startMinutes
    }

    const dispatch = useDispatch()
    const [page, setPage] = useState(1)
    const [setting, setSetting] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        setError
    } = useForm({
        defaultValues: {
            calling: {
                status: 'ENABLED',
                call_icon_visibility: 'DEFAULT',
                call_hours: {
                    status: 'ENABLED',
                    timezone_id: 'Asia/Kolkata',
                    weekly_operating_hours: [],
                    holiday_schedule: []
                },
                callback_permission_status: 'ENABLED',
                sip: {
                    status: 'DISABLED',
                    servers: []
                }
            }
        }
    })

    const [loading, setLoading] = useState(false)
    const [time, setTime] = useState(null)

    const toggleModal = () => {
        setShowModal(!showModal)
        reset()
    }

    const onSubmit = (data) => {
        console.log("Form Data:", JSON.stringify(data, null, 2))
        waCalling({
            wa_configuration_id: edit?.id,

            jsonData: {
                ...data
            },
            dispatch,
            loading: setLoading,
            success: (d) => {
                toggleModal()
                setResetIt(new Date()); reset()
                preload()
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

        // Here you would typically send this data to an API
        // toggleModal()
    }

    const callingStatus = watch('calling.status')
    const callHoursStatus = watch('calling.call_hours.status')
    const sipStatus = watch('calling.sip.status')

    const dayOfWeekOptions = [
        { value: 'MONDAY', label: 'Monday' },
        { value: 'TUESDAY', label: 'Tuesday' },
        { value: 'WEDNESDAY', label: 'Wednesday' },
        { value: 'THURSDAY', label: 'Thursday' },
        { value: 'FRIDAY', label: 'Friday' },
        { value: 'SATURDAY', label: 'Saturday' },
        { value: 'SUNDAY', label: 'Sunday' }
    ]

    const timezoneOptions = time ? time.map(tz => ({ value: tz, label: tz })) : []

    const [weeklyHours, setWeeklyHours] = useState([])
    const [holidaySchedule, setHolidaySchedule] = useState([])
    const [sipServers, setSipServers] = useState([])

    useEffect(() => {
        if (showModal) { // Only run when modal is open
            if (edit) {
                // Preload data if 'edit' prop is provided
                setValue('calling', edit?.calling)
                setWeeklyHours(edit?.calling?.call_hours?.weekly_operating_hours || [{ day_of_week: '', open_time: '', close_time: '' }])
                setHolidaySchedule(edit?.calling?.call_hours?.holiday_schedule || [{ date: '', start_time: '', end_time: '' }])
                setSipServers(edit?.calling?.sip?.servers || [])
            } else {
                // Set default values for new entry
                reset({
                    calling: {
                        status: 'ENABLED',
                        call_icon_visibility: 'DEFAULT',
                        call_hours: {
                            status: 'ENABLED',
                            timezone_id: 'Asia/Kolkata',
                            weekly_operating_hours: [],
                            holiday_schedule: []
                        },
                        callback_permission_status: 'ENABLED',
                        sip: {
                            status: 'DISABLED',
                            servers: []
                        }
                    }
                })
                setWeeklyHours([{ day_of_week: '', open_time: '', close_time: '' }])
                setHolidaySchedule([{ date: '', start_time: '', end_time: '' }])
                setSipServers([])
            }
        }
    }, [edit, showModal, reset, setValue])

    const addWeeklyHour = () => {
        if (weeklyHours.length < dayOfWeekOptions.length) {
            setWeeklyHours([...weeklyHours, { day_of_week: '', open_time: '', close_time: '' }])
        }
    }

    const removeWeeklyHour = (index) => {
        const newWeeklyHours = [...weeklyHours]
        newWeeklyHours.splice(index, 1)
        setWeeklyHours(newWeeklyHours)
        setValue('calling.call_hours.weekly_operating_hours', newWeeklyHours)
    }

    const handleWeeklyHourChange = (index, field, value) => {
        const newWeeklyHours = [...weeklyHours]
        newWeeklyHours[index][field] = value
        setWeeklyHours(newWeeklyHours)
        setValue('calling.call_hours.weekly_operating_hours', newWeeklyHours)
    }

    const getAvailableDayOptions = (currentIndex) => {
        return dayOfWeekOptions
    }

    const addHoliday = () => {
        setHolidaySchedule([...holidaySchedule, { date: '', start_time: '', end_time: '' }])
    }

    const removeHoliday = (index) => {
        const newHolidaySchedule = [...holidaySchedule]
        newHolidaySchedule.splice(index, 1)
        setHolidaySchedule(newHolidaySchedule)
        setValue('calling.call_hours.holiday_schedule', newHolidaySchedule)
    }

    const handleHolidayChange = (index, field, value) => {
        const newHolidaySchedule = [...holidaySchedule]
        newHolidaySchedule[index][field] = value
        setHolidaySchedule(newHolidaySchedule)
        setValue(`calling.call_hours.holiday_schedule[${index}].${field}`, value)
    }

    const addSipServer = () => {
        setSipServers([...sipServers, { hostname: '', port: '', sip_user_password: '', request_uri_user_params: {} }])
    }

    const removeSipServer = (index) => {
        const newSipServers = [...sipServers]
        newSipServers.splice(index, 1)
        setSipServers(newSipServers)
        setValue('calling.sip.servers', newSipServers)
    }

    const handleSipServerChange = (index, field, value) => {
        const newSipServers = [...sipServers]
        newSipServers[index][field] = value
        setSipServers(newSipServers)
        setValue('calling.sip.servers', newSipServers)
    }

    const addSipParam = (serverIndex) => {
        const newSipServers = [...sipServers]
        newSipServers[serverIndex].request_uri_user_params = {
            ...newSipServers[serverIndex].request_uri_user_params,
            [`KEY${Object.keys(newSipServers[serverIndex].request_uri_user_params).length + 1}`]: ''
        }
        setSipServers(newSipServers)
        setValue('calling.sip.servers', newSipServers)
    }

    const removeSipParam = (serverIndex, paramKey) => {
        const newSipServers = [...sipServers]
        delete newSipServers[serverIndex].request_uri_user_params[paramKey]
        setSipServers(newSipServers)
        setValue('calling.sip.servers', newSipServers)
    }

    const handleSipParamChange = (serverIndex, paramKey, value) => {
        const newSipServers = [...sipServers]
        newSipServers[serverIndex].request_uri_user_params[paramKey] = value
        setSipServers(newSipServers)
        setValue('calling.sip.servers', newSipServers)
    }

    const preloadTimeZone = async (search, loadedOptions, { page = 1 } = {}) => {
        getAllTimeZone({
            async: true,
            page,
            perPage: 100, // Adjust perPage as needed
            jsonData: { name: search },
            success: e => {
                setTime(e.data)

            }
        })

        // console.log("res asdsadsadasdsad", res)

        // const formattedOptions = res?.data ? res.data.map(tz => ({ value: tz, label: tz })) : []

        // return {
        //     options: formattedOptions,
        //     hasMore: false, // Assuming getAllTimeZone does not support pagination in this context
        //     additional: {
        //         page: page + 1
        //     }
        // }
    }

    const preloadWaSettings = () => {
        getWhatsappCallSetting({
            wa_configuration_id: edit?.id,
            loading: setLoading,
            success: (e) => {
                setSetting(e)
                setLoading(false)

                const holiday_schedule = e.calling.call_hours.holiday_schedule
                const weekly_operating_hours = e.calling.call_hours.weekly_operating_hours


                holiday_schedule?.forEach((e, index) => {
                    console.log("holiday_schedule", e)
                    setValue(`calling.call_hours.holiday_schedule[${index}].date`, formatDate(e.date, "YYYY-MM-DD"))
                    setValue(`calling.call_hours.holiday_schedule[${index}].start_time`, e.start_time)
                    setValue(`calling.call_hours.holiday_schedule[${index}].end_time`, e.end_time)
                    setHolidaySchedule(holiday_schedule)

                    // handleHolidayChange(index, 'date', e.date)
                    // handleHolidayChange(index, 'start_time', e.start_time)
                    // handleHolidayChange(index, 'end_time', e.end_time)
                })

                weekly_operating_hours?.forEach((e, index) => {
                    setValue(`calling.call_hours.weekly_operating_hours[${index}].day_of_week`, e.day_of_week)
                    setValue(`calling.call_hours.weekly_operating_hours[${index}].open_time`, e.open_time)
                    setValue(`calling.call_hours.weekly_operating_hours[${index}].close_time`, e.close_time)
                    setWeeklyHours(weekly_operating_hours)

                })

                // setValue('calling', e.calling)
                // setWeeklyHours(e.calling.call_hours.weekly_operating_hours || [{ day_of_week: '', open_time: '', close_time: '' }])
                // setHolidaySchedule(e.calling.call_hours.holiday_schedule || [{ date: '', start_time: '', end_time: '' }])
                // setSipServers(e.calling.sip.servers || [])
            },
            error: () => {
                setLoading(false)

            }
        })
    }


    useEffect(() => {
        if (edit) {
            preloadTimeZone() // Removed direct call as it's handled by AsyncPaginate
            preloadWaSettings()
        }
    }, [showModal, edit])

    log(setting, "setting")

    return (
        <Modal
            isOpen={showModal}
            toggle={toggleModal}
            className='modal-dialog-centered modal-lg'
            backdrop="static"
        >
            <ModalHeader toggle={toggleModal}>Whatsapp Calling Configuration</ModalHeader>
            <Form onSubmit={handleSubmit(onSubmit)}>


                <ModalBody>

                    <>

                        {/* <p>{setting}</p> */}
                        {setting?.calling?.callback_permission_status === "NOT_SET" ? (<>
                            <Row>
                                <Col md='6' className=''>
                                    {/* <FormGroup>
                                <Label for='calling-status'>Calling Status</Label>
                                <Controller
                                    name='calling.status'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={[{ value: 'ENABLED', label: 'Enabled' }, { value: 'DISABLED', label: 'Disabled' }]}
                                            classNamePrefix='select'

                                            onChange={(e) => field.onChange(e.value)}
                                            value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                        />Weekly Operating Hours
                                    )}
                                />
                            </FormGroup> */}
                                    <FormGroupCustom
                                        key={resetIt}
                                        type={"select"}
                                        control={control}
                                        name='calling.status'
                                        // value={edit?.gateway_type ?? 1}
                                        isClearable
                                        className='mb-1'
                                        value={watch("calling.status") ?? 'ENABLED'}
                                        label="Calling Status"
                                        errors={errors}
                                        options={createConstSelectOptions(callingStatusConst)}
                                        rules={{ required: true }}
                                    />
                                </Col>
                                <Col md='6' className=''>
                                    {/* <FormGroup>
                                <Label for='call-icon-visibility'>Call Icon Visibility</Label>
                                <Controller
                                    name='calling.call_icon_visibility'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={[{ value: 'DEFAULT', label: 'Default' }, { value: 'DISABLE_ALL', label: 'Disabled' }]}
                                            classNamePrefix='select'
                                            onChange={(e) => field.onChange(e.value)}
                                            value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                        />
                                    )}
                                />
                            </FormGroup> */}
                                    <FormGroupCustom
                                        key={resetIt}
                                        type={"select"}
                                        control={control}
                                        name='calling.call_icon_visibility'
                                        // value={edit?.gateway_type ?? 1}
                                        isClearable
                                        className='mb-1'
                                        label="Call Icon Visibility"
                                        errors={errors}
                                        options={createConstSelectOptions(iconVisibilIty)}
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Row>

                            {(callingStatus === 'ENABLED' || watch("calling.status" === 'ENABLED')) && (
                                <>
                                    <Row className=''>
                                        <Col md='6' className=''>
                                            <FormGroup>
                                                {/* <Label for='call-hours-status'>Call Hours Status</Label>
                                        <Controller
                                            name='calling.call_hours.status'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={[{ value: 'ENABLED', label: 'Enabled' }, { value: 'DISABLED', label: 'Disabled' }]}
                                                    classNamePrefix='select'
                                                    defaultValue={'ENABLED'}
                                                    onChange={(e) => field.onChange(e.value)}
                                                    value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                                />
                                            )}
                                        /> */}
                                                <FormGroupCustom
                                                    key={resetIt}
                                                    type={"select"}
                                                    control={control}
                                                    name="calling.call_hours.status"
                                                    // value={edit?.gateway_type ?? 1}
                                                    isClearable
                                                    className='mb-1'
                                                    value={watch("calling.call_hours.status.status") ?? 'ENABLED'}
                                                    label="Call Hours Status"
                                                    errors={errors}
                                                    options={createConstSelectOptions(callingStatusConst)}
                                                    rules={{ required: true }}
                                                />
                                            </FormGroup>
                                        </Col>

                                        {callHoursStatus === 'ENABLED' && (
                                            <Col md='6' className=''>
                                                <FormGroupCustom
                                                    key={resetIt}
                                                    type={"select"}
                                                    control={control}
                                                    name='calling.call_hours.timezone_id'
                                                    isClearable
                                                    className='mb-1'
                                                    value={setting?.calling?.call_hours?.timezone_id}
                                                    label="Timezone"
                                                    errors={errors}
                                                    loadOptions={preloadTimeZone}
                                                    rules={{ required: true }}
                                                />
                                            </Col>
                                        )}
                                    </Row>
                                        
                                    {callHoursStatus === 'ENABLED' && (
                                        <>
                                            <h6>Weekly Operating Hours</h6>
                                            {weeklyHours.map((hour, index) => (
                                                <Row key={index} className=''>
                                                    <Col md='3'>
                                                        <FormGroup>
                                                            <Label for={`day-of-week-${index}`}>Day of Week</Label>
                                                            <Controller
                                                                key={resetIt}
                                                                name={`calling.call_hours.weekly_operating_hours[${index}].day_of_week`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        key={resetIt}
                                                                        {...field}
                                                                        options={getAvailableDayOptions(index)}
                                                                        classNamePrefix='select'
                                                                        onChange={(e) => {
                                                                            field.onChange(e.value)
                                                                            handleWeeklyHourChange(index, 'day_of_week', e.value)
                                                                        }}

                                                                        value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                                                        rules={{
                                                                            required: 'true'
                                                                        }}
                                                                    />
                                                                )}
                                                            />

                                                            {errors.calling?.call_hours?.weekly_operating_hours?.[index]?.day_of_week && <p className='text-danger'>Day of week is required</p>}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md='3'>
                                                        <FormGroup>
                                                            <Label for={`open-time-${index}`}>Open Time</Label>
                                                            <Controller
                                                                key={resetIt}
                                                                name={`calling.call_hours.weekly_operating_hours[${index}].open_time`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Flatpickr
                                                                        key={resetIt}
                                                                        className='form-control'
                                                                        value={field.value}
                                                                        options={{
                                                                            enableTime: true,
                                                                            noCalendar: true,
                                                                            dateFormat: 'H:i',
                                                                            time_24hr: true
                                                                        }}
                                                                        onChange={date => {
                                                                            const formattedTime = date[0] ? `${String(date[0].getHours()).padStart(2, '0')}${String(date[0].getMinutes()).padStart(2, '0')}` : ''
                                                                            field.onChange(formattedTime)
                                                                            handleWeeklyHourChange(index, 'open_time', formattedTime)
                                                                        }}
                                                                        invalid={errors.calling?.call_hours?.weekly_operating_hours?.[index]?.open_time}
                                                                    />
                                                                )}
                                                                rules={{
                                                                    required: 'Open time is required',
                                                                    validate: {
                                                                        timeRange: (value) => {
                                                                            const closeTime = weeklyHours[index].close_time
                                                                            if (!value || !closeTime) return true
                                                                            return validateTimeRange(value, closeTime) || 'Open time must be before close time'
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            {errors.calling?.call_hours?.weekly_operating_hours?.[index]?.open_time && <p className='text-danger'>{errors.calling.call_hours.weekly_operating_hours[index].open_time.message}</p>}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md='3'>
                                                        <FormGroup>
                                                            <Label for={`close-time-${index}`}>Close Time</Label>
                                                            <Controller
                                                                name={`calling.call_hours.weekly_operating_hours[${index}].close_time`}
                                                                control={control}
                                                                key={resetIt}
                                                                render={({ field }) => (
                                                                    <Flatpickr
                                                                        key={resetIt}
                                                                        className='form-control'
                                                                        value={field.value}
                                                                        options={{
                                                                            enableTime: true,
                                                                            noCalendar: true,
                                                                            dateFormat: 'H:i',
                                                                            time_24hr: true
                                                                        }}
                                                                        onChange={date => {
                                                                            const formattedTime = date[0] ? `${String(date[0].getHours()).padStart(2, '0')}${String(date[0].getMinutes()).padStart(2, '0')}` : ''
                                                                            field.onChange(formattedTime)
                                                                            handleWeeklyHourChange(index, 'close_time', formattedTime)
                                                                        }}
                                                                        invalid={errors.calling?.call_hours?.weekly_operating_hours?.[index]?.close_time}
                                                                    />
                                                                )}
                                                                rules={{
                                                                    required: 'Close time is required',
                                                                    validate: {
                                                                        timeRange: (value) => {
                                                                            const openTime = weeklyHours[index].open_time
                                                                            if (!value || !openTime) return true
                                                                            return validateTimeRange(openTime, value) || 'Close time must be after open time'
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            {errors.calling?.call_hours?.weekly_operating_hours?.[index]?.close_time && <p className='text-danger'>{errors.calling.call_hours.weekly_operating_hours[index].close_time.message}</p>}
                                                        </FormGroup>
                                                    </Col>


                                                    <Col md='3' className={""}>
                                                        {index === 0 ? (
                                                            <Button color='primary' size="sm" pill style={{ marginTop: "23px" }} onClick={addWeeklyHour} disabled={weeklyHours.length >= dayOfWeekOptions.length}><Plus /> </Button>
                                                        ) : (
                                                            <Button color='danger' size="sm" pill style={{ marginTop: "23px", marginLeft: "10px" }} onClick={() => removeWeeklyHour(index)}><Remove /> </Button>
                                                        )}
                                                    </Col>
                                                </Row>
                                            ))}

                                            {/* <Button color='primary' onClick={addWeeklyHour} disabled={weeklyHours.length >= dayOfWeekOptions.length}>Add Weekly Hour</Button> */}

                                            <h6 className='mt-3'>Holiday Schedule</h6>
                                            {holidaySchedule.map((holiday, index) => (
                                                <Row key={index} className=''>
                                                    <Col md='3'>
                                                        {/* <FormGroup>
                                                    <Label for={`holiday-date-${index}`}>Date</Label>
                                                    <Controller
                                                        name={`calling.call_hours.holiday_schedule[${index}].date`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Flatpickr
                                                                className='form-control'
                                                                value={field.value}
                                                                options={{
                                                                    dateFormat: 'Y-m-d',
                                                                    minDate: new Date().fp_incr(1) // Set minDate to tomorrow
                                                                }}
                                                                onChange={date => {
                                                                    const formattedDate = date[0] ? date[0].toISOString().split('T')[0] : ''
                                                                    field.onChange(formattedDate)
                                                                    handleHolidayChange(index, 'date', formattedDate)
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </FormGroup> */}
                                                        <FormGroupCustom
                                                            key={resetIt}
                                                            name={`calling.call_hours.holiday_schedule[${index}].date`}
                                                            type={"date"}
                                                            errors={errors}
                                                            label={"Date"}
                                                            options={{
                                                                enableTime: false,
                                                                // minDate: Date.now()
                                                                minDate: new Date().fp_incr(1), // Set minDate to tomorrow
                                                                maxDate: new Date().fp_incr(20) // Set maxDate to one year from tomorrow
                                                            }}
                                                            dateFormat={"YYYY-MM-DD"}
                                                            // onChangeValue={e => {
                                                            //     setValue(`calling.call_hours.holiday_schedule[${index}].date`, e)
                                                            // }}
                                                            onChangeValue={e => {
                                                                setValue(`calling.call_hours.holiday_schedule[${index}].date`, formatDate(e, "YYYY-MM-DD"))

                                                            }}
                                                            className="mb-2"
                                                            control={control}
                                                            rules={{ required: false }}
                                                        // value={holiday.date}
                                                        // values={edit?.out_time}
                                                        />
                                                    </Col>
                                                    <Col md='3'>
                                                        <FormGroup>
                                                            <Label for={`holiday-start-time-${index}`}>Start Time</Label>
                                                            <Controller
                                                                key={resetIt}
                                                                name={`calling.call_hours.holiday_schedule[${index}].start_time`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Flatpickr
                                                                        key={resetIt}
                                                                        className='form-control'
                                                                        value={field.value}
                                                                        options={{
                                                                            enableTime: true,
                                                                            noCalendar: true,
                                                                            dateFormat: 'H:i',
                                                                            time_24hr: true
                                                                        }}
                                                                        onChange={date => {
                                                                            const formattedTime = date[0] ? `${String(date[0].getHours()).padStart(2, '0')}${String(date[0].getMinutes()).padStart(2, '0')}` : ''
                                                                            field.onChange(formattedTime)
                                                                            handleHolidayChange(index, 'start_time', formattedTime)
                                                                        }}
                                                                        invalid={errors.calling?.call_hours?.holiday_schedule?.[index]?.start_time}
                                                                    />
                                                                )}
                                                                rules={{
                                                                    validate: {
                                                                        timeRange: (value) => validateTimeRange(value, holidaySchedule[index].end_time) || 'Start time must be before end time'
                                                                    }
                                                                }}
                                                            />
                                                            {errors.calling?.call_hours?.holiday_schedule?.[index]?.start_time && <p className='text-danger'>{errors.calling.call_hours.holiday_schedule[index].start_time.message}</p>}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md='3'>
                                                        <FormGroup>
                                                            <Label for={`holiday-end-time-${index}`}>End Time</Label>
                                                            <Controller
                                                                name={`calling.call_hours.holiday_schedule[${index}].end_time`}
                                                                control={control}
                                                                key={resetIt}
                                                                render={({ field }) => (
                                                                    <Flatpickr
                                                                        key={resetIt}
                                                                        className='form-control'
                                                                        value={field.value}
                                                                        options={{
                                                                            enableTime: true,
                                                                            noCalendar: true,
                                                                            dateFormat: 'H:i',
                                                                            time_24hr: true
                                                                        }}
                                                                        onChange={date => {
                                                                            const formattedTime = date[0] ? `${String(date[0].getHours()).padStart(2, '0')}${String(date[0].getMinutes()).padStart(2, '0')}` : ''
                                                                            field.onChange(formattedTime)
                                                                            handleHolidayChange(index, 'end_time', formattedTime)
                                                                        }}
                                                                    />
                                                                )}
                                                                rules={{
                                                                    validate: {
                                                                        timeRange: (value) => validateTimeRange(holidaySchedule[index].start_time, value) || 'End time must be after start time'
                                                                    }
                                                                }}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    {/* <Col md='3'>
                                                <Button color='danger' style={{ marginTop: "23px" }} onClick={() => removeHoliday(index)} disabled={holidaySchedule.length <= 1}>Remove</Button>
                                            </Col> */}

                                                    <Col md='3' className={""}>
                                                        {index === 0 ? (
                                                            <Button color='primary' size="sm" pill style={{ marginTop: "23px" }} onClick={addHoliday}><Plus /> </Button>
                                                        ) : (
                                                            <Button color='danger' size="sm" pill style={{ marginTop: "23px", marginLeft: "10px" }} onClick={() => removeHoliday(index)} ><Remove /> </Button>

                                                        )}

                                                        {/* <Button color='danger' size="sm" pill style={{ marginTop: "23px", marginLeft: "10px" }} onClick={() => removeHoliday(index)} ><Remove /> </Button> */}
                                                    </Col>

                                                </Row>
                                            ))}
                                            {/* <Button color='primary' onClick={addHoliday}>Add Holiday</Button> */}
                                        </>
                                    )}

                                    <Row className='mt-2'>
                                        <Col md='12' className=''>
                                            <FormGroup>
                                                <Label for='callback-permission-status'>Callback Permission Status</Label>
                                                <Controller
                                                    name='calling.callback_permission_status'
                                                    control={control}
                                                    key={resetIt}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={resetIt}
                                                            {...field}
                                                            options={[{ value: 'ENABLED', label: 'Enabled' }, { value: 'DISABLED', label: 'Disabled' }]}
                                                            classNamePrefix='select'
                                                            defaultValue={'ENABLED'}
                                                            onChange={(e) => field.onChange(e.value)}
                                                            value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                                        />
                                                    )}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row className='mt-2'>
                                        <Col md='6' className=''>
                                            <FormGroup>
                                                <Label for='sip-status'>SIP Status</Label>
                                                <Controller
                                                    name='calling.sip.status'
                                                    control={control}
                                                    key={resetIt}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={resetIt}
                                                            {...field}
                                                            options={[{ value: 'ENABLED', label: 'Enabled' }, { value: 'DISABLED', label: 'Disabled' }]}
                                                            classNamePrefix='select'
                                                            defaultValue={'ENABLED'}
                                                            onChange={(e) => field.onChange(e.value)}
                                                            value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                                        />
                                                    )}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {sipStatus === 'ENABLED' && (
                                        <>
                                            <h6>SIP Servers</h6>
                                            {sipServers.map((server, serverIndex) => (
                                                <div key={serverIndex} className='border p-2 mb-2'>
                                                    <Row className=''>
                                                        <Col md='4'>
                                                            <FormGroupCustom
                                                                key={resetIt}
                                                                name={`calling.sip.servers[${serverIndex}].hostname`}
                                                                type='text'
                                                                label='Hostname'
                                                                control={control}
                                                                errors={errors}
                                                                setValue={setValue}
                                                                onChange={(e) => handleSipServerChange(serverIndex, 'hostname', e.target.value)}
                                                                value={server.hostname}
                                                            />
                                                        </Col>
                                                        <Col md='4'>
                                                            <FormGroupCustom
                                                                key={resetIt}
                                                                name={`calling.sip.servers[${serverIndex}].port`}
                                                                type='number'
                                                                label='Port'
                                                                control={control}
                                                                errors={errors}
                                                                setValue={setValue}
                                                                onChange={(e) => handleSipServerChange(serverIndex, 'port', e.target.value)}
                                                                value={server.port}
                                                            />
                                                        </Col>
                                                        <Col md='4'>
                                                            <FormGroupCustom
                                                                key={resetIt}
                                                                name={`calling.sip.servers[${serverIndex}].sip_user_password`}
                                                                type='password'
                                                                label='SIP User Password'
                                                                control={control}
                                                                errors={errors}
                                                                setValue={setValue}
                                                                onChange={(e) => handleSipServerChange(serverIndex, 'sip_user_password', e.target.value)}
                                                                value={server.sip_user_password}
                                                            />
                                                        </Col>
                                                        <Col md='12' className='d-flex justify-content-end mt-1'>
                                                            <Button color='danger' onClick={() => removeSipServer(serverIndex)}>Remove Server</Button>
                                                        </Col>
                                                    </Row>

                                                    <div className='mt-2'>
                                                        <h7 className="mt-1">Request URI User Params</h7>

                                                    </div>
                                                    {Object.entries(server.request_uri_user_params).map(([key, value]) => (
                                                        <Row key={key} className=' align-items-end'>
                                                            <Col md='5'>
                                                                <FormGroupCustom
                                                                    key={resetIt}
                                                                    name={`calling.sip.servers[${serverIndex}].request_uri_user_params.${key}.key`}
                                                                    type='text'
                                                                    label='Key'
                                                                    control={control}
                                                                    errors={errors}
                                                                    setValue={setValue}
                                                                    defaultValue={key}
                                                                    onChange={(e) => {
                                                                        const newKey = e.target.value
                                                                        const newParams = { ...server.request_uri_user_params }
                                                                        newParams[newKey] = newParams[key]
                                                                        if (newKey !== key) delete newParams[key]
                                                                        handleSipServerChange(serverIndex, 'request_uri_user_params', newParams)
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col md='5'>
                                                                <FormGroupCustom
                                                                    key={resetIt}
                                                                    name={`calling.sip.servers[${serverIndex}].request_uri_user_params.${key}`}
                                                                    type='text'
                                                                    label='Value'
                                                                    control={control}
                                                                    errors={errors}
                                                                    setValue={setValue}
                                                                    defaultValue={value}
                                                                    onChange={(e) => handleSipParamChange(serverIndex, key, e.target.value)}
                                                                />
                                                            </Col>
                                                            <Col md='2'>
                                                                <Button color='danger' onClick={() => removeSipParam(serverIndex, key)}>Remove Param</Button>
                                                            </Col>
                                                        </Row>
                                                    ))}
                                                    <Button color='secondary' className="mt-2" size='sm' onClick={() => addSipParam(serverIndex)}>Add Param</Button>
                                                </div>
                                            ))}
                                            {sipServers.length === 0 && (
                                                <Button color='primary' onClick={addSipServer}>Add SIP Server</Button>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                        </>) : (<>

                            <Row>
                                <Col md='6' className=''>


                                    {/* <FormGroup>
                                <Label for='calling-status'>Calling Status</Label>
                                <Controller
                                    name='calling.status'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={[{ value: 'ENABLED', label: 'Enabled' }, { value: 'DISABLED', label: 'Disabled' }]}
                                            classNamePrefix='select'

                                            onChange={(e) => field.onChange(e.value)}
                                            value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                        />Weekly Operating Hours
                                    )}
                                />
                            </FormGroup> */}
                                    <FormGroupCustom
                                        key={resetIt}
                                        type={"select"}
                                        control={control}
                                        name='calling.status'
                                        // value={edit?.gateway_type ?? 1}
                                        isClearable
                                        className='mb-1'
                                        value={setting?.calling?.status}
                                        label="Calling Status"
                                        errors={errors}
                                        options={createConstSelectOptions(callingStatusConst)}
                                        rules={{ required: true }}
                                    />
                                </Col>
                                <Col md='6' className=''>
                                    {/* <FormGroup>
                                <Label for='call-icon-visibility'>Call Icon Visibility</Label>
                                <Controller
                                    name='calling.call_icon_visibility'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={[{ value: 'DEFAULT', label: 'Default' }, { value: 'DISABLE_ALL', label: 'Disabled' }]}
                                            classNamePrefix='select'
                                            onChange={(e) => field.onChange(e.value)}
                                            value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                        />
                                    )}
                                />
                            </FormGroup> */}
                                    <FormGroupCustom
                                        key={resetIt}
                                        type={"select"}
                                        control={control}
                                        name='calling.call_icon_visibility'
                                        // value={edit?.gateway_type ?? 1}
                                        value={setting?.calling?.call_icon_visibility}
                                        isClearable
                                        className='mb-1'
                                        label="Call Icon Visibility"
                                        errors={errors}
                                        options={createConstSelectOptions(iconVisibilIty)}
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Row>

                            {(callingStatus === 'ENABLED' || watch("calling.status" === 'ENABLED')) && (
                                <>
                                    <Row className=''>
                                        <Col md='6' className=''>
                                            <FormGroup>
                                                {/* <Label for='call-hours-status'>Call Hours Status</Label>
                                        <Controller
                                            name='calling.call_hours.status'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={[{ value: 'ENABLED', label: 'Enabled' }, { value: 'DISABLED', label: 'Disabled' }]}
                                                    classNamePrefix='select'
                                                    defaultValue={'ENABLED'}
                                                    onChange={(e) => field.onChange(e.value)}
                                                    value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                                />
                                            )}
                                        /> */}
                                                <FormGroupCustom
                                                    key={resetIt}
                                                    type={"select"}
                                                    control={control}
                                                    name="calling.call_hours.status"
                                                    // value={edit?.gateway_type ?? 1}
                                                    isClearable
                                                    className='mb-1'
                                                    // value={watch("calling.call_hours.status.status") ?? 'ENABLED'}
                                                    value={setting?.calling?.call_hours?.status}
                                                    label="Call Hours Status"
                                                    errors={errors}
                                                    options={createConstSelectOptions(callingStatusConst)}
                                                    rules={{ required: true }}
                                                />
                                            </FormGroup>
                                        </Col>

                                        {callHoursStatus === 'ENABLED' && (
                                            <Col md='6' className=''>
                                                <FormGroup>
                                                    <Label for='timezone-id'>Timezone ID</Label>
                                                    <Controller
                                                        key={resetIt}
                                                        name='calling.call_hours.timezone_id'
                                                        control={control}
                                                        defaultValue={setting?.calling?.call_hours?.timezone_id}
                                                        render={({ field }) => (
                                                            <Select
                                                                key={resetIt}
                                                                {...field}
                                                                options={timezoneOptions}
                                                                classNamePrefix='select'
                                                                onChange={(e) => field.onChange(e.value)}
                                                                value={timezoneOptions.find(option => option.value === field.value) || null}
                                                            />
                                                        )}
                                                    />
                                                </FormGroup>
                                                {/* <FormGroupCustom
                                                    type={"select"}
                                                    control={control}
                                                    name='calling.call_hours.timezone_id'
                                                    // value={edit?.gateway_type ?? 1}
                                                    isClearable
                                                    className='mb-1'
                                                    // value={watch("calling.call_hours.status.status") ?? 'ENABLED'}
                                                   // value={setting?.calling?.call_hours?.timezone_id}
                                                    label="Timezone"
                                                    errors={errors}
                                                    options={timezoneOptions}
                                                    rules={{ required: true }}
                                                /> */}
                                            </Col>
                                        )}
                                    </Row>


                                    {callHoursStatus === 'ENABLED' && (
                                        <>
                                            <h6>Weekly Operating Hours</h6>
                                            {weeklyHours.map((hour, index) => (
                                                <Row key={index} className=''>
                                                    <Col md='3'>
                                                        <FormGroup>
                                                            <Label for={`day-of-week-${index}`}>Day of Week</Label>
                                                            <Controller
                                                                name={`calling.call_hours.weekly_operating_hours[${index}].day_of_week`}
                                                                control={control}
                                                                key={resetIt}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        key={resetIt}
                                                                        {...field}
                                                                        options={getAvailableDayOptions(index)}
                                                                        classNamePrefix='select'
                                                                        onChange={(e) => {
                                                                            field.onChange(e.value)
                                                                            handleWeeklyHourChange(index, 'day_of_week', e.value)
                                                                        }}

                                                                        value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                                                        rules={{
                                                                            required: 'true'
                                                                        }}
                                                                    />
                                                                )}
                                                            />

                                                            {errors.calling?.call_hours?.weekly_operating_hours?.[index]?.day_of_week && <p className='text-danger'>Day of week is required</p>}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md='3'>
                                                        <FormGroup>
                                                            <Label for={`open-time-${index}`}>Open Time</Label>
                                                            <Controller
                                                                name={`calling.call_hours.weekly_operating_hours[${index}].open_time`}
                                                                control={control}
                                                                key={resetIt}
                                                                render={({ field }) => (
                                                                    <Flatpickr
                                                                        key={resetIt}
                                                                        className='form-control'
                                                                        value={field.value}
                                                                        options={{
                                                                            enableTime: true,
                                                                            noCalendar: true,
                                                                            dateFormat: 'H:i',
                                                                            time_24hr: true
                                                                        }}
                                                                        onChange={date => {
                                                                            const formattedTime = date[0] ? `${String(date[0].getHours()).padStart(2, '0')}${String(date[0].getMinutes()).padStart(2, '0')}` : ''
                                                                            field.onChange(formattedTime)
                                                                            handleWeeklyHourChange(index, 'open_time', formattedTime)
                                                                        }}
                                                                        invalid={errors.calling?.call_hours?.weekly_operating_hours?.[index]?.open_time}
                                                                    />
                                                                )}
                                                                rules={{
                                                                    required: 'Open time is required',
                                                                    validate: {
                                                                        timeRange: (value) => {
                                                                            const closeTime = weeklyHours[index].close_time
                                                                            if (!value || !closeTime) return true
                                                                            return validateTimeRange(value, closeTime) || 'Open time must be before close time'
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            {errors.calling?.call_hours?.weekly_operating_hours?.[index]?.open_time && <p className='text-danger'>{errors.calling.call_hours.weekly_operating_hours[index].open_time.message}</p>}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md='3'>
                                                        <FormGroup>
                                                            <Label for={`close-time-${index}`}>Close Time</Label>
                                                            <Controller
                                                                name={`calling.call_hours.weekly_operating_hours[${index}].close_time`}
                                                                control={control}
                                                                key={resetIt}
                                                                render={({ field }) => (
                                                                    <Flatpickr
                                                                        key={resetIt}
                                                                        className='form-control'
                                                                        value={field.value}
                                                                        options={{
                                                                            enableTime: true,
                                                                            noCalendar: true,
                                                                            dateFormat: 'H:i',
                                                                            time_24hr: true
                                                                        }}
                                                                        onChange={date => {
                                                                            const formattedTime = date[0] ? `${String(date[0].getHours()).padStart(2, '0')}${String(date[0].getMinutes()).padStart(2, '0')}` : ''
                                                                            field.onChange(formattedTime)
                                                                            handleWeeklyHourChange(index, 'close_time', formattedTime)
                                                                        }}
                                                                        invalid={errors.calling?.call_hours?.weekly_operating_hours?.[index]?.close_time}
                                                                    />
                                                                )}
                                                                rules={{
                                                                    required: 'Close time is required',
                                                                    validate: {
                                                                        timeRange: (value) => {
                                                                            const openTime = weeklyHours[index].open_time
                                                                            if (!value || !openTime) return true
                                                                            return validateTimeRange(openTime, value) || 'Close time must be after open time'
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            {errors.calling?.call_hours?.weekly_operating_hours?.[index]?.close_time && <p className='text-danger'>{errors.calling.call_hours.weekly_operating_hours[index].close_time.message}</p>}
                                                        </FormGroup>
                                                    </Col>


                                                    <Col md='3' className={""}>
                                                        {index === 0 ? (
                                                            <Button color='primary' size="sm" pill style={{ marginTop: "23px" }} onClick={addWeeklyHour} disabled={weeklyHours.length >= dayOfWeekOptions.length}><Plus /> </Button>
                                                        ) : (
                                                            <Button color='danger' size="sm" pill style={{ marginTop: "23px", marginLeft: "10px" }} onClick={() => removeWeeklyHour(index)}><Remove /> </Button>
                                                        )}
                                                    </Col>
                                                </Row>
                                            ))}

                                            {/* <Button color='primary' onClick={addWeeklyHour} disabled={weeklyHours.length >= dayOfWeekOptions.length}>Add Weekly Hour</Button> */}

                                            <h6 className='mt-3'>Holiday Schedule</h6>
                                            {holidaySchedule.map((holiday, index) => (
                                                <Row key={index} className=''>
                                                    <Col md='3'>
                                                        {/* <FormGroup>
                                                    <Label for={`holiday-date-${index}`}>Date</Label>
                                                    <Controller
                                                        name={`calling.call_hours.holiday_schedule[${index}].date`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Flatpickr
                                                                className='form-control'
                                                                value={field.value}
                                                                options={{
                                                                    dateFormat: 'Y-m-d',
                                                                    minDate: new Date().fp_incr(1) // Set minDate to tomorrow
                                                                }}
                                                                onChange={date => {
                                                                    const formattedDate = date[0] ? date[0].toISOString().split('T')[0] : ''
                                                                    field.onChange(formattedDate)
                                                                    handleHolidayChange(index, 'date', formattedDate)
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </FormGroup> */}
                                                        <FormGroupCustom
                                                            key={resetIt}
                                                            name={`calling.call_hours.holiday_schedule[${index}].date`}
                                                            type={"date"}
                                                            errors={errors}
                                                            label={"Date"}
                                                            options={{
                                                                enableTime: false,
                                                                // minDate: Date.now()
                                                                minDate: new Date().fp_incr(1), // Set minDate to tomorrow
                                                                maxDate: new Date().fp_incr(20) // Set maxDate to one year from tomorrow
                                                            }}
                                                            dateFormat={"YYYY-MM-DD"}
                                                            // onChangeValue={e => {
                                                            //     setValue(`calling.call_hours.holiday_schedule[${index}].date`, e)
                                                            // }}

                                                            onChangeValue={e => {
                                                                setValue(`calling.call_hours.holiday_schedule[${index}].date`, formatDate(e, "YYYY-MM-DD"))
                                                            }}
                                                            className="mb-2"
                                                            control={control}
                                                            rules={{ required: false }}
                                                            value={watch(`calling.call_hours.holiday_schedule[${index}].date`)}
                                                        // value={edit?.out_time}
                                                        // values={edit?.out_time}
                                                        />
                                                    </Col>
                                                    <Col md='3'>
                                                        <FormGroup>
                                                            <Label for={`holiday-start-time-${index}`}>Start Time</Label>
                                                            <Controller
                                                                name={`calling.call_hours.holiday_schedule[${index}].start_time`}
                                                                control={control}
                                                                key={resetIt}
                                                                render={({ field }) => (
                                                                    <Flatpickr
                                                                        key={resetIt}
                                                                        className='form-control'
                                                                        value={field.value}
                                                                        options={{
                                                                            enableTime: true,
                                                                            noCalendar: true,
                                                                            dateFormat: 'H:i',
                                                                            time_24hr: true
                                                                        }}
                                                                        onChange={date => {
                                                                            const formattedTime = date[0] ? `${String(date[0].getHours()).padStart(2, '0')}${String(date[0].getMinutes()).padStart(2, '0')}` : ''
                                                                            field.onChange(formattedTime)
                                                                            handleHolidayChange(index, 'start_time', formattedTime)
                                                                        }}
                                                                        invalid={errors.calling?.call_hours?.holiday_schedule?.[index]?.start_time}
                                                                    />
                                                                )}
                                                                rules={{
                                                                    validate: {
                                                                        timeRange: (value) => validateTimeRange(value, holidaySchedule[index].end_time) || 'Start time must be before end time'
                                                                    }
                                                                }}
                                                            />
                                                            {errors.calling?.call_hours?.holiday_schedule?.[index]?.start_time && <p className='text-danger'>{errors.calling.call_hours.holiday_schedule[index].start_time.message}</p>}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md='3'>
                                                        <FormGroup>
                                                            <Label for={`holiday-end-time-${index}`}>End Time</Label>
                                                            <Controller
                                                                name={`calling.call_hours.holiday_schedule[${index}].end_time`}
                                                                control={control}
                                                                key={resetIt}
                                                                render={({ field }) => (
                                                                    <Flatpickr
                                                                        key={resetIt}
                                                                        className='form-control'
                                                                        value={field.value}
                                                                        options={{
                                                                            enableTime: true,
                                                                            noCalendar: true,
                                                                            dateFormat: 'H:i',
                                                                            time_24hr: true
                                                                        }}
                                                                        onChange={date => {
                                                                            const formattedTime = date[0] ? `${String(date[0].getHours()).padStart(2, '0')}${String(date[0].getMinutes()).padStart(2, '0')}` : ''
                                                                            field.onChange(formattedTime)
                                                                            handleHolidayChange(index, 'end_time', formattedTime)
                                                                        }}
                                                                    />
                                                                )}
                                                                rules={{
                                                                    validate: {
                                                                        timeRange: (value) => validateTimeRange(holidaySchedule[index].start_time, value) || 'End time must be after start time'
                                                                    }
                                                                }}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    {/* <Col md='3'>
                                                <Button color='danger' style={{ marginTop: "23px" }} onClick={() => removeHoliday(index)} disabled={holidaySchedule.length <= 1}>Remove</Button>
                                            </Col> */}

                                                    <Col md='3' className={""}>
                                                        {index === 0 ? (
                                                            <Button color='primary' size="sm" pill style={{ marginTop: "23px" }} onClick={addHoliday}><Plus /> </Button>
                                                        ) : (
                                                            <Button color='danger' size="sm" pill style={{ marginTop: "23px", marginLeft: "10px" }} onClick={() => removeHoliday(index)} ><Remove /> </Button>

                                                        )}

                                                        {/* <Button color='danger' size="sm" pill style={{ marginTop: "23px", marginLeft: "10px" }} onClick={() => removeHoliday(index)} ><Remove /> </Button> */}
                                                    </Col>

                                                </Row>
                                            ))}
                                            {/* <Button color='primary' onClick={addHoliday}>Add Holiday</Button> */}
                                        </>
                                    )}

                                    <Row className='mt-2'>
                                        <Col md='12' className=''>
                                            {/* <FormGroup>
                                                <Label for='callback-permission-status'>Callback Permission Status</Label>
                                                <Controller
                                                    name='calling.callback_permission_status'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            options={[{ value: 'ENABLED', label: 'Enabled' }, { value: 'DISABLED', label: 'Disabled' }]}
                                                            classNamePrefix='select'
                                                            defaultValue={'ENABLED'}
                                                            onChange={(e) => field.onChange(e.value)}
                                                            value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                                        />
                                                    )}
                                                />
                                            </FormGroup> */}

                                            <FormGroupCustom
                                                key={resetIt}
                                                type={"select"}
                                                control={control}
                                                name="calling.callback_permission_status"
                                                // value={edit?.gateway_type ?? 1}
                                                isClearable
                                                className='mb-1'
                                                value={setting?.calling?.callback_permission_status}
                                                label="Callback Permission Status"
                                                errors={errors}
                                                options={createConstSelectOptions(callingStatusConst)}
                                                rules={{ required: true }}
                                            />

                                        </Col>
                                    </Row>

                                    <Row className='mt-2'>
                                        <Col md='6' className=''>
                                            {/* <FormGroup>
                                                <Label for='sip-status'>SIP Status</Label>
                                                <Controller
                                                    name='calling.sip.status'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            options={[{ value: 'ENABLED', label: 'Enabled' }, { value: 'DISABLED', label: 'Disabled' }]}
                                                            classNamePrefix='select'
                                                            defaultValue={'ENABLED'}
                                                            onChange={(e) => field.onChange(e.value)}
                                                            value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase() } : null}
                                                        />
                                                    )}
                                                />
                                            </FormGroup> */}

                                            <FormGroupCustom
                                                key={resetIt}
                                                type={"select"}
                                                control={control}
                                                name='calling.sip.status'
                                                // value={edit?.gateway_type ?? 1}
                                                isClearable
                                                className='mb-1'
                                                value={setting?.calling?.sip?.status}
                                                label="Callback Permission Status"
                                                errors={errors}
                                                options={createConstSelectOptions(callingStatusConst)}
                                                rules={{ required: true }}
                                            />
                                        </Col>
                                    </Row>

                                    {sipStatus === 'ENABLED' && (
                                        <>
                                            <h6>SIP Servers</h6>
                                            {sipServers.map((server, serverIndex) => (
                                                <div key={serverIndex} className='border p-2 mb-2'>
                                                    <Row className=''>
                                                        <Col md='4'>
                                                            <FormGroupCustom
                                                                key={resetIt}
                                                                name={`calling.sip.servers[${serverIndex}].hostname`}
                                                                type='text'
                                                                label='Hostname'
                                                                control={control}
                                                                errors={errors}
                                                                setValue={setValue}
                                                                onChange={(e) => handleSipServerChange(serverIndex, 'hostname', e.target.value)}
                                                                value={server.hostname}
                                                            />
                                                        </Col>
                                                        <Col md='4'>
                                                            <FormGroupCustom
                                                                key={resetIt}
                                                                name={`calling.sip.servers[${serverIndex}].port`}
                                                                type='number'
                                                                label='Port'
                                                                control={control}
                                                                errors={errors}
                                                                setValue={setValue}
                                                                onChange={(e) => handleSipServerChange(serverIndex, 'port', e.target.value)}
                                                                value={server.port}
                                                            />
                                                        </Col>
                                                        <Col md='4'>
                                                            <FormGroupCustom
                                                                key={resetIt}
                                                                name={`calling.sip.servers[${serverIndex}].sip_user_password`}
                                                                type='password'
                                                                label='SIP User Password'
                                                                control={control}
                                                                errors={errors}
                                                                setValue={setValue}
                                                                onChange={(e) => handleSipServerChange(serverIndex, 'sip_user_password', e.target.value)}
                                                                value={server.sip_user_password}
                                                            />
                                                        </Col>
                                                        <Col md='12' className='d-flex justify-content-end mt-1'>
                                                            <Button color='danger' onClick={() => removeSipServer(serverIndex)}>Remove Server</Button>
                                                        </Col>
                                                    </Row>

                                                    <div className='mt-2'>
                                                        <h7 className="mt-1">Request URI User Params</h7>

                                                    </div>
                                                    {Object.entries(server.request_uri_user_params).map(([key, value]) => (
                                                        <Row key={key} className=' align-items-end'>
                                                            <Col md='5'>
                                                                <FormGroupCustom
                                                                    key={resetIt}
                                                                    name={`calling.sip.servers[${serverIndex}].request_uri_user_params.${key}.key`}
                                                                    type='text'
                                                                    label='Key'
                                                                    control={control}
                                                                    errors={errors}
                                                                    setValue={setValue}
                                                                    defaultValue={key}
                                                                    onChange={(e) => {
                                                                        const newKey = e.target.value
                                                                        const newParams = { ...server.request_uri_user_params }
                                                                        newParams[newKey] = newParams[key]
                                                                        if (newKey !== key) delete newParams[key]
                                                                        handleSipServerChange(serverIndex, 'request_uri_user_params', newParams)
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col md='5'>
                                                                <FormGroupCustom
                                                                    key={resetIt}
                                                                    name={`calling.sip.servers[${serverIndex}].request_uri_user_params.${key}`}
                                                                    type='text'
                                                                    label='Value'
                                                                    control={control}
                                                                    errors={errors}
                                                                    setValue={setValue}
                                                                    defaultValue={value}
                                                                    onChange={(e) => handleSipParamChange(serverIndex, key, e.target.value)}
                                                                />
                                                            </Col>
                                                            <Col md='2'>
                                                                <Button color='danger' onClick={() => removeSipParam(serverIndex, key)}>Remove Param</Button>
                                                            </Col>
                                                        </Row>
                                                    ))}
                                                    <Button color='secondary' className="mt-2" size='sm' onClick={() => addSipParam(serverIndex)}>Add Param</Button>
                                                </div>
                                            ))}
                                            {sipServers.length === 0 && (
                                                <Button color='primary' onClick={addSipServer}>Add SIP Server</Button>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>)}
                    </>
                </ModalBody>
                <ModalFooter>
                    <Button color='primary' type='submit'>
                        Submit
                    </Button>
                    <Button color='secondary' onClick={toggleModal}>
                        Cancel
                    </Button>
                </ModalFooter>


            </Form>

        </Modal>
    )
}

export default WhatsappCallingModal
