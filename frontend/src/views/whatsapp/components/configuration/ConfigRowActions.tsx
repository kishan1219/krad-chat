// @ts-nocheck
import React from 'react'
import { Button, ButtonGroup, UncontrolledTooltip } from 'reactstrap'
import { MoreVertical, Eye, Edit, Trash2 } from 'react-feather'
import { Call, Report } from '@mui/icons-material'
import Aod from '@mui/icons-material/Aod'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import Loyalty from '@mui/icons-material/Loyalty'
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid'
import VerifiedIcon from '@mui/icons-material/Verified'
import WhatsApp from '@mui/icons-material/WhatsApp'
import DropDownMenu from '../../../components/dropdown'
import ConfirmAlert from '../../../../utility/helpers/ConfirmAlert'
import ViewConfigInModal from '../../VIewConfigInModal'
import WhatsappTemplatePull from '../../AddWhatsappConfig'
import Show from '../../../../utility/Show'
import { Permissions } from '../../../../utility/Permissions'
import { IconSizes } from '../../../../utility/Const'
import { waMarketingLiteApiStatus, onboardPartnersToMmLite } from '../../../../utility/apis/whatsappConfig'

interface ConfigRowActionsProps {
    row: any
    colors: any
    onQualityCheck: (row: any) => void
    onOpenVerificationModal: (row: any) => void
    onRegisterPhone: (row: any) => void
    onSubscribeApps: (row: any) => void
    onOpenEcommerce: (row: any) => void
    onOpenCalling: (row: any) => void
    onDelete: (row: any) => void
    preload: () => void
    deletedState: any
    failedState: any
    onCloseConfirmAlert: (confirmed: boolean, row: any) => void
}

export function ConfigRowActions({
    row,
    colors,
    onQualityCheck,
    onOpenVerificationModal,
    onRegisterPhone,
    onSubscribeApps,
    onOpenEcommerce,
    onOpenCalling,
    onDelete,
    preload,
    deletedState,
    failedState,
    onCloseConfirmAlert
}: ConfigRowActionsProps) {
    const primaryColor = colors?.primary?.main || '#ff8c21'

    return (
        <div className="d-flex align-items-center gap-1">
            <DropDownMenu
                direction="down"
                tooltip="Menu"
                component={<MoreVertical color={primaryColor} size={IconSizes.MenuVertical} />}
                options={[
                    {
                        IF: row?.platform_type === 'NOT_APPLICABLE',
                        icon: <Aod size={14} />,
                        onClick: () => onRegisterPhone(row),
                        name: 'Register Phone No.'
                    },
                    {
                        icon: <Loyalty size={14} />,
                        onClick: () => onSubscribeApps(row),
                        name: 'Subscribe Apps'
                    },
                    {
                        icon: <WhatsApp size={14} />,
                        onClick: () => onOpenEcommerce(row),
                        name: 'Whatsapp Ecommerce'
                    },
                    {
                        icon: <Call size={14} />,
                        onClick: () => onOpenCalling(row),
                        name: 'Whatsapp Calling'
                    },
                    {
                        IF: row?.marketing_messages_lite_api_status !== 'ONBOARDED',
                        icon: <FactCheckIcon size={14} />,
                        onClick: () => {
                            waMarketingLiteApiStatus({
                                id: row?.id,
                                success: () => preload()
                            })
                        },
                        name: 'Check Lite Status'
                    },
                    {
                        IF: row?.marketing_messages_lite_api_status === 'ELIGIBLE' && !row?.is_mm_lite_request_sent,
                        icon: <VerifiedIcon size={14} />,
                        onClick: () => {
                            onboardPartnersToMmLite({
                                id: row?.id,
                                success: () => preload()
                            })
                        },
                        name: 'Send Response to MM Lite'
                    }
                ]}
            />

            <ButtonGroup size="sm">
                <UncontrolledTooltip target={`verify-${row?.id}`}>
                    Quality Check <br />
                    Last Quality Checked: {row?.last_quality_checked || 'Never'}
                </UncontrolledTooltip>
                <Button.Ripple
                    size="sm"
                    color="success"
                    onClick={() => onQualityCheck(row)}
                    id={`verify-${row?.id}`}
                    className="p-1"
                >
                    <FactCheckIcon fontSize="inherit" />
                </Button.Ripple>

                <Show IF={row?.code_verification_status !== 'VERIFIED'}>
                    <UncontrolledTooltip target={`verified-${row?.id}`}>Phone Number Verification</UncontrolledTooltip>
                    <Button.Ripple
                        size="sm"
                        color="info"
                        onClick={() => onOpenVerificationModal(row)}
                        id={`verified-${row?.id}`}
                        className="p-1"
                    >
                        <PhoneAndroidIcon fontSize="inherit" />
                    </Button.Ripple>
                </Show>

                <Show IF={Permissions?.whatsappConfigView}>
                    <UncontrolledTooltip placement="top" id={`view-tip-${row?.id}`} target={`view-${row?.id}`}>
                        View
                    </UncontrolledTooltip>
                    <ViewConfigInModal
                        Component={Button.Ripple}
                        size="sm"
                        color="success"
                        edit={row}
                        id={`view-${row?.id}`}
                        className="p-1"
                    >
                        <Eye size={14} />
                    </ViewConfigInModal>
                </Show>

                <Show IF={Permissions?.whatsappConfigEdit}>
                    <UncontrolledTooltip placement="top" id={`edit-tip-${row?.id}`} target={`edit-${row?.id}`}>
                        Edit
                    </UncontrolledTooltip>
                    <WhatsappTemplatePull
                        Component={Button.Ripple}
                        size="sm"
                        color="secondary"
                        edit={row}
                        id={`edit-${row?.id}`}
                        className="p-1"
                    >
                        <Edit size={14} />
                    </WhatsappTemplatePull>
                </Show>

                <Show IF={Permissions?.whatsappConfigDelete}>
                    <ConfirmAlert
                        title={`Delete ${row?.sender_number || row?.name}?`}
                        color="text-warning"
                        onClickYes={() => onDelete(row)}
                        onSuccess={deletedState}
                        onFailed={failedState}
                        onClose={(confirmed) => onCloseConfirmAlert(confirmed, row)}
                        className="waves-effect btn btn-danger btn-sm p-1"
                        style={{ cursor: 'pointer' }}
                        id={`grid-delete-${row?.id}`}
                    >
                        <Trash2 size={14} style={{ cursor: 'pointer' }} />
                    </ConfirmAlert>
                </Show>
            </ButtonGroup>
        </div>
    )
}

