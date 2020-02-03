import React, { useState } from "react";
import { IProceso } from "../App";

interface Props {
  handleProcesosUpdate: (proceso: IProceso) => void;
  handleShowForm: (value: boolean) => void;
  procesos: IProceso[];
}

const Form: React.FC<Props> = props => {
  const [totalProcesos, setTotalProcesos] = useState<number>(0);
  const [valTotalProcesos, setValTotalProcesos] = useState<string>("");
  const [capturedProcesos, setCapturedProcesos] = useState<number>(0);
  const [formError, setFormError] = useState<string>("");
  const [formValues, setFormValues] = useState<{
    nombreProgramador: string;
    operacionRealizar: string;
    TME: string;
    numeroPrograma: string;
  }>({
    nombreProgramador: "",
    operacionRealizar: "",
    TME: "",
    numeroPrograma: ""
  });

  const handleContinuarClick = () => {
    setTotalProcesos(+valTotalProcesos);
  };

  const handleSubmitForm = () => {
    // Validar que todos los input tengan info
    if (
      formValues.nombreProgramador.length < 1 ||
      formValues.TME.length < 1 ||
      formValues.numeroPrograma.length < 1 ||
      formValues.operacionRealizar.length < 1
    ) {
      setFormError("Llena todos los campos");
      return;
    }

    if (
      !(
        formValues.operacionRealizar.indexOf("+") > -1 ||
        formValues.operacionRealizar.indexOf("-") > -1 ||
        formValues.operacionRealizar.indexOf("*") > -1 ||
        formValues.operacionRealizar.indexOf("/") > -1
      )
    ) {
      setFormError("Ingresa una operación válida");
      return;
    }

    try {
      const op = eval(formValues.operacionRealizar);
      if (isNaN(op) || !isFinite(op)) {
        setFormError("Ingresa una operación válida");
        return;
      }
    } catch (err) {
      setFormError("Ingresa una operación válida");
      return;
    }

    // Validar que TME sea un número entero mayor a cero
    if (
      !Number.isInteger(+formValues.TME) ||
      +formValues.TME < 1 ||
      isNaN(+formValues.TME)
    ) {
      setFormError("Ingresa un TME entero mayor a cero");
      return;
    }

    // Validar que Número de programa sea un número único
    if (
      props.procesos.find(
        proceso =>
          proceso.numeroPrograma &&
          +proceso.numeroPrograma == +formValues.numeroPrograma
      )
    ) {
      setFormError("Ya existe ese número de programa");
      return;
    }

    setCapturedProcesos(capturedProcesos + 1);
    props.handleProcesosUpdate({
      TME: +formValues.TME,
      nombreProgramador: formValues.nombreProgramador,
      numeroPrograma: +formValues.numeroPrograma,
      operacionRealizar: formValues.operacionRealizar,
      resultadoOperacion: eval(formValues.operacionRealizar)
    });
    setFormValues({
      nombreProgramador: "",
      operacionRealizar: "",
      TME: "",
      numeroPrograma: ""
    });
  };

  if (valTotalProcesos !== "") {
    if (capturedProcesos >= +valTotalProcesos) props.handleShowForm(false);
  }

  return totalProcesos === 0 ? (
    <div>
      <input
        type="text"
        value={valTotalProcesos}
        onChange={e => {
          setValTotalProcesos(e.target.value);
        }}
      />
      <button onClick={handleContinuarClick}>continuar</button>
    </div>
  ) : capturedProcesos <= totalProcesos ? (
    <div>
      <input
        type="text"
        placeholder="Nombre de Programador"
        value={formValues.nombreProgramador}
        onChange={e => {
          setFormValues({
            ...formValues,
            nombreProgramador: e.target.value
          });
        }}
      />
      <input
        type="text"
        placeholder="Operación a realizar"
        value={formValues.operacionRealizar}
        onChange={e => {
          setFormValues({
            ...formValues,
            operacionRealizar: e.target.value
          });
        }}
      />
      <input
        type="text"
        placeholder="Tiempo Máximo Estimado"
        value={formValues.TME}
        onChange={e => {
          setFormValues({
            ...formValues,
            TME: e.target.value
          });
        }}
      />
      <input
        type="text"
        placeholder="Número de Programa"
        value={formValues.numeroPrograma}
        onChange={e => {
          setFormValues({
            ...formValues,
            numeroPrograma: e.target.value
          });
        }}
      />
      {formError ? <div>hay errores: {formError}</div> : null}
      <button onClick={handleSubmitForm}>Guardar</button>
    </div>
  ) : null;
};

export default Form;
