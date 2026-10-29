// @ts-nocheck
import React, { useState } from 'react'
import { PopoverBody, PopoverHeader, UncontrolledPopover } from 'reactstrap'
import { isValid } from '../../../utility/helpers/common'
import Show from '../../../utility/Show'
import { getUniqId } from '../../../utility/Utils'

const BsPopover = ({ className = '', title = null, Tag = "span", content = null, trigger = "lagacy", children, placement = "top", ...rest }) => {
    const [id, setId] = useState(getUniqId("popover"))

    if (isValid(content)) {
        return (
            <>
                <UncontrolledPopover popperClassName={className} trigger={trigger} placement={placement} target={id}>
                    <Show IF={isValid(title)}>
                        <PopoverHeader>
                            {title}
                        </PopoverHeader>
                    </Show>
                    <PopoverBody>
                        {content}
                    </PopoverBody>
                </UncontrolledPopover>
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

export default BsPopover
