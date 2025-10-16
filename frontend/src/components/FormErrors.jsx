import React from 'react';

// Componente para mostrar erro individual de campo
export const FieldError = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`field-error ${className}`} style={{
      color: '#dc2626',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    }}>
      <span style={{ fontSize: '1rem' }}>⚠️</span>
      {error.message}
    </div>
  );
};

// Componente para mostrar lista de erros gerais do servidor
export const ServerErrors = ({ errors, className = '' }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className={`server-errors ${className}`} style={{
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      marginBottom: '1rem'
    }}>
      <strong>Erros encontrados:</strong>
      <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

// Componente para mostrar resumo de erros de validação
export const ValidationErrorsSummary = ({ errors, className = '' }) => {
  const fieldErrors = Object.values(errors).filter(error => error);
  
  if (fieldErrors.length === 0) return null;

  return (
    <div className={`validation-errors ${className}`} style={{
      backgroundColor: '#fffbeb',
      border: '1px solid #fed7aa',
      color: '#92400e',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      marginBottom: '1rem'
    }}>
      <strong>Por favor, corrija os seguintes erros:</strong>
      <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
        {fieldErrors.map((error, index) => (
          <li key={index}>{error.message}</li>
        ))}
      </ul>
    </div>
  );
};

// Componente combinado para mostrar todos os tipos de erro
export const FormErrors = ({ errors, serverErrors, showValidationSummary = true }) => {
  return (
    <>
      <ServerErrors errors={serverErrors} />
      {showValidationSummary && <ValidationErrorsSummary errors={errors} />}
    </>
  );
};

