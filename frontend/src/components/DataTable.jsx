import React from 'react'

export default function DataTable({ columns = [], data = [], onRowClick }){
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id} style={{cursor: onRowClick ? 'pointer':'default'}} onClick={() => onRowClick?.(row)}>
              {columns.map(c => (
                <td key={c.key}>
                  {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
