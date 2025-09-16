import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { IMaskInput } from "react-imask";
import FormField from "../../components/FormField";
import { getPaciente, savePaciente } from "../../services/pacientes";
import { pacienteSchema } from "../../validations/pacienteSchema";

export default function PacienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(pacienteSchema),
    defaultValues: {
      nomeComp: "",
      cpf: "",
      rg: "",
      dataNasc: "",
      sexo: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      codiPais: "BRA",
      codiCidade: "01",
      telefone: "",
      email: "",
      status: "A",
      responsavel: "",
      tipoSangue: "",
      alergia: "",
      histDoencas: "",
      observacao: "",
    },
  });

  const estados = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
    "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
    "SP","SE","TO"
  ];

  const tiposSanguineos = [
    { value: "", label: "Selecione o tipo sanguíneo" },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" }
  ];

  // Carrega dados para edição
  useEffect(() => {
    if (id) {
      setLoading(true);
      getPaciente(id)
        .then((data) => {
          const formData = {
            ...data,
            rg: data.rg?.replace(/\D/g, "") || "",
            cep: data.cep?.replace(/\D/g, "") || "",
            telefone: data.telefone?.replace(/\D/g, "") || "",
            dataNasc: data.dataNasc ? data.dataNasc.split("T")[0] : "",
            codiPais: data.codiPais || "BRA",
            codiCidade: data.codiCidade || "01"
          };
          reset(formData);
          
          if (data.fotoUrl) {
            setFotoPreview(data.fotoUrl);
          }
        })
        .catch((e) => {
          console.error("Erro ao buscar paciente:", e);
          alert("Erro ao carregar dados do paciente");
        })
        .finally(() => setLoading(false));
    }
  }, [id, reset]);
  
  async function onSubmit(formData) {
    setLoading(true);
    try {
      const cleanData = { ...formData };
      
      if (cleanData.dataNasc) {
        const date = new Date(cleanData.dataNasc);
        if (!isNaN(date)) {
          cleanData.dataNasc = date.toISOString().split('T')[0];
        } else {
          cleanData.dataNasc = '';
        }
      }

      const payload = new FormData();
      
      const todosOsCampos = [
        'nomeComp', 'cpf', 'rg', 'dataNasc', 'sexo',
        'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 
        'estado', 'cep', 'codiPais', 'codiCidade', 'telefone', 
        'email', 'status', 'responsavel', 'tipoSangue', 'alergia', 
        'histDoencas', 'observacao'
      ];
      
      todosOsCampos.forEach(campo => {
        const value = cleanData[campo];
        if (value !== null && value !== undefined && value !== '') {
          payload.append(campo, value);
        } else {
          payload.append(campo, '');
        }
      });

      console.log("Dados do FormData:");
      for (let [key, value] of payload.entries()) {
        console.log(key, value);
      }
      
      if (fotoFile) {
        payload.append("foto", fotoFile);
      }
      
      await savePaciente(payload, id); 
      
      navigate("/pacientes");
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      if (error.response?.data) {
        Object.entries(error.response.data).forEach(([field, messages]) => {
          setError(field, { 
            type: "server", 
            message: Array.isArray(messages) ? messages.join(", ") : messages 
          });
        });
      } else {
        alert("Ocorreu um erro ao salvar o paciente.");
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
    <form className="card" onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>{id ? "Editar" : "Novo"} Paciente</h2>
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
        
        {/* Coluna 1: Dados Pessoais */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Dados Pessoais
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FormField label="Nome completo" error={errors.nomeComp}>
              <input 
                className="input" 
                {...register("nomeComp")} 
                placeholder="Digite o nome completo"
                style={getInputStyle('nomeComp')}
              />
              <ErrorMessage error={errors.nomeComp} />
            </FormField>

            <FormField label="CPF" error={errors.cpf}>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <IMaskInput
                    mask="000.000.000-00"
                    {...field}
                    onAccept={(val) => field.onChange(val.replace(/\D/g, ""))}
                    className="input"
                    placeholder="000.000.000-00"
                    style={getInputStyle('cpf')}
                  />
                )}
              />
              <ErrorMessage error={errors.cpf} />
            </FormField>

            <FormField label="RG" error={errors.rg}>
              <Controller
                name="rg"
                control={control}
                render={({ field }) => (
                  <IMaskInput
                    mask="00.000.000-0"
                    {...field}
                    onAccept={(val) => field.onChange(val.replace(/\D/g, ""))}
                    className="input"
                    placeholder="00.000.000-0"
                    style={getInputStyle('rg')}
                  />
                )}
              />
              <ErrorMessage error={errors.rg} />
            </FormField>

            <FormField label="Data de nascimento" error={errors.dataNasc}>
              <input 
                type="date" 
                className="input" 
                {...register("dataNasc")} 
                max={new Date().toISOString().split('T')[0]}
                style={getInputStyle('dataNasc')}
              />
              <ErrorMessage error={errors.dataNasc} />
            </FormField>

            <FormField label="Sexo" error={errors.sexo}>
              <select 
                className="input" 
                {...register("sexo")}
                style={getInputStyle('sexo')}
              >
                <option value="">Selecione o sexo</option>
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
                <option value="O">Outro</option>
              </select>
              <ErrorMessage error={errors.sexo} />
            </FormField>

            <FormField label="Tipo sanguíneo" error={errors.tipoSangue}>
              <select 
                className="input" 
                {...register("tipoSangue")}
                style={getInputStyle('tipoSangue')}
              >
                {tiposSanguineos.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              <ErrorMessage error={errors.tipoSangue} />
            </FormField>
          </div>
        </div>

        {/* Coluna 2: Contato */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Contato
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FormField label="Telefone" error={errors.telefone}>
              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <IMaskInput
                    mask="(00)00000-0000"
                    {...field}
                    onAccept={(val) => field.onChange(val.replace(/\D/g, ""))}
                    className="input"
                    placeholder="(00)00000-0000"
                    style={getInputStyle('telefone')}
                  />
                )}
              />
              <ErrorMessage error={errors.telefone} />
            </FormField>

            <FormField label="E-mail" error={errors.email}>
              <input 
                className="input" 
                {...register("email")} 
                type="email"
                placeholder="email@exemplo.com"
                style={getInputStyle('email')}
              />
              <ErrorMessage error={errors.email} />
            </FormField>

            <FormField label="Responsável legal" error={errors.responsavel}>
              <input 
                className="input" 
                {...register("responsavel")} 
                placeholder="Nome do responsável (se aplicável)"
                style={getInputStyle('responsavel')}
              />
              <ErrorMessage error={errors.responsavel} />
            </FormField>

            <FormField label="Status" error={errors.status}>
              <select 
                className="input" 
                {...register("status")}
                style={getInputStyle('status')}
              >
                <option value="A">Ativo</option>
                <option value="I">Inativo</option>
              </select>
              <ErrorMessage error={errors.status} />
            </FormField>

            <FormField label="Foto do Paciente" error={errors.foto}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (!file.type.startsWith('image/')) {
                      setError('foto', { type: 'manual', message: 'Por favor, selecione um arquivo de imagem' });
                      return;
                    }
                    
                    if (file.size > 5 * 1024 * 1024) {
                      setError('foto', { type: 'manual', message: 'A imagem deve ter no máximo 5MB' });
                      return;
                    }
                    
                    setFotoFile(file);
                    setFotoPreview(URL.createObjectURL(file));
                    // Limpa erro se o arquivo for válido
                    if (errors.foto) {
                      setError('foto', null);
                    }
                  }
                }}
                className="input"
                style={errors.foto ? getInputStyle('foto') : {}}
              />
              <ErrorMessage error={errors.foto} />
              {fotoPreview && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={fotoPreview}
                    alt="Preview"
                    style={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: 8, 
                      objectFit: 'cover',
                      border: '1px solid #ddd'
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      setFotoPreview(null);
                      setFotoFile(null);
                    }}
                    style={{ 
                      marginLeft: 8, 
                      padding: '4px 8px', 
                      backgroundColor: '#ff4757', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Remover
                  </button>
                </div>
              )}
            </FormField>
          </div>
        </div>

        {/* Coluna 3: Endereço */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Endereço
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FormField label="Logradouro" error={errors.logradouro}>
              <input 
                className="input" 
                {...register("logradouro")} 
                placeholder="Nome da rua, avenida, etc."
                style={getInputStyle('logradouro')}
              />
              <ErrorMessage error={errors.logradouro} />
            </FormField>

            <FormField label="Número" error={errors.numero}>
              <input 
                className="input" 
                {...register("numero")} 
                placeholder="Número"
                style={getInputStyle('numero')}
              />
              <ErrorMessage error={errors.numero} />
            </FormField>

            <FormField label="Complemento" error={errors.complemento}>
              <input 
                className="input" 
                {...register("complemento")} 
                placeholder="Apartamento, bloco, etc."
                style={getInputStyle('complemento')}
              />
              <ErrorMessage error={errors.complemento} />
            </FormField>

            <FormField label="Bairro" error={errors.bairro}>
              <input 
                className="input" 
                {...register("bairro")} 
                placeholder="Nome do bairro"
                style={getInputStyle('bairro')}
              />
              <ErrorMessage error={errors.bairro} />
            </FormField>

            <FormField label="Cidade" error={errors.cidade}>
              <input 
                className="input" 
                {...register("cidade")} 
                placeholder="Nome da cidade"
                style={getInputStyle('cidade')}
              />
              <ErrorMessage error={errors.cidade} />
            </FormField>

            <FormField label="Estado" error={errors.estado}>
              <Controller
                name="estado"
                control={control}
                render={({ field }) => (
                  <select 
                    {...field} 
                    className="input"
                    style={getInputStyle('estado')}
                  >
                    <option value="">Selecione o estado</option>
                    {estados.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                )}
              />
              <ErrorMessage error={errors.estado} />
            </FormField>

            <FormField label="CEP" error={errors.cep}>
              <Controller
                name="cep"
                control={control}
                render={({ field }) => (
                  <IMaskInput
                    mask="00000-000"
                    {...field}
                    onAccept={(val) => field.onChange(val.replace(/\D/g, ""))}
                    className="input"
                    placeholder="00000-000"
                    style={getInputStyle('cep')}
                  />
                )}
              />
              <ErrorMessage error={errors.cep} />
            </FormField>
          </div>
        </div>

        {/* Coluna 4: Saúde */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Informações de Saúde
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FormField label="Alergias" error={errors.alergia}>
              <input 
                className="input" 
                {...register("alergia")} 
                placeholder="Lista de alergias conhecidas"
                style={getInputStyle('alergia')}
              />
              <ErrorMessage error={errors.alergia} />
            </FormField>

            <FormField label="Doenças pré-existentes" error={errors.histDoencas}>
              <textarea 
                className="input" 
                {...register("histDoencas")} 
                rows={3}
                placeholder="Histórico de doenças crônicas ou condições preexistentes"
                style={getInputStyle('histDoencas')}
              />
              <ErrorMessage error={errors.histDoencas} />
            </FormField>

            <FormField label="Observações" error={errors.observacao}>
              <textarea 
                className="input" 
                {...register("observacao")} 
                rows={3}
                placeholder="Observações adicionais sobre o paciente"
                style={getInputStyle('observacao')}
              />
              <ErrorMessage error={errors.observacao} />
            </FormField>

            {/* Campos ocultos para codiPais e codiCidade */}
            <input type="hidden" {...register("codiPais")} />
            <input type="hidden" {...register("codiCidade")} />
          </div>
        </div>
      </div>
    </form>
  );
}