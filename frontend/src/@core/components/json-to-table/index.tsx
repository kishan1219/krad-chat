// @ts-nocheck
const renderValue = value => {
  if (Array.isArray(value)) {
    return value.length ? value.map((item, index) => <div key={index}>{renderValue(item)}</div>) : '[]'
  }

  if (value && typeof value === 'object') {
    return <JsonToTable json={value} />
  }

  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return String(value)
}

export const JsonToTable = ({ json }) => {
  if (!json || typeof json !== 'object') {
    return <span>{renderValue(json)}</span>
  }

  const entries = Array.isArray(json) ? json.map((value, index) => [index, value]) : Object.entries(json)

  return (
    <table className='table table-sm mb-0'>
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <th className='text-nowrap'>{key}</th>
            <td>{renderValue(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default JsonToTable
