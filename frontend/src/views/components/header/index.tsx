// @ts-nocheck
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
// import { Routes } from '../../../router'
import { matchRoutes, useMatch, useRouteMatch, withRouter } from 'react-router-dom'
import { Col, Row } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import Hide from '../../../utility/Hide'
import { Routes } from '../../../router/routes'


const Header = ({
    title, children = null, titleCol = "7", childCol = "5", subHeading, icon = null, description = null, noHeader = false
}) => {
    // const  match  = matchRoutes()
    // const { t } = useTranslation()

    // const getRouteName = () => {
    //     let title = ""
    //     Routes?.forEach((route) => {
    //         if (route?.path === match.path) {
    //             title = route?.meta?.title
    //         }
    //     })
    //     return t(title)
    // }


    return (
        <>
            <Row className="align-items-center mb-2">
                <Hide IF={noHeader}>
                    <Col md={titleCol} className="d-flex align-items-center">
                        <h2 className={classNames("content-header-title float-left mb-0 text-primary", { "border-end-0": !subHeading })}>
                            {icon ? icon : null} {title}
                        </h2>
                        <div className=" ms-1 p-0 mb-0">
                            {subHeading}
                        </div>
                    </Col>
                </Hide>
                <Col md={noHeader ? "12" : childCol} className={`py-1 py-md-0 d-flex ${noHeader ? '' : 'justify-content-md-end'} justify-content-start`}>
                    {children}
                </Col>
                {description ? <Col md="12" className='mt-1'>
                    {description}
                </Col> : null}
            </Row>
        </>
    )
}

Header.propTypes = {
    title: PropTypes.string
}

export default Header
