// @ts-nocheck
// ** React Imports

// ** Third Party Components
import Chart from 'react-apexcharts'
import * as Icon from 'react-feather'

// ** Reactstrap Imports
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle
} from 'reactstrap'
import { log } from '../../utility/helpers/common'
import { useEffect, useState, useMemo } from 'react'

const WaCharts = props => {
    const [processCount, setProcessCount] = useState(0)

    const data = props?.edit

    const { processing, totalDeliveredMessage, options, series } = useMemo(() => {
        const total_contacts = Number(data?.total_contacts || 0)
        const total_block_number = Number(data?.total_block_number || 0)
        const total_delivered = Number(data?.total_delivered || 0)
        const total_failed = Number(data?.total_failed || 0)
        const total_read = Number(data?.total_read || 0)
        const total_invalid_number = Number(data?.total_invalid_number || 0)
        const total_other = Number(data?.total_other || 0)
        const total_sent = Number(data?.total_sent || 0)

        const proc = total_contacts - (total_block_number + total_delivered + total_failed + total_read + total_invalid_number + total_other + total_sent)
        const totalDelivered = total_delivered + total_sent + total_read

        const chartOptions = {
            chart: {
                toolbar: {
                    show: false
                }
            },
            labels: ['Delivered+Read+Sent', 'Block', 'Failed', 'Invalid', 'Other'],
            dataLabels: {
                enabled: true
            },
            legend: { show: true },
            stroke: {
                width: 4
            },
            colors: [
                (props.read || '').trim(),
                (props.block || '').trim(),
                (props.failed || '').trim(),
                (props.invalid || '').trim(),
                (props.other || '').trim()
            ].filter(Boolean)
        }

        const chartSeries = [
            Number(totalDelivered),
            Number(total_block_number),
            Number(total_failed),
            Number(total_invalid_number),
            Number(total_other)
        ]

        return {
            processing: proc,
            totalDeliveredMessage: totalDelivered,
            options: chartOptions,
            series: chartSeries
        }
    }, [data, props.success, props.block, props.failed, props.invalid, props.other])

    useEffect(() => {
        setProcessCount(processing)
    }, [processing])

    log(processCount, "processing")

    return data !== null ? (
        <Card className='border'>
            <CardHeader className='align-items-end border-bottom'>
                <CardTitle tag='h4'>Status</CardTitle>

            </CardHeader>
            <CardBody className='mb-2'>
                <Chart options={options} series={series} type='pie' height={325} />
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} style={{ color: '#128C7E' }} />
                        <span className='fw-bold ms-75'>Delivered </span>
                    </div>
                    <span>{data?.total_delivered}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} style={{ color: '#F44336' }} />
                        <span className='fw-bold ms-75'>Failed</span>
                    </div>
                    <span>{data?.total_failed}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} style={{ color: '#9E9E9E' }} />
                        <span className='fw-bold ms-75'>Invalid</span>
                    </div>
                    <span>{data?.total_invalid_number}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} style={{ color: '#075E54' }} />
                        <span className='fw-bold ms-75'>Other</span>
                    </div>
                    <span>{data?.total_other}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} style={{ color: '#25D366' }} />
                        <span className='fw-bold ms-75'>Read</span>
                    </div>
                    <span>{data?.total_read}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} style={{ color: '#63C1A0' }} />
                        <span className='fw-bold ms-75'>Processing</span>
                    </div>
                    <span>{processing}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} style={{ color: '#34B7F1' }} />
                        <span className='fw-bold ms-75'>Sent</span>
                    </div>
                    <span>{data?.total_sent}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} style={{ color: '#FF5722' }} />
                        <span className='fw-bold ms-75'>Block</span>
                    </div>
                    <span>{data?.total_block_number}</span>
                </div>


            </CardBody>
        </Card>
    ) : null
}

export default WaCharts
