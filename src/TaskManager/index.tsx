import React, { useEffect, useState, useRef } from "react";
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
  const [loteActivo, setLoteActivo] = useState<ILote[]>([]);
  const [c, setC] = useState<boolean>(false);
  const [stopped, setStopped] = useState<boolean>(false);
  const [procesosFinalizado, setProcesosFinalizado] = useState<IProceso[]>([]);
  const [procesoEjecucion, setProcesoEjecucion] = useState<
    { tiempoTranscurrido: number } & IProceso
  >();
  const [time, setTime] = useState<number>(0);
  const timeInterval = 1000;

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
    setLotes(tmpLotes);
    setStaticLotes(tmpLotes);
  }, []);

  const getLoteId = (proceso: IProceso) => {
    const lote = staticLotes.filter(l =>
      l.procesos.find(p => p.numeroPrograma == proceso.numeroPrograma)
    );
    return lote[0];
  };

  useInterval(
    () => {
      if (procesoEjecucion) {
        if (procesoEjecucion?.TME === procesoEjecucion.tiempoTranscurrido + 1) {
          setProcesosFinalizado([...procesosFinalizado, procesoEjecucion]);
          const p = shiftProceso();
          if (p) {
            setProcesoEjecucion({ ...p, tiempoTranscurrido: 0 });
          } else {
            setStopped(true);
            setProcesoEjecucion({
              operacionRealizar: "",
              resultadoOperacion: "",
              tiempoTranscurrido: -1,
              TME: -1,
              numeroPrograma: -1
            });
          }
        } else {
          setProcesoEjecucion({
            ...procesoEjecucion,
            tiempoTranscurrido: procesoEjecucion.tiempoTranscurrido
              ? procesoEjecucion.tiempoTranscurrido + 1
              : 1
          });
        }
      }
      setTime(time => time + 1);
      if (!procesoEjecucion) setStopped(true);
    },
    !stopped ? timeInterval : null
  );

  useEffect(() => {
    if (lotes.length !== 0) {
      if (!c) {
        setC(true);
        const p = shiftProceso();
        setProcesoEjecucion({ ...p, tiempoTranscurrido: 0 });
      }
    }
  }, [lotes]);

  const shiftProceso = () => {
    const copyLotes = JSON.parse(JSON.stringify(lotes));
    const newLotes: ILote[] = [];
    let proceso: any = null;
    let r = false;
    copyLotes.map((lote: ILote) => {
      if (!r) {
        if (lote.procesos.length > 0) {
          //@ts-ignore
          proceso = lote.procesos.shift();
          r = true;
        }
        if (lote.procesos.length > 0) newLotes.push(lote);
      } else {
        newLotes.push(lote);
      }
    });
    setLotes(newLotes);
    return proceso;
  };

  return (
    <Container>
      <Row>
        <Col>
          <Row>
            <Col>
              <h2>Lotes</h2>
              <hr />
            </Col>
          </Row>
          {lotes.map(lote => {
            return (
              <Row key={lote.id}>
                <h6>Lote #{lote.id}</h6>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>TME</th>
                      <th>TT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lote.procesos.map(lote => {
                      return (
                        <tr key={lote.numeroPrograma}>
                          <td>{lote.numeroPrograma}</td>
                          <td>{lote.TME}</td>
                          <td>{lote.TME}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Row>
            );
          })}
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
                      {procesoEjecucion?.tiempoTranscurrido == -1
                        ? ""
                        : procesoEjecucion &&
                          procesoEjecucion.TME &&
                          procesoEjecucion.tiempoTranscurrido
                        ? procesoEjecucion.TME -
                          procesoEjecucion.tiempoTranscurrido
                        : procesoEjecucion?.tiempoTranscurrido}
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
