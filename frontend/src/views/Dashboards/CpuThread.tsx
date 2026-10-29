// @ts-nocheck
// ** React Imports
import { useContext } from 'react'

// ** Third Party Components
import { ThemeColors } from '@src/utility/context/ThemeColors'
import Chart from 'react-apexcharts'

// ** Reactstrap Imports
import {
    Card,
    CardBody,
    CardHeader,
    CardText,
    CardTitle,
    Col,
    Row
} from 'reactstrap'

const CpuThread = props => {
    const context = useContext(ThemeColors)
    const data = props?.stats
    const count = data?.cpu_usage_percentage
    const series = [count]
    const color = count <= 50 ? context.colors.success.main : count > 50 && count < 85 ? context.colors.warning.main : context.colors.danger.main
    const options = {
        plotOptions: {
            radialBar: {
                size: 150,
                offsetY: 20,
                startAngle: -150,
                endAngle: 150,
                hollow: {
                    size: '65%'
                },
                track: {
                    show: true,
                    startAngle: undefined,
                    endAngle: undefined,
                    background: '#f2f2f2',
                    strokeWidth: '97%',
                    opacity: 1,
                    margin: 5,
                    dropShadow: {
                        enabled: false,
                        top: 0,
                        left: 0,
                        blur: 3,
                        opacity: 0.5
                    }
                },
                dataLabels: {
                    name: {
                        offsetY: -5,
                        fontFamily: 'Montserrat',
                        fontSize: '1rem'
                    },
                    value: {
                        offsetY: 15,
                        fontFamily: 'Montserrat',
                        fontSize: '1.714rem'
                    }
                }
            }
        },
        colors: [color],
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: [color],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        stroke: {
            dashArray: 8
        },
        labels: ['CPU Usage']
    }
    return data !== null ? (
    
    <Card>
    <CardHeader>
      <CardTitle tag='h4'>CPU Usage</CardTitle>      
    </CardHeader>

    <CardBody className=''>
    <Chart options={options} series={series} type='radialBar' height={277} id='support-tracker-card' />
    </CardBody>

    <Row className='border-top text-center'>
      <Col xs='6' className='border-end py-1'>
        <CardText className='text-muted mb-0'>CPU Thread</CardText>
        <h3 className='fw-bolder mb-0'> {data?.cpu_threads} </h3>
      </Col>
      <Col xs='6' className='py-1'>
        <CardText className='text-muted mb-0'>CPU Usage</CardText>
        <h3 className='fw-bolder mb-0'> {data?.cpu_usage_percentage} </h3>
      </Col>
    </Row>
  </Card>

    ) : null
}
export default CpuThread
