// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import SelectReact, { components } from 'react-select'
import classNames from 'classnames'
import { Controller } from 'react-hook-form'
import { FM, isValid, isValidArray, log } from '../../../utility/helpers/common'
import { DynamicIcon, getSelectValues, getUniqId, makeSelectValues, selectThemeColors } from '../../../utility/Utils'
import Emitter from '../../../utility/Emitter'
import { Events } from '../../../utility/Const'
import Show from '../../../utility/Show'
import { Home } from 'react-feather'

const Select = ({ onChangeValueSelect = () => { }, grouped = false, onChangeValue = () => { }, matchWith = null, error = null, control, options: optionsxx, value, name, rules, isMulti, errors, async = false, isClearable = false, optionComponent = null, loadOptions = () => { }, ...rest }) => {
    const [v, setV] = useState(null)
    const [vvvvv, setVvvvvv] = useState(null)
    const [key, setKey] = useState(getUniqId("select-input"))
    const [options, setOptions] = useState()
    const refff = useRef()

    const { Option } = components
    const IconOption = props => (
        <Option {...props}>
            {isValid(props?.data?.icon) && <props.data.icon className="text-primary" size={14} style={{ marginTop: -3 }} />}
            {isValid(props?.data?.icon) && " "}
            {props.data.label}
        </Option>
    )

    useEffect(() => {
        if (isValidArray(optionsxx)) {
            if (!isValidArray(options)) {
                setOptions(optionsxx)
            }
        }
    }, [options, optionsxx])

    useEffect(() => {
        // log(refff?.current?.props?.options)
        if (isValidArray(refff?.current?.props?.options)) {
            setOptions(refff?.current?.props?.options)
        }
    }, [refff?.current?.props?.options])

    useEffect(() => {
        if (v) {
            log('xx', makeSelectValues(options, v, isMulti, matchWith, grouped))
            setVvvvvv(makeSelectValues(options, v, isMulti, matchWith, grouped))
            log('x', v)
        } else {
            setVvvvvv(makeSelectValues(options, value, isMulti, matchWith, grouped))
            log('y', v)

        }
    }, [v, options, isMulti, matchWith, grouped, value])

    useEffect(() => {
        log('vvvvv', vvvvv)
    }, [vvvvv])

    useEffect(() => {
        if (isValid(vvvvv)) {
            setTimeout(() => {
                setKey('added')
            }, 1000)
        }
    }, [vvvvv])


    if (async) {
        return (
            <>
                <Controller
                    // key={`control-select-${key}-${options?.length}`}
                    control={control}
                    defaultValue={value}
                    name={name}
                    rules={rules}
                    render={({ field: { onChange, ref } }) => (
                        <AsyncPaginate
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            key={`select-${key}`}
                            placeholder={FM("select")}
                            name={name}
                            // ref={refff}
                            selectRef={refff}
                            isMulti={isMulti}
                            components={{ Option: IconOption }}

                            theme={selectThemeColors}
                            className={classNames('react-select', { 'is-invalid': (error ?? errors[name]) })}
                            classNamePrefix='select'
                            isClearable={isClearable}
                            // options={options}
                            loadOptions={loadOptions}
                            defaultValue={vvvvv}
                            onChange={val => {
                                // log('chamnging', val)
                                if (isMulti) {
                                    onChange(getSelectValues(val, matchWith))
                                    setV(getSelectValues(val, matchWith))
                                    onChangeValue(getSelectValues(val, matchWith))
                                    onChangeValueSelect(getSelectValues(val, null))
                                } else {
                                    if (matchWith) {
                                        onChange(val?.value[matchWith])
                                        setV(val?.value[matchWith])
                                        onChangeValue(val?.value[matchWith])
                                        onChangeValueSelect(val?.value)
                                    } else {
                                        onChange(val?.value)
                                        setV(val?.value)
                                        onChangeValue(val?.value)
                                        onChangeValueSelect(val?.value)
                                    }
                                }
                            }}
                            additional={{
                                page: 1
                            }}
                            {
                            ...rest
                            }
                        />
                    )}
                />
            </>
        )
    } else {
        return (
            <>

                <Controller
                    key={`control-select-${key}-${options?.length}`}
                    control={control}
                    defaultValue={value}
                    name={name}
                    rules={rules}
                    render={({ field: { onChange, ref } }) => (
                        <SelectReact
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            key={`select-${key}-${options?.length}`}
                            selectRef={refff}

                            isMulti={isMulti}
                            placeholder={FM("select")}
                            name={name}
                            components={{ Option: IconOption }}
                            theme={selectThemeColors}
                            className={classNames('react-select', { 'is-invalid': (error ?? errors[name]) })}
                            classNamePrefix='select'
                            isClearable={isClearable}
                            options={options}
                            // onMenuScrollToBottom={() => {
                            //     log("test")
                            // }}
                            value={v ? makeSelectValues(options, v, isMulti, matchWith, grouped) : makeSelectValues(options, value, isMulti, matchWith, grouped)}
                            onChange={val => {
                                // log("val", val)
                                // if (isMulti) {
                                //     onChange(getSelectValues(val))
                                //     setV(getSelectValues(val))
                                //     onChangeValue(getSelectValues(val))

                                // } else {
                                //     onChange(val?.value)
                                //     setV(val?.value)
                                //     onChangeValue(val?.value)

                                // }
                                if (isMulti) {
                                    onChange(getSelectValues(val, matchWith))
                                    setV(getSelectValues(val, matchWith))
                                    onChangeValue(getSelectValues(val, matchWith))
                                    onChangeValueSelect(getSelectValues(val, matchWith))
                                } else {
                                    if (matchWith) {
                                        onChange(val?.value[matchWith])
                                        setV(val?.value[matchWith])
                                        onChangeValue(val?.value[matchWith])
                                        onChangeValueSelect(val?.value)

                                    } else {
                                        onChange(val?.value)
                                        setV(val?.value)
                                        onChangeValue(val?.value)
                                        onChangeValueSelect(val?.value)

                                    }
                                }
                            }}
                            {
                            ...rest
                            }
                        />
                    )}
                />
            </>
        )
    }
}

export default Select
