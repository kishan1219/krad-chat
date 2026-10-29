// @ts-nocheck
/* eslint-disable no-unused-vars */
import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { Eye, HelpCircle, Info, X } from 'react-feather'
import { Controller, useWatch } from 'react-hook-form'
import Flatpickr from 'react-flatpickr'
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect'
import { Swedish } from "flatpickr/dist/l10n/sv"

import { Input, InputGroup, InputGroupText, Label, UncontrolledTooltip } from 'reactstrap'
import { IconSizes } from '../../../utility/Const'
import { FM, log, isValid } from '../../../utility/helpers/common'
import { formatDate, getUniqId } from '../../../utility/Utils'
import Select from '../select'
import Cleave from 'cleave.js/react'
import { components } from 'react-select'
import { ContentState, convertFromHTML, convertToRaw, EditorState } from 'draft-js'
import { Editor } from '@components/draft-wysiwyg'
// ** Styles
import '@styles/react/libs/editor/editor.scss'
import draftToHtml from 'draftjs-to-html'
// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'

import Show from '../../../utility/Show'
import ColorPicker from '../colorPicker/indx'
import { useDispatch, useSelector } from 'react-redux'
import { useSkin } from '../../../utility/hooks/useSkin'


const FormGroupCustom = ({
    setOption = null,
    placeholder = null,
    defaultChecked = false,
    noLabel = false,
    noGroup = false,
    message = null,
    classNameInput = "",
    classNameLabel = "",
    feedback = null,
    options = [],
    prepend = null,
    append = null,
    rules = {},
    monthShow = false,
    optionComponent = null,
    control,
    isMulti = false,
    setValue = () => { },
    loadOptions = () => { },
    onChangeValue = () => { },
    onChangeValueSelect = () => { },
    onValueUpdate = () => { },
    onKeyUp = () => { },
    name,
    label = null,
    value = null,
    values = null,
    type,
    errors = [],
    error = null,
    innerRef = null,
    className = "",
    id = null,
    tooltip = null,
    maskOptions = '',
    dateFormat = "YYYY-MM-DD",
    refreshInput = false,
    suggestions = [],
    matchWith = null,
    grouped = false,
    forceValue = false,
    dateRef = null,
    appendTo = false,
    ...extra
}) => {
    const watch = useWatch({ control, name })
    const [passType, setPassType] = useState('password')
    const [key, setId] = useState(getUniqId("input-field"))
    const [editorValue, setEditorValue] = useState(null)
    const [refresh, setRefresh] = useState(null)
    const [kid, setKid] = useState(getUniqId("i"))
    const dispatch = useDispatch()
    const { skin } = useSkin()
    const containerRef = useRef()
    const container = containerRef.current

    useEffect(() => {
        setId(getUniqId("input-field-updated"))
    }, [refreshInput])

    useEffect(() => {
        setRefresh(null)
    }, [key])

    useEffect(() => {
        if (type === "date") {
            setRefresh(value ? value : values ? values[name] : null)
        }
    }, [value, values])

    useEffect(() => {
        if (type === 'editor') {
            setEditorValue(EditorState.createWithContent(
                ContentState.createFromBlockArray(
                    convertFromHTML((value ? value : values ? values[name] : "<p></p>"))
                )))
        }
    }, [type, value, values])

    const inputController = () => {
        const Comp = (type === "mask" ? Cleave : Input)
        const p = {
            x: "1"
        }
        if (type === "mask") {
            p.value = value ? value : values ? values[name] : ''
        }
        if (forceValue) {
            p.value = value
        }

        return (
            <>
                {
                    tooltip ? <UncontrolledTooltip target={id ? id : `input-${name}-tooltip`}>
                        {tooltip}
                    </UncontrolledTooltip> : null}
                <Controller

                    key={`${key}-controller`}
                    control={control}
                    defaultValue={value ? value : values ? values[name] : ''}
                    name={name}
                    rules={rules}
                    render={({ field: { onChange, name, ref } }) => (
                        <>
                            <Comp

                                options={maskOptions}
                                key={`${key}-input`}

                                defaultValue={value ? value : values ? values[name] : ''}
                                onKeyUpCapture={onKeyUp}
                                placeholder={placeholder ?? (label ? FM(label) : FM(name))}
                                type={type === "password" ? passType : type}
                                name={name}
                                onChange={(e) => {
                                    if (type === "file") {
                                        onChange(e?.target?.files)
                                        onChangeValue(e?.target?.files)

                                    } else {
                                        onChange(e?.target?.value)
                                        onChangeValue(e?.target?.value)

                                    }
                                }}
                                invalid={error ?? errors?.hasOwnProperty(name)}
                                {
                                ...extra
                                }
                                {
                                ...p
                                }
                                className='form-control'
                                innerRef={innerRef ?? ref}
                                id={id ? id : `input-${name}-tooltip`}
                            />

                        </>
                    )}
                />
            </>
        )
    }
    const inputCheckboxController = () => {
        return (
            <>
                {
                    tooltip ? <UncontrolledTooltip target={id ? id : `${name}-${type}-${key}-${value ?? ''}`}>
                        {tooltip}
                    </UncontrolledTooltip> : null}
                <Controller
                    key={`${key}-controller`}
                    control={control}
                    defaultValue={value ? value : values ? values[name] : ''}
                    name={name}
                    rules={rules}
                    render={({ field: { onChange, ref } }) => (
                        <Input
                            key={`${key}-input-${value}`}
                            name={name}
                            value={value ? value : values ? values[name] : ''}
                            invalid={error ?? errors?.hasOwnProperty(name)}
                            defaultChecked={(value ? value : values ? values[name] : '') === 1}
                            onKeyUp={onKeyUp}
                            onChange={(e) => {
                                onChangeValue(e?.target?.checked)

                                if (e.target.checked) {
                                    onChange(1)
                                } else {
                                    onChange(0)
                                }
                            }}
                            type={type}
                            {...extra}
                            innerRef={ref}
                            id={id ? id : `${name}-${type}-${key}-${value ?? ''}`}
                        />

                    )}
                />
            </>
        )
    }


    const inputRadioController = () => {
        return (
            <>
                {
                    tooltip ? <UncontrolledTooltip target={id ? id : `${name}-${type}-${key}-${value ?? ''}`}>
                        {tooltip}
                    </UncontrolledTooltip> : null}
                <Controller
                    key={`${key}-controller`}
                    control={control}
                    defaultValue={value ? value : values ? values[name] : ''}
                    name={name}
                    rules={rules}
                    render={({ field: { onChange, ref } }) => (
                        <Input
                            key={`${key}-input-${value}`}
                            name={name}
                            value={(value ? value : values ? values[name] : '')}
                            invalid={error ?? errors?.hasOwnProperty(name)}
                            onKeyUp={onKeyUp}
                            defaultChecked={defaultChecked}
                            onChange={(e) => {
                                onChange(e.target.value)
                                setValue(name, e.target.value)
                                onChangeValue(e?.target?.value)


                            }}
                            type={type}
                            {...extra}
                            innerRef={ref}
                            id={id ? id : `${name}-${type}-${key}-${value ?? ''}`}
                        />

                    )}
                />
            </>
        )
    }
    const selectController = () => {
        return (
            <Select
                grouped={grouped}
                loadOptions={loadOptions}
                control={control}
                value={value ? value : values ? values[name] : ''}
                options={options}
                errors={errors}
                error={error}
                isMulti={isMulti}
                onChangeValue={onChangeValue}
                onKeyUp={onKeyUp}
                onChangeValueSelect={onChangeValueSelect}
                rules={{ ...rules }}
                optionComponent={optionComponent}
                name={name}
                matchWith={matchWith}
                id={`input-${name}-tooltip`}
                {
                ...extra
                }
            />
        )
    }
    const textEditor = () => {
        return (
            <Controller
                key={`${key}-controller`}
                control={control}
                defaultValue={value ? value : values ? values[name] : ''}
                name={name}
                rules={rules}
                render={({ field: { onChange, name, ref } }) => (
                    <div className={className}>
                        <Editor wrapperClassName={error || errors?.hasOwnProperty(name) ? "invalid" : ""} editorState={editorValue} onEditorStateChange={data => {
                            setEditorValue(data)
                            onKeyUp = { onKeyUp }
                            onChangeValue(draftToHtml(convertToRaw(data?.getCurrentContent())))
                            onKeyUp(draftToHtml(convertToRaw(data?.getCurrentContent())))
                            onChange(draftToHtml(convertToRaw(data?.getCurrentContent())))
                        }} />
                    </div>
                )}
            />
        )
    }

    const dateController = () => {
        return (
            <>
                <Controller
                    key={`${key}-controller`}
                    control={control}
                    defaultValue={value ? value : values ? values[name] : ''}
                    name={name}
                    rules={rules}
                    render={({ field: { onChange, ref } }) => (
                        <Flatpickr
                            className={classNames("form-control flatpickr-input", { "bg-white": skin !== "dark", "is-invalid": (error || errors?.hasOwnProperty(name)), "border-end-0": refresh !== null && isValid(watch) && !noGroup, "d-none": options?.inline })}
                            key={`${key}-input`}
                            // disabled={disabled}
                            options={{
                                plugins: monthShow ? [
                                    new monthSelectPlugin({
                                        shorthand: true, //defaults to false
                                        dateFormat: "m.y", //defaults to "F Y"
                                        altFormat: "F Y", //defaults to "F Y"
                                        theme: "dark" // defaults to "light"
                                    })
                                ] : [],
                                // locale: English,
                                time_24hr: false,
                                // dateFormat: options?.enableTime && options?.noCalendar ? "h:i AA" : "Y-m-d H:i",
                                ...options,
                                appendTo: container
                            }}
                            onKeyUp={onKeyUp}
                            value={value ? value : values ? values[name] : ''}
                            placeholder={label ? FM(label) : FM(name)}
                            name={name}
                            onValueUpdate={onValueUpdate}
                            onChange={(e, v, s) => {
                                setRefresh(e[0])
                                if (options?.mode === "multiple" || options?.mode === "range") {
                                    if (dateFormat) {
                                        onChange(e?.map(e => formatDate(e, dateFormat)))
                                    } else {
                                        onChange(e)
                                    }
                                    onChangeValue(e, v, s)
                                } else {
                                    if (dateFormat) {
                                        onChange(formatDate(e[0], dateFormat))
                                    } else {
                                        onChange(e[0])
                                    }
                                    onChangeValue(e[0], v, s)
                                }
                            }}
                            {
                            ...extra
                            }
                            innerRef={ref}
                            ref={dateRef}
                            id={id ? id : `input-${name}-tooltip`}
                        />
                    )}
                />
                <div ref={appendTo ? containerRef : null}> </div>
            </>
        )
    }

    const colorPickerInput = () => {
        return (
            <Controller
                key={`${key}-controller`}
                control={control}
                defaultValue={value ? value : values ? values[name] : ''}
                name={name}
                rules={rules}
                render={({ field: { onChange, ref } }) => (
                    <ColorPicker
                        key={`${key}-input`}
                        onKeyUp={onKeyUp}
                        color={value ? value : values ? values[name] : ''}
                        onChange={(d) => {
                            if (d !== "#000000") {
                                onChange(d)
                                onChangeValue(d)
                            } else {
                                onChange(null)
                                onChangeValue(null)
                            }
                        }}
                        {
                        ...extra
                        }
                        className={classNames("", { "is-invalid": (error || errors?.hasOwnProperty(name)) })}
                        innerRef={ref}
                        id={id ? id : `input-${name}-tooltip`}
                    />
                )}
            />
        )
    }

    if (type === "select") {
        if (control === undefined) {
            console.log('Control Not Found!! Please pass the control form React Hook Form')
            throw new Error('Control Not Found!! Please pass the control form React Hook Form')
        }
        return (
            <>
                {noLabel ? null : <Label for={name}>{label ? FM(label) : FM(name)} {" "}
                    {
                        rules?.required === true ? <span className='text-danger'>*</span> : null
                    } {" "}
                    {message ? <>
                        <UncontrolledTooltip target={`help-tooltip-message-${name}`}>
                            {message}
                        </UncontrolledTooltip>
                        <HelpCircle className='fw-bold' style={{ marginTop: "-2px" }} size={IconSizes.HelpIcon} id={`help-tooltip-message-${name}`} />
                    </> : null}

                </Label>}
                {
                    isValid(errors[name]?.message) ? <UncontrolledTooltip target={`input-${name}-tooltip`}>
                        {errors[name]?.message ?? "sa"}
                    </UncontrolledTooltip> : feedback ? <UncontrolledTooltip target={`input-${name}-tooltip`}>
                        {feedback}
                    </UncontrolledTooltip> : null
                }
                {
                    noGroup ? selectController() : <>
                        <InputGroup className={classNames(className)}>
                            {
                                prepend ?? ''
                            }
                            <div className='flex-1'>
                                {selectController()}
                            </div>

                            {
                                noLabel && message ? <InputGroupText className='cursor-pointer'>
                                    <Info size={IconSizes.InputAddon} id={`help-tooltip-message-${name}`} />
                                    <UncontrolledTooltip target={`help-tooltip-message-${name}`}>
                                        {message}
                                    </UncontrolledTooltip>
                                </InputGroupText> : null}
                            {
                                append ?? ''
                            }
                        </InputGroup>
                    </>
                }

            </>
        )
    } else if (type === "checkbox" || type === "radio") {
        if (control === undefined) {
            console.log('Control Not Found!! Please pass the control form React Hook Form')
            throw new Error('Control Not Found!! Please pass the control form React Hook Form')
        }

        return (
            <>
                {
                    noGroup ? (type === "radio" ? inputRadioController() : inputCheckboxController()) : <div className={`form-check ${className}`}>
                        {noLabel ? null : <>
                            <Label style={{ marginBottom: 2, cursor: "pointer" }} className={classNameLabel} for={id ? id : `${name}-${type}-${key}-${value ?? ''}`}>
                                {label ? FM(label) : FM(name)} {" "}
                                {
                                    rules?.required === true ? <span className='text-danger'>*</span> : null
                                }
                            </Label>
                            {(type === "radio" ? inputRadioController() : inputCheckboxController())}
                        </>}
                    </div>
                }

            </>
        )
    } else if (type === "date") {
        if (control === undefined) {
            console.log('Control Not Found!! Please pass the control form React Hook Form')
            throw new Error('Control Not Found!! Please pass the control form React Hook Form')
        }
        return (
            <>
                {noLabel ? null : <Label for={name}>{label ? FM(label) : FM(name)} {" "}
                    {
                        rules?.required === true ? <span className='text-danger'>*</span> : null
                    } {" "}
                    {message ? <>
                        <UncontrolledTooltip target={`help-tooltip-message-${name}`}>
                            {message}
                        </UncontrolledTooltip>
                        <HelpCircle className='fw-bold' style={{ marginTop: "-2px" }} size={IconSizes.HelpIcon} id={`help-tooltip-message-${name}`} />
                    </> : null}

                </Label>}
                {
                    noGroup ? dateController() : <InputGroup className={classNames(className)}>
                        {
                            prepend ?? ''
                        }

                        {dateController()}
                        {
                            errors[name] && feedback ? <UncontrolledTooltip target={`input-${name}-tooltip`}>
                                {feedback}
                            </UncontrolledTooltip> : null}
                        {
                            noLabel && message ? <InputGroupText className='cursor-pointer'>
                                <Info size={IconSizes.InputAddon} id={`help-tooltip-message-${name}`} />
                                <UncontrolledTooltip target={`help-tooltip-message-${name}`}>
                                    {message}
                                </UncontrolledTooltip>
                            </InputGroupText> : null}
                        <Show IF={refresh !== null && isValid(watch)}>
                            <UncontrolledTooltip target={`clear-tooltip-message-${kid}`}>
                                {FM("clear")}
                            </UncontrolledTooltip>
                            <InputGroupText id={`clear-tooltip-message-${kid}`} className='border-start-0 cursor-pointer' onClick={() => {
                                setId(getUniqId("date-cleated"))
                                setValue(name, "")
                                onChangeValue("")
                            }}>
                                <X size={16} />
                            </InputGroupText>
                        </Show>
                        {
                            append ?? ''
                        }
                    </InputGroup>

                }
                {/* {messageType === "default" && message ? <FormText>
                    {message}
                </FormText> : null}
                {feedbackType === "default" && feedback && errors[name] ? <FormFeedback>
                    {errors[name]?.message !== "" ? errors[name]?.message : feedback}
                </FormFeedback> : null} */}
            </>
        )
    } else if (type === "editor") {
        if (control === undefined) {
            console.log('Control Not Found!! Please pass the control form React Hook Form')
            throw new Error('Control Not Found!! Please pass the control form React Hook Form')
        }
        return (
            <>
                {noLabel ? null : <Label for={name}>{label ? FM(label) : FM(name)} {" "}
                    {
                        rules?.required === true ? <span className='text-danger'>*</span> : null
                    } {" "}
                    {message ? <>
                        <UncontrolledTooltip target={`help-tooltip-message-${name}`}>
                            {message}
                        </UncontrolledTooltip>
                        <HelpCircle className='fw-bold' style={{ marginTop: "-2px" }} size={IconSizes.HelpIcon} id={`help-tooltip-message-${name}`} />
                    </> : null}

                </Label>}
                {
                    isValid(errors[name]?.message) ? <UncontrolledTooltip target={`input-${name}-tooltip`}>
                        {errors[name]?.message}
                    </UncontrolledTooltip> : feedback ? <UncontrolledTooltip target={`input-${name}-tooltip`}>
                        {feedback}
                    </UncontrolledTooltip> : null
                }
                {
                    textEditor()
                }
                {/* {messageType === "default" && message ? <FormText>
                    {message}
                </FormText> : null}
                {feedbackType === "default" && feedback && errors[name] ? <FormFeedback>
                    {errors[name]?.message !== "" ? errors[name]?.message : feedback}
                </FormFeedback> : null} */}
            </>
        )

    } else if (type === "color") {
        if (control === undefined) {
            console.log('Control Not Found!! Please pass the control form React Hook Form')
            throw new Error('Control Not Found!! Please pass the control form React Hook Form')
        }
        return (
            <>
                {noLabel ? null : <Label for={name}>{label ? FM(label) : FM(name)} {" "}
                    {
                        rules?.required === true ? <span className='text-danger'>*</span> : null
                    } {" "}
                    {message ? <>
                        <UncontrolledTooltip target={`help-tooltip-message-${name}`}>
                            {message}
                        </UncontrolledTooltip>
                        <HelpCircle className='fw-bold' style={{ marginTop: "-2px" }} size={IconSizes.HelpIcon} id={`help-tooltip-message-${name}`} />
                    </> : null}

                </Label>}
                {
                    isValid(errors[name]?.message) ? <UncontrolledTooltip target={`input-${name}-tooltip`}>
                        {errors[name]?.message}
                    </UncontrolledTooltip> : feedback ? <UncontrolledTooltip target={`input-${name}-tooltip`}>
                        {feedback}
                    </UncontrolledTooltip> : null
                }
                {
                    noGroup ? colorPickerInput() : <InputGroup className={classNames(className)}>
                        {
                            prepend ?? ''
                        }

                        {colorPickerInput()}

                        {
                            noLabel && message ? <InputGroupText className='cursor-pointer'>
                                <Info size={IconSizes.InputAddon} id={`help-tooltip-message-${name}`} />
                                <UncontrolledTooltip target={`help-tooltip-message-${name}`}>
                                    {message}
                                </UncontrolledTooltip>
                            </InputGroupText> : null}
                        {
                            append ?? ''
                        }
                        {
                            !append && type === "password" ? <InputGroupText className={classNames("cursor-pointer", { "text-primary": (passType === "text") })} onClick={() => {
                                setPassType((passType === "password" ? "text" : "password"))
                            }}>
                                <Eye size={IconSizes.InputAddon} />
                            </InputGroupText> : null
                        }
                    </InputGroup>

                }
                {/* {messageType === "default" && message ? <FormText>
                        {message}
                    </FormText> : null}
                    {feedbackType === "default" && feedback && errors[name] ? <FormFeedback>
                        {errors[name]?.message !== "" ? errors[name]?.message : feedback}
                    </FormFeedback> : null} */}
            </>
        )

    } else {
        if (control === undefined) {
            console.log('Control Not Found!! Please pass the control form React Hook Form')
            throw new Error('Control Not Found!! Please pass the control form React Hook Form')
        }
        return (
            <>
                {noLabel ? null : <Label for={`input-${name}-tooltip`}>{label ? FM(label) : FM(name)} {" "}
                    {
                        rules?.required === true ? <span className='text-danger'>*</span> : null
                    } {" "}
                    {message ? <>
                        <UncontrolledTooltip target={`help-tooltip-message-${name}`}>
                            {message}
                        </UncontrolledTooltip>
                        <HelpCircle className='fw-bold' style={{ marginTop: "-2px" }} size={IconSizes.HelpIcon} id={`help-tooltip-message-${name}`} />
                    </> : null}

                </Label>}
                {
                    isValid(errors[name]?.message) ? <UncontrolledTooltip target={`input-${name}-tooltip`}>
                        {errors[name]?.message}
                    </UncontrolledTooltip> : feedback ? <UncontrolledTooltip target={`input-${name}-tooltip`}>
                        {feedback}
                    </UncontrolledTooltip> : null
                }
                {
                    noGroup ? inputController() : <InputGroup className={classNames(className)}>
                        {
                            prepend ?? ''
                        }
                        {inputController()}
                        {
                            noLabel && message ? <InputGroupText className='cursor-pointer'>
                                <Info size={IconSizes.InputAddon} id={`help-tooltip-message-${name}`} />
                                <UncontrolledTooltip target={`help-tooltip-message-${name}`}>
                                    {message}
                                </UncontrolledTooltip>
                            </InputGroupText> : null}
                        {
                            append ?? ''
                        }
                        {
                            !append && type === "password" ? <InputGroupText className={classNames("cursor-pointer", { "text-primary": (passType === "text") })} onClick={() => {
                                setPassType((passType === "password" ? "text" : "password"))
                            }}>
                                <Eye size={IconSizes.InputAddon} />
                            </InputGroupText> : null
                        }
                    </InputGroup>

                }
                {/* {messageType === "default" && message ? <FormText>
                    {message}
                </FormText> : null}
                {feedbackType === "default" && feedback && errors[name] ? <FormFeedback>
                    {errors[name]?.message !== "" ? errors[name]?.message : feedback}
                </FormFeedback> : null} */}


            </>
        )
    }
}
export default FormGroupCustom
