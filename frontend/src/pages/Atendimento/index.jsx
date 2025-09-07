import React from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import FormField from "../../components/FormField"
import { saveAtendimento } from "../../services/atendimento"
import { atendimentoSchema } from "../../validations/atendimentoSchema"

export default function Atendimento() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(atendimentoSchema),
    defaultValues: { tipoAten: "", justAten: "", codiAten: "" }
  })

  const onSubmit = async (data) => {
    await saveAtendimento(data)
    alert("Atendimento salvo com sucesso!")
  }

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>Cadastro de Atendimento</h2>

      <FormField label="Tipo de Atendimento">
        <input className="input" {...register("tipoAten")} />
        {errors.tipoAten && <p>{errors.tipoAten.message}</p>}
      </FormField>

      <FormField label="Justificativa">
        <textarea className="input" rows={3} {...register("justAten")} />
        {errors.justAten && <p>{errors.justAten.message}</p>}
      </FormField>

      <FormField label="Código do Atendimento">
        <input className="input" {...register("codiAten")} />
        {errors.codiAten && <p>{errors.codiAten.message}</p>}
      </FormField>

      <button className="button" style={{ marginTop: 12 }}>Salvar</button>
    </form>
  )
}
