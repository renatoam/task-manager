import { ButtonHTMLAttributes, MouseEvent } from "react";

interface FilterButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function FilterButton(props: Readonly<FilterButtonProps>) {
  const { onClick, children, ...rest } = props;
  return (
    <button {...rest} type="button" onClick={onClick}>{children}</button>
  )
}
