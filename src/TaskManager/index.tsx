import React from "react";
import { IProceso } from "../App";

interface Props {
  procesos: IProceso[];
}
const TaskManager: React.FC<Props> = props => {
  console.log("los procesos", props.procesos);
  return <div>hey</div>;
};

export default TaskManager;
