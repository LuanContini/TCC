import React from 'react'
export default function FormField({ label, children }){
  return (
    <label style={{display:'block', marginBottom:12}}>
      <div style={{fontSize:12, marginBottom:6, color:'#374151'}}>{label}</div>
      {children}
    </label>
  )
}
