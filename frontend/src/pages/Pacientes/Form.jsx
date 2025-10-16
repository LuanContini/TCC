import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Controller } from "react-hook-form";
import { IMaskInput } from "react-imask";

// Componentes e hooks
import { EnhancedFormField } from "../../components/EnhancedFormField";
import { FormErrors } from "../../components/FormErrors";
import { useFormHandler } from "../../hooks/useFormHandler";
import { getPaciente, savePaciente } from "../../services/pacientes";
import { pacienteSchema } from "../../validations/pacienteSchema";

// Utilitários
import { estadosBrasil, TIPOS_SANGUINEOS, SEXO_OPTIONS, STATUS_OPTIONS } from "../../utils/constants";

const empty = {
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
};

export default function PacienteForm() {
  const { id } = useParams();
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    errors,
    loading,
    setLoading,
    serverErrors,
    onSubmitHandler,
    navigate,
    setError
  } = useFormHandler(pacienteSchema, empty);

  // Carrega dados para edição
  useEffect(() => {
    if (id) {
      setLoading(true);
      getPaciente(id)
        .then((data) => {
          const formData = {
            ...empty,
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
        .catch((error) => {
          console.error("Erro ao buscar paciente:", error);
          alert("Erro ao carregar dados do paciente");
        })
        .finally(() => setLoading(false));
    }
  }, [id, reset, setLoading]);

  const onSubmit = async (formData) => {
    const cleanData = { ...formData };
    
    // Formatar data de nascimento
    if (cleanData.dataNasc) {
      const date = new Date(cleanData.dataNasc);
      if (!isNaN(date)) {
        cleanData.dataNasc = date.toISOString().split('T')[0];
      } else {
        cleanData.dataNasc = '';
      }
    }

    // Criar FormData para envio com arquivo
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
    
    if (fotoFile) {
      payload.append("foto", fotoFile);
    }

    try {
      await savePaciente(payload, id);
      navigate("/pacientes");
      alert(`Paciente ${id ? 'atualizado' : 'cadastrado'} com sucesso!`);
    } catch (error) {
      // O useFormHandler já trata os erros automaticamente
      console.error("Erro ao salvar paciente:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validações do arquivo
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
  };

  const handleRemoveFoto = () => {
    setFotoPreview(null);
    setFotoFile(null);
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>{id ? "Editar" : "Novo"} Paciente</h2>
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

      {/* Exibição centralizada de erros */}
      <FormErrors errors={errors} serverErrors={serverErrors} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Coluna 1: Dados Pessoais */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Dados Pessoais
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <EnhancedFormField label="Nome completo" error={errors.nomeComp} required>
              <input 
                className="input" 
                {...register("nomeComp")} 
                placeholder="Digite o nome completo"
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="CPF" error={errors.cpf} required>
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
                    disabled={loading}
                  />
                )}
              />
            </EnhancedFormField>

            <EnhancedFormField label="RG" error={errors.rg}>
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
                    disabled={loading}
                  />
                )}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Data de nascimento" error={errors.dataNasc} required>
              <input 
                type="date" 
                className="input" 
                {...register("dataNasc")} 
                max={new Date().toISOString().split('T')[0]}
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Sexo" error={errors.sexo} required>
              <Controller
                name="sexo"
                control={control}
                render={({ field }) => (
                  <select 
                    {...field} 
                    className="input"
                    disabled={loading}
                  >
                    <option value="">Selecione o sexo</option>
                    {SEXO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Tipo sanguíneo" error={errors.tipoSangue}>
              <Controller
                name="tipoSangue"
                control={control}
                render={({ field }) => (
                  <select 
                    {...field} 
                    className="input"
                    disabled={loading}
                  >
                    {TIPOS_SANGUINEOS.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </EnhancedFormField>
          </div>
        </div>

        {/* Coluna 2: Contato */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Contato
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <EnhancedFormField label="Telefone" error={errors.telefone} required>
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
                    disabled={loading}
                  />
                )}
              />
            </EnhancedFormField>

            <EnhancedFormField label="E-mail" error={errors.email}>
              <input 
                className="input" 
                {...register("email")} 
                type="email"
                placeholder="email@exemplo.com"
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Responsável legal" error={errors.responsavel}>
              <input 
                className="input" 
                {...register("responsavel")} 
                placeholder="Nome do responsável (se aplicável)"
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Status" error={errors.status} required>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select 
                    {...field} 
                    className="input"
                    disabled={loading}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Foto do Paciente" error={errors.foto}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="input"
                disabled={loading}
              />
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
                    onClick={handleRemoveFoto}
                    style={{ 
                      marginLeft: 8, 
                      padding: '4px 8px', 
                      backgroundColor: '#ff4757', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                    disabled={loading}
                  >
                    Remover
                  </button>
                </div>
              )}
            </EnhancedFormField>
          </div>
        </div>

        {/* Coluna 3: Endereço */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Endereço
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <EnhancedFormField label="Logradouro" error={errors.logradouro} required>
              <input 
                className="input" 
                {...register("logradouro")} 
                placeholder="Nome da rua, avenida, etc."
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Número" error={errors.numero} required>
              <input 
                className="input" 
                {...register("numero")} 
                placeholder="Número"
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Complemento" error={errors.complemento}>
              <input 
                className="input" 
                {...register("complemento")} 
                placeholder="Apartamento, bloco, etc."
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Bairro" error={errors.bairro} required>
              <input 
                className="input" 
                {...register("bairro")} 
                placeholder="Nome do bairro"
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Cidade" error={errors.cidade}>
              <input 
                className="input" 
                {...register("cidade")} 
                placeholder="Nome da cidade"
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Estado" error={errors.estado} required>
              <Controller
                name="estado"
                control={control}
                render={({ field }) => (
                  <select 
                    {...field} 
                    className="input"
                    disabled={loading}
                  >
                    <option value="">Selecione o estado</option>
                    {estadosBrasil.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                )}
              />
            </EnhancedFormField>

            <EnhancedFormField label="CEP" error={errors.cep} required>
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
                    disabled={loading}
                  />
                )}
              />
            </EnhancedFormField>
          </div>
        </div>

        {/* Coluna 4: Saúde */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Informações de Saúde
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <EnhancedFormField label="Alergias" error={errors.alergia}>
              <input 
                className="input" 
                {...register("alergia")} 
                placeholder="Lista de alergias conhecidas"
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Doenças pré-existentes" error={errors.histDoencas}>
              <textarea 
                className="input" 
                {...register("histDoencas")} 
                rows={3}
                placeholder="Histórico de doenças crônicas ou condições preexistentes"
                disabled={loading}
              />
            </EnhancedFormField>

            <EnhancedFormField label="Observações" error={errors.observacao}>
              <textarea 
                className="input" 
                {...register("observacao")} 
                rows={3}
                placeholder="Observações adicionais sobre o paciente"
                disabled={loading}
              />
            </EnhancedFormField>

            {/* Campos ocultos para codiPais e codiCidade */}
            <input type="hidden" {...register("codiPais")} />
            <input type="hidden" {...register("codiCidade")} />
          </div>
        </div>
      </div>
    </form>
  );
}