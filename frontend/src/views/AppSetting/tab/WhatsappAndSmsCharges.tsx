// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { loadWhatsappCharges } from '../../../utility/apis/whatsappCharges'
import { useDispatch, useSelector } from 'react-redux'
import Shimmer from '../../components/shimmers/Shimmer'
import Store from '@mui/icons-material/Store'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'

import VpnKey from '@mui/icons-material/VpnKey'
// import InfoOutline from '@mui/icons-material/InfoOutline'
import PrivacyTip from '@mui/icons-material/PrivacyTip'
import DisplaySettings from '@mui/icons-material/DisplaySettings'
import { formatIndianNumberWithDecimals, isValid } from '../../../utility/helpers/common'
import { Card, CardBody, Col, Row } from 'reactstrap'
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined'
import MicNone from '@mui/icons-material/MicNone'
import MobiledataOff from '@mui/icons-material/MobiledataOff'
import WhatsApp from '@mui/icons-material/WhatsApp'
import DataTable from 'react-data-table-component'
import { ChevronDown } from 'react-feather'

const WhatsappAndSmsCharges = ({ activeTab }) => {
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const dispatch = useDispatch()
    const loginUser = useSelector(state => state.auth.userData)
    const [charge, setCharge] = useState(null)
    const [loading, setLoading] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        user_id: loginUser?.id
    })


    const preload = () => {
        loadWhatsappCharges({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                setCharge(e)
            },
            loading: setLoading,
            jsonData: filterData
        })
    }

    console.log(charge)
    useEffect(() => {
        if (activeTab === "8") {
            preload()
        }
    }, [filterData, activeTab])

    const chargeColumns = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "100px"
        },
        {
            name: "Country",

            selector: r => (<>{r?.country?.name} <span className='fw-bolder'>(+{r?.country?.phonecode})</span></>),
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "Currency",
            selector: r => (<><span className='fw-bolder'>{r?.country?.currency_code} ({r?.country?.currency_symbol})</span></>),
            sortable: true,
            minWidth: '180px'
        },
        // {
        //     name: "Currency Symbol",
        //     selector: r => r?.country?.currency_symbol,
        //     sortable: true,
        //   minWidth: '180px'
        // },

        {
            name: "Marketing Charge",
            selector: r => r?.wa_marketing_charge,
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "Utility Charge",
            selector: r => r?.wa_utility_charge,
            sortable: true,
            minWidth: '180px'
        },
        // {
        //     name: "Service Charge",
        //     selector: r => r?.wa_service_charge,
        //     sortable: true,
        //     minWidth: '180px'
        // },
        {
            name: "Authentication Charges",
            selector: r => r?.wa_authentication_charge,
            sortable: true,
            minWidth: '180px'
        }
    ]

    return (
        <>
            {loading ? <>
                <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />

            </> : <>
                <Row>

                    <Col md="12">
                        <h3>Charges & Credit</h3>
                    </Col>
                    {/* <Col lg='3' sm='6'>
                            <StatsHorizontal icon={<MarkEmailReadOutlined fontSize='medium' />} color='success' stats={isValid(charge?.data?.[0]?.wa_authentication_charge) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.wa_authentication_charge)) : 0} statTitle={"Authentication"} />
                        </Col>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal icon={<MarkEmailReadOutlined fontSize='medium' />} color='success' stats={isValid(charge?.data?.[0]?.wa_marketing_charge) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.wa_marketing_charge)) : 0} statTitle={"Marketing"} />
                        </Col>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal icon={<MicNone fontSize='medium' />} color='success' stats={isValid(charge?.data?.[0]?.wa_service_charge) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.wa_service_charge)) : 0} statTitle={"Service"} />
                        </Col>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal icon={<MobiledataOff fontSize='medium' />} color='success' stats={isValid(charge?.data?.[0]?.wa_utility_charge) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.wa_utility_charge)) : 0} statTitle={"Utility"} />
                        </Col> */}
                    <Col lg='3' sm='6'>
                        <StatsHorizontal icon={<MarkEmailReadOutlined size={21} />} color='success' stats={isValid(charge?.data?.[0]?.user?.transaction_credit) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.user?.transaction_credit)) : 0} statTitle={"Transactional"} />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal icon={<MarkEmailReadOutlined size={21} />} color='success' stats={isValid(charge?.data?.[0]?.user?.promotional_credit) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.user?.promotional_credit)) : 0} statTitle={"Promotional"} />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal icon={<MicNone size={21} />} color='success' stats={isValid(charge?.data?.[0]?.user?.voice_sms_credit) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.user?.voice_sms_credit)) : 0} statTitle={"Voice"} />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal icon={<MobiledataOff size={21} />} color='success' stats={isValid(charge?.data?.[0]?.user?.two_waysms_credit) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.user?.two_waysms_credit)) : 0} statTitle={"Two-Way"} />
                    </Col>
                    <Col lg='3' sm='6'>
                        {/* <StatsHorizontal icon={<WhatsApp size={21} />} color='success' stats={isValid(charge?.data?.[0]?.user?.wa_amount) ? ₹formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.user?.wa_amount)) : 0} statTitle={"Whatsapp"} /> */}
                        <StatsHorizontal
                            icon={<WhatsApp size={21} />}
                            color='success'
                            stats={isValid(charge?.data?.[0]?.user?.wa_amount) ? `₹${formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.user?.wa_amount))}` : '₹0'}
                            statTitle={"Whatsapp"}
                        />
                    </Col>

                    <div>
                        {/* <br /> */}
                        <hr style={{ marginTop: '5px', marginBottom: '25px' }} />
                        {/* <br /> */}
                    </div>
                    <Col md="12">
                        <h3>Whatsapp Charges</h3>
                    </Col>
                    {/* <Col lg='3' sm='6'>
                    <StatsHorizontal icon={<VpnKey fontSize='medium' />} color='success' stats={isValid(charge?.data?.[0]?.wa_authentication_charge) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.wa_authentication_charge)) : 0} statTitle={"Authentication"} />
                </Col>
                <Col lg='3' sm='6'>
                    <StatsHorizontal icon={<Store fontSize='medium' />} color='success' stats={isValid(charge?.data?.[0]?.wa_marketing_charge) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.wa_marketing_charge)) : 0} statTitle={"Marketing"} />
                </Col>
                <Col lg='3' sm='6'>
                    <StatsHorizontal icon={<DisplaySettings fontSize='medium' />} color='success' stats={isValid(charge?.data?.[0]?.wa_service_charge) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.wa_service_charge)) : 0} statTitle={"Service"} />
                </Col>
                <Col lg='3' sm='6'>
                        <StatsHorizontal icon={<PrivacyTip fontSize='medium' />} color='success' stats={isValid(charge?.data?.[0]?.wa_utility_charge) ? formatIndianNumberWithDecimals(parseFloat(charge?.data?.[0]?.wa_utility_charge)) : 0} statTitle={"Utility"} />
                </Col> */}
                    {loading ? <>
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    </> : <>

                        <Card className='p-1'>
                            <DataTable
                                noHeader
                                // selectableRows
                                // pagination
                                // paginationServer
                                className='react-dataTable'
                                columns={chargeColumns}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}

                                sortIcon={<ChevronDown size={10} />}
                                // paginationComponent={CustomPagination}
                                data={charge?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </Card>
                    </>}
                </Row>
            </>

            }
        </>
    )
}

export default WhatsappAndSmsCharges
