// src/components/DataTable.jsx
import React from 'react'

export default function DataTable({ columns, data, onRowClick, emptyMessage = "Nenhum dado encontrado" }) {
  if (!data || data.length === 0) {
    return <div className="card">{emptyMessage}</div>
  }

  return (
    <div className="card">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              {columns.map((column, index) => (
                <th 
                  key={column.key || index} 
                  style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #ddd',
                    fontWeight: 'bold'
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr 
                key={row.idAgendamento || row.id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                style={{ 
                  cursor: onRowClick ? 'pointer' : 'default',
                  backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9',
                  borderBottom: '1px solid #eee'
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.backgroundColor = '#f0f8ff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fff' : '#f9f9f9'
                  }
                }}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={`${row.idAgendamento || row.id || rowIndex}-${column.key}`} 
                    style={{ padding: '12px' }}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}