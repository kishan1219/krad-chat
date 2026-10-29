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
import { formatIndianNumber, isValid, log } from '../../utility/helpers/common'
import useUser from '../../utility/hooks/useUser'
import Show from '../../utility/Show'
import { formatDate, minusDay } from '../../utility/Utils'

const WhatsappStatus = props => {
    // ** State
    //   const [data, setData] = useState(null)

    const user = useUser()

    // find the previous date in YY/MM/DD Format
    // const previousDate = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString('en-IN')

    const data = props?.dashboards?.till_yesterday_whatsapp

    const options = {
        chart: {
            toolbar: {
                show: false
            }

        },

        labels: ['Delivered', 'Failed', 'Other', 'Processing', "Read", "Sent"],
        dataLabels: {
            enabled: true
        },
        legend: { show: false, position: 'bottom' },
        stroke: {
            width: 4
        },
        // colors: [props.success, props.danger, props.warning, props.secondary, props.progress, props.dark]
        colors: [props.success, props.danger, props.dark, props.secondary, props.info, props.warning]
    },
        // series = [0, 0, 0, 6579934, 6579934]
        series = [Number(data?.total_delivered), Number(data?.total_failed), Number(data?.total_other), Number(data?.total_process), Number(data?.total_read), Number(data?.total_sent)]


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
                <hr />
                <Show IF={user?.userType === 0 || user?.userType === 3}>
                    <div className='d-flex justify-content-between mb-1'>
                        <div className='d-flex align-items-center'>
                            <Icon.Circle size={15} className='text-success' />
                            <span className='fw-bold ms-75'>Delivered</span>
                        </div>
                        <span>{isValid(data?.total_delivered) ? formatIndianNumber(parseInt(data?.total_delivered)) : 0}</span>
                    </div>
                    <div className='d-flex justify-content-between mb-1'>
                        <div className='d-flex align-items-center'>
                            <Icon.Circle size={15} className='text-danger' />
                            <span className='fw-bold ms-75'>Failed</span>
                            
                        </div>
                        <span>{isValid(data?.total_failed) ? formatIndianNumber(parseInt(data?.total_failed)) : 0}</span>
                    </div>
                    <div className='d-flex justify-content-between mb-1'>
                        <div className='d-flex align-items-center'>
                            <Icon.Circle size={15} className='text-warning' />
                            <span className='fw-bold ms-75'>Other</span>
                        </div>
                        <span>{isValid(data?.total_other) ? formatIndianNumber(parseInt(data?.total_other)) : 0}</span>
                    </div>
                    <div className='d-flex justify-content-between mb-1'>
                        <div className='d-flex align-items-center'>
                            <Icon.Circle size={15} className='text-secondary' />
                            <span className='fw-bold ms-75'>Processing</span>
                        </div>
                        <span>{isValid(data?.total_process) ? formatIndianNumber(parseInt(data?.total_process)) : 0}</span>
                    </div>
                </Show>
                <div className='d-flex justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} className='text-success' />
                        <span className='fw-bolder ms-75'>Total Submission</span>
                    </div>
                    <span className='fw-bolder'>{isValid(data?.total_sent) ? formatIndianNumber(parseInt(data?.total_sent)) : 0}</span>
                </div>
                <div className='d-flex justify-content-between'>
                    <div className='d-flex align-items-center'>
                        <Icon.Circle size={15} className='text-info' />
                        <span className='fw-bolder ms-75'>Total Read</span>
                    </div>
                    <span className='fw-bolder'>{isValid(data?.total_read) ? formatIndianNumber(parseInt(data?.total_read)) : 0}</span>
                </div>

            </CardBody>
        </Card>
    ) : null
}
export default WhatsappStatus
