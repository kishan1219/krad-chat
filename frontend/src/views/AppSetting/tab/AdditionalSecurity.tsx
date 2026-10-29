// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { Plus, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Card, CardHeader, Col, Form, Row, Table } from 'reactstrap'
import { handleLogin } from '../../../redux/authentication'
import { setActiveTab } from '../../../redux/navbar'
import { ipDelete } from '../../../redux/reducers/ip'
import { formatDate } from '../../../utility/Utils'
import { addIp, deleteIp, loadIp } from '../../../utility/apis/IpList'
import { enableApiSecurity } from '../../../utility/apis/userManagement'
import ConfirmAlert from '../../../utility/helpers/ConfirmAlert'
import { isValidArray } from '../../../utility/helpers/common'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'
import Shimmer from '../../components/shimmers/Shimmer'

const AdditionalSecurity = ({ activeTab, user }) => {
    // const user = useSelector(state => state.auth.userData)
    const [loading, setLoading] = useState(false)
    const [api, setApi] = useState(null)
    const [ip, setIp] = useState(null)
    const [loadingSet, setLoadingSet] = useState(false)
    const [loadingX, setLoadingX] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [deletedId, setDeletedId] = useState(null)
    const [copied, setCopied] = useState(false)
    // const userT = useUser()
    const ref = useRef(null)
    const dispatch = useDispatch()

    const getAllIp = () => {
        loadIp({
            success: (d) => {
                setIp(d)
            }
        })
    }

    const enableSecurity = (data) => {
        enableApiSecurity({
            jsonData: {
                ...user,
                ...data,
                is_enabled_api_ip_security: watch("is_enabled_api_ip_security") ? 1 : 0
            },
            success: (d) => {
                const x = {
                    ...user,
                    ...d?.data
                }
                setLoadingX(false)
                dispatch(handleLogin(x))
                dispatch(setActiveTab("7"))
            }
        })
    }

    // useEffect(() => {
    //     if (activeTab === "7") {
    //         enableSecurity()
    //     }
    // }, [watch("is_enabled_api_ip_security")])


    useEffect(() => {
        if (activeTab === "7") {
            getAllIp()
        }
    }, [loading, activeTab])


    const onSubmit = (dataa) => {
        addIp({
            jsonData: {
                ip_address: dataa?.ip_address

            },
            loading: setLoading,
            success: () => {
                ///  getAllIp()
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

    return (
        <>
            <Card className='p-2'>
                <Row>

                    <Card className='border mt-2  col-6'>
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
                                        // tooltip="Enable Api IP Security"
                                        type={"checkbox"}
                                        control={control}
                                        disabled={loadingX}
                                        name="is_enabled_api_ip_security"
                                        value={user?.is_enabled_api_ip_security}
                                        onChangeValue={e => {
                                            setLoadingX(true)
                                            setTimeout(() => {
                                                enableSecurity()
                                            }, 120)
                                        }}
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
                        {
                            loadingX && <>
                                <Shimmer style={{ height: 50, marginBottom: 4, borderRadius: 2 }} />
                                <Shimmer style={{ height: 50, marginBottom: 4, borderRadius: 2 }} />
                            </>
                        }
                        {(!loadingX && user?.is_enabled_api_ip_security === 1 ? <Row className='mb-2'>
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

                                <LoadingButton loading={loading} type='submit' className='btn-icon mt-2 round' color='primary' block>
                                    <Plus size={14} />
                                    <span className='align-middle ms-25'>Add New IP</span>
                                </LoadingButton>
                            </Form>
                        </Row> : "")}

                    </Card>

                    {(!loadingX && user?.is_enabled_api_ip_security === 1 ? <Card className='border mt-2 col-6 p-1'>
                        <CardHeader>
                            <h4 className='h2 text-dark fw-bolder' >
                                Enable additional security
                            </h4>
                        </CardHeader>
                        {loading ? <>   <Shimmer style={{ height: 25, marginBottom: 4, borderRadius: 2 }} />
                            <Shimmer style={{ height: 20, width: "90%", marginBottom: 4, borderRadius: 2 }} />
                            <Shimmer style={{ height: 20, width: "50%", marginBottom: 25, borderRadius: 2 }} />

                            <Shimmer style={{ height: 25, marginBottom: 4, borderRadius: 2 }} />
                            <Shimmer style={{ height: 20, width: "90%", marginBottom: 4, borderRadius: 2 }} />
                            <Shimmer style={{ height: 20, width: "50%", marginBottom: 25, borderRadius: 2 }} />

                            <Shimmer style={{ height: 25, marginBottom: 4, borderRadius: 2 }} />
                            <Shimmer style={{ height: 20, width: "90%", marginBottom: 4, borderRadius: 2 }} />
                            <Shimmer style={{ height: 20, width: "50%", marginBottom: 25, borderRadius: 2 }} />
                            <Shimmer style={{ height: 25, marginBottom: 4, borderRadius: 2 }} />
                            <Shimmer style={{ height: 20, width: "90%", marginBottom: 4, borderRadius: 2 }} />
                            <Shimmer style={{ height: 20, width: "50%", marginBottom: 25, borderRadius: 2 }} />
                        </> : <> <Table responsive>
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
                                {ip?.data?.map((item, i) => {
                                    return (

                                        <tr>
                                            <td className='text-nowrap'> {i + 1}</td>
                                            <td className='text-nowrap'> {item?.ip_address} </td>
                                            <td className='text-nowrap'>  {formatDate(item?.created_at, "DD-MM-YYYY")}</td>
                                            <td className='text-nowrap'>
                                                <ConfirmAlert
                                                    title={`Delete ${item?.ip_address} ?`}
                                                    color='text-warning'
                                                    onClickYes={() => deleteIp({ id: item?.id, loading: setLoadingSet, success: e => { setDeletedId(item?.id); setDeleted(e) }, error: setFailed })}
                                                    // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                                    onSuccess={deleted}
                                                    onFailed={failed}

                                                    onClose={(e) => {
                                                        if (e) {
                                                            dispatch(ipDelete(deletedId))
                                                        }
                                                        setDeleted(null)
                                                        setFailed(null)
                                                    }}
                                                    className="waves-effect btn btn-danger btn-sm"
                                                    id={`grid-delete-${item?.id}`}>
                                                    <Trash2 size={15} />
                                                </ConfirmAlert></td>
                                        </tr>

                                    )
                                })}
                            </tbody>
                        </Table> </>}

                    </Card> : "")}
                </Row>
            </Card>

        </>
    )
}

export default AdditionalSecurity
