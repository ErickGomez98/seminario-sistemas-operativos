import React, { useState } from "react";
import TaskManager from "./TaskManager";
import FormProcesos from "./Form";
import { Container, Row, Col } from "react-bootstrap";

export interface IProceso {
  operacionRealizar: string;
  resultadoOperacion: string | number;
  TME: number;
  numeroPrograma?: number;
  tiempoTranscurrido: number;
  tiempoRestante: number;
}

export interface ILote {
  id: number;
  procesos: IProceso[];
  maxProcesos: number;
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
