// @ts-nocheck
// ** Third Party Components
import Chart from 'react-apexcharts'
import Flatpickr from 'react-flatpickr'
import { Calendar } from 'react-feather'

// ** Reactstrap Imports
import { Card, CardHeader, CardTitle, CardBody } from 'reactstrap'
import { log } from '../../utility/helpers/common'

const MonthlyReportChart2 = ({ direction, reportData }) => {

    log("reportData", reportData)
    const columnColors = {
       
        series5: '#9BCF53',
        series6: '#EE4266',
        series7: '#FF6868',
        series8: '#50727B',
        bg: 'rgb(34 40 49 / 5%)'
    }

    // ** Chart Options
    const options = {
        chart: {
            height: 400,
            type: 'bar',
            stacked: true,
            parentHeightOffset: 0,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                columnWidth: '15%',
                colors: {
                    // backgroundBarColors: [columnColors.bg, columnColors.bg, columnColors.bg, columnColors.bg, columnColors.bg],
                    backgroundBarRadius: 10
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'top',
            horizontalAlign: 'start'
        },
        colors: [columnColors.series5, columnColors.series6, columnColors.series7, columnColors.series8],
        stroke: {
            show: true,
            colors: ['transparent']
        },
        grid: {
            xaxis: {
                lines: {
                    show: true
                }
            }
        },
        xaxis: {
            categories: reportData?.map(e => e.group_name)
        },
        fill: {
            opacity: 1
        },
        yaxis: {
            opposite: direction === 'rtl'
        }
    }

    // ** Chart Series
    const series = [
      
        {
            name: 'SMS count Delivered',
            data: reportData?.map(e => e.sms_count_delivered)
        },
        {
            name: 'SMS count Failed',
            data: reportData?.map(e => e.sms_count_failed)
        },
        {
            name: 'SMS count Invalid',
            data: reportData?.map(e => e.sms_count_invalid)
        },
        {
            name: 'SMS count Rejected',
            data: reportData?.map(e => e.sms_count_rejected)
        }
    ]

    return (
        <Card>
            {/* <CardHeader className='d-flex flex-md-row flex-column justify-content-md-between justify-content-start align-items-md-center align-items-start'>
                <CardTitle tag='h4'>Data Science</CardTitle>
                <div className='d-flex align-items-center mt-md-0 mt-1'>
                    <Calendar size={17} />
                    <Flatpickr
                        className='form-control flat-picker bg-transparent border-0 shadow-none'
                        options={{
                            mode: 'range',
                            // eslint-disable-next-line no-mixed-operators
                            defaultDate: [new Date(), new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000)]
                        }}
                    />
                </div>
            </CardHeader> */}
            <CardBody>
                <Chart options={options} series={series} type='bar' height={400} />
            </CardBody>
        </Card>
    )
}
export default MonthlyReportChart2
