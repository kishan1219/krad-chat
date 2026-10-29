// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardBody, Col, Form, Row } from 'reactstrap'
import { Applicable } from '../../utility/Const'
import { createConstSelectOptions } from '../../utility/Utils'
import { dlrAction } from '../../utility/apis/dlr'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'

const DlrAction = ({ edit, handleReportChange, rowsSelected, preload }) => {
    const [loading, setLoading] = useState(false)
    const { register, errors, handleSubmit, control } = useForm()
    const [reportData, setReportData] = useState({

        dlrcode_vender_ids: []
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(2)
    const [filterData, setFilterData] = useState({

    })


    const submitHandler = (data) => {
        if (handleReportChange) {
            // if (isObjEmpty(errors)) {
            dlrAction({
                id: edit?.id,
                jsonData: {
                    ...data,
                    dlrcode_vender_ids: rowsSelected,
                    status: 1
                    // reportData
                },
                loading: setLoading,
                success: () => {
                    preload()
                }
            })
            // }
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
                                    name="action"
                                    isClearable
                                    errors={errors}
                                    // label={FM("vacation-trip")}
                                    options={createConstSelectOptions(Applicable)}
                                />
                            </Col>

                            <Col sm='6' md='6'>
                                <LoadingButton loading={loading}
                                    className='mr-1' color='primary' type='submit' id='save'>
                                    Confirm
                                </LoadingButton>

                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </div>
    )
}

export default DlrAction
