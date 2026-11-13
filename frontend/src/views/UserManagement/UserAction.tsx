// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Card, CardBody, Col, Form, Row, Spinner } from 'reactstrap'
import { activeStatus } from '../../utility/Const'
import { createConstSelectOptions } from '../../utility/Utils'
import { userAction } from '../../utility/apis/userManagement'
import FormGroupCustom from '../components/formGroupCustom'

const UserAction = ({ edit, handleReportChange, rowsSelected, preload }) => {
    const [loading, setLoading] = useState(false)
    const { register, errors, handleSubmit, control } = useForm()
    const [reportData, setReportData] = useState({

        user_ids: []
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(2)
    const [filterData, setFilterData] = useState({


    })

    const submitHandler = (data) => {
        if (handleReportChange) {
            const rawStatus = typeof data?.status === 'object' && data?.status !== null ? data?.status?.value : data?.status
            const action = (rawStatus === 1 || rawStatus === '1' || rawStatus === true) ? 'enable' : 'disable'
            userAction({
                id: edit?.id,
                jsonData: {
                    ...data,
                    ids: rowsSelected?.length ? rowsSelected : (edit?.id ? [edit.id] : []),
                    action,
                    user_ids: rowsSelected
                },
                loading: setLoading,
                success: () => {
                    preload()
                }
            })
        }
    }

    return (
        <div>
            <Card>
                <CardBody>
                    <Form onSubmit={handleSubmit(submitHandler)}>
                        <Row>
                            <Col md={6}>
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    noLabel
                                    name="status"
                                    isClearable
                                    errors={errors}
                                    // label={FM("vacation-trip")}
                                    options={createConstSelectOptions(activeStatus)}
                                />
                            </Col>
                            <Col sm='6' md='6'>
                                <Button.Ripple
                                    className='mr-1' color='primary' type='submit' id='save'>
                                    {loading ? <Spinner size="sm" /> : "confirm"}
                                </Button.Ripple>
                                
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </div>
    )
}

export default UserAction
