// @ts-nocheck
// ** React Imports
import { useState, Fragment, useEffect } from 'react'

// ** Reactstrap Imports
import { Card, CardHeader, CardTitle, CardBody, Button, ListGroup, ListGroupItem, Progress, ButtonGroup, Input, Col, Row } from 'reactstrap'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Imports
import { toast } from 'react-toastify'
import { useDropzone } from 'react-dropzone'
import { X, DownloadCloud, FileText, Check, Eye, File } from 'react-feather'
import { createAsyncSelectOptions, createConstSelectOptions, ErrorToast, getFIleBinaries, humanFileSize } from '../../../../utility/Utils'
// ** Styles
import '@styles/react/libs/file-uploader/file-uploader.scss'
import { FM, isValid, log } from '../../../../utility/helpers/common'
import Show from '../../../../utility/Show'
import Hide from '../../../../utility/Hide'
import { uploadFiles } from '../../../../utility/apis/commons'
import BsTooltip from '../../tooltip'
import FormGroupCustom from '../../formGroupCustom'
import { useForm } from 'react-hook-form'
import { roleTypes, UserTypes } from '../../../../utility/Const'
import { loadComp } from '../../../../utility/apis/companyApis'
import { uploadFile } from '../../../../redux/reducers/fileupload'
import { useDispatch } from 'react-redux'

