// @ts-nocheck
// import React, { useEffect, useState } from 'react'
// import { Spinner } from 'reactstrap'
// import Swal from 'sweetalert2'
// import withReactContent from 'sweetalert2-react-content'
// import { isValid } from './common'

// const MySwal = withReactContent(Swal)
// /**
//  * Show Alert with confirm
//  */
// const ConfirmStop = ({
//     itemId = null,
//     title = null,
//     text = null,
//     enableNo = false,
//     icon = 'warning',
//     confirmButtonText,
//     showCancelButton = true,
//     successIcon = "success",
//     successTitle = null,
//     successText = null,
//     failedIcon = "error",
//     failedTitle = null,
//     failedText = null,
//     onClickYes = () => { },
//     onClickNo = () => { },
//     children,
//     id = "",
//     style = {},
//     className = {},
//     onClose = () => { },
//     onSuccess = false,
//     onFailed = false,
//     color = "text-success",
//     input = false
// }) => {


//     const [reason, setReason] = useState()
//     title = title ?  title  : "Are You  Sure"
//     text = text ? text  : "you wont be able to revert this"
//     confirmButtonText = confirmButtonText ?  confirmButtonText : "yes"
//     // Success
//     successTitle = successTitle ? successTitle : "stopped"
//     successText = successText ? successText : "campaign stopped"
//     // Failed
//     failedTitle = failedTitle ? failedTitle : "failed"
//     failedText = failedText ? failedText : "item-failed"

//     useEffect(() => {
//         if (onSuccess) {
//             MySwal.fire({
//                 onDestroy: () => { onClose() },
//                 icon: successIcon,
//                 title: successTitle,
//                 text: successText,
//                 showConfirmButton: false,
//                 timer: 1500
//             }).then(() => {
//                 onClose(true, itemId)
//             })
//         }
//     }, [onSuccess])

//     useEffect(() => {
//         if (onFailed) {
//             MySwal.fire({
//                 onDestroy: () => { onClose() },
//                 icon: failedIcon,
//                 title: failedTitle,
//                 text: failedText,
//                 timer: 1500,
//                 showConfirmButton: false
//             }).then(() => {
//                 onClose(false)
//             })
//         }
//     }, [onFailed])

//     const popup = () => {
//         return MySwal.fire({
//             title,
//             text,
//             icon,
//             inputValidator: (value) => {
//                 if (!value) {
//                     setReason(value)
//                     return 'You need to write a valid reason!'
//                 }
//             },
//             inputLabel: 'Reason for expiry',
//             input: input ? 'textarea' : null,
//             showDenyButton: enableNo,
//             showCancelButton,
//             confirmButtonText,
//             customClass: {
//                 input: 'form-control mx-3',
//                 confirmButton: 'btn btn-primary',
//                 cancelButton: 'btn btn-outline-danger ms-1',
//                 denyButton: 'btn btn-warning ms-1'
//             },
//             inputAttributes: {
//                 autocapitalize: 'off'
//             },
//             buttonsStyling: false
//         }).then(function (result) {
//             console.log(result?.value)
//             if (result.value === true || isValid(result.value)) {
//                 onClickYes(result.value)
//                 MySwal.fire({
//                     title: <>
//                         <div className=''>
//                             <Spinner animation="border" color='danger' size={"lg"}>
//                                 <span className="visually-hidden">Loading...</span>
//                             </Spinner>
//                         </div>
//                     </>,
//                     text: "Please Wait",
//                     showConfirmButton: false,
//                     showCancelButton: false,
//                     allowOutsideClick: false
//                 })
//             } else if (result.value === false) {
//                 onClickNo(result.value)
//                 MySwal.fire({
//                     title: <>
//                         <div className=''>
//                             <Spinner animation="border" color='danger' size={"lg"}>
//                                 <span className="visually-hidden">Loading...</span>
//                             </Spinner>
//                         </div>
//                     </>,
//                     text: "Please Wait",
//                     showConfirmButton: false,
//                     showCancelButton: false,
//                     allowOutsideClick: false
//                 })
//             }
//         })
//     }

//     return (
//         <>
//             <span role="button" onClick={popup} className={className} style={style} id={id}>
//                 {children}
//             </span>
//         </>
//     )

// }

// export default ConfirmStop

import React, { useEffect, useState } from 'react'
import { Spinner } from 'reactstrap'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Events } from '../Const'
import Emitter from '../Emitter'
import { isValid, log } from './common'

const MySwal = withReactContent(Swal)
/**
 * Show Alert with confirm
 */
