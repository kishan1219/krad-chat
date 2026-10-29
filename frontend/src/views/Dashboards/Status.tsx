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
    CardTitle,

    Row
} from 'reactstrap'
import { formatIndianNumber, log } from '../../utility/helpers/common'
import Show from '../../utility/Show'
import useUser from '../../utility/hooks/useUser'
import { formatDate, minusDay } from '../../utility/Utils'

const Status = props => {
    // ** State
    //   const [data, setData] = useState(null)
    const previousDate = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString('en-IN')

    const user = useUser()
    const data = props?.dashboards?.till_yesterday_sms

    const options = {
        chart: {
            toolbar: {
                show: false
            }

        },

        labels: ['Delivered', 'Failed', 'Invalid', 'Processing', "Total Voice Sms"],
        dataLabels: {
            enabled: true
        },
        legend: { show: false, position: 'bottom' },
        stroke: {
            width: 4
        },
        colors: [props.success, props.danger, props.warning, props.secondary]
    },
  
        // series = [0, 0, 0, 6579934, 6579934]
        series = [Number(data?.total_delivered), Number(data?.total_failed), Number(data?.total_invalid_number), Number(data?.total_process)]
    const userOptions = {
        chart: {
            toolbar: {
                show: false
            }

        },

        labels: ['Delivered'],
        dataLabels: {
            enabled: true
        },
        legend: { show: false, position: 'bottom' },
        stroke: {
            width: 4
        },
        colors: [props.success, props.danger, props.warning, props.secondary]
    },
        userSeries = [Number(data?.total_delivered)]

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
        <Card >
            <CardHeader className='align-items-end'>
                <CardTitle tag='h4'>{props.title} <br /> <small>Till {formatDate(minusDay(new Date(), 1), 'YYYY-MM-DD')} </small></CardTitle>

            </CardHeader>
            <CardBody className='mb-2'>

                <Chart options={options} series={series} type='pie' height={275} />
                {/* <Chart options={userOptions} series={userSeries} type='pie' height={275} /> */}
                <hr />
                <Show IF={user?.userType === 0 || user?.userType === 3}>
                    <div className='d-flex justify-content-between mb-1'>
                        <div className='d-flex align-items-center'>
                            <Icon.Circle size={15} className='text-success' />
                            <span className='fw-bold ms-75'>Delivered</span>
                        </div>
                        <span>{formatIndianNumber(parseInt(data?.total_delivered)) ?? 0}</span>
                    </div>
                    <div className='d-flex justify-content-between mb-1'>
                        <div className='d-flex align-items-center'>
                            <Icon.Circle size={15} className='text-danger' />
                            <span className='fw-bold ms-75'>Failed</span>
                        </div>
                        <span>{formatIndianNumber(parseInt(data?.total_failed)) ?? 0}</span>
                    </div>
                    <div className='d-flex justify-content-between mb-1'>
                        <div className='d-flex align-items-center'>
                            <Icon.Circle size={15} className='text-warning' />
                            <span className='fw-bold ms-75'>Invalid</span>
                        </div>
                        <span>{formatIndianNumber(parseInt(data?.total_invalid_number)) ?? 0}</span>
                    </div>
                    <div className='d-flex justify-content-between mb-1'>
                        <div className='d-flex align-items-center'>
                            <Icon.Circle size={15} className='text-secondary' />
                            <span className='fw-bold ms-75'>Processing</span>
                        </div>
                        <span>{formatIndianNumber(parseInt(data?.total_process)) ?? 0}</span>
                    </div>
                </Show>
                <div className='d-flex justify-content-between'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} className='text-info' />
                        <span className='fw-bolder ms-75'>Total Submission</span>
                    </div>
                    <span className='fw-bolder'>{formatIndianNumber(parseInt(data?.total_sent)) ?? 0}</span>
                </div>

            </CardBody>
        </Card>
    ) : null
}
export default Status