const DropZoneAdmin = ({ value = null, onSuccess = () => { }, multiple = false, accept = null, maxSize = 26214400, minSize = 0, maxFiles = 1, handleClose, setReload = () => { } }) => {
    // ** State
    const [files, setFiles] = useState([])
    const dispatch = useDispatch()
    const [controller, setController] = useState(new AbortController())
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(false)
    const [uploaded, setUploaded] = useState([])
    const [oldFiles, setOldFIles] = useState([])
    const [comp, setComp] = useState([])
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch } = form

    useEffect(() => {
        onSuccess(uploaded)
    }, [uploaded])

    const loadCompOptions = async (search, loadedOptions, { page }) => {
        const res = await loadComp({
            async: true,
            page,
            perPage: 100,
            jsonData: { name: search }
        })
        return createAsyncSelectOptions(res, page, "name", "id", setComp)
    }

    useEffect(() => {

        if (isValid(value)) {
            if (multiple && maxFiles > 1) {
                setOldFIles([
                    ...value?.map((a) => {
                        return {
                            url: a?.url,
                            name: "",
                            size: '',
                            ext: ""
                        }
                    })
                ])
            } else {
                setOldFIles([
                    {
                        url: value,
                        name: "",
                        size: '',
                        ext: ""
                    }
                ])
            }
        }
    }, [value])

    const { getRootProps, getInputProps } = useDropzone({
        multiple,
        accept,
        maxSize,
        minSize,
        maxFiles,
        onDrop: (acceptedFiles, rejectedFiles) => {
            if (rejectedFiles.length) {
                ErrorToast("invalid-file-selected")
            } else {
                setFiles([...files, ...acceptedFiles.map(file => Object.assign(file))])
            }
        }
    })

    const handleRemoveFile = file => {
        const uploadedFiles = files
        const filtered = uploadedFiles.filter(i => i.name !== file.name)
        setFiles([...filtered])

        if (maxFiles === 1) {
            setUploaded([])
        } else {
            const uF = uploaded
            const f = uF.filter(i => i.uploading_file_name !== file.name)
            setUploaded([...f])
        }
    }

    const renderFileSize = size => {
        return humanFileSize(size)
    }

    const renderFilePreview = file => {
        if (file.type.startsWith('image')) {
            return <img className='rounded' alt={file.name} src={URL.createObjectURL(file)} height='28' width='28' />
        } else {
            return <FileText size='28' />
        }
    }
    function checkURL(url) {
        return (String(url).match(/\.(jpeg|jpg|gif|png)$/) !== null)
    }

    const renderOldFilePreview = file => {
        if (checkURL(file?.url)) {
            return <img className='rounded' alt={file.name} src={file?.url} height='28' width='28' />
        } else {
            return <FileText url={file?.url} size='28' />
        }
    }
    function baseName(str) {
        let base = new String(str)?.substring(str?.lastIndexOf('/') + 1)
        if (base?.lastIndexOf(".") !== -1) base = base?.substring(0, base?.lastIndexOf("."))
        return base
    }
    const fileList = files?.map((file, index) => (
        <ListGroupItem key={`${file.name}-${index}`} className='d-flex align-items-center justify-content-between'>
            <div className='file-details d-flex align-items-center'>
                <div className='file-preview me-1'>{renderFilePreview(file)}</div>
                <div>
                    <p className='file-name mb-0'>{file.name}</p>
                    <p className='file-size mb-0'>{renderFileSize(file.size)}</p>
                </div>
            </div>
            <div>
                <Button color='danger' outline size='sm' className='btn-icon' onClick={() => handleRemoveFile(file)}>
                    <X size={14} />
                </Button>
            </div>
        </ListGroupItem>
    ))
    const uploadedFiles = uploaded?.map((file, index) => (
        <ListGroupItem key={`${file.name}-${index}`} className='d-flex align-items-center justify-content-between'>
            <div className='file-details d-flex align-items-center'>
                <div className='file-preview me-1'>{renderOldFilePreview(file?.file_name)}</div>
                <div>
                    <p className='file-name mb-0'>{(file?.uploading_file_name)}</p>
                    <p className='file-size mb-0'>{(file.file_extension)}</p>

                </div>
            </div>
            <div>
                <Button color='flat-success' size='sm' className='btn-icon'>
                    <Check size={14} />
                </Button>
                <BsTooltip Tag={Button} title={FM("view")} color='primary' outline size='sm' className='btn-icon' onClick={() => {
                    window.open(file?.file_name, '_blank')
                }}>
                    <Eye size={14} />
                </BsTooltip>
            </div>
        </ListGroupItem>
    ))

    const renderOldList = oldFiles?.map((file, index) => (
        <ListGroupItem key={`${file.name}-${index}`} className='d-flex align-items-center justify-content-between'>
            <div className='file-details d-flex align-items-center'>
                <div className='file-preview me-1'>{renderOldFilePreview(file)}</div>
                <div>
                    <p className='file-name mb-0'>{baseName(file?.url)}</p>

                </div>
            </div>
            <div>
                <Button color='flat-success' size='sm' className='btn-icon'>
                    <Check size={14} />
                </Button>
                <BsTooltip Tag={Button} title={FM("view")} color='primary' outline size='sm' className='btn-icon' onClick={() => {
                    window.open(file?.url, '_blank')
                }}>
                    <Eye size={14} />
                </BsTooltip>
            </div>
        </ListGroupItem>
    ))

    const handleRemoveAllFiles = () => {
        setFiles([])
        setUploaded(null)
    }

    const handleCancel = () => {
        controller?.abort()
        setController(new AbortController())
        setProgress(0)
    }

    const handleUpload = () => {
        // log(files)
        uploadFiles({
            success: (d) => {
                setReload(true)
                setProgress(0)
                if (multiple) {
                    setUploaded([
                        ...uploaded,
                        ...d?.payload
                    ])
                } else {
                    setUploaded([d?.payload])
                }
                // dispatch(uploadFile([d?.payload]))
                setFiles([])
                handleClose()

            },
            loading: setLoading,
            progress: setProgress,
            controller,
            formData: maxFiles === 0 || maxFiles > 1 ? { is_multiple: 1, ...getFIleBinaries(files) } : {
                is_multiple: 0, file: files[0], title: watch('title'), store_in_db: 1, company_ids: watch('company_ids'), all_company: watch('all_company') ? 'yes' : 'no'
            }
        })
    }

    const handleReplace = () => {
        setOldFIles([])
    }

    return (
        <>

            <Hide IF={maxFiles === files?.length || maxFiles === uploaded?.length || maxFiles === (files?.length + uploaded?.length) || maxFiles === 0 || oldFiles?.length > 0}>
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    <div className='d-flex align-items-center justify-content-center flex-column'>
                        <DownloadCloud size={34} />
                        <h5>{FM("upload")}</h5>
                        <p className='text-secondary text-center text-size-12 mb-0 ps-2 pe-2'>
                            {FM("drop-files-here-or-click")}{' '}
                            <a href='/' onClick={e => e.preventDefault()}>
                                {FM("browse")}
                            </a>{' '}
                            {FM("through-your-machine")}
                        </p>
                        <p className='text-size-12 mb-0 text-dark fw-bold'>{FM("max-upload-size", { size: renderFileSize(maxSize) })}</p>
                    </div>
                </div>
            </Hide>

            {files?.length || uploaded?.length ? (
                <Fragment>
                    <ListGroup className={maxFiles === files?.length || maxFiles === 0 ? '' : 'my-2'}>
                        {uploadedFiles}
                        {fileList}
                    </ListGroup>
                    <Show IF={maxFiles === (files?.length + uploaded?.length) && maxFiles > 1}>
                        <div className='limit-reached text-danger text-size-12'>
                            {FM("max-upload-limit-reached")}
                        </div>
                    </Show>
                    <Show IF={loading}>
                        <Progress animated striped className='progress-bar-success my-1' value={progress} />
                    </Show>
                    <Row className='mt-2'>
                        <Col md="4">
                            <FormGroupCustom
                                noLabel
                                placeholder={FM("file-title")}
                                name={"title"}
                                type={"text"}
                                errors={errors}
                                className="mb-2"
                                control={control}
                                rules={{ required: true }} />
                        </Col>
                        <Col md="3">
                            <FormGroupCustom
                                label={"All Company"}
                                name={"all_company"}
                                type={"checkbox"}
                                errors={errors}
                                className="mb-3"
                                control={control}
                                rules={{ required: false }} />
                        </Col>
                        <Hide IF={watch('all_company') === 1}>
                            <Col md="5">
                                <FormGroupCustom
                                    key={watch("all_company")}
                                    noLabel
                                    isMulti
                                    async
                                    placeholder={FM("company")}
                                    type={"select"}
                                    errors={errors}
                                    className="mb-2"
                                    control={control}
                                    options={comp}
                                    loadOptions={loadCompOptions}
                                    name={"company_ids"}
                                />
                            </Col>
                        </Hide>
                    </Row>
                    <div className='d-flex justify-content-end mt-2'>
                        <Hide IF={loading || maxFiles === 1}>
                            <Button className='me-1' color='danger' outline onClick={handleRemoveAllFiles}>
                                {FM("remove-all")}
                            </Button>
                        </Hide>
                        <Show IF={loading}>
                            <Button className='me-1' color='danger' outline onClick={handleCancel}>
                                {FM("cancel")}
                            </Button>
                        </Show>
                        <Hide IF={loading || (files?.length <= 0)}>
                            <Button onClick={handleUpload} color='primary'>{FM("upload")}</Button>
                        </Hide>
                    </div>
                </Fragment>
            ) : null
            }
            {oldFiles?.length ? (
                <Fragment>
                    <ListGroup className={'my-2'}>{renderOldList}</ListGroup>

                    <div className='d-flex justify-content-end mt-2'>

                        <Button className='me-1' color='danger' outline onClick={handleReplace}>
                            {FM("replace")}
                        </Button>
                    </div>
                </Fragment>
            ) : null
            }
        </>
    )
}

export default DropZoneAdmin
