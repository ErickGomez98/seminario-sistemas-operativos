import React, { useEffect, useState, useRef, useCallback } from "react";
import { IProceso, ILote } from "../App";
import { Container, Row, Col, Table } from "react-bootstrap";
interface Props {
  procesos: IProceso[];
}

const chunk = (array: any, size: any) => {
  const chunked_arr = [];
  for (let i = 0; i < array.length; i++) {
    const last = chunked_arr[chunked_arr.length - 1];
    if (!last || last.length === size) {
      chunked_arr.push([array[i]]);
    } else {
      last.push(array[i]);
    }
  }
  return chunked_arr;
};

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

const TaskManager: React.FC<Props> = props => {
  const [lotes, setLotes] = useState<ILote[]>([]);
  const [staticLotes, setStaticLotes] = useState<ILote[]>([]);
  const [loteActivo, setLoteActivo] = useState<Partial<ILote>>();
  const [c, setC] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [stopped, setStopped] = useState<boolean>(false);
  const [keyEvent, setKeyEvent] = useState<any>();
  const [procesosFinalizado, setProcesosFinalizado] = useState<IProceso[]>([]);
  const [internalClock, setinternalClock] = useState<number>(0);
  const [procesoEjecucion, setProcesoEjecucion] = useState<IProceso>();
  const [time, setTime] = useState<number>(0);
  const timeInterval = 100;

  useEffect(() => {
    const arr = chunk(props.procesos, 5);
    const tmpLotes: ILote[] = [];
    arr.map((v, k) => {
      const tmpLote: ILote = {
        id: k + 1,
        maxProcesos: 5,
        procesos: v
      };
      tmpLotes.push(tmpLote);
    });
    const t = JSON.parse(JSON.stringify(tmpLotes));
    if (tmpLotes.length > 0) setLoteActivo(tmpLotes.shift());
    setLotes(tmpLotes);
    setStaticLotes(t);
    console.log("lotes", tmpLotes);
    console.log("staticlotes", t);

    document.addEventListener("keydown", keyDetectFunction, false);

    return () => {
      document.removeEventListener("keydown", keyDetectFunction, false);
    };
  }, []);

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
            console.log("interrupcion");
            pushProcesoToLoteByInterrupcion();
          }
        } else if (key === "c" || key === "C") {
          // Solo cuando está detenido ejecutar la acción
          if (stopped) {
            if (!shouldFinish()) {
              console.log("continuar");
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

  const getLoteId = (proceso: IProceso) => {
    const lote = staticLotes.filter(l =>
      l.procesos.find(p => p.numeroPrograma == proceso.numeroPrograma)
    );
    return lote[0];
  };

  const shouldFinish = () => {
    return (
      procesosFinalizado.length ===
      staticLotes.reduce((count, lote) => count + lote.procesos.length, 0)
    );
  };

  const moveFromLoteToEjecucion = (currentLote: any) => {
    const p = shiftProceso(currentLote);

    if (p) {
      console.log("AVEEER", p);
      setProcesoEjecucion({
        ...p,
        tiempoTranscurrido: p.tiempoTranscurrido ? p.tiempoTranscurrido : 0,
        tiempoRestante: p.tiempoRestante ? p.tiempoRestante : p.TME
      });
    } else {
      setStopped(true);
      setProcesoEjecucion({
        operacionRealizar: "",
        resultadoOperacion: "",
        tiempoTranscurrido: -1,
        TME: -1,
        numeroPrograma: -1,
        tiempoRestante: -1
      });
    }
  };

  const moveProcesoToFinalizado = (proceso: any) => {
    if (procesoEjecucion) {
      if (proceso) {
        //@ts-ignore
        const pro: IProceso = proceso;
        setProcesosFinalizado([...procesosFinalizado, pro]);
      } else {
        setProcesosFinalizado([...procesosFinalizado, procesoEjecucion]);
      }
      moveFromLoteToEjecucion(undefined);
    }
  };

  useInterval(
    () => {
      // Finaliza cuando la cantidad de procesos terminados es igual
      // a la cantidad de procesos iniciales
      if (shouldFinish()) {
        console.log("aaaaaaaaaa");
        setFinished(true);
        setStopped(true);
      } else {
        if (procesoEjecucion) {
          if (
            procesoEjecucion?.TME ===
            procesoEjecucion.tiempoTranscurrido + 1
          ) {
            moveProcesoToFinalizado(null);
          } else {
            setProcesoEjecucion({
              ...procesoEjecucion,
              tiempoTranscurrido: procesoEjecucion.tiempoTranscurrido
                ? procesoEjecucion.tiempoTranscurrido + 1
                : 1,
              tiempoRestante:
                procesoEjecucion.TME - procesoEjecucion.tiempoTranscurrido - 1
            });
          }
        } else {
          console.log("ya se acabo");
        }
      }

      // if (!finished && !stopped) {
      //   if (procesoEjecucion) {
      //     console.log("TME", procesoEjecucion.TME);
      //     console.log("TTrans", procesoEjecucion.tiempoTranscurrido);
      //     console.log(
      //       "waaa",
      //       procesoEjecucion.TME - procesoEjecucion.tiempoTranscurrido - 1
      //     );
      //     setProcesoEjecucion({
      //       ...procesoEjecucion,
      //       tiempoTranscurrido: procesoEjecucion.tiempoTranscurrido
      //         ? procesoEjecucion.tiempoTranscurrido + 1
      //         : 1,
      //       tiempoRestante:
      //         procesoEjecucion.TME - procesoEjecucion.tiempoTranscurrido - 1
      //     });
      //   }
      // }

      setTime(time => time + 1);
    },
    !stopped ? timeInterval : null
  );

  // Usado para actualizar datos cada vuelta del timeInterval
  // useInterval(() => {
  //   console.log("xd", stopped);
  //   // Actualizar proceso en ejecución
  //   if (!finished && !stopped) {
  //     if (procesoEjecucion) {
  //       setProcesoEjecucion({
  //         ...procesoEjecucion,
  //         tiempoTranscurrido: procesoEjecucion.tiempoTranscurrido
  //           ? procesoEjecucion.tiempoTranscurrido + 1
  //           : 1,
  //         tiempoRestante:
  //           procesoEjecucion.TME - procesoEjecucion.tiempoTranscurrido - 1
  //       });
  //     }
  //   }

  //   setinternalClock(internalClock => internalClock + 1);
  // }, timeInterval);

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
    if (procesoEjecucion) {
      const copyP = Object.assign({}, procesoEjecucion);
      const copyCurrentLote: Partial<ILote> = Object.assign({}, loteActivo);
      if (copyCurrentLote.procesos) {
        copyCurrentLote.procesos.push(procesoEjecucion);
      } else {
        copyCurrentLote.procesos = [procesoEjecucion];
      }
      console.log("current", copyCurrentLote);
      setLoteActivo(copyCurrentLote);
      moveFromLoteToEjecucion(copyCurrentLote);
    }
  };

  useEffect(() => {
    // Simplemente es para inicializar el primer proceso
    if (lotes.length !== 0 || loteActivo) {
      if (!c) {
        setC(true);
        const p = shiftProceso(false);
        setProcesoEjecucion({
          ...p,
          tiempoTranscurrido: 0,
          tiempoRestante: p.TME
        });
      }
    }
  }, [lotes]);

  const shiftProceso = (l: any) => {
    let copyCurrentLote;
    if (l) {
      copyCurrentLote = l;
    } else {
      copyCurrentLote = Object.assign({}, loteActivo);
    }

    console.log("currentLote", copyCurrentLote);

    let proceso: any = null;
    if (copyCurrentLote.procesos) proceso = copyCurrentLote.procesos.shift();

    if (copyCurrentLote.procesos?.length === 0) {
      console.log("ya no tengo", copyCurrentLote.procesos.length);
      const tmpLotes = JSON.parse(JSON.stringify(lotes));
      const tmpLote = tmpLotes.shift();
      console.log("actual lotes", lotes);
      console.log("new lotes", tmpLotes);
      setLotes(tmpLotes);
      setLoteActivo(tmpLote);
    } else {
      setLoteActivo(copyCurrentLote);
    }
    console.log("el proceso shift", proceso);
    return proceso;
  };
  return (
    <Container>
      <Row>
        <Col>
          <Row>
            <Col>
              <h2>Lotes Restantes: {lotes.length}</h2>
              <hr />
            </Col>
          </Row>
          {loteActivo && (
            <Row key={loteActivo.id}>
              <h6>Lote #{loteActivo.id}</h6>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>TME</th>
                    <th>TT</th>
                    <th>TR</th>
                  </tr>
                </thead>
                <tbody>
                  {loteActivo.procesos &&
                    loteActivo.procesos.map(lote => {
                      return (
                        <tr key={lote.numeroPrograma}>
                          <td>{lote.numeroPrograma}</td>
                          <td>{lote.TME}</td>
                          <td>
                            {lote.tiempoTranscurrido
                              ? lote.tiempoTranscurrido
                              : 0}
                          </td>
                          <td>
                            {lote.tiempoRestante
                              ? lote.tiempoRestante
                              : lote.TME}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            </Row>
          )}
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
                <th># Lote</th>
                <th>N° Programa</th>
                <th>TME</th>
                <th>TT</th>
                <th>Operación</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {procesosFinalizado.map(p => {
                return (
                  <tr key={p.numeroPrograma}>
                    <td>{getLoteId(p).id}</td>
                    <td>{p.numeroPrograma}</td>
                    <td>{p.TME}</td>
                    <td>
                      {p.resultadoOperacion === "Error"
                        ? p.tiempoTranscurrido
                        : p.tiempoTranscurrido + 1}
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
