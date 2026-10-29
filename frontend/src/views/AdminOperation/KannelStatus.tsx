// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { getKennelStatus } from '../../utility/apis/adminOperation'
import Header from '../components/header'
import { Card, CardBody } from 'reactstrap'
import hljs from 'highlight.js'

const KannelStatus = () => {

    const [kennel, setKennel] = useState(null)
    const [loading, setLoading] = useState(false)

    const preload = () => {
        getKennelStatus({
            loading: setLoading,
            success: (e) => {
                setKennel(e)
            }
        })
    }

    useEffect(() => {
        preload()
    }, [])

    const highlightedCode = (text, lang) => hljs.highlight(
        `${text}`,
        { language: lang }
    ).value

    return (
        <>
            <Header title="Get Kannel Status" />

            <Card>
                <CardBody className='p-0'>
                    <span className='hljs'>
                        <pre>
                            <code dangerouslySetInnerHTML={{ __html: highlightedCode(kennel, 'apache') }} />
                        </pre>
                    </span>
                </CardBody>
            </Card>
        </>
    )
}

export default KannelStatus
