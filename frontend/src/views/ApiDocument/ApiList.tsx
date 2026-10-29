// @ts-nocheck
import React, { Fragment, useRef, useState } from 'react'
import Curl from './Tab/Curl'

const ApiList = () => {
    // ** Ref
    const ref = useRef(null)

    // ** State
    const [stepper, setStepper] = useState(null)

 
    return (
        <Fragment>
       
       <Curl  />
    
      </Fragment>
       
    
    )
}

export default ApiList
