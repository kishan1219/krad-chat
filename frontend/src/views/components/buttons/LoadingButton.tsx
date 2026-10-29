// @ts-nocheck
import React, { useState } from 'react'
import { Button, Spinner, UncontrolledTooltip } from 'reactstrap'
import { getUniqId } from '../../../utility/Utils'
// import { getUniqId } from '../../../utility/Utils'

const LoadingButton = ({ id = null, loading = false, tooltip = null, ...props }) => {
    const [uId, setId] = useState(props?.id ?? getUniqId("button"))
    const ButtonComponent = Button.Ripple || Button
    return (
        <>
            {tooltip ? <UncontrolledTooltip target={uId}>
                {tooltip}
            </UncontrolledTooltip> : null}
            <ButtonComponent id={uId} disabled={loading} {...{ ...props, loading: "false" }}>
                {
                    loading ? <>
                        <Spinner animation="border" size={"sm"}>
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </> : props.children
                }
            </ButtonComponent>
        </>
    )
}

export default LoadingButton
