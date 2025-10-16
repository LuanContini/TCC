// src/components/EnhancedFormField.js 
import React from 'react';
import { FieldError } from './FormErrors';
import { getFieldStyle } from '../utils/formStyles';

export const EnhancedFormField = ({ 
  label, 
  error, 
  children, 
  required = false,
  htmlFor,
  className = '',
  style = {},
  helpText 
}) => {
  // Função para encontrar o elemento de campo principal
  const getFieldElement = (children) => {
    if (React.isValidElement(children)) {
      return children;
    }
    
    if (Array.isArray(children)) {
      // Encontrar o primeiro elemento válido (input, select, etc.)
      const fieldElement = children.find(child => 
        React.isValidElement(child) && 
        (child.type === 'input' || child.type === 'select' || child.type === 'textarea' ||
         typeof child.type === 'function') 
      );
      return fieldElement || children[0];
    }
    
    return null;
  };

  const fieldElement = getFieldElement(children);
  const additionalElements = Array.isArray(children) ? children.slice(1) : [];

  if (!fieldElement || !React.isValidElement(fieldElement)) {
    console.warn(`EnhancedFormField: não foi possível encontrar um elemento de campo válido para "${label}"`);
    
    return (
      <div className={`form-field ${className}`} style={{ marginBottom: '1.5rem', ...style }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: '500',
          color: '#374151',
          fontSize: '0.875rem'
        }}>
          {label}
          {required && <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>}
        </label>
        
        <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>
          Erro: Campo não renderizado corretamente
        </div>
        
        <FieldError error={error} />
      </div>
    );
  }

  return (
    <div className={`form-field ${className}`} style={{ marginBottom: '1.5rem', ...style }}>
      <label htmlFor={htmlFor} style={{ 
        display: 'block', 
        marginBottom: '0.5rem', 
        fontWeight: '500',
        color: '#374151',
        fontSize: '0.875rem'
      }}>
        {label}
        {required && <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>}
      </label>
      
      {/* Campo principal */}
      {React.cloneElement(fieldElement, {
        style: {
          ...(fieldElement.props?.style || {}),
          ...getFieldStyle(!!error)
        }
      })}
      
      {/* Texto de ajuda */}
      {helpText && (
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280', 
          marginTop: '0.25rem',
          fontStyle: 'italic'
        }}>
          {helpText}
        </div>
      )}
      
      {/* Elementos adicionais */}
      {additionalElements.map((element, index) => (
        React.isValidElement(element) 
          ? React.cloneElement(element, { key: index })
          : <div key={index}>{element}</div>
      ))}
      
      <FieldError error={error} />
    </div>
  );
};