import React, { useState } from "react";
import { IProceso, EProcesoState } from "../App";
import { Form, Button } from "react-bootstrap";

interface Props {
  handleProcesosUpdate: (proceso: IProceso[]) => void;
  handleShowForm: (value: boolean) => void;
  procesos: IProceso[];
}

const FormProcesos: React.FC<Props> = props => {
  const [totalProcesos, setTotalProcesos] = useState<number>(0);
  const [valTotalProcesos, setValTotalProcesos] = useState<string>("");

  const handleContinuarClick = () => {
    setTotalProcesos(+valTotalProcesos);
    props.handleShowForm(false);
    const procesosList: IProceso[] = [];

    for (let i = 0; i < +valTotalProcesos; i++) {
      procesosList.push(generarProcesoAleatorio(i + 1));
    }

    props.handleProcesosUpdate(procesosList);
  };

  const generarProcesoAleatorio = (id: number) => {
    const [op, result] = genRandomOperation();
    const proceso: IProceso = {
      numeroPrograma: id,
      operacionRealizar: op,
      resultadoOperacion: Number.parseFloat(result).toFixed(2),
      TME: Math.floor(Math.random() * (18 - 8 + 1) + 8),
      // En un inicio, tiempoRestante debe de ser igual al TME
      tiempoRestante: Math.floor(Math.random() * (18 - 8 + 1) + 8),
      tiempoTranscurrido: 0,
      tiempoLlegada: 0,
      tiempoEspera: 0,
      tiempoFinalizacion: 0,
      tiempoRespuesta: 0,
      tiempoRetorno: 0,
      tiempoServicio: 0,
      currentState: EProcesoState.NUEVO,
      tiempoRespuestaChecked: false
    };
    return proceso;
  };

  const genRandomOperation = (): [string, string] => {
    let breakPoint = true;
    let op: string = "";
    while (breakPoint) {
      const nL = Math.floor(Math.random() * 100);
      const nR = Math.floor(Math.random() * 100);
      const symbols = ["+", "-", "*", "/", "%"];
      const rS = Math.floor(Math.random() * 5);
      op = `${nL}${symbols[rS]}${nR}`;
      if (checkValidOperation(op)) breakPoint = false;
    }
    return [op, eval(op)];
  };

  const checkValidOperation = (operacionRealizar: string): boolean => {
    if (
      !(
        operacionRealizar.indexOf("+") > -1 ||
        operacionRealizar.indexOf("-") > -1 ||
        operacionRealizar.indexOf("*") > -1 ||
        operacionRealizar.indexOf("/") > -1 ||
        operacionRealizar.indexOf("%") > -1
      )
    ) {
      return false;
    }

    try {
      const op = eval(operacionRealizar);
      if (isNaN(op) || !isFinite(op)) {
        return false;
      }
    } catch (err) {
      return false;
    }

    return true;
  };

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
  ) : null;
};

export default FormProcesos;
