import { Button, Input } from 'reactstrap'

export default function KeyValueFields({ value, onChange, label, limit = 30 }: { value: [string, string][]; onChange: (value: [string, string][]) => void; label: string; limit?: number }) {
    return <div>{value.map(([name, content], index) => <div key={index} className='d-flex gap-1 mb-1'>
        <Input aria-label={`${label} ${index + 1} name`} placeholder='Name' value={name} onChange={e => onChange(value.map((pair, i) => (i === index ? [e.target.value, content] : pair)))} />
        <Input aria-label={`${label} ${index + 1} value`} placeholder='Value' value={content} onChange={e => onChange(value.map((pair, i) => (i === index ? [name, e.target.value] : pair)))} />
        <Button outline size='sm' aria-label={`Remove ${label} ${index + 1}`} onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove</Button>
    </div>)}<Button outline size='sm' disabled={value.length >= limit} onClick={() => onChange([...value, ['', '']])}>Add {label}</Button></div>
}
