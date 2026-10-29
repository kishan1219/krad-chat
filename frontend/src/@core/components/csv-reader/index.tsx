// @ts-nocheck
import Papa from 'papaparse'

const CsvReader = ({ cssInputClass, inputRef, onFileLoaded, parserOptions = {}, ...rest }) => {
  const handleChange = event => {
    const [file] = event.target.files || []

    if (!file || typeof onFileLoaded !== 'function') {
      return
    }

    Papa.parse(file, {
      ...parserOptions,
      complete: results => {
        onFileLoaded(results.data, file)
      },
      error: error => {
        if (parserOptions?.error) {
          parserOptions.error(error, file)
        }
      }
    })
  }

  return <input {...rest} ref={inputRef} type='file' accept='.csv,text/csv' className={cssInputClass} onChange={handleChange} />
}

export default CsvReader
