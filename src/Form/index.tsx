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
    // Validar que sea una operación válida con try catch
    // Validar que la operación no regrese Infinity
    // Validar que la operación no regrese NaN

    // Validar que TME sea un número entero mayor a cero

    // Validar que Número de programa sea un número único
    setCapturedProcesos(capturedProcesos + 1);
    props.handleProcesosUpdate({
      TME: 1,
      nombreProgramador: "Erick",
      numeroPrograma: 1,
      operacionRealizar: "2-2",
      resultadoOperacion: "0"
    });
    setFormValues({
      nombreProgramador: "",
      operacionRealizar: "",
      TME: "",
      numeroPrograma: ""
    });
    setFormError("");
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
