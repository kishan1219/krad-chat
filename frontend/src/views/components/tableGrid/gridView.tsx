// @ts-nocheck
import React from 'react'
import { Card, CardBody, Col, Row } from 'reactstrap'
import { isValidArray, log } from '../../../utility/helpers/common'

const GridView = ({ gridClassName = "", gridView = () => { }, data = null, loading, shimmer, gridCol = "4", ...extra }) => {
    // log("data", data)
    const shimmerShow = () => {
        const ss = []
        for (let i = 1; i < 25; i++) {
            ss.push(<Col md={gridCol} key={`${i}-shimmer`} {...extra}>
                <Card>
                    <CardBody className="p-0">
                        {shimmer}
                    </CardBody>
                </Card>
            </Col>)
        }
        return ss
    }
    if (loading) {
        return (
            <Row>
                {shimmerShow()}
            </Row>
        )
    } else {
        // log(data, "file")
        return (
            <>
                <Row key={"row-of-grid"}>
                    {
                        isValidArray(data?.data) ? data?.data?.map((item, index) => {
                            return (
                                <>
                                    <Col key={`${item.id}-grid-single`} className={`grid d-flex align-items-stretch ${gridClassName}`} md={gridCol} {...extra}>
                                        {gridView(item, index)}
                                    </Col>
                                </>
                            )
                        }) : ""
                    }
                </Row>
                <div id="theEnd"></div>
            </>
        )
    }
}

export default GridView
