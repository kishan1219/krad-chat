// @ts-nocheck
// import React, { useEffect, useState } from 'react'
// import { Spinner } from 'reactstrap'
// import Swal from 'sweetalert2'
// import withReactContent from 'sweetalert2-react-content'
// import { Events } from '../Const'
// import Emitter from '../Emitter'
// import { isValid, log } from './common'

// const MySwal = withReactContent(Swal)
// /**
//  * Show Alert with confirm
//  */
// const ConfirmPhoneNumber = ({
//     item = null,
//     title = null,
//     text = null,
//     enableNo = false,
//     eventId = Events.confirmAlert,
//     icon = 'warning',
//     showCancelButton = true,
//     successIcon = "success",
//     successTitle = null,
//     successText = null,
//     failedIcon = "error",
//     failedTitle = null,
//     failedText = null,
//     onClickSMS = () => { },
//     onClickVoice = () => { },
//     onClickNo = () => { },
//     children,
//     id = "",
//     style = {},
//     className = {},
//     textClass = "",
//     disableConfirm = false,
//     onFailedEvent = () => { },
//     onSuccessEvent = () => { },
//     color = "text-success",
//     input = false,
//     inputType = "textarea",
//     inputLabel = "reason-for-expiry",
//     inputOptions = null
// }) => {
//     const [isOpen, setOpen] = useState(true)
//     const [reason, setReason] = useState()
//     const [payload, setPayload] = useState(null)

//     const [onSuccess, setOnsuccess] = useState(null)
//     const [onFailed, setOnFailed] = useState(null)

//     title = title ? title : "Receive OTP"
//     text = text ? text : "you wont be able to revert this"
//     // Success
//     successTitle = successTitle ? successTitle : "success"
//     successText = successText ? successText : "executed-successfully"
//     // Failed
//     failedTitle = failedTitle ? failedTitle : "failed"
//     failedText = failedText ? failedText : "execution-failed"

//     useEffect(() => {
//         if (isValid(item)) {
//             setPayload(i => ({ ...i, ...item }))
//         }
//     }, [item])

//     useEffect(() => {
//         if (isOpen) {
//             Emitter.on(eventId, e => {
//                 setPayload(i => ({ ...i, ...e?.payload }))
//                 if (e?.type === 'success') {
//                     setOnsuccess(true)
//                 } else if (e?.type === "failed") {
//                     setOnFailed(true)
//                 }
//             })
//         }
//     }, [isOpen])

//     useEffect(() => {
//         if (onSuccess) {
//             MySwal.fire({
//                 icon: successIcon,
//                 title: successTitle,
//                 text: successText,
//                 showConfirmButton: false,
//                 timer: 1500
//             }).then(() => {
//                 onSuccessEvent(payload)
//                 setOpen(false)
//                 setOnsuccess(null)
//             })
//         }
//     }, [onSuccess])

//     useEffect(() => {
//         if (onFailed) {
//             MySwal.fire({
//                 icon: failedIcon,
//                 title: failedTitle,
//                 text: failedText,
//                 timer: 1500,
//                 showConfirmButton: false
//             }).then(() => {
//                 onFailedEvent(payload)
//                 setOpen(false)
//                 setOnFailed(null)
//             })
//         }
//     }, [onFailed])

//     // Attach event listeners after popup is shown
//     useEffect(() => {
//         if (isOpen) {
//             setTimeout(() => {
//                 const smsBtn = document.getElementById('sms-btn')
//                 const voiceBtn = document.getElementById('voice-btn')
//                 if (smsBtn) smsBtn.onclick = () => { onClickSMS(payload); MySwal.close() }
//                 if (voiceBtn) voiceBtn.onclick = () => { onClickVoice(payload); MySwal.close() }
//             }, 100)
//         }
//         // eslint-disable-next-line
//     }, [isOpen, payload]);

//     const popup = () => {
//         setOpen(true)
//         return MySwal.fire({
//             title,
//             text: text === 'no-text' ? null : text,
//             icon,
//             showCancelButton,
//             showConfirmButton: false,
//             html: `
//                 <button id="sms-btn" class="swal2-confirm swal2-styled" style="margin-right:10px;">SMS</button>
//                 <button id="voice-btn" class="swal2-confirm swal2-styled">Voice</button>
//             `,
//             allowOutsideClick: false,
//             customClass: {
//                 htmlContainer: textClass,
//                 inputLabel: 'fw-bolder text-dark',
//                 input: inputType === "select" ? 'form-select' : 'form-control',
//                 cancelButton: 'btn btn-outline-danger ms-1'
//             },
//             buttonsStyling: false
//         })
//     }

//     return (
//         <>
//             <span role="button" onClick={popup} className={className} style={style} id={id ?? 'delete-button'}>
//                 {children}
//             </span>
//         </>
//     )
// }

// export default ConfirmPhoneNumber

import React from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const ConfirmPhoneNumber = ({
    title = "Send Verification code on?",
    subtitle = "",
    icon = "warning",
    onSMS = () => { },
    onVoice = () => { },
    children,
    id = "",
    style = {},
    className = ""
}) => {
    const showModal = () => {
        MySwal.fire({
            iconHtml: '<span style="color:#ff0000;font-size:64px;"><b>!</b></span>',
            title: `<div style="color:#6c6c6c;font-weight:600;font-size:1.3rem;">${title}</div>`,
            html: `<div style="color:#b23c3c;font-size:1.1rem;margin-bottom:1rem;">${subtitle}</div>`,
            showConfirmButton: false,
            showCancelButton: false,
            customClass: {
                popup: 'swal2-border-radius'
            },
            didOpen: () => {
                const swalContent = Swal.getHtmlContainer()
                if (swalContent) {
                    // Add buttons
                    const btnGroup = document.createElement('div')
                    btnGroup.style.display = 'flex'
                    btnGroup.style.justifyContent = 'center'
                    btnGroup.style.gap = '10px'
                    btnGroup.style.marginTop = '1.5rem'

                    const smsBtn = document.createElement('button')
                    smsBtn.innerText = 'SMS'
                    smsBtn.className = 'swal2-confirm swal2-styled'
                    smsBtn.style.background = '#00b894'
                    smsBtn.style.color = '#fff'
                    smsBtn.style.fontWeight = '600'
                    smsBtn.onclick = () => {
                        Swal.close()
                        onSMS({ otp_method: 'SMS' })
                    }

                    const voiceBtn = document.createElement('button')
                    voiceBtn.innerText = 'Voice'
                    voiceBtn.className = 'swal2-cancel swal2-styled'
                    voiceBtn.style.background = '#0984e3'
                    voiceBtn.style.color = '#fff'
                    voiceBtn.style.fontWeight = '600'
                    voiceBtn.onclick = () => {
                        Swal.close()
                        onVoice({ otp_method: 'VOICE' })
                    }

                    btnGroup.appendChild(smsBtn)
                    btnGroup.appendChild(voiceBtn)
                    swalContent.appendChild(btnGroup)
                }
            }
        })
    }

    return (
        <span role="button" onClick={showModal} className={className} style={style} id={id}>
            {children}
        </span>
    )
}

export default ConfirmPhoneNumber