const ConfirmStop = ({
    item = null,
    title = null,
    text = null,
    enableNo = false,
    eventId = Events.confirmAlert,
    icon = 'warning',
    confirmButtonText,
    cancelButtonText,
    denyButtonText,
    showCancelButton = true,
    successIcon = "success",
    successTitle = null,
    successText = null,
    failedIcon = "error",
    failedTitle = null,
    failedText = null,
    onClickYes = () => { },
    onClickNo = () => { },
    children,
    id = "",
    style = {},
    className = {},
    textClass = "",
    disableConfirm = false,
    onFailedEvent = () => { },
    onSuccessEvent = () => { },
    color = "text-success",
    input = false,
    inputType = "textarea",
    inputLabel = "reason-for-expiry",
    inputOptions = null
}) => {
    const [isOpen, setOpen] = useState(true)
    const [reason, setReason] = useState()
    const [payload, setPayload] = useState(null)

    const [onSuccess, setOnsuccess] = useState(null)
    const [onFailed, setOnFailed] = useState(null)

    title = title ? title : "are you sure"
    text = text ? text : "you wont be able to revert this"
    confirmButtonText = confirmButtonText ? confirmButtonText : "Yes"
    cancelButtonText = cancelButtonText ? cancelButtonText : "cancel"
    denyButtonText = denyButtonText ? denyButtonText : "no"
    // Success
    successTitle = successTitle ? successTitle : "success"
    successText = successText ? successText : "executed-successfully"
    // Failed
    failedTitle = failedTitle ? failedTitle : "failed"
    failedText = failedText ? failedText : "execution-failed"

    useEffect(() => {
        if (isValid(item)) {
            setPayload(i => ({ ...i, ...item }))
        }
    }, [item])

    useEffect(() => {
        if (isOpen) {
            // log("onSuccess", onSuccess)
            // log("onFailed", onFailed)
            // log("isOpen", isOpen)
        }
    }, [onSuccess, onFailed, isOpen])

    useEffect(() => {
        if (isOpen) {
            Emitter.on(eventId, e => {
                setPayload(i => ({ ...i, ...e?.payload }))
                if (e?.type === 'success') {
                    // log("success rec", e)
                    setOnsuccess(true)
                } else if (e?.type === "failed") {
                    // log("failed rec", e)
                    setOnFailed(true)
                } else {
                    // log("no match")
                }
            })
        }
    }, [isOpen])

    useEffect(() => {
        if (onSuccess) {
            MySwal.fire({
                icon: successIcon,
                title: successTitle,
                text: successText,
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                onSuccessEvent(payload)
                setOpen(false)
                setOnsuccess(null)
            })
        }
    }, [onSuccess])


    useEffect(() => {
        if (onFailed) {
            MySwal.fire({
                icon: failedIcon,
                title: failedTitle,
                text: failedText,
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                onFailedEvent(payload)
                setOpen(false)
                setOnFailed(null)
            })
        }
    }, [onFailed])

    const popup = () => {
        setOpen(true)
        return MySwal.fire({
            title,
            text: text === 'no-text' ? null : text,
            icon,
            inputValidator: (value) => {
                if (inputType === 'textarea') {
                    if (!value) {
                        setReason(value)
                        return 'You need to write a valid reason!'
                    }
                }
            },
            inputLabel,
            inputOptions,
            input: input ? inputType : null,
            showDenyButton: enableNo,
            showCancelButton,
            confirmButtonText,
            denyButtonText,
            allowOutsideClick: false,
            customClass: {
                htmlContainer: textClass,
                inputLabel: 'fw-bolder text-dark',
                input: inputType === "select" ? 'form-select' : 'form-control',
                confirmButton: disableConfirm ? 'btn btn-secondary pe-none' : 'btn btn-primary',
                cancelButton: 'btn btn-outline-danger ms-1',
                denyButton: 'btn btn-warning ms-1'
            },
            inputAttributes: {
                autocapitalize: 'off'
            },
            buttonsStyling: false
        }).then(function (result) {
            if (result.value === true || (isValid(result.value) && input)) {
                onClickYes(result.value)
                setOpen(true)
                MySwal.fire({
                    title: <>
                        <div className=''>
                            <Spinner animation="border" color='danger' size={"lg"}>
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    </>,
                    text: "Please Wait",
                    showConfirmButton: false,
                    showCancelButton: false,
                    allowOutsideClick: false
                })
            } else if (result.value === false) {
                onClickNo(result.value)
                setOpen(true)
                MySwal.fire({
                    title: <>
                        <div className=''>
                            <Spinner animation="border" color='danger' size={"lg"}>
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    </>,

                    text: "Please Wait",
                    showConfirmButton: false,
                    showCancelButton: false,
                    allowOutsideClick: false
                })
            }
        })
    }

    return (
        <>
            <span role="button" onClick={popup} className={className} style={style} id={id ?? 'delete-button'}>
                {children}
            </span>
        </>
    )

}

export default ConfirmStop
