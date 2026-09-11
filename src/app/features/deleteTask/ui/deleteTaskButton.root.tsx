import { TrashIcon } from "lucide-react";
import { MouseEventHandler } from "react";

export default function DeleteButton(props: Readonly<{ onClick: MouseEventHandler<HTMLButtonElement> }>) {
  return (
    <button id="deleteTask" onClick={props.onClick}>
      <TrashIcon />
    </button>
  )
}
