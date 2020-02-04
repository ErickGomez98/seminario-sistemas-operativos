import React, { useState } from "react";
import { IProceso } from "../App";
import { Form, Button, Alert } from "react-bootstrap";

interface Props {
  handleProcesosUpdate: (proceso: IProceso) => void;
  handleShowForm: (value: boolean) => void;
  procesos: IProceso[];
}

const FormProcesos: React.FC<Props> = props => {
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
    setFormError("");
  };

  if (valTotalProcesos !== "") {
    if (capturedProcesos >= +valTotalProcesos) props.handleShowForm(false);
  }

  return totalProcesos === 0 ? (
    <div>
      <Form>
        <Form.Group>
          <Form.Label>Cantidad de Procesos</Form.Label>
          <Form.Control
            type="text"
            value={valTotalProcesos}
            onChange={(e: any) => {
              setValTotalProcesos(e.target.value);
            }}
            placeholder="Ingresa la cantidad de procesos"
          />
        </Form.Group>
      </Form>
      <Button onClick={handleContinuarClick} variant="primary">
        continuar
      </Button>
    </div>
  ) : capturedProcesos <= totalProcesos ? (
    <div>
      <Form>
        <Form.Group>
          <Form.Label>Nombre de Programador</Form.Label>
          <Form.Control
            type="text"
            value={formValues.nombreProgramador}
            onChange={(e: any) => {
              setFormValues({
                ...formValues,
                nombreProgramador: e.target.value
              });
            }}
            placeholder="Nombre de programador"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Operación a Realizar</Form.Label>
          <Form.Control
            type="text"
            value={formValues.operacionRealizar}
            onChange={(e: any) => {
              setFormValues({
                ...formValues,
                operacionRealizar: e.target.value
              });
            }}
            placeholder="Operación a realizar"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Tiempo máximo estimado</Form.Label>
          <Form.Control
            type="text"
            value={formValues.TME}
            onChange={(e: any) => {
              setFormValues({
                ...formValues,
                TME: e.target.value
              });
            }}
            placeholder="Tiempo máximo estimado"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Número de programa</Form.Label>
          <Form.Control
            type="text"
            value={formValues.numeroPrograma}
            onChange={(e: any) => {
              setFormValues({
                ...formValues,
                numeroPrograma: e.target.value
              });
            }}
            placeholder="Número de Programa"
          />
        </Form.Group>
      </Form>
      {formError ? (
        <Alert variant="danger">
          <b>Error</b>: {formError}
        </Alert>
      ) : null}
      <Button onClick={handleSubmitForm} variant="primary">
        Guardar
      </Button>
    </div>
  ) : null;
};

export default FormProcesos;
