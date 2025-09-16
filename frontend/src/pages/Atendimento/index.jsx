import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormField from "../../components/FormField";
import { getAtendimento, saveAtendimento, updateAtendimento } from "../../services/atendimento";
import { atendimentoSchema } from "../../validations/atendimentoSchema";

export default function AtendimentoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(atendimentoSchema),
    defaultValues: {
      tipoAten: "",
      justAten: "",
      codiAten: "",
    },
  });

  // Watch para converter codiAten para maiúsculas em tempo real
  const codiAtenValue = watch("codiAten");
  useEffect(() => {
    if (codiAtenValue && codiAtenValue !== codiAtenValue.toUpperCase()) {
      setValue("codiAten", codiAtenValue.toUpperCase());
    }
  }, [codiAtenValue, setValue]);

  // Carrega dados para edição
  useEffect(() => {
    if (id) {
      setLoading(true);
      getAtendimento(id)
        .then((data) => {
          if (data.success) {
            reset(data.data);
          } else {
            alert("Erro ao carregar dados do atendimento");
          }
        })
        .catch((e) => {
          console.error("Erro ao buscar atendimento:", e);
          alert("Erro ao carregar dados do atendimento");
        })
        .finally(() => setLoading(false));
    }
  }, [id, reset]);
  
  async function onSubmit(formData) {
    setLoading(true);
    setServerErrors({});
    
    try {
      // O schema já converteu para o formato correto
      const payload = {
        tipoAten: formData.tipoAten,
        codiAten: formData.codiAten,
        justAten: formData.justAten || null
      };
      
      console.log("Enviando para API:", payload);
      
      let response;
      if (id) {
        response = await updateAtendimento(id, payload);
      } else {
        response = await saveAtendimento(payload);
      }
      
      if (response.success) {
        navigate("/atendimentos");
      } else {
        alert(response.message || "Erro ao salvar atendimento");
      }
      
    } catch (error) {
      console.error("Erro completo:", error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Se for erro de validação do Marshmallow
        if (errorData.errors) {
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            setError(field, {
              type: "server",
              message: Array.isArray(messages) ? messages.join(", ") : messages
            });
          });
        } 
        // Se for erro de código duplicado
        else if (errorData.message && errorData.message.includes("já existe")) {
          setError("codiAten", {
            type: "server",
            message: errorData.message
          });
        }
        // Outros erros do servidor
        else if (errorData.message) {
          setServerErrors({ general: errorData.message });
        }
      } else {
        setServerErrors({ general: "Erro de conexão com o servidor" });
      }
    } finally {
      setLoading(false);
    }
  }

  // Componente personalizado para mostrar erros
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    
    return (
      <div style={{ 
        color: '#e74c3c', 
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

  // Estilo para campos com erro
  const getInputStyle = (fieldName) => {
    return errors[fieldName] ? {
      borderColor: '#e74c3c',
      backgroundColor: '#fdf2f2'
    } : {};
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>{id ? "Editar" : "Novo"} Atendimento</h2>
          
          {serverErrors.general && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              marginTop: '1rem',
              fontSize: '0.875rem'
            }}>
              {serverErrors.general}
            </div>
          )}
          
          {Object.keys(errors).length > 0 && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              marginTop: '1rem',
              fontSize: '0.875rem'
            }}>
              <strong>Por favor, corrija os seguintes erros:</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <button 
            type="button" 
            className="button secondary" 
            onClick={() => navigate(-1)}
            style={{ marginRight: '0.5rem' }}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="button primary" 
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Coluna 1: Dados do Atendimento */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Dados do Atendimento
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FormField label="Código do Atendimento *" error={errors.codiAten}>
              <input 
                className="input" 
                {...register("codiAten")} 
                placeholder="Ex: AT1234"
                style={getInputStyle('codiAten')}
                onInput={(e) => {
                  // Converte para maiúsculas enquanto digita
                  e.target.value = e.target.value.toUpperCase();
                }}
              />
              <ErrorMessage error={errors.codiAten} />
            </FormField>

            <FormField label="Tipo de Atendimento *" error={errors.tipoAten}>
              <select 
                className="input" 
                {...register("tipoAten")}
                style={getInputStyle('tipoAten')}
              >
                <option value="">Selecione o tipo</option>
                <option value="CON">Consulta (CON)</option>
                <option value="URG">Urgência (URG)</option>
                <option value="RET">Retorno (RET)</option>
                <option value="EME">Emergência (EME)</option>
                <option value="OUT">Outro (OUT)</option>
              </select>
              <ErrorMessage error={errors.tipoAten} />
            </FormField>
          </div>
        </div>

        {/* Coluna 2: Justificativa */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Justificativa
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FormField label="Justificativa do Atendimento" error={errors.justAten}>
              <textarea 
                className="input" 
                {...register("justAten")} 
                rows={5}
                placeholder="Descreva a justificativa do atendimento (máximo 255 caracteres)"
                style={getInputStyle('justAten')}
                maxLength={255}
              />
              <ErrorMessage error={errors.justAten} />
            </FormField>
          </div>
        </div>
      </div>
    </form>
  );
}