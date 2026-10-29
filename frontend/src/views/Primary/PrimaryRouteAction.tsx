// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Card, CardBody, Col, Form, FormGroup, Row, Spinner } from 'reactstrap'
import { primaryRouteAction } from '../../utility/apis/primaryRoutes'
import { PrimaryAction } from '../../utility/Const'
import { createConstSelectOptions, isObjEmpty } from '../../utility/Utils'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'

const PrimaryRouteAction = ({ edit, handleReportChange, rowsSelected, preload }) => {
    const [loading, setLoading] = useState(false)
    const { register, errors, handleSubmit, control } = useForm()
    const [reportData, setReportData] = useState({
      
        primary_routes_id: []
    })
  
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(2)
    const [filterData, setFilterData] = useState({
       
      
    })
    
    const submitHandler = (data) => {
        if (handleReportChange) {
            // if (isObjEmpty(errors)) {
                primaryRouteAction({
                    id: edit?.id,
                    jsonData: {
                        ...data,
                        primary_routes_id: rowsSelected
                        
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
                                        name="status"
                                        isClearable
                                        errors={errors}
                                        // label={FM("vacation-trip")}
                                        options={createConstSelectOptions(PrimaryAction)}
                                    />
                            </Col>
                       
                            <Col sm='6' md='6'>
                            <LoadingButton loading={loading}
                                className='mr-1' color='primary' type='submit' id='save'>
                               Confirm
                            </LoadingButton>
                            {/* <UncontrolledTooltip placement='top' target='save'>
                                {FM("confirm")}
                            </UncontrolledTooltip> */}
                        </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </div>
    )
}

export default PrimaryRouteAction
