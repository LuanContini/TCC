import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { IMaskInput } from "react-imask";
import FormField from "../../components/FormField";
import { getPaciente, savePaciente } from "../../services/pacientes";
import { pacienteSchema } from "../../validations/pacienteSchema";

export default function PacienteForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    reset,
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
      codiPais: "",
      codiCidade: "",
      telefone: "",
      email: "",
      status: "A",
      responsavel: "",
      tipoSangue: "",
      alergia: "",
      histDoencas: "",
      observacao: "",
      idAgendamento: "",
    },
  });

  // Carrega dados para edição
  useEffect(() => {
    if (id) {
      getPaciente(id).then((data) => {
        // Remove máscaras para o formulário
        data.cpf = data.cpf?.replace(/\D/g, "");
        data.rg = data.rg?.replace(/\D/g, "");
        data.cep = data.cep?.replace(/\D/g, "");
        data.telefone = data.telefone?.replace(/\D/g, "");
        reset(data);
      });
    }
  }, [id, reset]);

  async function onSubmit(formData) {
    await savePaciente({ id, ...formData });
    nav("/pacientes");
  }

  const estados = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
    "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
    "SP","SE","TO"
  ];

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>{id ? "Editar" : "Novo"} Paciente</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Nome completo">
          <input className="input" {...register("nomeComp")} />
          {errors.nomeComp && <p>{errors.nomeComp.message}</p>}
        </FormField>

        <FormField label="CPF">
          <Controller
            name="cpf"
            control={control}
            render={({ field }) => (
              <IMaskInput
                mask="000.000.000-00"
                {...field}
                onAccept={(val) => field.onChange(val.replace(/\D/g, ""))}
                className="input"
              />
            )}
          />
          {errors.cpf && <p>{errors.cpf.message}</p>}
        </FormField>

        <FormField label="RG">
          <Controller
            name="rg"
            control={control}
            render={({ field }) => (
              <IMaskInput
                mask="00.000.000-0"
                {...field}
                onAccept={(val) => field.onChange(val.replace(/\D/g, ""))}
                className="input"
              />
            )}
          />
          {errors.rg && <p>{errors.rg.message}</p>}
        </FormField>

        <FormField label="Data de nascimento">
          <input type="date" className="input" {...register("dataNasc")} />
          {errors.dataNasc && <p>{errors.dataNasc.message}</p>}
        </FormField>

        <FormField label="Sexo">
          <select className="input" {...register("sexo")}>
            <option value="">Selecione</option>
            <option value="F">Feminino</option>
            <option value="M">Masculino</option>
            <option value="O">Outro</option>
          </select>
          {errors.sexo && <p>{errors.sexo.message}</p>}
        </FormField>

        <FormField label="Telefone">
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <IMaskInput
                mask="(00)00000-0000"
                {...field}
                onAccept={(val) => field.onChange(val.replace(/\D/g, ""))}
                className="input"
              />
            )}
          />
          {errors.telefone && <p>{errors.telefone.message}</p>}
        </FormField>

        <FormField label="E-mail">
          <input className="input" {...register("email")} />
          {errors.email && <p>{errors.email.message}</p>}
        </FormField>

        <FormField label="Endereço completo">
          <input className="input" {...register("logradouro")} placeholder="Rua, Avenida..." />
          {errors.logradouro && <p>{errors.logradouro.message}</p>}
        </FormField>

        <FormField label="Número">
          <input className="input" {...register("numero")} />
          {errors.numero && <p>{errors.numero.message}</p>}
        </FormField>

        <FormField label="Complemento">
          <input className="input" {...register("complemento")} />
        </FormField>

        <FormField label="Bairro">
          <input className="input" {...register("bairro")} />
          {errors.bairro && <p>{errors.bairro.message}</p>}
        </FormField>

        <FormField label="Cidade">
          <input className="input" {...register("cidade")} />
        </FormField>

        <FormField label="Estado">
          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <select {...field} className="input">
                <option value="">Selecione</option>
                {estados.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            )}
          />
          {errors.estado && <p>{errors.estado.message}</p>}
        </FormField>

        <FormField label="CEP">
          <Controller
            name="cep"
            control={control}
            render={({ field }) => (
              <IMaskInput
                mask="00000-000"
                {...field}
                onAccept={(val) => field.onChange(val.replace(/\D/g, ""))}
                className="input"
              />
            )}
          />
          {errors.cep && <p>{errors.cep.message}</p>}
        </FormField>

        <FormField label="Responsável legal">
          <input className="input" {...register("responsavel")} />
        </FormField>

        <FormField label="Tipo sanguíneo">
          <input className="input" {...register("tipoSangue")} placeholder="A+, O-, etc." />
        </FormField>

        <FormField label="Alergias">
          <input className="input" {...register("alergia")} />
        </FormField>

        <FormField label="Doenças pré-existentes">
          <textarea className="input" {...register("histDoencas")} />
        </FormField>

        <FormField label="Observações">
          <textarea className="input" {...register("observacao")} />
        </FormField>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button className="button" type="submit">Salvar</button>
        <button className="button" type="button" onClick={() => history.back()}>Cancelar</button>
      </div>
    </form>
  );
}
