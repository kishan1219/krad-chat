// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Badge, Card, Col, Row, Table, Input } from 'reactstrap' // Assuming Input is imported from reactstrap
import { getTemplateGroupById } from '../../../utility/apis/templateGroup'
import { use } from 'i18next'
import CenteredModal from '../../components/modal/CenteredModal'
import { log } from '../../../utility/helpers/common'

const ViewTemplateGroup = ({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) => {

    const [open, setOpen] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const form = useForm()
    const [group, setGroup] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [activeTab, setActiveTab] = useState('1')
    const [searchQuery, setSearchQuery] = useState('') // State variable for search query

    const toggleTab = tab => {
        setActiveTab(tab)
    }

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)
    }

    const handleClose = (from = null) => {
        handleShow()
    }

    const viewTemplateGroup = () => {
        getTemplateGroupById({
            id: edit?.id,
            loading: setLoading,
            success: (e) => {
                setGroup(e)
            }
        })
    }

    useEffect(() => {
        if (edit && open) {
            viewTemplateGroup()
        }
    }, [edit, open])

    // Filter the templates based on the search query
    const filteredTemplates = group?.dlt_templates?.filter(template => template.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.dlt_template_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.dlt_message.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                title="View Template Group">
                <>
                    <Card>
                        <div className="p-2">
                           
                            <Row className='align-items-start gy-2'>
                                <Col md="6">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Group Name
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {group?.group_name}
                                    </p>
                                </Col>
                                <Col md="6">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        User Name
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {group?.user?.name}
                                    </p>
                                </Col>
                            </Row>
                            {/* <div className='d-flex justify-content-end'>
                                <Row>
                                    <Col md="3">
                                        <Input
                                            type="text"
                                            placeholder="Search Templates"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                            </div> */}
                            <Row className='justify-content-end mx-0'>
                                <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>
                                    <Input
                                        type="text"
                                        placeholder="Search Templates"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Table striped responsive className='mt-1'>
                                <thead>
                                    <tr>
                                        <th scope='col' className='text-nowrap'>S.NO</th>
                                        <th scope='col' className='text-nowrap'>Template Name</th>
                                        <th scope='col' className='text-nowrap'>Template ID</th>
                                        <th scope='col' className='text-nowrap'>Template Message</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTemplates?.map((e, i) => {
                                        return (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td>{e?.template_name}</td>
                                                <td>{e?.dlt_template_id}</td>
                                                <td>{e?.dlt_message}</td>
                                                {/* <td>{Number(e?.status) === 1 ? <Badge color='success' className='badge-glow'>Active</Badge> : <Badge color='danger' className='badge-glow'>In-Active</Badge>}</td> */}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </>
            </CenteredModal>
        </>
    )
}

export default ViewTemplateGroup
