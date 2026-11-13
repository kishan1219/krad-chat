import React from 'react'
import { Plus, Sliders, RefreshCw, Search } from 'react-feather'
import { Button, Input } from 'reactstrap'

interface ConnectionsHeaderProps {
    search: string
    onSearchChange: (value: string) => void
    onOpenAddModal: () => void
    showManual: boolean
    onToggleManual: () => void
    onRefresh: () => void
    refreshing: boolean
}

export function ConnectionsHeader({
    search,
    onSearchChange,
    onOpenAddModal,
    showManual,
    onToggleManual,
    onRefresh,
    refreshing
}: ConnectionsHeaderProps) {
    return (
        <div className="mb-2">
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-1 mb-1">
                <div>
                    <h2
                        className="fw-bolder mb-25"
                        style={{ color: '#ff8c21', fontSize: '1.65rem', letterSpacing: '-0.3px' }}
                    >
                        Whatsapp Configuration
                    </h2>
                    <p className="text-muted small mb-0">
                        Manage your connected phone numbers, Meta Embedded Signups, and messaging limit tiers.
                    </p>
                </div>

                <div className="d-flex align-items-center gap-1">
                    <Button
                        type="button"
                        onClick={onOpenAddModal}
                        style={{
                            backgroundColor: '#ff8c21',
                            borderColor: '#ff8c21',
                            color: '#ffffff',
                            fontWeight: 600,
                            borderRadius: '6px',
                            padding: '0.55rem 1.25rem',
                            fontSize: '0.88rem'
                        }}
                        className="d-inline-flex align-items-center gap-50 shadow-sm"
                    >
                        <Plus size={15} />
                        <span>Add Whatsapp</span>
                    </Button>

                    <Button
                        type="button"
                        onClick={onToggleManual}
                        title="Toggle Manual Credentials Form"
                        style={{
                            backgroundColor: showManual ? '#283046' : '#5e5873',
                            borderColor: showManual ? '#283046' : '#5e5873',
                            color: '#ffffff',
                            borderRadius: '6px',
                            padding: '0.55rem 0.75rem'
                        }}
                    >
                        <Sliders size={15} />
                    </Button>

                    <Button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        title="Refresh Connections"
                        style={{
                            backgroundColor: '#4b465c',
                            borderColor: '#4b465c',
                            color: '#ffffff',
                            borderRadius: '6px',
                            padding: '0.55rem 0.75rem'
                        }}
                    >
                        <RefreshCw size={15} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Search Bar matching user screenshot */}
            <div className="d-flex justify-content-end mt-1">
                <div className="input-group" style={{ maxWidth: '320px' }}>
                    <Input
                        type="text"
                        bsSize="sm"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search..."
                        style={{
                            borderRadius: '6px 0 0 6px',
                            border: '1px solid #d8d6de',
                            fontSize: '0.88rem',
                            paddingLeft: '0.85rem'
                        }}
                    />
                    <Button
                        style={{
                            backgroundColor: '#ff8c21',
                            borderColor: '#ff8c21',
                            color: '#fff',
                            borderRadius: '0 6px 6px 0'
                        }}
                        size="sm"
                    >
                        <Search size={14} />
                    </Button>
                </div>
            </div>
        </div>
    )
}
