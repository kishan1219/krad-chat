import React, { useState, useEffect, useRef } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Card,
    CardBody,
    Badge,
    Spinner,
    Input,
    Label,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from 'reactstrap'
import {
    Image,
    Smile,
    Download,
    Copy,
    Check,
    CheckCircle,
    AlertCircle,
    X,
    UploadCloud,
    Film,
    Star,
    RefreshCw
} from 'react-feather'
import { whatsappService } from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface WhatsAppStickerCreatorModalProps {
    isOpen: boolean
    toggle: () => void
}

export function WhatsAppStickerCreatorModal({ isOpen, toggle }: WhatsAppStickerCreatorModalProps) {
    const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('create')
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const [packName, setPackName] = useState('KRAD Stickers')
    const [author, setAuthor] = useState('Krad Technology')
    const [isAnimated, setIsAnimated] = useState(false)
    const [converting, setConverting] = useState(false)
    const [resultSticker, setResultSticker] = useState<any>(null)
    const [stickersList, setStickersList] = useState<any[]>([])
    const [loadingGallery, setLoadingGallery] = useState(false)
    const [copiedId, setCopiedId] = useState<string | number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchGallery = async () => {
        setLoadingGallery(true)
        try {
            const list = await whatsappService.getWhatsAppStickers()
            setStickersList(Array.isArray(list) ? list : [])
        } catch {
            // non-blocking
        } finally {
            setLoadingGallery(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            void fetchGallery()
        } else {
            setFile(null)
            setPreviewUrl('')
            setResultSticker(null)
        }
    }, [isOpen])

    const handleFileSelect = (selectedFile: File) => {
        if (!selectedFile) return
        if (selectedFile.size > 10 * 1024 * 1024) {
            ErrorToast('Image size exceeds 10 MB limit.')
            return
        }

        const isGifOrWebp = selectedFile.type === 'image/gif' || selectedFile.type === 'image/webp'
        if (isGifOrWebp && selectedFile.type === 'image/gif') {
            setIsAnimated(true)
        }

        setFile(selectedFile)
        setResultSticker(null)
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(selectedFile)
    }

    const handleConvert = async () => {
        if (!previewUrl) {
            ErrorToast('Please select or upload an image first.')
            return
        }

        setConverting(true)
        try {
            const res = await whatsappService.convertWhatsAppSticker({
                image_base64: previewUrl,
                filename: file?.name || 'sticker.png',
                pack_name: packName,
                author: author,
                is_animated: isAnimated
            })
            setResultSticker(res)
            SuccessToast(res.message || 'Sticker created and verified!')
            void fetchGallery()
        } catch (err: any) {
            ErrorToast(err?.message || 'Failed to convert sticker to WhatsApp format.')
        } finally {
            setConverting(false)
        }
    }

    const copyToClipboard = (text: string, id: string | number) => {
        if (navigator?.clipboard) {
            navigator.clipboard.writeText(text)
            setCopiedId(id)
            SuccessToast('Sticker CDN link copied to clipboard!')
            setTimeout(() => setCopiedId(null), 2500)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            className="modal-dialog-centered modal-lg"
            contentClassName="rounded-3 shadow-lg border-0 overflow-hidden"
        >
            <ModalHeader
                toggle={toggle}
                className="border-bottom py-2 px-3 bg-light"
                close={
                    <Button color="link" size="sm" className="p-0 text-muted" onClick={toggle}>
                        <X size={20} />
                    </Button>
                }
            >
                <div className="d-flex align-items-center gap-2">
                    <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: '32px', height: '32px', backgroundColor: '#e6f9ed', color: '#25D366' }}
                    >
                        <Smile size={18} />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                                WhatsApp Sticker Studio
                            </h5>
                            <Badge color="light-success" pill style={{ fontSize: '0.72rem' }}>
                                512×512 WebP Compliant
                            </Badge>
                        </div>
                        <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                            Convert images and animations into official Meta WhatsApp stickers with transparent backgrounds
                        </p>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="p-3" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <Nav tabs className="mb-3">
                    <NavItem>
                        <NavLink
                            className={`cursor-pointer ${activeTab === 'create' ? 'active fw-bold' : ''}`}
                            onClick={() => setActiveTab('create')}
                            style={{ fontSize: '0.86rem' }}
                        >
                            <Star size={14} className="me-1 text-warning" />
                            Sticker Creator & Exporter
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={`cursor-pointer ${activeTab === 'gallery' ? 'active fw-bold' : ''}`}
                            onClick={() => {
                                setActiveTab('gallery')
                                void fetchGallery()
                            }}
                            style={{ fontSize: '0.86rem' }}
                        >
                            <Smile size={14} className="me-1" />
                            Saved Stickers ({stickersList.length})
                        </NavLink>
                    </NavItem>
                </Nav>

                <TabContent activeTab={activeTab}>
                    {/* Tab 1: Creator */}
                    <TabPane tabId="create">
                        <div className="row g-3">
                            {/* Left Column: Upload & Parameters */}
                            <div className="col-12 col-md-6">
                                <Card className="border shadow-none mb-3" style={{ borderColor: '#e2e8f0' }}>
                                    <CardBody className="p-3">
                                        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                                            1. Select Image or Graphic
                                        </h6>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/gif"
                                            className="d-none"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0]
                                                if (f) handleFileSelect(f)
                                            }}
                                        />

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border border-2 border-dashed rounded-3 p-3 text-center cursor-pointer mb-3"
                                            style={{
                                                borderColor: previewUrl ? '#25D366' : '#cbd5e1',
                                                backgroundColor: previewUrl ? '#f0fdf4' : '#f8fafc',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <UploadCloud size={28} className={previewUrl ? 'text-success' : 'text-muted'} />
                                            <p className="fw-semibold text-dark mb-1 small mt-2">
                                                {file ? file.name : 'Click to upload graphic or animation'}
                                            </p>
                                            <p className="text-muted small mb-0" style={{ fontSize: '0.74rem' }}>
                                                PNG (recommended with transparency), WebP, GIF, or JPEG (Max 10 MB)
                                            </p>
                                        </div>

                                        <div className="row g-2 mb-2">
                                            <div className="col-6">
                                                <Label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.78rem' }}>
                                                    Sticker Pack Name
                                                </Label>
                                                <Input
                                                    bsSize="sm"
                                                    value={packName}
                                                    onChange={(e) => setPackName(e.target.value)}
                                                    placeholder="e.g. Sales Promos"
                                                    style={{ fontSize: '0.82rem' }}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <Label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.78rem' }}>
                                                    Author Attribution
                                                </Label>
                                                <Input
                                                    bsSize="sm"
                                                    value={author}
                                                    onChange={(e) => setAuthor(e.target.value)}
                                                    placeholder="e.g. Krad Technology"
                                                    style={{ fontSize: '0.82rem' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-check form-switch mb-3">
                                            <Input
                                                type="switch"
                                                id="stickerAnimatedSwitch"
                                                checked={isAnimated}
                                                onChange={(e) => setIsAnimated(e.target.checked)}
                                            />
                                            <Label className="form-check-label small text-dark fw-semibold" htmlFor="stickerAnimatedSwitch">
                                                Animated Sticker Mode (Max 500 KB)
                                            </Label>
                                        </div>

                                        <Button
                                            type="button"
                                            color="primary"
                                            size="sm"
                                            className="w-100 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                                            disabled={!previewUrl || converting}
                                            onClick={handleConvert}
                                            style={{
                                                backgroundColor: '#25D366',
                                                borderColor: '#25D366',
                                                fontWeight: 600,
                                                padding: '8px 12px'
                                            }}
                                        >
                                            {converting ? (
                                                <>
                                                    <Spinner size="sm" className="me-1" />
                                                    <span>Rendering 512×512 WebP Sticker...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Star size={15} />
                                                    <span>Export WhatsApp Sticker (512×512)</span>
                                                </>
                                            )}
                                        </Button>
                                    </CardBody>
                                </Card>

                                {/* Compliance Specification Card */}
                                <Card className="border shadow-none" style={{ borderColor: '#e2e8f0', backgroundColor: '#fbfcfd' }}>
                                    <CardBody className="p-3">
                                        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.82rem', textTransform: 'uppercase' }}>
                                            Meta WhatsApp Sticker Guidelines
                                        </h6>
                                        <ul className="list-unstyled mb-0 d-flex flex-column gap-1 small text-muted" style={{ fontSize: '0.78rem' }}>
                                            <li className="d-flex align-items-center gap-2">
                                                <CheckCircle size={14} className="text-success" />
                                                <span>Exact <strong>512 × 512 pixels</strong> square canvas</span>
                                            </li>
                                            <li className="d-flex align-items-center gap-2">
                                                <CheckCircle size={14} className="text-success" />
                                                <span>Format: <strong>WebP</strong> with alpha channel transparency</span>
                                            </li>
                                            <li className="d-flex align-items-center gap-2">
                                                <CheckCircle size={14} className="text-success" />
                                                <span>File size: <strong>&le; 100 KB</strong> (static) / <strong>&le; 500 KB</strong> (animated)</span>
                                            </li>
                                            <li className="d-flex align-items-center gap-2">
                                                <CheckCircle size={14} className="text-success" />
                                                <span>Safe padding: <strong>16-pixel transparent margin</strong> auto-applied</span>
                                            </li>
                                        </ul>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Right Column: Previews & Results */}
                            <div className="col-12 col-md-6">
                                <Card className="border shadow-none mb-3" style={{ borderColor: '#e2e8f0' }}>
                                    <CardBody className="p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.88rem' }}>
                                                2. Live WhatsApp Chat Simulation
                                            </h6>
                                            <Badge color="light-primary" pill style={{ fontSize: '0.72rem' }}>
                                                Canvas: 512×512
                                            </Badge>
                                        </div>

                                        {/* WhatsApp Chat Simulation Container */}
                                        <div
                                            className="rounded-3 p-3 position-relative overflow-hidden mb-3"
                                            style={{
                                                backgroundColor: '#efeae2',
                                                backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)',
                                                backgroundSize: '16px 16px',
                                                minHeight: '220px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'flex-end'
                                            }}
                                        >
                                            {/* Chat Bubble containing Sticker */}
                                            <div
                                                className="p-1 rounded-3 position-relative"
                                                style={{
                                                    maxWidth: '180px',
                                                    backgroundColor: 'transparent'
                                                }}
                                            >
                                                {previewUrl || resultSticker ? (
                                                    <div
                                                        className="position-relative rounded-2 overflow-hidden"
                                                        style={{
                                                            width: '160px',
                                                            height: '160px',
                                                            backgroundImage:
                                                                'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 50% / 12px 12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                                                        }}
                                                    >
                                                        <img
                                                            src={resultSticker?.cdn_url || previewUrl}
                                                            alt="Sticker Preview"
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '100%',
                                                                objectFit: 'contain'
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="d-flex flex-column align-items-center justify-content-center text-muted p-4"
                                                        style={{ width: '160px', height: '160px' }}
                                                    >
                                                        <Smile size={36} className="text-muted opacity-50 mb-1" />
                                                        <span className="small text-center opacity-75" style={{ fontSize: '0.72rem' }}>
                                                            Select image to preview sticker
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Chat Timestamp */}
                                                <div className="d-flex align-items-center justify-content-end gap-1 mt-1 text-muted" style={{ fontSize: '0.68rem' }}>
                                                    <span>12:45 PM</span>
                                                    <span style={{ color: '#53bdeb' }}>✓✓</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Result Details if Converted */}
                                        {resultSticker && (
                                            <div className="p-3 rounded-2 border bg-white" style={{ borderColor: '#bbf7d0' }}>
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <CheckCircle size={18} className="text-success" />
                                                    <span className="fw-bold text-dark small" style={{ fontSize: '0.85rem' }}>
                                                        Sticker Ready & Compliant
                                                    </span>
                                                </div>

                                                <div className="d-flex justify-content-between small text-muted mb-2" style={{ fontSize: '0.78rem' }}>
                                                    <span>Dimensions: <strong>512 × 512 px</strong></span>
                                                    <span>Format: <strong>WebP</strong></span>
                                                    <span>Size: <strong>{(resultSticker.size_bytes / 1024).toFixed(1)} KB</strong></span>
                                                </div>

                                                <div className="d-flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        color="outline-secondary"
                                                        className="w-50 d-flex align-items-center justify-content-center gap-1"
                                                        onClick={() => copyToClipboard(resultSticker.cdn_url, 'result')}
                                                        style={{ fontSize: '0.78rem' }}
                                                    >
                                                        {copiedId === 'result' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                                                        <span>{copiedId === 'result' ? 'Copied' : 'Copy CDN URL'}</span>
                                                    </Button>
                                                    <a
                                                        href={resultSticker.cdn_url}
                                                        download={resultSticker.name || 'whatsapp_sticker.webp'}
                                                        className="btn btn-sm btn-outline-success w-50 d-flex align-items-center justify-content-center gap-1"
                                                        style={{ fontSize: '0.78rem' }}
                                                    >
                                                        <Download size={13} />
                                                        <span>Download WebP</span>
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </TabPane>

                    {/* Tab 2: Gallery */}
                    <TabPane tabId="gallery">
                        {loadingGallery ? (
                            <div className="text-center py-5">
                                <Spinner size="sm" color="primary" />
                                <p className="text-muted small mt-2">Loading sticker collection...</p>
                            </div>
                        ) : stickersList.length === 0 ? (
                            <div className="text-center py-5 border rounded-3 bg-light">
                                <Smile size={40} className="text-muted mb-2 opacity-50" />
                                <h6 className="fw-semibold text-dark">No Stickers Generated Yet</h6>
                                <p className="text-muted small mb-3">Upload your brand logo or graphics to create 512×512 WebP stickers.</p>
                                <Button size="sm" color="primary" onClick={() => setActiveTab('create')}>
                                    Create First Sticker
                                </Button>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {stickersList.map((stk) => (
                                    <div key={stk.id} className="col-6 col-md-4 col-lg-3">
                                        <Card className="border h-100 shadow-none" style={{ borderColor: '#e2e8f0' }}>
                                            <div
                                                className="p-3 text-center rounded-top"
                                                style={{
                                                    backgroundImage:
                                                        'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 50% / 10px 10px',
                                                    height: '140px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <img
                                                    src={stk.cdn_url}
                                                    alt={stk.name}
                                                    style={{ maxWidth: '100%', maxHeight: '110px', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <CardBody className="p-2">
                                                <p className="fw-bold text-dark text-truncate small mb-0" style={{ fontSize: '0.8rem' }} title={stk.name}>
                                                    {stk.name}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center text-muted small mb-2" style={{ fontSize: '0.72rem' }}>
                                                    <span>512×512 WebP</span>
                                                    <span>{stk.size_bytes ? `${(stk.size_bytes / 1024).toFixed(0)} KB` : ''}</span>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        color="light"
                                                        className="p-1 flex-fill border d-flex align-items-center justify-content-center"
                                                        onClick={() => copyToClipboard(stk.cdn_url, stk.id)}
                                                        title="Copy CDN URL"
                                                    >
                                                        {copiedId === stk.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                                                    </Button>
                                                    <a
                                                        href={stk.cdn_url}
                                                        download={stk.name || 'sticker.webp'}
                                                        className="btn btn-sm btn-light p-1 flex-fill border d-flex align-items-center justify-content-center text-dark"
                                                        title="Download Sticker"
                                                    >
                                                        <Download size={13} />
                                                    </a>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabPane>
                </TabContent>
            </ModalBody>

            <ModalFooter className="border-top py-2 px-3 bg-light d-flex justify-content-between align-items-center">
                <Button color="secondary" size="sm" onClick={toggle} outline>
                    Close
                </Button>
                <div className="d-flex align-items-center gap-2">
                    <Button
                        color="light"
                        size="sm"
                        className="d-flex align-items-center gap-1 border"
                        onClick={fetchGallery}
                        disabled={loadingGallery}
                    >
                        <RefreshCw size={13} className={loadingGallery ? 'spin' : ''} />
                        <span>Refresh Collection</span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default WhatsAppStickerCreatorModal