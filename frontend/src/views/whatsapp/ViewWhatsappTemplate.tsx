// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { readWhatsappTemplate } from '../../utility/apis/whatsappTemplate'
import { isValid, isValidArray, renderTextWithFormatting } from '../../utility/helpers/common'
import CenteredModal from '../components/modal/CenteredModal'
import { Badge, Card, Col, Row, Table } from 'reactstrap'
import { formatDate } from '../../utility/Utils'
import Show from '../../utility/Show'
import { Tab } from '@mui/material'
import Shimmer from '../components/shimmers/Shimmer'
import Hide from '../../utility/Hide'
import { useSelector } from 'react-redux'
import { ArrowLeft } from 'react-feather'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Launch from '@mui/icons-material/Launch'
import LocalPhone from '@mui/icons-material/LocalPhone'
import ReplyIcon from '@mui/icons-material/Reply'
import ListIcon from '@mui/icons-material/List'

const ViewWhatsappTemplate = ({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) => {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const users = useSelector(state => state.auth.userData)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [activeTab, setActiveTab] = useState('1')

    const toggleTab = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab)
        }
    }
    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
        setShowModal(false)
        setActiveTab('1')
    }

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

    const getTemplate = () => {
        readWhatsappTemplate({
            id: edit?.id,
            loading: setLoading,
            success: (data) => {
                setEditData(data)

            },
            errors: (e) => { }

        })
    }

    useEffect(() => {
        if (open) {
            getTemplate()
        }
    }, [open, edit])

    // render icon based on media type

    const renderIcon = (editData) => {

        if (editData?.whats_app_template_buttons[0]?.button_type === 'URL') {
            // <div className='d-flex justify-content-center'>
            <Launch style={{ color: '34B7F1' }} />
            // </div>
        }

    }

    const ButtonIcons = ({ buttonType }) => {
        switch (buttonType) {
            case 'PHONE_NUMBER':
                return (<>
                    <LocalPhone style={{ color: '34B7F1' }} />
                </>)
            case 'URL':
                return <Launch style={{ color: '34B7F1' }} />
            case 'COPY_CODE':
                return <ContentCopy style={{ color: '34B7F1' }} />


            case 'QUICK_REPLY':
                return <ReplyIcon style={{ color: '34B7F1' }} />

            default:
                return <ListIcon style={{ color: '34B7F1' }} />

        }
    }
    function renderWhatsAppTemplateButtons() {
        const buttons = editData?.whats_app_template_buttons
        const renderedButtons = []

        if (buttons) {
            for (let index = 0; index < buttons.length; index++) {
                if (index <= 1) {
                    renderedButtons.push(
                        <div className='d-flex justify-content-center border-top p-1'>
                            <span className='fw-bold text-center' style={{ color: '#34B7F1' }}>{ButtonIcons({ buttonType: buttons[index].button_type })} {buttons[index]?.button_text}</span>
                        </div>
                    )
                } else {
                    break
                }
            }

            if (buttons.length > 2) {
                renderedButtons.push(
                    <div className='d-flex justify-content-center border-top p-1'>
                        <span className='fw-bold text-center' style={{ color: '#34B7F1' }}><ListIcon style={{ color: '34B7F1' }} /> See all options</span>
                    </div>
                )
            }
        }

        return renderedButtons
    }

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                disableFooter={true}
                scrollControl={true}

                handleModal={handleClose}
                modalClass="modal-xl"
                // handleSave={handleSubmit(handleSave)}
                title={"View Whatsapp Template"}>

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
                            <Col md="8" sm="12" className='p-1'>
                                <Card>
                                    <div className='p-2'>
                                        {/* <Row className='align-items-start gy-2'> */}

                                        <Row className='align-items-start gy-2'>
                                            <Col md="3">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Created By
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary'>
                                                    {editData?.name ?? 'N/A'}
                                                </p>
                                            </Col>
                                            <Col md="3">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Template Name
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary'>
                                                    {editData?.template_name ?? 'N/A'}
                                                </p>
                                            </Col>

                                            <Col md="3">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Template Type
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary'>
                                                    {editData?.template_type ?? 'N/A'}
                                                </p>
                                            </Col>

                                            <Col md="3">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Whatsapp Status
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary'>
                                                    <Badge pill color='primary'> {editData?.wa_status ?? 'N/A'}</Badge>
                                                </p>
                                            </Col>


                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Category
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary'>
                                                    {editData?.category ?? 'N/A'}
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Whatsapp Template ID
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary'>
                                                    {editData?.wa_template_id ?? 'N/A'}
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Template Language
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary'>
                                                    {editData?.template_language ?? 'N/A'}
                                                </p>
                                            </Col>


                                        </Row>
                                        <Row className='border-top pt-0 mt-1 gy-2'>
                                            <Hide IF={editData?.media_type === 'IMAGE'}>
                                                <Col md="8">
                                                    <p className='mb-0 text-dark fw-bolder'>
                                                        Header
                                                    </p>
                                                    <p className='mb-0 fw-bold text-secondary'>
                                                        {editData?.header_text ?? 'N/A'}
                                                    </p>
                                                </Col>
                                                <Col md="4">
                                                    <p className='mb-0 text-dark fw-bolder'>
                                                        Header Variables
                                                    </p>
                                                    <p className='mb-0 fw-bold text-secondary'>
                                                        {editData?.header_variable ?? 'N/A'}
                                                    </p>
                                                </Col>
                                            </Hide>
                                            <Hide IF={editData?.media_type === 'TEXT' || editData?.media_type === 'LOCATION' || editData?.media_type === null}>

                                                <Col md="8">
                                                    <p className='mb-0 text-dark fw-bolder'>
                                                        Media Type
                                                    </p>
                                                    <p className='mb-0 fw-bold text-secondary'>
                                                        {editData?.media_type ?? 'N/A'}
                                                    </p>
                                                </Col>
                                                <Col md="4">
                                                    <p className='mb-0 text-dark fw-bolder'>
                                                        URL
                                                    </p>
                                                    <p className='mb-0 fw-bold text-secondary'>
                                                        {/* {isValid(editData?.header_handle) ? <a href={editData?.header_handle} target='_blank' rel='noreferrer noopener'> View </a> : 'N/A'} */}
                                                            {isValid(editData?.header_handle) && editData?.header_handle.startsWith('https:') ? <a href={editData?.header_handle} target='_blank' rel='noreferrer noopener'>View</a> : 'N/A'}
                                                    </p>
                                                    {/* <Show IF={editData?.media_type === 'IMAGE'}>
                                                
                                                <a href={editData?.header_handle} target='_blank' rel='noreferrer noopener'>View</a>
                                            </Show> */}
                                                </Col>
                                            </Hide>
                                        </Row>

                                        <Row className='border-top pt-0 mt-1 gy-2'>
                                            <Col md="8">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Message
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary'>
                                                    {editData?.message ?? 'N/A'}
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Message Variables
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary'>
                                                    {editData?.message_variable ?? 'N/A'}
                                                </p>
                                            </Col>
                                        </Row>
                                        {/* <Row className='border-top pt-0 mt-1 gy-2'>
                                                <Col md="8">
                                                    <p className='mb-0 text-dark fw-bolder'>
                                                        Footer Text
                                                    </p>
                                                    <p className='mb-0 fw-bold text-secondary'>
                                                        {editData?.footer_text ?? 'N/A'}
                                                    </p>
                                                </Col>
                                                <Col md="4">
                                                    <p className='mb-0 text-dark fw-bolder'>
                                                        Footer Variables
                                                    </p>
                                                    <p className='mb-0 fw-bold text-secondary'>
                                                        {editData?.footer_variable ?? 'N/A'}
                                                    </p>
                                                </Col>
                                            </Row> */}


                                        <Show IF={isValidArray(editData?.whats_app_template_buttons)}>
                                            <Row className='border-top gy-2 mt-1'>
                                                <h4 className='mb-0 text-dark fw-bolder'>
                                                    Template Buttons
                                                </h4>
                                                {/* <Show IF={editData?.button_action === 1}>
                                            <Col md="12">
                                                <Table bordered striped responsive>

                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Button Type</th>
                                                            <th>Button Text</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {editData?.template_buttons?.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{item.button_type ?? 'N/A'}</td>
                                                                <td>{item.button_text ?? 'N/A'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>

                                                </Table>
                                            </Col>
                                        </Show> */}
                                                {/* <Show IF={editData?.button_action === 0}> */}
                                                <Col md="12">
                                                    <Table bordered striped responsive>

                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Button Type</th>
                                                                <th>Button Text</th>
                                                                <th>Button Value</th>
                                                                <th>Button Example</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {editData?.whats_app_template_buttons?.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{item.button_type}</td>
                                                                    <td>{item.button_text}</td>
                                                                    <td>{item.button_value}</td>
                                                                    <td>{item.button_variables}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>

                                                    </Table>
                                                </Col>
                                                {/* </Show> */}

                                            </Row>
                                        </Show>
                                            <Row className='border-top pt-0 mt-1 gy-2'>
                                                <Col md="12">
                                                    <p className='mb-0 text-dark fw-bolder'>
                                                        Tags
                                                    </p>
                                                    <p className='mb-0 fw-bold text-secondary'>
                                                        {editData?.tags ? (
                                                            editData.tags.split(',').map((tag, index) => (
                                                                <Badge key={index} color='primary' className='me-1'>
                                                                    {tag.trim()}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </p>
                                                </Col>
                                                
                                            </Row>
                                        {/* </Row> */}
                                    </div>
                                </Card>
                            </Col>
                            <Col md="4" sm="12" className='p-1'>
                                <Card className='p-1'>
                                    <div className="page">
                                        <div className="marvel-device nexus5">
                                            <div className="top-bar"></div>
                                            <div className="sleep"></div>
                                            <div className="volume"></div>
                                            <div className="camera"></div>
                                            <div className="screen">
                                                <div className="screen-container">

                                                    <div className="chat">
                                                        <div className="chat-container">
                                                            <div className="user-bar">
                                                                <div className="back">

                                                                    <ArrowLeft />
                                                                </div>
                                                                <div className="avatar">
                                                                    <img src={require("../../assets/images/avatars/avatar-blank.png").default} alt="Avatar" />
                                                                </div>
                                                                <div className="name">
                                                                    <span>{editData?.name}</span>
                                                                    <span className="status">online</span>
                                                                </div>

                                                            </div>
                                                            <div className="conversation">
                                                                <div className="conversation-container">

                                                                    <div className="message received">

                                                                        <Show IF={editData?.media_type === 'IMAGE'}>
                                                                            {/* <img className='rounded me-50'
                                                                                src={editData?.header_handle ? editData?.header_handle : "https://via.placeholder.com/200"}
                                                                                alt='image' height='auto' width='100%' /> */}
                                                                                <img
                                                                                    className='rounded me-50'
                                                                                    src={
                                                                                        isValid(editData?.header_handle) && editData?.header_handle.startsWith('https:') ? editData.header_handle : "data:image/png;base64,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"
                                                                                    }
                                                                                    alt='image'
                                                                                    height='auto'
                                                                                    width='100%'
                                                                                />
                                                                        </Show>
                                                                        <Show IF={editData?.media_type === 'VIDEO'}>
                                                                                <video src={editData?.header_handle ? editData?.header_handle : "data:image/png;base64,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"} controls alt="Image_Photo" className='img-fluid' width="300" height="200" />

                                                                        </Show>
                                                                        {/* <Show IF={details?.media_type === 'VIDEO'}>
                                                                                {mediaData ? (
                                                                                    <video src={`${httpConfig?.baseUrl2}/${mediaData}`} controls alt="Image_Photo" className='img-fluid' width="300" height="200" />
                                                                                ) : (
                                                                                    <video src={avatar ? avatar : "https://via.placeholder.com/200"} controls alt="Image_Photo" className='img-fluid' width="300" height="200" />
                                                                                )}
                                                                            </Show>
                                                                            <Show IF={details?.media_type === 'DOCUMENT'}>
                                                                                <img className='rounded me-50'
                                                                                    src={"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/391px-PDF_file_icon.svg.png"}
                                                                                    alt='image' height='100' width='100%' />
                                                                              

                                                                            </Show> */}
                                                                        <div id="random" className='fw-bolder' dangerouslySetInnerHTML={{ __html: renderTextWithFormatting(editData?.header_text) }} />

                                                                        <div id="random" className='fw-bold mt-1' dangerouslySetInnerHTML={{ __html: renderTextWithFormatting(editData?.message) }} />
                                                                        <br />

                                                                        <span className='footerTextStyle'>{editData?.footer_text}</span>

                                                                        {/* <span className="metadata"><span className="time"></span></span> */}
                                                                        <Show IF={isValidArray(editData?.whats_app_template_buttons)}>
                                                                            {/* <hr style={{ width: '100%' }} /> */}

                                                                            <div className="">
                                                                                {/* {renderIcon(editData)} */}
                                                                                {renderWhatsAppTemplateButtons()}
                                                                            </div>

                                                                        </Show>
                                                                    </div>

                                                                    <Row>
                                                                        {watch('button_text')?.map((button, b) => {
                                                                            return (
                                                                                <Col md="6">
                                                                                    <Card>
                                                                                        <span className='fw-bold text-center' style={{ color: '#34B7F1' }}> {button?.value} </span>
                                                                                    </Card>
                                                                                </Col>
                                                                            )
                                                                        })}

                                                                    </Row>


                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </Card>
                            </Col>
                        </Row>


                    </>}
                </>

            </CenteredModal>

        </>
    )
}

export default ViewWhatsappTemplate
