import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormField from "../../components/FormField";
import { getAgendamento, saveAgendamento, updateAgendamento } from "../../services/agendamentos";
import { listProfissionais } from "../../services/profissionais";
import { listPacientes } from "../../services/pacientes";
import { listAtendimentos } from "../../services/atendimento";
import { agendamentoSchema } from "../../validations/agendamentoSchema";

export default function AgendamentoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profissionais, setProfissionais] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [serverErrors, setServerErrors] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(agendamentoSchema),
    defaultValues: {
      codiAgen: "",
      canalAgen: "O",
      status: "PE",
      horario: "",
      idProfissional: "",
      idPaciente: "",
      idAtendimento: ""
    },
  });

  const extractDataFromResponse = (response) => {
    if (response && typeof response === 'object') {
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    }
    console.warn("Estrutura de resposta inesperada:", response);
    return [];
  };

  // Carrega dados para dropdowns
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [profsResponse, pacsResponse, atendsResponse] = await Promise.all([
          listProfissionais(),
          listPacientes(),
          listAtendimentos()
        ]);
        
        setProfissionais(extractDataFromResponse(profsResponse));
        setPacientes(extractDataFromResponse(pacsResponse));
        setAtendimentos(extractDataFromResponse(atendsResponse));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados para o formulário");
      }
    };

    loadDropdowns();
  }, []);

  // Carrega dados para edição
  useEffect(() => {
    if (id) {
      setLoading(true);
      getAgendamento(id)
        .then((response) => {
          // Extrai dados da resposta considerando diferentes estruturas
          const agendamentoData = response.success ? response.data : response;
          
          if (agendamentoData) {
            // Formata a data/hora para o input datetime-local
            const formattedData = {
              ...agendamentoData,
              horario: agendamentoData.horario ? agendamentoData.horario.replace(' ', 'T') : ''
            };
            reset(formattedData);
          } else {
            alert("Erro ao carregar dados do agendamento");
          }
        })
        .catch((e) => {
          console.error("Erro ao buscar agendamento:", e);
          alert("Erro ao carregar dados do agendamento");
        })
        .finally(() => setLoading(false));
    }
  }, [id, reset]);
  
  async function onSubmit(formData) {
    setLoading(true);
    setServerErrors({});
    
    try {
      const payload = {
        ...formData,
        codiAgen: parseInt(formData.codiAgen) 
      };
      
      console.log("Enviando para API:", payload);
      
      let response;
      if (id) {
        response = await updateAgendamento(id, payload);
      } else {
        response = await saveAgendamento(payload);
      }
      
      // Verifica se a resposta tem success: true ou se foi bem sucedida
      if (response.success || response.id) {
        navigate("/agendamentos");
      } else {
        alert(response.message || "Erro ao salvar agendamento");
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
        // Se for erro de conflito de horário
        else if (errorData.message && errorData.message.includes("conflito")) {
          setError("horario", {
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

  const getInputStyle = (fieldName) => {
    return errors[fieldName] ? {
      borderColor: '#e74c3c',
      backgroundColor: '#fdf2f2'
    } : {};
  };

  if (loading && id) {
    return <div className="card">Carregando...</div>;
  }

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>{id ? "Editar" : "Novo"} Agendamento</h2>
          
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
        
        {/* Coluna 1: Dados Básicos */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Dados do Agendamento
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FormField label="Código do Agendamento *" error={errors.codiAgen}>
              <input 
                type="number"
                className="input" 
                {...register("codiAgen")} 
                placeholder="Número do agendamento"
                style={getInputStyle('codiAgen')}
              />
              <ErrorMessage error={errors.codiAgen} />
            </FormField>

            <FormField label="Canal *" error={errors.canalAgen}>
              <select 
                className="input" 
                {...register("canalAgen")}
                style={getInputStyle('canalAgen')}
              >
                <option value="T">Telefone</option>
                <option value="W">WhatsApp</option>
                <option value="O">Online</option>
              </select>
              <ErrorMessage error={errors.canalAgen} />
            </FormField>

            <FormField label="Status" error={errors.status}>
              <select 
                className="input" 
                {...register("status")}
                style={getInputStyle('status')}
              >
                <option value="PE">Pendente</option>
                <option value="CN">Confirmado</option>
                <option value="CP">Compareceu</option>
                <option value="CA">Cancelado</option>
                <option value="RE">Remarcado</option>
              </select>
              <ErrorMessage error={errors.status} />
            </FormField>

            <FormField label="Data e Hora *" error={errors.horario}>
              <input 
                type="datetime-local"
                className="input" 
                {...register("horario")}
                style={getInputStyle('horario')}
              />
              <ErrorMessage error={errors.horario} />
            </FormField>
          </div>
        </div>

        {/* Coluna 2: Relacionamentos */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Relacionamentos
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FormField label="Profissional *" error={errors.idProfissional}>
              <select 
                className="input" 
                {...register("idProfissional")}
                style={getInputStyle('idProfissional')}
              >
                <option value="">Selecione o profissional</option>
                {profissionais.map(prof => (
                  <option key={prof.idProfissional} value={prof.idProfissional}>
                    {prof.nomeComp} ({prof.tipoConc})
                  </option>
                ))}
              </select>
              <ErrorMessage error={errors.idProfissional} />
            </FormField>

            <FormField label="Paciente *" error={errors.idPaciente}>
              <select 
                className="input" 
                {...register("idPaciente")}
                style={getInputStyle('idPaciente')}
              >
                <option value="">Selecione o paciente</option>
                {pacientes.map(pac => (
                  <option key={pac.idPaciente} value={pac.idPaciente}>
                    {pac.nomeComp} - {pac.cpf}
                  </option>
                ))}
              </select>
              <ErrorMessage error={errors.idPaciente} />
            </FormField>

            <FormField label="Tipo de Atendimento *" error={errors.idAtendimento}>
              <select 
                className="input" 
                {...register("idAtendimento")}
                style={getInputStyle('idAtendimento')}
              >
                <option value="">Selecione o tipo de atendimento</option>
                {atendimentos.map(atend => (
                  <option key={atend.idAtendimento} value={atend.idAtendimento}>
                    {atend.tipoAten} - {atend.codiAten}
                  </option>
                ))}
              </select>
              <ErrorMessage error={errors.idAtendimento} />
            </FormField>
          </div>
        </div>
      </div>
    </form>
  );
}