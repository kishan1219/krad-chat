// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardBody, Col, Form, Row } from 'reactstrap'
import { blacklistAction } from '../../utility/apis/blacklist'
import LoadingButton from '../components/buttons/LoadingButton'

const BlackListAction = ({ edit, handleReportChange, rowsSelected, preload }) => {
    const [loading, setLoading] = useState(false)
    const { register, errors, handleSubmit, control } = useForm()
    const [reportData, setReportData] = useState({

        blacklists_id: []
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(2)
    const [filterData, setFilterData] = useState({


    })

    const submitHandler = (data) => {
        if (handleReportChange) {
            // if (isObjEmpty(errors)) {
            blacklistAction({
                id: edit?.id,
                jsonData: {
                    ...data,
                    blacklists_id: rowsSelected

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
                           
                            <Col sm='6' md='6'>
                                <LoadingButton loading={loading}
                                    className='mr-1' color='primary' type='submit' id='save'>
                                    BlackList
                                </LoadingButton>
                               
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </div>
    )
}

export default BlackListAction
