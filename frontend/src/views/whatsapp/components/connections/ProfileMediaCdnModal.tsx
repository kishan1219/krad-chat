import React, { useState, useEffect, useRef } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Label,
    FormGroup,
    Badge,
    Spinner,
    Alert
} from 'reactstrap'
import {
    UploadCloud,
    Check,
    Copy,
    Trash2,
    Image as ImageIcon,
    RefreshCw,
    Globe,
    Info,
    CheckCircle
} from 'react-feather'
import { WhatsAppConnection, whatsappService } from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface ProfileMediaCdnModalProps {
    isOpen: boolean
    toggle: () => void
    conn: WhatsAppConnection | null
    onUpdated?: () => void
}

export const ProfileMediaCdnModal: React.FC<ProfileMediaCdnModalProps> = ({
    isOpen,
    toggle,
    conn,
    onUpdated
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const [base64Data, setBase64Data] = useState<string>('')
    const [aboutText, setAboutText] = useState<string>('Available on WhatsApp')
    const [description, setDescription] = useState<string>('')
    const [currentCdnUrl, setCurrentCdnUrl] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [fetching, setFetching] = useState<boolean>(false)
    const [copied, setCopied] = useState<boolean>(false)

    useEffect(() => {
        if (isOpen && conn) {
            setSelectedFile(null)
            setPreviewUrl(conn.profile_picture_url || '')
            setCurrentCdnUrl(conn.profile_picture_url || '')
            setAboutText(conn.profile_about || 'Available on WhatsApp')
            setBase64Data('')
            setCopied(false)

            // Fetch live profile details from Meta Graph API
            void loadLiveProfile(conn.id)
        }
    }, [isOpen, conn])

    const loadLiveProfile = async (id: number) => {
        setFetching(true)
        try {
            const profile = await whatsappService.getBusinessProfile(id)
            if (profile.profile_picture_url) {
                setPreviewUrl(profile.profile_picture_url)
                setCurrentCdnUrl(profile.profile_picture_url)
            }
            if (profile.about) {
                setAboutText(profile.about)
            }
            if (profile.description) {
                setDescription(profile.description)
            }
        } catch {
            // keep existing values if live fetch fails
        } finally {
            setFetching(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            ErrorToast('Image size exceeds 5 MB. Please select a smaller image.')
            return
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if (!validTypes.includes(file.type)) {
            ErrorToast('Invalid format. Please select a PNG, JPG, or WebP image.')
            return
        }

        setSelectedFile(file)
        const reader = new FileReader()
        reader.onload = (event) => {
            const result = event.target?.result as string
            setPreviewUrl(result)
            setBase64Data(result)
        }
        reader.readAsDataURL(file)
    }

    const handleUploadAndSync = async () => {
        if (!conn) return
        if (!base64Data && !aboutText) {
            ErrorToast('Please select a profile image to upload.')
            return
        }

        setLoading(true)
        try {
            const res = await whatsappService.uploadProfileAvatar(conn.id, {
                image_base64: base64Data || previewUrl,
                filename: selectedFile?.name || 'whatsapp_avatar.jpg',
                about: aboutText.trim().slice(0, 139),
                description: description.trim().slice(0, 512)
            })

            setCurrentCdnUrl(res.profile_picture_url)
            setPreviewUrl(res.profile_picture_url)
            setSelectedFile(null)
            SuccessToast(res.message || 'Avatar converted to 640x640 JPEG & synced to Meta!')
            onUpdated?.()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to update WhatsApp profile'
            ErrorToast(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAvatar = async () => {
        if (!conn) return
        if (!window.confirm('Are you sure you want to remove the WhatsApp Business profile avatar?')) return

        setLoading(true)
        try {
            await whatsappService.deleteProfileAvatar(conn.id)
            setCurrentCdnUrl('')
            setPreviewUrl('')
            setSelectedFile(null)
            setBase64Data('')
            SuccessToast('Profile avatar removed.')
            onUpdated?.()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to remove avatar'
            ErrorToast(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleCopyCdnUrl = () => {
        if (!currentCdnUrl) return
        navigator.clipboard.writeText(currentCdnUrl)
        setCopied(true)
        SuccessToast('CDN image URL copied to clipboard!')
        setTimeout(() => setCopied(false), 2500)
    }

    const isObaApproved = conn?.oba_status === 'APPROVED'

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="lg" className="rounded-3">
            <ModalHeader
                toggle={toggle}
                className="border-bottom py-3 px-4"
                style={{ backgroundColor: '#ffffff' }}
            >
                <div className="d-flex align-items-center gap-2">
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '38px', height: '38px', backgroundColor: '#ecfdf5', color: '#25D366' }}
                    >
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>
                                WhatsApp Profile & Media CDN
                            </h5>
                            <Badge
                                pill
                                style={{
                                    backgroundColor: '#25D366',
                                    color: '#ffffff',
                                    fontSize: '0.68rem',
                                    fontWeight: 700
                                }}
                            >
                                640×640 JPG Standard
                            </Badge>
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                            {conn?.name || 'WhatsApp Line'} ({conn?.display_phone_number || conn?.phone_number_id})
                        </p>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="p-4" style={{ backgroundColor: '#f8fafc' }}>
                {fetching && (
                    <div className="d-flex align-items-center justify-content-center gap-2 py-2 mb-3 text-muted" style={{ fontSize: '0.82rem' }}>
                        <Spinner size="sm" color="primary" />
                        <span>Synchronizing live WhatsApp Business profile with Meta Graph API...</span>
                    </div>
                )}

                <div className="row g-4">
                    {/* Left Column: Avatar Preview & Upload */}
                    <div className="col-12 col-md-5">
                        <div className="bg-white p-3 rounded-3 border text-center h-100 d-flex flex-column align-items-center justify-content-between" style={{ borderColor: '#e2e8f0' }}>
                            <div className="w-100">
                                <Label className="fw-bold text-dark d-block mb-3" style={{ fontSize: '0.85rem' }}>
                                    Profile Picture Avatar
                                </Label>

                                {/* 640x640 Square / Circular Avatar Frame */}
                                <div className="position-relative mx-auto mb-3" style={{ width: '130px', height: '130px' }}>
                                    <div
                                        className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center shadow-sm"
                                        style={{
                                            width: '130px',
                                            height: '130px',
                                            border: '3px solid #25D366',
                                            backgroundColor: '#f1f5f9'
                                        }}
                                    >
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="WhatsApp Profile Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <ImageIcon size={48} className="text-muted" />
                                        )}
                                    </div>

                                    {/* Official Business Account Verified Badge Overlay */}
                                    {isObaApproved && (
                                        <div
                                            className="position-absolute d-flex align-items-center justify-content-center rounded-circle"
                                            style={{
                                                bottom: '4px',
                                                right: '4px',
                                                width: '30px',
                                                height: '30px',
                                                backgroundColor: '#25D366',
                                                border: '2px solid #ffffff'
                                            }}
                                            title="Official Business Account (Green Checkmark Verified)"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M7.5 12L10.5 15L16.5 9" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex flex-wrap align-items-center justify-content-center gap-1 mb-3">
                                    <Badge color="light-success" pill style={{ fontSize: '0.7rem' }}>
                                        ✓ 640×640 Square
                                    </Badge>
                                    <Badge color="light-primary" pill style={{ fontSize: '0.7rem' }}>
                                        JPEG / Max 5MB
                                    </Badge>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                />

                                <Button
                                    type="button"
                                    color="light"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="d-inline-flex align-items-center gap-1 fw-semibold mb-2"
                                    style={{ borderColor: '#cbd5e1', fontSize: '0.8rem' }}
                                >
                                    <UploadCloud size={14} />
                                    <span>Choose Image File</span>
                                </Button>

                                {selectedFile && (
                                    <div className="text-success fw-semibold" style={{ fontSize: '0.75rem' }}>
                                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                                    </div>
                                )}
                            </div>

                            {currentCdnUrl && (
                                <div className="w-100 pt-2 border-top">
                                    <Button
                                        type="button"
                                        color="light-danger"
                                        size="sm"
                                        onClick={handleDeleteAvatar}
                                        disabled={loading}
                                        className="d-inline-flex align-items-center gap-1"
                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                                    >
                                        <Trash2 size={13} />
                                        <span>Remove Avatar</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Meta Business Profile & CDN Distribution */}
                    <div className="col-12 col-md-7">
                        <div className="bg-white p-3 rounded-3 border h-100 d-flex flex-column justify-content-between" style={{ borderColor: '#e2e8f0' }}>
                            <div>
                                <FormGroup className="mb-3">
                                    <Label className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                        Verified Brand Name
                                    </Label>
                                    <Input
                                        type="text"
                                        readOnly
                                        value={conn?.verified_name || conn?.name || 'WhatsApp Line'}
                                        className="bg-light font-monospace"
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    <div className="d-flex align-items-center justify-content-between mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
                                        <span>Official Meta Brand Identity</span>
                                        {isObaApproved ? (
                                            <span className="text-success fw-bold">✓ Official Green Checkmark Active</span>
                                        ) : (
                                            <span>Display Name Status: {conn?.name_status || 'APPROVED'}</span>
                                        )}
                                    </div>
                                </FormGroup>

                                <FormGroup className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <Label className="fw-bold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                                            About Status Text
                                        </Label>
                                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                            {aboutText.length}/139 chars
                                        </span>
                                    </div>
                                    <Input
                                        type="text"
                                        maxLength={139}
                                        value={aboutText}
                                        onChange={(e) => setAboutText(e.target.value)}
                                        placeholder="e.g. Available on WhatsApp | Customer Support"
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                                        Displayed directly below your business name in WhatsApp contact info.
                                    </small>
                                </FormGroup>

                                <FormGroup className="mb-3">
                                    <Label className="fw-bold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                                        Business Description (Bio)
                                    </Label>
                                    <Input
                                        type="textarea"
                                        rows={2}
                                        maxLength={512}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe your company services or product offerings to customers..."
                                        style={{ fontSize: '0.82rem' }}
                                    />
                                </FormGroup>

                                {/* High-Performance Media CDN URL */}
                                {currentCdnUrl && (
                                    <FormGroup className="mb-2">
                                        <Label className="fw-bold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                                            Media CDN Public Endpoint
                                        </Label>
                                        <div className="input-group input-group-sm">
                                            <Input
                                                type="text"
                                                readOnly
                                                value={currentCdnUrl}
                                                className="bg-light font-monospace"
                                                style={{ fontSize: '0.75rem' }}
                                            />
                                            <Button
                                                type="button"
                                                color={copied ? 'success' : 'light'}
                                                onClick={handleCopyCdnUrl}
                                                className="d-flex align-items-center gap-1"
                                                style={{ borderColor: '#cbd5e1' }}
                                            >
                                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                                <span>{copied ? 'Copied' : 'Copy'}</span>
                                            </Button>
                                        </div>
                                    </FormGroup>
                                )}
                            </div>

                            <Alert color="light-success" className="d-flex align-items-start gap-2 p-2 mb-0" style={{ fontSize: '0.76rem' }}>
                                <Info size={15} className="text-success mt-1 flex-shrink-0" />
                                <div>
                                    <strong>Automated Image Processor:</strong> Any selected picture is automatically cropped and converted to <strong>640×640 JPEG</strong> format, uploaded to KradChat's media CDN, and pushed to Meta Graph API <code>whatsapp_business_profile</code>.
                                </div>
                            </Alert>
                        </div>
                    </div>
                </div>
            </ModalBody>

            <ModalFooter className="border-top py-2 px-4 d-flex justify-content-between">
                <Button
                    type="button"
                    color="light"
                    onClick={toggle}
                    disabled={loading}
                    style={{ fontSize: '0.85rem' }}
                >
                    Cancel
                </Button>

                <Button
                    type="button"
                    onClick={handleUploadAndSync}
                    disabled={loading || (!base64Data && !selectedFile && !aboutText)}
                    style={{
                        backgroundColor: '#ff8c21',
                        borderColor: '#ff8c21',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        padding: '0.5rem 1.25rem'
                    }}
                    className="d-inline-flex align-items-center gap-2 shadow-sm"
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" />
                            <span>Processing & Syncing to Meta...</span>
                        </>
                    ) : (
                        <>
                            <RefreshCw size={14} />
                            <span>Sync to Meta WhatsApp Profile</span>
                        </>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ProfileMediaCdnModal
