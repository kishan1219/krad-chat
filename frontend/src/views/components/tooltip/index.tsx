// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { UncontrolledTooltip } from 'reactstrap'
import { isValid, log } from '../../../utility/helpers/common'
import { getUniqId } from '../../../utility/Utils'

const BsTooltip = ({ Tag = "span", title, children, placement = "top", ...rest }) => {
    const [id, setId] = useState(getUniqId("tooltip"))

    if (isValid(title)) {
        return (
            <>
                <UncontrolledTooltip placement={placement} target={id}>
                    {title}
                </UncontrolledTooltip>
                <Tag id={id} {...rest}>
                    {children}
                </Tag>
            </>
        )
    } else {
        return <Tag id={id} {...rest}>
            {children}
        </Tag>
    }
}

export default BsTooltip
