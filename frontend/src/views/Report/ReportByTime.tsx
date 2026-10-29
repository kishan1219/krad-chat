// @ts-nocheck
import React, { useEffect, useState } from 'react'
import Header from '../components/header'
import HourglassBottom from '@mui/icons-material/HourglassBottom'
import { reportByTime } from '../../utility/apis/report'
import { Button, ButtonGroup, Card, CardBody, Col, Row, Table, UncontrolledTooltip } from 'reactstrap'
import FormGroupCustom from '../components/formGroupCustom'
import { useForm } from 'react-hook-form'
import { isValid, log } from '../../utility/helpers/common'
import classNames from 'classnames'
import Shimmer from '../components/shimmers/Shimmer'
import Show from '../../utility/Show'
import { RefreshCcw } from 'react-feather'
import { formatDate, minusDay } from '../../utility/Utils'

const ReportByTime = () => {
    const [loading, setLoading] = useState(false)
    const [frame, setFrame] = useState(null)
    const [filterData, setFilterData] = useState({
        // per_page_record: 15,
        // user_id: ""
    })
    const [reload, setReload] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    
    const preload = () => {
        reportByTime({
            perPage: 1000,
            // jsonData: {
            //     from_date: watch('from_date'),
            //     to_date: watch('to_date')
            // },
            loading: setLoading,
            // dispatch,
            success: (e) => {
                setFrame(e)

            }
        })
    }

    useEffect(() => {
        // check if from date to date is valid
        // if (isValid(watch('from_date')) && isValid(watch('to_date'))) {
            preload()
      

    }, [])

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    return (
        <>
            <Header title={"Report By Time Frame(30 Sec)"} icon={<HourglassBottom />} >
                <ButtonGroup>
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { preload() }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>
            <Card>
                {/* <Row className='justify-content-start mx-0'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                        <FormGroupCustom
                            noLabel
                            defaultOptions
                            control={control}
                            name={"from_date"}
                            type={"date"}
                            errors={errors}
                            label={"From"}
                            options={{
                                minDate: formatDate(new Date(
                                    minusDay(
                                        new Date(), 30
                                    )
                                ))
                            }}
                            dateFormat={"YYYY-MM-DD"}
                            setValue={setValue}
                            
                            className={classNames("mb-1")}
                        />
                    </Col>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                        <FormGroupCustom
                            noLabel
                            defaultOptions
                            control={control}
                            name={"to_date"}
                            type={"date"}
                            errors={errors}
                            // isDisable
                            options={{
                                // enableTime: true,
                                minDate: watch("from_date")
                            }}
                            label={"To"}
                            dateFormat={"YYYY-MM-DD"}
                            setValue={setValue}
                            isClearable
                            className={classNames("mb-1")}
                        />
                    </Col>
                </Row> */}
                <Row className='mt-2'>
                    {loading ? <>
                        <Col md='12'>
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        </Col>
                    </> : <>
                        <Show IF={isValid(frame)}>
                            <Table striped responsive>
                                <thead>
                                    <tr>
                                        <th scope='col' className='text-nowrap'>
                                            #
                                        </th>
                                        <th scope='col' className='text-nowrap'>
                                            Time Difference(in seconds)
                                        </th>
                                        <th scope='col' className='text-nowrap'>
                                            Total Delivered.
                                        </th>
                                    </tr>
                                </thead>

                                {frame?.map((item, index) => {
                                    return (
                                        <>
                                            <tbody>
                                                <tr>
                                                    <td className='text-nowrap' > {index + 1} </td>
                                                    <td className='text-nowrap'> {item?.difference_in_seconds}</td>
                                                    <td className='text-nowrap'> {item?.total_delivered}</td>
                                                </tr>
                                            </tbody>
                                        </>
                                    )
                                })}

                            </Table>
                        </Show>
                    </>}

                    <Show IF={!isValid(frame)}>
                                            
                        <CardBody className='text-center'>
                            No Record Found
                            </CardBody>
                        
                    </Show>

                </Row>
            </Card>
        </>
    )
}

export default ReportByTime
