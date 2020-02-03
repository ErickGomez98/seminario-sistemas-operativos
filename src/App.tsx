import React, { useState } from "react";
import TaskManager from "./TaskManager";
import Form from "./Form";

export interface IProceso {
  nombreProgramador: string;
  operacionRealizar: string;
  resultadoOperacion: string;
  TME?: number;
  numeroPrograma?: number;
}

export interface ILote {
  id: number;
  procesos: IProceso[];
  maxProcesos: number;
}

const App: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(true);
  const [procesos, setProcesos] = useState<IProceso[]>([]);

  const actualizarProcesosList = (proceso: IProceso) => {
    setProcesos([...procesos, proceso]);
  };

  return showForm ? (
    <Form
      procesos={procesos}
      handleProcesosUpdate={actualizarProcesosList}
      handleShowForm={setShowForm}
    />
  ) : (
    <TaskManager procesos={procesos} />
  );
};

export default App;
