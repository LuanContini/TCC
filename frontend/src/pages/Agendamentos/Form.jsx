// src/pages/Agendamentos/AgendamentoForm.jsx
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useNavigate } from "react-router-dom"
import FormField from "../../components/FormField"
import { saveAgendamento } from "../../services/agendamentos"
import { listProfissionais } from "../../services/profissionais"
import { listPacientes } from "../../services/pacientes"
import { agendamentoSchema } from "../../validations/agendamentoSchema"

export default function AgendamentoForm() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(agendamentoSchema),
    defaultValues: {
      codiAgen: "",
      canalAgen: "O",
      status: "PE",
      horario: "",
      idProfissional: "",
      idPaciente: "",
      idAtendimento: ""
    }
  })

  const [profissionais, setProfissionais] = useState([])
  const [pacientes, setPacientes] = useState([])

  useEffect(() => {
    (async () => {
      setProfissionais(await listProfissionais())
      setPacientes(await listPacientes())
    })()
  }, [])

  const onSubmit = async (data) => {
    await saveAgendamento(data)
    alert("Agendamento salvo com sucesso!")
    navigate(-1)
  }

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>Novo Agendamento</h2>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>

        <FormField label="Código">
          <input className="input" {...register("codiAgen")} />
          {errors.codiAgen && <p>{errors.codiAgen.message}</p>}
        </FormField>

        <FormField label="Canal">
          <select className="input" {...register("canalAgen")}>
            <option value="T">Telefone</option>
            <option value="W">WhatsApp</option>
            <option value="O">Online</option>
          </select>
          {errors.canalAgen && <p>{errors.canalAgen.message}</p>}
        </FormField>

        <FormField label="Status">
          <select className="input" {...register("status")}>
            <option value="PE">Pendente</option>
            <option value="CN">Confirmado</option>
            <option value="CP">Compareceu</option>
            <option value="CA">Cancelado</option>
            <option value="RE">Remarcado</option>
          </select>
        </FormField>

        <FormField label="Horário">
          <input type="datetime-local" className="input" {...register("horario")} />
          {errors.horario && <p>{errors.horario.message}</p>}
        </FormField>

        <FormField label="Profissional">
          <select className="input" {...register("idProfissional")}>
            <option value="">Selecione</option>
            {profissionais.map(p => (
              <option key={p.idProfissional} value={p.idProfissional}>
                {p.nomeComp} ({p.tipoConc})
              </option>
            ))}
          </select>
          {errors.idProfissional && <p>{errors.idProfissional.message}</p>}
        </FormField>

        <FormField label="Paciente">
          <select className="input" {...register("idPaciente")}>
            <option value="">Selecione</option>
            {pacientes.map(p => (
              <option key={p.idPaciente} value={p.idPaciente}>
                {p.nomeComp}
              </option>
            ))}
          </select>
          {errors.idPaciente && <p>{errors.idPaciente.message}</p>}
        </FormField>

        <FormField label="Atendimento (ID)">
          <input className="input" {...register("idAtendimento")} />
          {errors.idAtendimento && <p>{errors.idAtendimento.message}</p>}
        </FormField>

      </div>
      <button className="button" style={{marginTop:12}}>Salvar</button>
    </form>
  )
}
