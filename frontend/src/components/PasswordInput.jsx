import React, { useState } from 'react';

export default function PasswordInputSimple({
  value,
  onChange,
  placeholder = "Senha",
  required = false,
  disabled = false,
  className = "",
  id = "password",
  name = "password",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`password-input ${className}`}
        style={{
          width: '100%',
          padding: '12px 100px 12px 12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '16px',
          boxSizing: 'border-box'
        }}
        {...props}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: '1px solid #ddd',
          cursor: 'pointer',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666',
          backgroundColor: '#f9f9f9'
        }}
        tabIndex={-1}
      >
        {showPassword ? 'Ocultar' : 'Mostrar'}
      </button>

      <style jsx>{`
        .password-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        .password-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
        
        button:hover {
          background-color: #f0f0f0;
        }
        
        button:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
      `}</style>
    </div>
  );
}