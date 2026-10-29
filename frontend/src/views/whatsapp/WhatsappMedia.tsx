// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Plus, RefreshCcw, Search, Sliders, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, Col, Form, Row, UncontrolledTooltip } from 'reactstrap'
import { deleteWhatsappMedia, loadWhatsappMedia } from '../../utility/apis/whatsappMedia'
import ConfirmStop from '../../utility/helpers/ConfirmStop'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import AddWhatsappMedia from './AddWhatsappMedia'
import MediaFilter from './Filter/MediaFilter'

const WhatsappMedia = () => {
    const media = useSelector(a => a.whatsappMedia.whatsappMedia)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [reload, setReload] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [loading, setLoading] = useState(false)
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        getValues,
        setError
    } = useForm()
    const dispatch = useDispatch()
    const [resetIt, setResetIt] = useState(new Date())

    const preload = (data) => {
        loadWhatsappMedia({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setDlr(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                search: filterData?.search
            }
        })
    }

    useEffect(() => {
        preload()
    }, [filterData])

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

    }
    const removeMedia = (row) => {
        deleteWhatsappMedia({
            id: row,
            // dispatch,
            jsonData: {

                send_sms_id: row

            },
            success: (e) => {
                //    preload()
            }
        })
    }
    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadWhatsappMedia({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setDlr,
            dispatch,
            loading: setLoading
        })
    }
    const mediaColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Username",
            selector: (row) => (row?.name),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "File Caption",
            cell: (row, index) => {
                return (<span className='text-wrap' style={{ cursor: "pointer", color: "darkorange" }} >{row.file_caption ?? 'N/A'}</span>)
            },
            sortable: true,
            minWidth: '250px'
        },
       
        {
            name: "File Type",
            selector: row => row?.file_type,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "File Path",
            selector: (row) => {
                return (<a href={`${httpConfig?.baseUrl2}/${row?.file_path}`} target='_blank' rel='noreferrer noopener'> View </a>)
            
            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Mime Type",
            selector: row => row?.mime_type,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (
                    <ButtonGroup>
                       
                        {/* <Show IF={Permissions?.whatsappConfigEdit}>
                            <UncontrolledTooltip placement='top' id='view' target='edit'>
                                Edit
                            </UncontrolledTooltip>
                            <WhatsappTemplatePull Component={Button.Ripple} size="sm" color={"secondary"} edit={row} id="edit"> <Edit size={15} /> </WhatsappTemplatePull>
                        </Show> */}

                       
                            {/* <ConfirmAlert
                                title={`Delete ${row?.file_caption} ?`}
                                color='text-warning'
                                onClickYes={() => deleteWhatsappMedia({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                onSuccess={deleted}
                                onFailed={failed}

                                onClose={(e) => {
                                    if (e) {
                                        dispatch(whatsappMediaDelete(deletedId))
                                    }
                                    setDeleted(null)
                                    setFailed(null)
                                }}
                                className="waves-effect btn btn-danger btn-sm"
                                id={`grid-delete-${row?.id}`}>

                                <Trash2 size={15} />
                            </ConfirmAlert> */}
                        <ConfirmStop
                            item={row}
                            // eventId={`stop-campaign-${row?.id}`}
                            title={`Delete  ${row?.file_caption} ?`}
                            color='text-warning'
                            onClickYes={() => removeMedia(row?.id)}
                            text={'no-text'}
                            onSuccessEvent={(item) => { preload() }}
                            onFailedEvent={((item) => { })}
                            className="waves-effect btn btn-danger btn-sm"
                            style={{ cursor: 'pointer' }}
                            id={`grid-delete-${row?.id}`}>
                            <Trash2 size={15} />
                        </ConfirmStop>
                       
                    </ButtonGroup>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(media?.total / media?.per_page)
        return (
            <ReactPaginate
                initialPage={media?.current_page - 1}
                disableInitialCallback
                previousLabel={''}
                nextLabel={''}
                breakLabel='...'
                pageCount={count}
                activeClassName='active'
                onPageChange={page => handlePagination(page)}
                pageClassName={'page-item'}
                nextLinkClassName={'page-link'}
                nextClassName={'page-item next'}
                previousClassName={'page-item prev'}
                previousLinkClassName={'page-link'}
                pageLinkClassName={'page-link'}
                breakClassName='page-item'
                breakLinkClassName='page-link'
                containerClassName={
                    'pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
                }
            />

        )
    }


  return (
    <>
          <Header icon={""} title={"Whatsapp Media"}>
              <ButtonGroup>

                  {/* <Show IF={Permissions?.whatsappConfigCreate}> */}

                      <AddWhatsappMedia Component={Button.Ripple} size="sm" color={"primary"} preload= {preload}><Plus size="14" />Add Whatsapp File</AddWhatsappMedia>
                  {/* </Show> */}


                  <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                  <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                  <Button.Ripple size="sm" color="secondary" id="filteree" onClick={() => { setShowFilter(true) }}>
                      <Sliders size="14" />
                  </Button.Ripple>
                  <Button.Ripple size="sm" color="dark" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }}>
                      <RefreshCcw size="14" />
                  </Button.Ripple>
              </ButtonGroup>
          </Header>

          <Card>
              {/* <CardHeader className='border-bottom inline'>
                
                </CardHeader> */}
              <Row className='justify-content-end mx-0'>
                  <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>
                      <Form onSubmit={handleSubmit(submitFilter)}>

                          <FormGroupCustom
                              key={resetIt}
                              name={"search"}
                              type={"text"}
                              errors={errors}
                              label="Search"
                              noLabel
                              setValue={setValue}
                              className="mb-2"
                              control={control}
                              append={
                                  <>
                                      <LoadingButton
                                          loading={loading}
                                          className="btn btn-primary"
                                          color="primary"
                                          type="submit"
                                          size="sm"
                                      >
                                          <Search size={15} />
                                      </LoadingButton>
                                  </>
                              }
                          />
                      </Form>
                  </Col>


              </Row>

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

                  <div className='card-datatable app-user-list table-responsive'>
                      <div className='react-dataTable'>

                          <DataTable
                              noHeader
                              // selectableRows
                              pagination
                              paginationServer
                              className='react-dataTable'
                              columns={mediaColumn}
                              noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                  No Record Found
                              </div>}
                            //   selectableRowsComponent={BootstrapCheckbox}
                              sortIcon={<ChevronDown size={10} />}
                              paginationComponent={CustomPagination}
                              data={media?.data}
                            //   onSelectedRowsChange={handleReportChange}
                          />
                      </div>
                  </div>
              </>
              }

          </Card>
          <MediaFilter show={showFilter} filterData={filterData} setFilterData={e => {
              setCurrentPage(1)
              setFilterData(e)
          }} handleFilterModal={() => { setShowFilter(false) }} />
    </>
  )
}

export default WhatsappMedia
