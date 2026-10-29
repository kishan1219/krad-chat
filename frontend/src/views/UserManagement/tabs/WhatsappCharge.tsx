// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Plus } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'reactstrap'
import { getCountry } from '../../../utility/apis/country'
import { addWhatsappCharges, loadWhatsappCharges } from '../../../utility/apis/whatsappCharges'
import { isValid, log } from '../../../utility/helpers/common'
import { Permissions } from '../../../utility/Permissions'
import Show from '../../../utility/Show'
import { SpaceTrim, createAsyncSelectOptions } from '../../../utility/Utils'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'
import Shimmer from '../../components/shimmers/Shimmer'

const WhatsappCharge = ({ activeTab, edit }) => {
    const loginUser = useSelector(state => state.auth.userData)
    const form = useForm()
    const ref = useRef()
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [user, setUser] = useState(null)
    const [country, setCountry] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [rowsSelected, setRowsSelected] = useState([])
    const [currentPage, setCurrentPage] = useState("1")
    const [reload, setReload] = useState(false)
    const [rowsPerPage] = useState("15")
    const [resetIt, setResetIt] = useState(new Date())
    const [charge, setCharge] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        user_id: edit?.id
    })

    useEffect(() => {
        if (activeTab === "9" && (loginUser?.userType === 0 || loginUser?.userType === 3)) {
            // listUser()
        }
    }, [activeTab])

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

    const listCountry = async (search, loadedOptions, { page }) => {

        const res = await getCountry({
            async: true,
            page,
            perPage: 500,
            jsonData: { name: search }
        })
        return createAsyncSelectOptions(res, page, "name", "id", setCountry)

    }

    useEffect(() => {
        if (activeTab === "9" && Permissions?.whatsappChargesList) {
            preload()
        }
    }, [filterData, activeTab])

    const onSubmit = (data) => {
        addWhatsappCharges({
            jsonData: {
                ...data,
                // user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? data?.user_id  : loginUser?.id
                user_id: edit?.id
            },
            loading: setLoading,
            success: () => {
                preload()
                setResetIt(new Date()); reset()

            }
        })
    }


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
    log(charge?.data?.[0]?.wa_marketing_charge)

    useEffect(() => {
        setValue("wa_marketing_charge", charge?.data?.[0]?.wa_marketing_charge)
        setValue("wa_utility_charge", charge?.data?.[0]?.wa_utility_charge)
        setValue("wa_service_charge", charge?.data?.[0]?.wa_service_charge)
        setValue("wa_authentication_charge", charge?.data?.[0]?.wa_authentication_charge)
        setValue("country_id", charge?.data?.[0]?.country_id)
    }, [charge])
    return (
        <>
            <Card>
                <Row>
                    <Show IF={Permissions?.whatsappChargesCreate}>
                        <Col md="3" sm="12" className='extra-md' >
                            <CardBody className='border'>
                                <Row>
                                    <Form ref={ref} onSubmit={handleSubmit(onSubmit)}>
                                        <Row>
                                            <Col md="12">
                                                <FormGroupCustom
                                                    key={resetIt}
                                                    type={"text"}
                                                    control={control}
                                                    name="wa_marketing_charge"
                                                    value={charge?.data?.[0]?.wa_marketing_charge}
                                                    className='mb-1'
                                                    label="Marketing Charge"
                                                    errors={errors}
                                                    rules={{ required: true, min: "0", step: "any" }}
                                                />
                                            </Col>
                                            <Col md="12">
                                                <FormGroupCustom
                                                    key={resetIt}
                                                    type={"text"}
                                                    control={control}
                                                    name="wa_utility_charge"
                                                    value={charge?.data?.[0]?.wa_utility_charge}
                                                    className='mb-1'
                                                    label="Utility Charge"
                                                    errors={errors}
                                                    rules={{ required: true, min: "0", step: "any" }}

                                                />
                                            </Col>
                                            <Col md="12">
                                                <FormGroupCustom
                                                    key={resetIt}
                                                    type={"text"}
                                                    control={control}
                                                    name="wa_service_charge"
                                                    value={charge?.data?.[0]?.wa_service_charge}
                                                    className='mb-1'
                                                    label="Service Charge"
                                                    errors={errors}
                                                    rules={{ required: true, min: "0", step: "any" }}

                                                />
                                            </Col>
                                            <Col md="12">
                                                <FormGroupCustom
                                                    key={resetIt}
                                                    type={"text"}
                                                    control={control}
                                                    name="wa_authentication_charge"
                                                    value={charge?.data?.[0]?.wa_authentication_charge}
                                                    className='mb-1'
                                                    label="Authentication Charges"
                                                    errors={errors}
                                                    rules={{ required: true, min: "0", step: "any" }}

                                                />
                                            </Col>

                                            <Col md="12">

                                                <FormGroupCustom
                                                    key={resetIt}
                                                    async
                                                    defaultOptions
                                                    control={control}
                                                    type={"select"}
                                                    errors={errors}
                                                    name={"country_id"}
                                                    isClearable
                                                    className='mb-1'
                                                    loadOptions={listCountry}
                                                    options={country}
                                                    value={76}
                                                    label="Country"
                                                    rules={{
                                                        required: true,
                                                        validate: (v) => {
                                                            return isValid(v) ? !SpaceTrim(v) : true
                                                        }
                                                    }}
                                                />
                                            </Col>

                                        </Row>
                                        <Col md="12">
                                            <LoadingButton loading={loading} type='submit' className='btn-icon mt-2 round' color='primary' block>
                                                <Plus size={14} />
                                                <span className='align-middle ms-25'>Add Charges</span>
                                            </LoadingButton>

                                        </Col>
                                    </Form>

                                </Row>
                            </CardBody>
                        </Col>
                    </Show>
                    <Col md={Permissions?.whatsappChargesCreate ? "9" : "12"} className='extra-md' sm={"12"}>
                        <CardBody className='border'>
                            {/* <Card className='p-2'> */}
                            <CardHeader className='border-bottom inline'>
                                <CardTitle className='text-primary' tag='h4'>WhatsApp Charges</CardTitle>
                            </CardHeader>

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
                            </>}
                        </CardBody>
                    </Col>
                </Row>
            </Card>
        </>
    )

}
export default WhatsappCharge
