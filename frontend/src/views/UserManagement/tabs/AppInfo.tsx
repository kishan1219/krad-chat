// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { SlideDown } from '@components/slide-down'
import { Button, Card, CardBody, CardHeader, Col, Form, Input, InputGroup, Label, Row, Table } from 'reactstrap'
import { enableApiSecurity, userChangeApi } from '../../../utility/apis/userManagement'
import { log } from '../../../utility/helpers/common'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FormGroupCustom from '../../components/formGroupCustom'
import { useForm } from 'react-hook-form'
import Repeater from '@components/repeater'
import { Plus, X } from 'react-feather'
import BsTooltip from '../../components/tooltip'
import { addIp, loadIp } from '../../../utility/apis/IpList'
import { formatDate } from '../../../utility/Utils'

const AppInfo = () => {
    const [loading, setLoading] = useState(false)
    const [api, setApi] = useState(null)
    const [ip, setIp] = useState(null)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form


    const [count, setCount] = useState(1)

    const increaseCount = () => {
        setCount(count + 1)
    }

    const deleteForm = e => {
        e.preventDefault()
        const slideDownWrapper = e.target.closest('.react-slidedown'),
            form = e.target.closest('form')
        if (slideDownWrapper) {
            slideDownWrapper.remove()
        } else {
            form.remove()
        }
    }

    const userApi = () => {
        userChangeApi({
            success: (d) => {
                setApi(d)
            }
        })
    }
    useEffect(() => {
        userApi()
    }, [watch("change_api")])

    // log(api)
    const [copySuccess, setCopySuccess] = useState('')
    const textAreaRef = useRef(null)

    const copyToClipboard = (e) => {
        textAreaRef.current.select()
        document.execCommand('copy')
        // This is just personal preference.
        // I prefer to not show the whole text area selected.
        e?.target?.focus()
        setCopySuccess('Copied!')
    }

    const enableSecurity = (data) => {
        enableApiSecurity({
            jsonData: {
                ...data,
                is_enabled_api_ip_security: watch("is_enabled_api_ip_security") ? 1 : 0
            },
            success: (d) => {

            }
        })
    }

    const onSubmit = (dataa) => {
        addIp({
            jsonData: {
                ip_address: dataa?.ip_address

            },
            success: () => {

            }
        })
    }


    useEffect(() => {
        enableSecurity()
    }, [watch("is_enabled_api_ip_security")])


    const getAllIp = () => {
        loadIp({
            success: (d) => {
                setIp(d)
            }
        })
    }
    useEffect(() => {
        getAllIp()
    }, [])

    // log(ip?.data)
    return (
        <>

            <Row>
            <CardBody className='border'>
                <CardHeader className='border-bottom'>
                    <h4 className='h2 text-dark fw-bolder' >
                        Api Keys
                    </h4>
                    <BsTooltip title={"Click here to change the APIs"}>
                        <div className='d-flex justify-content-end'>
                            <FormGroupCustom
                                noLabel
                                noGroup
                                type={"checkbox"}
                                control={control}
                                name="change_api"
                                // value={edit?.userType}
                                isClearable
                                // label="User Type"
                                errors={errors}
                            // label={FM("vacation-trip")}
                            // options={createConstSelectOptions(UserType)}
                            />

                        </div>
                    </BsTooltip>
                </CardHeader>
                {/* {(watch("is_enabled_api_ip_security") === 1 */}
                {/* {(watch("change_api") === 1 ? {userApi} : "")} */}
                <div className='d-flex justify-content-between border'>
                    <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                        App key
                    </div>
                    <div className="mt-1 mb-1 h5 text-dark fw-bolder">
                        {/* <p  ref={textAreaRef}>{api?.app_key}</p> <ContentCopyIcon className='text-success'  onClick={copyToClipboard} /> */}
                        {api?.app_key} <ContentCopyIcon className='text-success' />
                    </div>
                </div>
                <div className='d-flex justify-content-between border-top border bottom'>
                    <div className='mt-1 mb-1 h5 text-dark fw-bolder '>
                        App Secret
                    </div>
                    <div className="mt-1 mb-1 h5 text-dark fw-bolder">
                        {api?.app_secret} <ContentCopyIcon className='text-success' />
                    </div>
                </div>

                <Card className='border mt-2 col-6'>
                    <CardHeader className='p-0 pt-1 mb-2'>
                        <Row className='flex-1 g-2 align-item-center'>
                            <Col md="9">
                                <h4 className='h2 mb-0 pb-0 text-dark fw-bolder' >
                                    Enable additional security
                                </h4>
                            </Col>
                            <Col md="3" className='d-flex justify-content-end'>
                                <FormGroupCustom
                                    noLabel
                                    noGroup
                                    tooltip="Enable Api IP Security"
                                    type={"checkbox"}
                                    control={control}
                                    name="is_enabled_api_ip_security"
                                    // value={edit?.userType}
                                    // isClearable
                                    // label="User Type"
                                    errors={errors}
                                // label={FM("vacation-trip")}
                                // options={createConstSelectOptions(UserType)}
                                />
                            </Col>
                        </Row>
                    </CardHeader>

                    <p className='col-12 fw-bold'>System will accepts requests only from allowed IPs, and all other requests from any random IPs will be discarded</p>

                    {(watch("is_enabled_api_ip_security") === 1 ? <Row className='mb-2'>
                        
                        <Form onSubmit={handleSubmit(onSubmit)}>

                            <Col md="12">
                                <FormGroupCustom

                                    type={"text"}
                                    control={control}
                                    name="ip_address"
                                    // value={edit?.userType}
                                    isClearable
                                    label="IP Address"
                                    placeholder="Enter Your IP Address"
                                    errors={errors}

                                />
                            </Col>
                            <Button type='submit' className='btn-icon mt-2 round' color='primary' >
                                <Plus size={14} />
                                <span className='align-middle ms-25'>Add New IP</span>
                            </Button>
                        </Form>
                    </Row> : "")}

                </Card>
                {(watch("is_enabled_api_ip_security") === 1 ? <Card className='border mt-2 col-6 p-1'>
                    <CardHeader>
                        <h4 className='h2 text-dark fw-bolder' >
                            Enable additional security
                        </h4>
                    </CardHeader>
                    {/* {ip?.map(item, index) => {

                    }} */}

                    {ip?.data?.map((item, i) => {
                        return (

                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th scope='col' className='text-nowrap'>
                                            #
                                        </th>
                                        <th scope='col' className='text-nowrap'>
                                            IP Address
                                        </th>
                                        <th scope='col' className='text-nowrap'>
                                            Created At
                                        </th>
                                        <th scope='col' className='text-nowrap'>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='text-nowrap'>1</td>
                                        <td className='text-nowrap'> {item?.ip_address} </td>
                                        <td className='text-nowrap'> {formatDate(item?.created_at, "DD-MM-YYYY")} {item?.created_at} </td>
                                        <td className='text-nowrap'>Table cell</td>
                                    </tr>
                                </tbody>
                            </Table>

                        )
                    })}
                </Card> : "")}
</CardBody>
            </Row>


            {/* </div> */}

        </>
    )
}

export default AppInfo
