import React, { useEffect, useState, useRef, useCallback } from "react";
import { IProceso, EProcesoState } from "../App";
import { Container, Row, Col, Table } from "react-bootstrap";
interface Props {
  procesos: IProceso[];
}

function useInterval(callback: any, delay: any) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      //@ts-ignore
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

/**
 * UTILS
 * Función para hacer deep clone de un array de objetos para perder la referencia
 * @param objectToClone
 */
function cloneArrayWithoutReference(objectToClone: any) {
  return JSON.parse(JSON.stringify(objectToClone));
}

const TaskManager: React.FC<Props> = props => {
  const [procesosNuevos, setProcesosNuevos] = useState<IProceso[]>([]);
  const [procesosListos, setProcesosListos] = useState<IProceso[]>([]);
  const [procesosBloqueados, setProcesosBloqueados] = useState<IProceso[]>([]);
  const [procesoEjecucion, setProcesoEjecucion] = useState<IProceso>({
    TME: 0,
    operacionRealizar: "",
    resultadoOperacion: "",
    tiempoEspera: 0,
    tiempoFinalizacion: 0,
    tiempoLlegada: 0,
    tiempoRespuesta: 0,
    tiempoRestante: 0,
    tiempoRetorno: 0,
    tiempoServicio: 0,
    tiempoTranscurrido: 0,
    numeroPrograma: 0,
    currentState: EProcesoState.NUEVO,
    tiempoRespuestaChecked: false
  });
  const [c, setC] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [stopped, setStopped] = useState<boolean>(false);
  const [keyEvent, setKeyEvent] = useState<any>();
  const [procesosFinalizados, setProcesosFinalizados] = useState<IProceso[]>(
    []
  );
  const [time, setTime] = useState<number>(0);
  const timeInterval = 100;

  useEffect(() => {
    inicializarPrimerosProcesos();

    // Key bindings
    document.addEventListener("keydown", keyDetectFunction, false);
    return () => {
      document.removeEventListener("keydown", keyDetectFunction, false);
    };
  }, []);

  /**
   * Función para meter los primeros 5 procesos a procesos listos
   */
  const inicializarPrimerosProcesos = () => {
    // Clonar props.procesos a procesosNuevos
    const pNuevos: IProceso[] = cloneArrayWithoutReference(props.procesos);

    let pListos: IProceso[];
    // Si hay más de 5 procesos mover solo 5 a procesos listos
    if (pNuevos.length > 5) {
      pListos = pNuevos.splice(0, 5);
    } else {
      // Si hay 5 procesos o menos, mover todos a procesos listos
      pListos = pNuevos.splice(0, pNuevos.length);
    }

    // Cambiar state de cada proceso que se movió a listo
    pListos.map(proceso => (proceso.currentState = EProcesoState.LISTO));

    // Inicializar proceso en ejecución
    const pEjec: IProceso = pListos.shift() as IProceso;

    // Cambiar state del proceso
    pEjec.currentState = EProcesoState.EJECUCION;

    console.log("procesos Nuevos: ", pNuevos);
    console.log("procesos Listos: ", pListos);
    console.log("proceso ejec: ", pEjec);

    setProcesoEjecucion(pEjec);
    setProcesosListos(pListos);
    setProcesosNuevos(pNuevos);
  };

  // KEY BINDING
  // para tener acceso al state, se tenía que hacer de está manera...
  useEffect(() => {
    if (keyEvent) {
      if (!finished) {
        const key = keyEvent.key;
        if (key === "e" || key === "E") {
          if (!stopped) {
            // Solo cuando no está detenido ejecutar la acción
            console.log("error");
            pushProcesoToFinalizadoByError();
          }
        } else if (key === "p" || key === "P") {
          setStopped(true);
        } else if (key === "i" || key === "I") {
          if (!stopped) {
            // Solo cuando no está detenido ejecutar la acción
            pushProcesoToLoteByInterrupcion();
          }
        } else if (key === "c" || key === "C") {
          // Solo cuando está detenido ejecutar la acción
          if (stopped) {
            if (!shouldFinish()) {
              setStopped(false);
            }
          }
        }
      }
    }
  }, [keyEvent]);

  const keyDetectFunction = (event: any) => {
    if (event.key === "e" || event.key === "E") {
      setKeyEvent(event);
    } else if (event.key === "p" || event.key === "P") {
      setKeyEvent(event);
    } else if (event.key === "i" || event.key === "I") {
      setKeyEvent(event);
    } else if (event.key === "c" || event.key === "C") {
      setKeyEvent(event);
    }
  };

  /**
   * Finaliza cuando la cantidad de procesos terminados es igual a la cantidad
   * de procesos iniciales
   */
  const shouldFinish = () => {
    return procesosFinalizados.length === props.procesos.length;
  };

  const moveFromLoteToEjecucion = (currentLote: any) => {
    // const p = shiftProceso(currentLote);
    // if (p) {
    //   console.log("AVEEER", p);
    //   setProcesoEjecucion({
    //     ...p,
    //     tiempoTranscurrido: p.tiempoTranscurrido ? p.tiempoTranscurrido : 0,
    //     tiempoRestante: p.tiempoRestante ? p.tiempoRestante : p.TME
    //   });
    // } else {
    //   setStopped(true);
    //   setProcesoEjecucion({
    //     operacionRealizar: "",
    //     resultadoOperacion: "",
    //     tiempoTranscurrido: -1,
    //     TME: -1,
    //     numeroPrograma: -1,
    //     tiempoRestante: -1
    //   });
    // }
  };

  const moveProcesoToFinalizado = (proceso: any) => {
    if (procesoEjecucion) {
      if (proceso) {
        //@ts-ignore
        const pro: IProceso = proceso;
        setProcesosFinalizados([...procesosFinalizados, pro]);
      } else {
        setProcesosFinalizados([...procesosFinalizados, procesoEjecucion]);
      }
      moveFromLoteToEjecucion(undefined);
    }
  };

  /**
   * Función encargada de controlar todo lo que sucede cada intervalo
   * de tiempo.
   */
  const mainLogicInterval = () => {
    // Finaliza cuando la cantidad de procesos terminados es igual
    // a la cantidad de procesos iniciales
    if (shouldFinish()) {
      console.log("Programa finalizado");
      setFinished(true);
      setStopped(true);

      console.log("procesoEjec", procesoEjecucion);
      console.log("procesosNuevos", procesosNuevos);
      console.log("procesosListos", procesosListos);
      console.log("procesosFinalizados", procesosFinalizados);
    } else {
      console.log("procesoEjec", procesoEjecucion);
      console.log("procesosNuevos", procesosNuevos);
      console.log("procesosListos", procesosListos);
      if (procesoEjecucion) {
        if (shouldProcesoEjecucionMoveToFinalizado()) {
          // moveProcesoEjecucionToFinalizado();
          const copyProcesosFinalizados: IProceso[] = cloneArrayWithoutReference(
            procesosFinalizados
          );
          copyProcesosFinalizados.push({
            ...procesoEjecucion,
            currentState: EProcesoState.FINALIZADO
          });
          setProcesosFinalizados(copyProcesosFinalizados);

          if (procesosListos.length > 0) {
            console.log("moviendo de listo a ejecucion");
            const copyProcesosListos = cloneArrayWithoutReference(
              procesosListos
            );
            console.warn("currentProcesoListos", procesosListos);
            console.warn("COPYProcesoListos", copyProcesosListos);
            const procesoEj: IProceso = copyProcesosListos.shift() as IProceso;
            procesoEj.currentState = EProcesoState.EJECUCION;
            if (!procesoEj.tiempoRespuestaChecked)
              procesoEj.tiempoRespuestaChecked = true;

            // mover proceso nuevo a listo
            if (procesosNuevos.length > 0) {
              const copyNuevos: IProceso[] = cloneArrayWithoutReference(
                procesosNuevos
              );
              const p: IProceso = copyNuevos.shift() as IProceso;
              copyProcesosListos.push({
                ...p,
                currentState: EProcesoState.LISTO,
                tiempoLlegada: p.tiempoLlegada
              });
              setProcesosNuevos(copyNuevos);
            } else {
              updateStateProcesosNuevos();
            }

            setProcesoEjecucion(procesoEj);
            setProcesosListos(copyProcesosListos);
          } else {
            setProcesoEjecucion({
              TME: 0,
              operacionRealizar: "",
              resultadoOperacion: "",
              tiempoEspera: 0,
              tiempoFinalizacion: 0,
              tiempoLlegada: 0,
              tiempoRespuesta: 0,
              tiempoRestante: 0,
              tiempoRetorno: 0,
              tiempoServicio: 0,
              tiempoTranscurrido: 0,
              numeroPrograma: 0,
              currentState: EProcesoState.NUEVO,
              tiempoRespuestaChecked: false
            });

            updateStateProcesosNuevos();
          }
        } else {
          updateStateProcesoEjecucion();

          // Actualizar state de procesos Listos
          updateStateProcesosListos();

          updateStateProcesosNuevos();
        }
      } else {
        console.log("Ya no hay proceso en ejecución");
      }

      //   // Actualizar state de procesos Nuevos
      //   setTimeout(() => {
      //     updateStateProcesosNuevos();
      //   }, 500);

      //   // Actualizar state de procesos Bloqueados
      //   updateStateProcesosBloqueados();
    }

    // Aumentar contador global
    setTime(time => time + 1);
  };

  /**
   * Mueve un proceso de proceso en ejecución a procesos finalizados
   */
  // const moveProcesoEjecucionToFinalizado = () => {
  //   console.log("muevelo a terminados");
  //   const copyProcesosFinalizados: IProceso[] = cloneArrayWithoutReference(
  //     procesosFinalizados
  //   );
  //   copyProcesosFinalizados.push({
  //     ...procesoEjecucion,
  //     currentState: EProcesoState.FINALIZADO
  //   });
  //   setProcesosFinalizados(copyProcesosFinalizados);
  //   moveProcesoListoToEjecucion();
  // };

  // const moveProcesoNuevoToListo = () => {
  //   if (countProcesosEnMemoria() < 5) {
  //     if (procesosNuevos.length > 0) {
  //       console.log("SI HAY ESPACIO, MOVER NUEVO TO LISTO");
  //       const copyNuevos: IProceso[] = cloneArrayWithoutReference(
  //         procesosNuevos
  //       );
  //       const p: IProceso = copyNuevos.shift() as IProceso;
  //       const copyListos: IProceso[] = cloneArrayWithoutReference(
  //         procesosListos
  //       );
  //       copyListos.push({
  //         ...p,
  //         currentState: EProcesoState.LISTO,
  //         tiempoLlegada: p.tiempoLlegada + 1
  //       });
  //       setProcesosListos(copyListos);
  //       setProcesosNuevos(copyNuevos);
  //     }
  //   } else {
  //     console.error("NO HAY ESPACIO EN MEMORIA");
  //   }
  // };

  /**
   * De la lista de procesos listos moverlo a proceso en ejecución.
   */
  const moveProcesoListoToEjecucion = () => {
    if (procesosListos.length > 0) {
      console.log("moviendo de listo a ejecucion");
      const copyProcesosListos = cloneArrayWithoutReference(procesosListos);
      console.warn("currentProcesoListos", procesosListos);
      console.warn("COPYProcesoListos", copyProcesosListos);
      const procesoEj: IProceso = copyProcesosListos.shift() as IProceso;
      procesoEj.currentState = EProcesoState.EJECUCION;
      if (!procesoEj.tiempoRespuestaChecked)
        procesoEj.tiempoRespuestaChecked = true;

      // mover proceso nuevo a listo
      const copyNuevos: IProceso[] = cloneArrayWithoutReference(procesosNuevos);
      const p: IProceso = copyNuevos.shift() as IProceso;
      copyProcesosListos.push({
        ...p,
        currentState: EProcesoState.LISTO,
        tiempoLlegada: p.tiempoLlegada + 1
      });
      setProcesoEjecucion(procesoEj);
      setProcesosListos(copyProcesosListos);
      setProcesosNuevos(copyNuevos);
    } else {
      setProcesoEjecucion({
        TME: 0,
        operacionRealizar: "",
        resultadoOperacion: "",
        tiempoEspera: 0,
        tiempoFinalizacion: 0,
        tiempoLlegada: 0,
        tiempoRespuesta: 0,
        tiempoRestante: 0,
        tiempoRetorno: 0,
        tiempoServicio: 0,
        tiempoTranscurrido: 0,
        numeroPrograma: 0,
        currentState: EProcesoState.NUEVO,
        tiempoRespuestaChecked: false
      });
    }
  };

  /**
   * Compara si el proceso en ejecución debe moverse a procesos finalizados
   * Se tendrá que mover cuando el tiempo maximo estimado sea igual al tiempo transcurrido + 1
   */
  const shouldProcesoEjecucionMoveToFinalizado = () => {
    return procesoEjecucion.TME === procesoEjecucion.tiempoTranscurrido;
  };

  /**
   * Se manda a llamar cada time interval
   * Actualiza el state de los procesos Nuevos
   */
  const updateStateProcesosNuevos = () => {
    // Ir incrementando tiempo de llegada, que cuando cambie a proceso listo deberá de
    // dejar de incrementar el contador.
    const copyProcesosNuevos: IProceso[] = cloneArrayWithoutReference(
      procesosNuevos
    );
    copyProcesosNuevos.map(
      proceso => (proceso.tiempoLlegada = proceso.tiempoLlegada + 1)
    );
    setProcesosNuevos(copyProcesosNuevos);
  };

  /**
   * Se manda a llamar cada time interval
   * Actualiza el state de los procesos Listos
   */
  const updateStateProcesosListos = () => {
    // Ir incrementando tiempo de respuesta, que cuando cambie a proceso en ejecución
    // POR PRIMERA VEZ deberá de dejar de incrementar el contador.
    // Ir incrementando el tiempo de espera, ya que debe de incrementar cuando no este el proceso
    // en ejecución.
    const copyProcesosListos: IProceso[] = cloneArrayWithoutReference(
      procesosListos
    );
    copyProcesosListos.map(proceso => {
      proceso.tiempoRespuesta = !proceso.tiempoRespuestaChecked
        ? proceso.tiempoRespuesta + 1
        : proceso.tiempoRespuesta;

      proceso.tiempoEspera = proceso.tiempoEspera + 1;
      proceso.tiempoRetorno = proceso.tiempoRetorno + 1;
      proceso.tiempoFinalizacion =
        proceso.tiempoLlegada + proceso.tiempoRetorno;

      return proceso;
    });
    setProcesosListos(copyProcesosListos);
  };

  /**
   * Se manda a llamar cada time interval
   * Actualiza el state del proceso en Ejecución
   */
  const updateStateProcesoEjecucion = () => {
    // Se debe de ir incrementando el tiempo transcurrido + 1 y
    // se debe de ir decrementando el tiempo restante - 1
    // Aumentar el tiempo de servicio, que es el tiempo que paso
    // en ejecución.

    setProcesoEjecucion({
      ...procesoEjecucion,
      tiempoTranscurrido: procesoEjecucion.tiempoTranscurrido + 1,
      tiempoRestante:
        procesoEjecucion.TME - procesoEjecucion.tiempoTranscurrido - 1,
      tiempoServicio: procesoEjecucion.tiempoServicio + 1,
      tiempoRetorno: procesoEjecucion.tiempoRetorno + 1,
      tiempoFinalizacion:
        procesoEjecucion.tiempoLlegada + procesoEjecucion.tiempoRetorno + 1
    });
  };

  /**
   * Se manda a llamar cada time interval
   * Actualiza el state de los procesos Bloqueados
   */
  const updateStateProcesosBloqueados = () => {};

  const countProcesosEnMemoria = () => {
    let t = procesosListos.length + procesosBloqueados.length;
    if (procesoEjecucion.numeroPrograma == 0) {
      t += 1;
    }
    return t;
  };

  /**
   * Interval hook para controlar el tiempo
   */
  useInterval(mainLogicInterval, !stopped ? timeInterval : null);

  const pushProcesoToFinalizadoByError = () => {
    // Tomar el proceso en ejecución y mandarlo a
    // la lista de procesosFinalizados
    if (procesoEjecucion) {
      const copyP = Object.assign({}, procesoEjecucion);
      copyP.resultadoOperacion = "Error";
      setProcesoEjecucion(copyP);
      moveProcesoToFinalizado(copyP);
    }
  };

  const pushProcesoToLoteByInterrupcion = () => {
    // if (procesoEjecucion) {
    //   const copyP = Object.assign({}, procesoEjecucion);
    //   const copyCurrentLote: Partial<ILote> = Object.assign({}, loteActivo);
    //   if (copyCurrentLote.procesos) {
    //     copyCurrentLote.procesos.push(procesoEjecucion);
    //   } else {
    //     copyCurrentLote.procesos = [procesoEjecucion];
    //   }
    //   console.log("current", copyCurrentLote);
    //   setLoteActivo(copyCurrentLote);
    //   moveFromLoteToEjecucion(copyCurrentLote);
    // }
  };

  // useEffect(() => {
  //   // Simplemente es para inicializar el primer proceso
  //   if (lotes.length !== 0 || loteActivo) {
  //     if (!c) {
  //       setC(true);
  //       const p = shiftProceso(false);
  //       setProcesoEjecucion({
  //         ...p,
  //         tiempoTranscurrido: 0,
  //         tiempoRestante: p.TME
  //       });
  //     }
  //   }
  // }, [lotes]);

  const shiftProceso = (l: any) => {
    // let copyCurrentLote;
    // if (l) {
    //   copyCurrentLote = l;
    // } else {
    //   copyCurrentLote = Object.assign({}, loteActivo);
    // }
    // console.log("currentLote", copyCurrentLote);
    // let proceso: any = null;
    // if (copyCurrentLote.procesos) proceso = copyCurrentLote.procesos.shift();
    // if (copyCurrentLote.procesos?.length === 0) {
    //   console.log("ya no tengo", copyCurrentLote.procesos.length);
    //   const tmpLotes = JSON.parse(JSON.stringify(lotes));
    //   const tmpLote = tmpLotes.shift();
    //   console.log("actual lotes", lotes);
    //   console.log("new lotes", tmpLotes);
    //   setLotes(tmpLotes);
    //   setLoteActivo(tmpLote);
    // } else {
    //   setLoteActivo(copyCurrentLote);
    // }
    // console.log("el proceso shift", proceso);
    // return proceso;
  };

  return (
    <Container>
      <Row>
        <Col>
          <Row>
            <Col>
              <h2>Procesos Nuevos: {procesosNuevos.length}</h2>
              <hr />
            </Col>
          </Row>
          <Row>
            <h6>Procesos Listos</h6>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TME</th>
                  <th>TT</th>
                </tr>
              </thead>
              <tbody>
                {procesosListos.map(proceso => (
                  <tr key={proceso.numeroPrograma}>
                    <td>{proceso.numeroPrograma}</td>
                    <td>{proceso.TME}</td>
                    <td>{proceso.tiempoTranscurrido}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Row>
        </Col>
        <Col>
          <Row>
            <Col>
              <h2>Proceso en Ejecución</h2>
              <hr />
            </Col>
          </Row>
          <Row>
            <Col>
              <Table striped bordered hover size="sm">
                <tbody>
                  <tr>
                    <td>Número de programa</td>
                    <td>
                      {procesoEjecucion?.numeroPrograma == -1
                        ? ""
                        : procesoEjecucion?.numeroPrograma}
                    </td>
                  </tr>
                  <tr>
                    <td>Operación a Realizar</td>
                    <td>{procesoEjecucion?.operacionRealizar}</td>
                  </tr>
                  <tr>
                    <td>Tiempo Máximo estimado</td>
                    <td>
                      {procesoEjecucion?.TME == -1 ? "" : procesoEjecucion?.TME}
                    </td>
                  </tr>
                  <tr>
                    <td>Tiempo Transcurrido</td>
                    <td>
                      {procesoEjecucion?.tiempoTranscurrido == -1
                        ? ""
                        : procesoEjecucion?.tiempoTranscurrido}
                    </td>
                  </tr>
                  <tr>
                    <td>Tiempo Restante</td>
                    <td>
                      {procesoEjecucion?.tiempoRestante == -1
                        ? ""
                        : procesoEjecucion?.tiempoRestante}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
        <Col>
          <h2>Procesos Finalizados</h2>
          <hr />
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>N° Programa</th>
                <th>TME</th>
                <th>TT</th>
                <th>Operación</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {procesosFinalizados.map(p => {
                return (
                  <tr key={p.numeroPrograma}>
                    <td>{p.numeroPrograma}</td>
                    <td>{p.TME}</td>
                    <td>
                      {p.resultadoOperacion === "Error"
                        ? p.tiempoTranscurrido
                        : p.tiempoTranscurrido}
                    </td>
                    <td>{p.operacionRealizar}</td>
                    <td>{p.resultadoOperacion}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col className="margin-auto text-center">
          <h3>Contador: {time}</h3>
        </Col>
      </Row>
    </Container>
  );
};

export default TaskManager;
