// @ts-nocheck
import classNames from 'classnames'
import React, { useState } from 'react'
import { MoreVertical } from 'react-feather'
import { Link } from 'react-router-dom'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown, UncontrolledTooltip } from 'reactstrap'
import { IconSizes } from '../../../utility/Const'
import { FM, isValid } from '../../../utility/helpers/common'
import Hide from '../../../utility/Hide'
import Show from '../../../utility/Show'
import { getUniqId } from '../../../utility/Utils'
// import FollowUpModal from '../../masters/followups/fragments/followUpModal'

const DropDownMenu = ({ direction = "start", button = null, tag = "span", component = null, options = [], tooltip = null }) => {
    const [id, setId] = useState(getUniqId("dropdown"))
    return (
        <>
            {tooltip ? <UncontrolledTooltip target={id}>
                {tooltip}
            </UncontrolledTooltip> : null}
            <UncontrolledButtonDropdown direction={direction}>
                {button}
                {
                    button ? <DropdownToggle className='dropdown-toggle-split' id={id} outline color='primary' caret /> : <DropdownToggle
                        className={classNames('cursor-pointer')}
                        id={id}
                        tag={tag}>
                        {component ?? <MoreVertical size={IconSizes.MenuVertical} />}
                    </DropdownToggle>}
                <DropdownMenu container={'body'}>
                    {
                        options?.map((o, i) => {
                            const IF = (o?.IF === undefined || o?.IF === null) ? true : o?.IF

                            if (o?.to) {
                                return (
                                    <>
                                        <Show IF={IF}>
                                            <Link className='dropdown-item' to={o?.to} key={o?.name} onClick={o?.onClick}>
                                                {o?.icon ? <><span className='me-1'>{o?.icon}</span>{o?.name}</> : o?.name}
                                            </Link>
                                        </Show>
                                    </>
                                )
                            } else {
                                return (
                                    <>
                                        <Show IF={IF}>
                                            {
                                                o?.noWrap ? o?.name : <span role={"button"} className='dropdown-item' key={o?.name} onClick={o?.onClick}>
                                                    {o?.icon ? <><span className='me-1'>{o?.icon}</span>{o?.name}</> : o?.name}
                                                </span>
                                            }
                                        </Show>
                                    </>
                                )
                            }
                        })
                    }
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        </>
    )
}

export default DropDownMenu
