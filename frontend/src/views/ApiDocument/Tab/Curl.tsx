// @ts-nocheck
// ** React Imports
import { useEffect, useState } from 'react'

// ** Icons Imports
import Api from '@mui/icons-material/Api'

// ** Reactstrap Imports
import Php from '@mui/icons-material/Php'
import {
    AccordionBody,
    AccordionHeader,
    AccordionItem,
    Button,
    Col,
    NavItem,
    NavLink,
    Row,
    TabPane,
    UncontrolledAccordion
} from 'reactstrap'
// ** Images
import Http from '@mui/icons-material/Http'
import Javascript from '@mui/icons-material/Javascript'
import { getApiDoc } from '../../../utility/apis/appSetting'
import { isValid, log } from '../../../utility/helpers/common'
import Header from '../../components/header'
import hljs from 'highlight.js'
import Hide from '../../../utility/Hide'

const Curl = ({ data }) => {
    const dataToRender = []
    const [activeTab, setActiveTab] = useState('1')
    const [doc, setDoc] = useState(null)
    const [docData, setDocData] = useState(null)
    const [loading, setLoading] = useState(null)

    const toggleTab = tab => setActiveTab(tab)

    const loadData = (code_lang = undefined) => {
        getApiDoc({
            params: { with_content: 1, code_lang },
            loading: setLoading,
            success: (e) => {
                if (isValid(code_lang)) {
                    setDocData(e)
                } else {
                    setDoc(e)
                }
                // setTotalBooking(d.data)
            }
        })
    }
    const prelaod = () => {
        loadData()
    }

    // log(doc, "docs")


    useEffect(() => {
        prelaod()
    }, [])

    const renderTabs = () => {
        return (
            <>
                <NavItem tag='li'>
                    <NavLink active={activeTab === '1'} onClick={() => toggleTab('1')}>
                        {/* <IconTag size={18} className='me-1' /> */}
                        <Php className='me-1' fontSize='large' />
                        <span className='fw-bold'>Language</span>
                    </NavLink>
                    <NavLink active={activeTab === '2'} onClick={() => toggleTab('2')}>
                        {/* <IconTag size={18} className='me-1' /> */}
                        <Javascript className='me-1' fontSize='large' />
                        <span className='fw-bold'>Language 2</span>
                    </NavLink>

                    <NavLink active={activeTab === '3'} onClick={() => toggleTab('3')}>
                        {/* <IconTag size={18} className='me-1' /> */}
                        <Http className='me-1' fontSize='large' />
                        <span className='fw-bold'>Language 2</span>
                    </NavLink>
                </NavItem>
            </>

        )
    }

    const renderTabContent = () => {


        return (
            <>
                <TabPane key={'1'} tabId={'1'}>
                    <div className='d-flex align-items-center'>
                        <div className='avatar avatar-tag bg-light-primary me-1'>
                            {/* <IconTag size={20} /> */}


                            <Php fontSize='large' />
                        </div>
                        <div>
                            <h4 className='mb-0'>PHP</h4>
                            {/* <span>is Language</span> */}
                        </div>
                    </div>

                    <UncontrolledAccordion className='accordion-margin mt-2'>

                        <AccordionItem >
                            <AccordionHeader tag='h2' targetId='1' >

                                <span style={{ fontSize: '17px' }}>  Check Network Status </span>
                            </AccordionHeader>
                            <span className='ms-2 fw-bold' style={{ fontSize: '15px' }} > Account status is reflecting on this whether it is active or alive we can say in which particular mode the account is. </span>
                            <br />
                            <span className='ms-2 mt-3' style={{ fontSize: '15px' }}>AppKey-AppSecret: Login authentication key (unique for every user). </span>
                            <AccordionBody accordionId='1'>rtrtsgdfgdgdfgdfgd</AccordionBody>
                        </AccordionItem>

                    </UncontrolledAccordion>

                </TabPane>
                <TabPane key={'2'} tabId={'2'}>
                    <div className='d-flex align-items-center'>
                        <div className='avatar avatar-tag bg-light-primary me-1'>
                            <Javascript fontSize='large' />
                        </div>
                        <div>
                            <h4 className='mb-0'>PYthon</h4>
                            <span>Its Python</span>
                        </div>
                    </div>

                    <UncontrolledAccordion className='accordion-margin mt-2'>

                        <AccordionItem >
                            <AccordionHeader tag='h2' targetId='2'>
                                Python
                            </AccordionHeader>
                            <AccordionBody accordionId='2'>its python</AccordionBody>
                        </AccordionItem>

                    </UncontrolledAccordion>
                    <UncontrolledAccordion className='accordion-margin mt-2'>

                        <AccordionItem >
                            <AccordionHeader tag='h2' targetId='2'>
                                java
                            </AccordionHeader>
                            <AccordionBody accordionId='2'>java 2</AccordionBody>
                        </AccordionItem>

                    </UncontrolledAccordion>

                </TabPane>
                <TabPane key={'3'} tabId={'3'}>
                    <div className='d-flex align-items-center'>
                        <div className='avatar avatar-tag bg-light-primary me-1'>
                            <Http fontSize='large' />
                        </div>
                        <div>
                            <h4 className='mb-0'>PYthonc</h4>
                            <span>Its Python</span>
                        </div>
                    </div>

                    <UncontrolledAccordion className='accordion-margin mt-2'>

                        <AccordionItem >
                            <AccordionHeader tag='h2' targetId='3'>
                                Python
                            </AccordionHeader>
                            <AccordionBody accordionId='3'>its python</AccordionBody>
                        </AccordionItem>

                    </UncontrolledAccordion>

                </TabPane>
            </>

        )

    }

    // const highlightedCode = (text, lang) => hljs.highlight(
    //     `${text}`,
    //     { language: lang }
    // ).value

    const highlightedCode = (text, lang) => {
        // fallback to 'plaintext' if lang is not supported
        const safeLang = hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(`${text}`, { language: safeLang }).value
    }

    return (

        <>
            <div className='p-2'>
                <Header title={"API Documents"} icon={<Api />} />
                <div>

                    <Row>

                        {doc?.data?.map((item, index) => {
                            return (
                                <Col md="4" sm="6" className={"mb-2"}>
                                    <Button.Ripple className='round' color='primary' outline block onClick={() => loadData(item?.code_lang)}>
                                        {item?.code_lang}
                                    </Button.Ripple>
                                </Col>
                            )
                        })}
                    </Row>
                    {docData?.data?.map((d, i) => {
                        return d?.get_lang_wise?.map((x, j) => {
                            return <>
                                <UncontrolledAccordion className='accordion-margin mt-2'>

                                    <AccordionItem >
                                        <AccordionHeader tag='h2' targetId='1' >

                                            <span className="fw-bold text-primary">{j + 1}.  {x?.title} </span>
                                        </AccordionHeader>
                                        <AccordionBody accordionId='1'>
                                            <div>
                                                {/* <div dangerouslySetInnerHTML={{ __html: x?.api_information }} /> */}
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: `<style>
                    img.image_resized {width:75% !important;max-width:75%;height:auto;}
                </style>${
                                                            // Add class 'image_resized' to all img tags in x?.api_information
                                                            (x?.api_information || '').replace(/<img /g, '<img class="image_resized" ')
                                                            }`
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                {x?.response_description}
                                            </div>
                                            <Hide IF={x?.api_code === null}>
                                                <div className='mt-2'>
                                                    <span className='fw-bolder'>Code</span>
                                                    <span className='hljs'>
                                                        <pre>
                                                            <code dangerouslySetInnerHTML={{ __html: highlightedCode(x?.api_code, x?.code_lang) }} />
                                                        </pre>
                                                    </span>
                                                </div>
                                            </Hide>
                                            <Hide IF={x?.api_response === null}>
                                                <div>
                                                    <span className='fw-bolder'>Response</span>
                                                    <span className='hljs'
                                                    ><pre>
                                                            <code dangerouslySetInnerHTML={{ __html: highlightedCode(x?.api_response, 'json') }} />
                                                        </pre>
                                                    </span>
                                                </div>
                                            </Hide>
                                        </AccordionBody>

                                    </AccordionItem>

                                </UncontrolledAccordion >

                            </>
                        })
                    })}
                </div >
            </div>
        </>
    )
}

export default Curl
