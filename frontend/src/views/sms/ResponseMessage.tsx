// @ts-nocheck
import { ThumbDown, ThumbUp } from '@mui/icons-material'
import { Typography } from '@mui/material'
import Rating from '@mui/material/Rating'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { Button, Card, Col, Form, Row } from 'reactstrap'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { takeResponse, webContent } from '../../utility/apis/webContent'
import { isValid, log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
const ResponseMessage = () => {
    

    const [loading, setLoading] = useState(false)
    const { sub_part, token, mobile_num } = useParams()
    const [details, setDetails] = useState(null)
    const [hover, setHover] = useState(-1)
    const [resetIt, setResetIt] = useState(new Date())
    const [rSelected, setRSelected] = useState(0)
    const [values, setValues] = useState(0)
    const [rating, setRating] = useState(null)
    const { register, formState: { errors }, handleSubmit, control, setValue, getValues, watch, reset, setError } = useForm()

    const [hideSave, setHideSave] = useState(false)

    useEffect(() => {
        setValue('rating', rating)
    }, [rating])
    const loadContent = () => {
        webContent({
            sub_part,
            token,
            mobile_num,
            loading: setLoading,
            success: (e) => {
                setDetails(e)
            }
            // sub_part: part?.sub_part,
            // token: tokens?.token
        })
    }

    useEffect(() => {
        loadContent()
    }, [])

    const labels = {
        0: <img className='img-fluid' src={require('../../assets/images/emots/feedback.png').default} />,
        1: <img className='img-fluid' src={require('../../assets/images/emots/angry.png').default} />,
        2: <img className='img-fluid' src={require('../../assets/images/emots/sad.png').default} />,
        3: <img className='img-fluid' src={require('../../assets/images/emots/smile.png').default} />,
        4: <img className='img-fluid' src={require('../../assets/images/emots/happy.png').default} />,
        5: <img className='img-fluid' src={require('../../assets/images/emots/superstar.png').default} />
    }
    // log(part)

    //http://localhost:3000/response/G/JhuA7/917984563210
    const letsHideSave = (e) => {
        if (e?.error === false) {
            setHideSave(true)
        }
    }

    const onSubmit = (data) => {
        // log(data, "dara")
        takeResponse({
            jsonData: {
                ...data,
                two_way_comm_id: details?.two_way_comm_id,
                short_link_id: details?.short_link_id,
                sub_part,
                token,
                response_from: details?.take_response,
                mobile_num,
                rating: values
            },
            success: (e) => {
                setResetIt(new Date()); reset()
                toast.success("Your Response have been submitted Successfully")
                log(e?.error, "error")
                letsHideSave(e)
            }
        })

    }


    const feedbackForm = (data) => {
        // log(data, "dara")
        takeResponse({
            jsonData: {
                ...data,
                two_way_comm_id: details?.two_way_comm_id,
                short_link_id: details?.short_link_id,
                sub_part,
                token,
                response_from: details?.take_response,
                mobile_num
                // rating: values
            },
            success: (e) => {
                setResetIt(new Date()); reset()
                toast.success("Your Response have been submitted Successfully")
                letsHideSave(e)
            }
        })
    }

    const interestButton = (data) => {
        // log(data, "dara")
        takeResponse({
            jsonData: {
                ...data,
                two_way_comm_id: details?.two_way_comm_id,
                short_link_id: details?.short_link_id,
                sub_part,
                token,
                response_from: details?.take_response,
                mobile_num,
                is_interest: rSelected === 1 ? 1 : 0
                // rating: values
            },
            success: (e) => {
                setResetIt(new Date()); reset()
                toast.success("Your Response have been submitted Successfully")
                letsHideSave(e)
            }
        })
    }
    const ratingForm = (data) => {
        // log(data, "dara")
        takeResponse({
            jsonData: {
                ...data,
                two_way_comm_id: details?.two_way_comm_id,
                short_link_id: details?.short_link_id,
                sub_part,
                token,
                response_from: details?.take_response,
                mobile_num,
                // is_interest: rSelected === 1 ? 1 : 0
                rating: values
            },
            success: (e) => {
                setResetIt(new Date()); reset()
                toast.success("Your Response have been submitted Successfully")
                letsHideSave(e)
            }
        })
    }


    useEffect(() => {
        if (isValid(details)) {
            document.body.style.background = details?.bg_color
        }
    }, [details])

    // log(rSelected, "Selected")

    return (
        <>
           
            <div className='d-flex justify-content-center mt-3' style={{ wordBreak: 'break-word' }}>
                <Card className='' style={{ width: "768px", backgroundColor: details?.bg_color }}>

                    <div className='mt-2 d-flex justify-content-center border-bottom p-1 ' style={{ textAlign: 'center', minHeight: "70px" }}>
                        <h2 className='text-dark'>{details?.title} </h2>

                    </div>
                    <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}>
                        {/* {content} */}

                        <div className='ck-content'
                            dangerouslySetInnerHTML={{ __html: details?.content }}
                        />
                    </div>
                    
                    <Show IF={details?.take_response === 1}>
                        <Form onSubmit={handleSubmit(interestButton)}>
                            <div className='mt-1' style={{ textAlign: 'center' }}>
                                <Row className='d-flex justify-content-center'>
                                    <Col md="12" sm="12" className='p-2'>
                                        <h3 className='fw-bold text-dark mb-2'>
                                            Are you satisfied with the quality of our services?
                                        </h3>
                                        <div className='d-flex justify-content-between'>
                                            <Button.Ripple outline={rSelected !== 1} color="success" onClick={() => { setRSelected(1) }} active={rSelected === 1} type='submit'>
                                                <ThumbUp className='text-success' /> <span className='ml-2 fw-bold'>Like</span>
                                            </Button.Ripple>
                                            <Button.Ripple outline={rSelected !== 2} color="danger" onClick={() => { setRSelected(2) }} active={rSelected === 2} type='submit'>
                                                <ThumbDown className='text-danger' /> <span className='ml-2 fw-bold'>DisLike</span>
                                            </Button.Ripple>
                                        </div>

                                    </Col>
                                </Row>
                            </div>
                        </Form>
                    </Show>
                    <Show IF={details?.take_response === 2}>
                        <Form onSubmit={handleSubmit(feedbackForm)}>
                            <div className='mt-2' style={{ textAlign: 'center' }}>
                                <Row className='d-flex justify-content-center'>
                                    <Col md="12" sm="12" className='p-2'>
                                        <h4 className='fw-bolder text-dark'>Share your contact information with us!</h4>
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
                                            <Hide IF={hideSave === true}>
                                                <div className='text-center'>
                                                    <Button.Ripple type="submit" color="primary" size="md" rounded>
                                                        Save
                                                    </Button.Ripple>
                                                </div>

                                            </Hide>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        </Form>
                    </Show>
                    <Show IF={details?.take_response === 3}>
                        <Form onSubmit={handleSubmit(ratingForm)}>
                            <h4 className='fw-bolder text-center text-dark mt-1'>Please Rate Our Services!</h4>
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
                                <div className='text-center mb-2'>
                                    <Button.Ripple color="primary" size="md" type= "submit" rounded>
                                        Submit
                                    </Button.Ripple>
                                </div>
                            </div>
                        </Form>
                    </Show>
                </Card>
            </div>
        </>
    )
}

export default ResponseMessage
