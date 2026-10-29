// @ts-nocheck
// ** React Imports

// ** Third Party Components
import classnames from 'classnames'
import Chart from 'react-apexcharts'
import * as Icon from 'react-feather'

// ** Reactstrap Imports
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle
} from 'reactstrap'

const Charts = props => {

    const data = props?.edit

    const processing = data?.total_contacts - data?.total_failed - data?.total_block_number - data?.total_delivered - data?.total_invalid_number
    const options = {
        chart: {
            toolbar: {
                show: false
            }
        },
        labels: ['Answered', 'Failed', 'In-Valid', 'Process', 'Block'],
        dataLabels: {
            enabled: true
        },
        legend: { show: true },
        stroke: {
            width: 4
        },
        colors: [props.success, props.danger, props.warning, props.info, props.secondary]
    },
        series = [data?.total_delivered, data?.total_failed, data?.total_invalid_number, processing, data?.total_block_number]

    const renderChartInfo = () => {
        return data.listData.map((item, index) => {
            const IconTag = Icon[item.icon]

            return (
                <div
                    key={index}
                    className={classnames('d-flex justify-content-between', {
                        'mb-1': index !== data.listData.length - 1
                    })}
                >
                    <div className='d-flex align-items-center'>
                        <IconTag
                            size={15}
                            className={classnames({
                                [item.iconColor]: item.iconColor
                            })}
                        />
                        <span className='fw-bold ms-75'>{item.text}</span>
                    </div>
                    <span>{item.result}</span>
                </div>
            )
        })
    }

    return data !== null ? (
        <Card className='border'>
            <CardHeader className='align-items-end border-bottom'>
                <CardTitle tag='h4'>Status</CardTitle>

            </CardHeader>
            <CardBody className='mb-2'>
                <Chart options={options} series={series} type='pie' height={325} />
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} className='text-success' />
                        <span className='fw-bold ms-75'>Answered</span>
                    </div>
                    <span>{data?.total_delivered}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} className='text-danger' />
                        <span className='fw-bold ms-75'>Failed</span>
                    </div>
                    <span>{data?.total_failed}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} className='text-warning' />
                        <span className='fw-bold ms-75'>Invalid</span>
                    </div>
                    <span>{data?.total_invalid_number}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} className='text-info' />
                        <span className='fw-bold ms-75'>Processing</span>
                    </div>
                    <span>{data?.total_contacts - data?.total_failed - data?.total_block_number - data?.total_delivered - data?.total_invalid_number}</span>
                </div>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} className='text-secondary' />
                        <span className='fw-bold ms-75'>Block</span>
                    </div>
                    <span>{data?.total_block_number}</span>
                </div>
            </CardBody>
        </Card>
    ) : null
}
export default Charts
