import React, { useState } from "react";
import TaskManager from "./TaskManager";
import FormProcesos from "./Form";
import { Container, Row, Col } from "react-bootstrap";

export interface IProcesoTimingEssentials {
  TME: number;
  tiempoTranscurrido: number;
  tiempoRestante: number;
  tiempoLlegada: number;
  tiempoFinalizacion: number;
  tiempoRetorno: number;
  tiempoServicio: number;
  tiempoEspera: number;
  tiempoRespuesta: number;
  tiempoBloqueado: number;
}

export enum EProcesoState {
  NUEVO = 1,
  LISTO = 2,
  EJECUCION = 3,
  BLOQUEADO = 4,
  FINALIZADO = 5
}

export interface IProceso extends IProcesoTimingEssentials {
  operacionRealizar: string;
  resultadoOperacion: string | number;
  numeroPrograma: number;
  currentState: EProcesoState;
  tiempoRespuestaChecked: boolean;
}

const App: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(true);
  const [procesos, setProcesos] = useState<IProceso[]>([]);

  const actualizarProcesosList = (p: IProceso[]) => {
    setProcesos(p);
  };

  return showForm ? (
    <Container>
      <Row>
        <Col>
          <FormProcesos
            procesos={procesos}
            handleProcesosUpdate={actualizarProcesosList}
            handleShowForm={setShowForm}
          />
        </Col>
      </Row>
    </Container>
  ) : (
    <TaskManager procesos={procesos} />
  );
};

export default App;
