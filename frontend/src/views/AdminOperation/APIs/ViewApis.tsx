// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import CenteredModal from '../../components/modal/CenteredModal'
import { readApi } from '../../../utility/apis/api'
import { isValid, log } from '../../../utility/helpers/common'
import hljs from 'highlight.js'
import Shimmer from '../../components/shimmers/Shimmer'

const ViewApis = ({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) => {

    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [getData, setData] = useState(null)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }

    const handleClose = (from = null) => {
        handleShow()
    }

    const loadData = () => {
        readApi({
            id: edit?.id,
            loading: setLoading,
            success: (e) => {
                setData(e)
            }
        })
    }

    // useEffect(() => {
    //     if (edit?.id) {
    //         loadData()
    //     }
    // }, [edit])
    useEffect(() => {
        if (open) {
            loadData()
        }

    }, [open, edit])

    // log(getData, "yeh edit hai")

    const highlightedCode = (text, lang) => {
        try {
            if (!text || !lang) return null
            return hljs.highlight(
                `${text}`,
                { language: lang ?? 'PHP' }
            ).value
        } catch (error) {
            return hljs.highlight(
                `${text}`, {
                language: 'html',
                ignoreIllegals: true
            }
            ).value
        }
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
                modalClass="modal-xl"
                // handleSave={handleSubmit(handleSave)}
                title={isValid(edit) ? edit?.code_lang : 'APIs'}>
                <>

                    <CardBody className='border-top'>
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
                            <div>
                                <span className="fw-bolder">{getData?.title} </span>
                            </div>
                            <div className='mt-2'>
                                <span className="fw-bold">{getData?.api_information} </span>
                            </div>
                            <div className='mt-2'>
                                <span className="fw-bolder">Code:-</span>
                                <span className='hljs'>
                                    <pre>
                                        <code dangerouslySetInnerHTML={{ __html: highlightedCode(getData?.api_code, getData?.code_lang) }} />
                                    </pre>
                                </span>
                            </div>
                            <div className='mt-2'>
                                <span className="fw-bolder">{getData?.response_description} </span>
                            </div>
                            <div className='mt-2'>
                                <span className='hljs'>
                                    <pre>
                                            <code dangerouslySetInnerHTML={{ __html: highlightedCode(getData?.api_response, 'json') }} />
                                    </pre>
                                </span>
                            </div>
                        </>
                        }
                    </CardBody>
                </>
            </CenteredModal >
        </>
    )
}

export default ViewApis
