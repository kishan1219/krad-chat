// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Download, ChevronDown, RefreshCw } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Card, CardBody, CardHeader, CardTitle, Col, Form, Row, Button } from 'reactstrap'
import { exportReportByUserId, checkExportStatus, downloadExportOfSMS } from '../../utility/apis/report'
import { loadUserChild } from '../../utility/apis/userManagement'
import { createAsyncSelectMultiUserOptions, formatDate } from '../../utility/Utils'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import DataTable from 'react-data-table-component'
import { useSelector } from 'react-redux'
import Hide from '../../utility/Hide'
import Header from '../components/header'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const ExportAllReport = () => {
    const [loading, setLoading] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, setError } = form
    const [user, setUser] = useState(null)
    const [tableData, setTableData] = useState([])
    const loginUser = useSelector(state => state.auth.userData)
    const navigate = useNavigate()

    const loadUserData = async (search, loadedOptions, { page }) => {
        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)
    }

    const preloadData = () => {
        exportReportByUserId({
            user_id: loginUser?.userType === 0 ? null : loginUser?.id,
            loading: setLoading,
            success: (e) => {
                if (e?.data) {
                    setTableData(e?.data)
                } else if (Array.isArray(e)) {
                    setTableData(e)
                }


            },
            errors: (e) => {
                // Handle errors if needed
            }
        })
    }

    useEffect(() => {
        // if (loginUser?.userType === 1 || loginUser?.userType === 2) {
        //     preloadData()
        // } 
        preloadData()
    }, [])
    const handleCheckStatus = (id) => {
        checkExportStatus({
            id,
            loading: (l) => {
                // Optional: specific row loading state could be handled here if needed
            },
            success: (data) => {
                const updatedStatus = data?.status || data?.data?.status

                if (updatedStatus) {
                    setTableData(prevData => prevData.map(row => {
                        if (row.id === id) {
                            return { ...row, status: updatedStatus }
                        }
                        return row
                    }))
                } else if (data?.data && Array.isArray(data.data) === false) {
                    setTableData(prevData => prevData.map(row => {
                        if (row.id === id) {
                            return { ...row, ...data.data }
                        }
                        return row
                    }))
                }
            }
        })
    }

    const handleDownload = (fileName) => {
        downloadExportOfSMS({
            file_name: fileName,
            loading: setLoading,
            success: (data) => {
                if (data instanceof Blob) {
                    const url = window.URL.createObjectURL(data)
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', fileName)
                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                    window.URL.revokeObjectURL(url)
                } else if (data?.download_url) {
                    window.open(data?.download_url, "_blank")
                } else if (data?.data?.download_url) {
                    window.open(data?.data?.download_url, "_blank")
                }
            }
        })
    }

    const columns = [
        // {
        //     name: 'ID',
        //     selector: row => row.id,
        //     sortable: true
        // },
        {
            name: 'File Name',
            selector: row => row.file_name,
            sortable: true
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true
        },
        {
            name: 'Date',
            selector: row => formatDate(row.created_at),
            sortable: true
        },
        {
            name: 'Action',
            cell: row => (
                <>
                    {row.status === "completed" ? (
                        <Button.Ripple
                            color='flat-success'
                            size='sm'
                            onClick={() => handleDownload(row.file_name)}
                            title="Download"
                        >
                            <Download size={14} />
                        </Button.Ripple>
                    ) : (
                        <Button.Ripple
                            color='flat-primary'
                            size='sm'
                            onClick={() => handleCheckStatus(row.id)}
                            title="Check Status"
                        >
                            <RefreshCw size={14} />
                        </Button.Ripple>
                    )}
                </>
            )
        }
    ]

    const submitHandler = (data) => {
        if (!data?.user_id) {
            setError("user_id", { type: "required", message: "User is required" })
            return
        }
        exportReportByUserId({
            user_id: data?.user_id,
            loading: setLoading,
            success: (e) => {
                if (e?.data) {
                    setTableData(e?.data)
                } else if (Array.isArray(e)) {
                    setTableData(e)
                }


            },
            errors: (e) => {
                // Handle errors if needed
            }
        })
    }

    return (

        <>
            <Header title="Export All Report" icon={<ArrowBack onClick={() => navigate(-1)} />} />
            <Card>

                <CardBody>
                    <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2}>
                        <Form onSubmit={handleSubmit(submitHandler)}>
                            <Row>
                                <Col md="6">
                                    <FormGroupCustom
                                        async
                                        loadOptions={loadUserData}
                                        type={"select"}
                                        control={control}
                                        name="user_id"
                                        isClearable
                                        className='mb-1'
                                        label="User"
                                        errors={errors}
                                        options={user}
                                        rules={{ required: "User is required" }}
                                    />
                                </Col>
                                <Col md="2" className='d-flex align-items-center'>
                                    <LoadingButton loading={loading} type='submit' className='btn-icon mt-0 btn-md' color='primary'>
                                        <Download size={14} />
                                        <span className='align-middle ms-25'>Export</span>
                                    </LoadingButton>
                                </Col>
                            </Row>
                        </Form>
                    </Hide>
                    <div className='react-dataTable mt-2'>
                        <DataTable
                            noHeader
                            pagination
                            data={tableData}
                            columns={columns}
                            className='react-dataTable'
                            sortIcon={<ChevronDown size={10} />}
                        // paginationRowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    </div>
                </CardBody>
            </Card>
        </>
    )
}

export default ExportAllReport
