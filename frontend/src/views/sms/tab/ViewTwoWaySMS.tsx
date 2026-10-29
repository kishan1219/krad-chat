// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import ScrollBar from 'react-perfect-scrollbar'
import { useDispatch } from 'react-redux'
import { Button, CardBody, Col, Row } from 'reactstrap'
import Show from '../../../utility/Show'
import FormGroupCustom from '../../components/formGroupCustom'
import CenteredModal from '../../components/modal/CenteredModal'
import Rating from '@mui/material/Rating'
import Typography from '@mui/material/Typography'
import { ThumbDown, ThumbUp } from '@mui/icons-material'


const ViewTwoWaySMS = ({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) => {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const form = useForm()
    const [id, setId] = useState(null)
    // const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const { register, formState: { errors }, handleSubmit, control, setValue: setVB, getValues, watch, reset } = useForm()
    const [hover, setHover] = useState(-1)
    const [values, setValues] = useState(0)
    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
        setShowModal(false)

    }

    useEffect(() => {
        setId(edit?.id)
    }, [edit])

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])
    const labels = {
        0: <img className='img-fluid' src={require('../../../assets/images/emots/feedback.png').default} />,
        1: <img className='img-fluid' src={require('../../../assets/images/emots/angry.png').default} />,
        2: <img className='img-fluid' src={require('../../../assets/images/emots/sad.png').default} />,
        3: <img className='img-fluid' src={require('../../../assets/images/emots/smile.png').default} />,
        4: <img className='img-fluid' src={require('../../../assets/images/emots/happy.png').default} />,
        5: <img className='img-fluid' src={require('../../../assets/images/emots/superstar.png').default} />
    }
    return (
       <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                disableFooter={true}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-lg"
                // handleSave={handleSubmit(handleSave)}
                title="View Two Way">
                <>

                    <CardBody className='border-top'>
                        <Row className='align-items-start gy-2'>
                            <div className='mobile'>
                                <div className='mobile-phone'>
                                    <div className='brove'>
                                        <span className='speaker'>
                                        </span>
                                    </div>
                                    <div className='screen' style={{ wordBreak: 'break-word', backgroundColor: edit?.bg_color }}>
                                        <ScrollBar className='p-1'>
                                            <div className='mt-2 d-flex justify-content-center border-bottom p-1 ' style={{ textAlign: 'center', minHeight: "70px" }}>
                                                <h2>{edit?.title ?? 'Lorem Ipsum'}</h2>
                                            </div>
                                            <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}>
                                                {/* {content} */}

                                                {/* {!content ? prev : <div
                                                    dangerouslySetInnerHTML={{ __html: content }}
                                                />} */}
                                                {<div className='ck-content'
                                                    dangerouslySetInnerHTML={{ __html: edit?.content }}
                                                />}
                                            </div>

                                            <Show IF={edit?.take_response === 1}>
                                                <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}>
                                                    <Show IF={edit?.take_response === 1}>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <h3 className='fw-bold'>
                                                                Are you satisfied with the quality of our services?
                                                            </h3>
                                                            <div className='d-flex justify-content-between'>
                                                                <Button.Ripple outline>
                                                                    <ThumbUp className='text-success' /> <span className='ml-2 fw-bold'>Like</span>
                                                                </Button.Ripple>
                                                                <Button.Ripple outline>
                                                                    <ThumbDown className='text-danger' /> <span className='ml-2 fw-bold'>DisLike</span>
                                                                </Button.Ripple>
                                                            </div>

                                                        </div>
                                                    </Show>
                                                    {/* <Rating
                                        direction={isRtl ? 'rtl' : 'ltr'}
                                        initialRating={0}
                                        emptySymbol={<Star size={32} fill='#babfc7' stroke='#babfc7' />}
                                        fullSymbol={<Star size={32} fill={themeColors.colors.warning.main} stroke={themeColors.colors.warning.main} />}
                                    /> */}


                                                </div>
                                            </Show>
                                            <Show IF={edit?.take_response === 3}>
                                                <div className='mt-2 text-center'>
                                                    {values !== null && <Typography style={{ textAlign: 'center' }}>{labels[hover !== -1 ? hover : values]}</Typography>}
                                                    <Rating
                                                        value={values}
                                                        precision={1}
                                                        initialRating={0}
                                                        name='hover-feedback'
                                                        // sx={{ mr: 4 }}
                                                        size='large'
                                                        // className=''
                                                        onChange={(event, newValue) => setValues(newValue ?? 0)}
                                                        onChangeActive={(event, newHover) => setHover(newHover ?? 0)}
                                                    />
                                                    <div className='text-center'>
                                                        <Button.Ripple color="primary" size="md" rounded>
                                                            Submit
                                                        </Button.Ripple>
                                                    </div>
                                                </div>
                                            </Show>
                                            <Show IF={edit?.take_response === 2}>
                                                <div className='mt-2' style={{ textAlign: 'center' }}>
                                                    <h4 className='fw-bolder'>Share your contact information with us!</h4>
                                                    <Row className='mt-1'>
                                                        <Col md="12">

                                                            <FormGroupCustom
                                                                name={'name'}
                                                                type={"text"}
                                                                label={'Enter your name'}
                                                                className='mb-2'
                                                                control={control}
                                                                rules={{ required: true }}
                                                            />
                                                        </Col>
                                                        <Col md="12">

                                                            <FormGroupCustom
                                                                name={'email'}
                                                                type={"email"}
                                                                label={'Enter your email'}
                                                                className='mb-2'
                                                                control={control}
                                                                rules={{ required: true }}
                                                            />
                                                        </Col>
                                                        <Col md="12">

                                                            <FormGroupCustom
                                                                name={'subject'}
                                                                type={"text"}
                                                                label={'Enter your subject'}
                                                                className='mb-2'
                                                                control={control}
                                                                rules={{ required: true }}
                                                            />
                                                        </Col>
                                                        <Col md="12">

                                                            <FormGroupCustom
                                                                name={'comment'}
                                                                type={"textarea"}
                                                                label={'Enter your comment'}
                                                                className='mb-2'
                                                                control={control}
                                                                rules={{ required: true }}
                                                            />
                                                        </Col>
                                                        <div className='text-center'>
                                                            <Button.Ripple color="primary" size="md" rounded>
                                                                Save
                                                            </Button.Ripple>
                                                        </div>


                                                    </Row>
                                                </div>
                                            </Show>
                                        </ScrollBar>
                                    </div>
                                </div>
                            </div>
                            
                        </Row>
                    </CardBody>
                </>

            </CenteredModal>
       </>
    )
}

export default ViewTwoWaySMS
