import { ReactNode } from "react";

type ButtonProps = {
  children?: ReactNode;
  type?: "button" | "submit";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: "blue" | "inverse";
};

function Button(props: ButtonProps) {
  const { children, onClick, variant = "blue", type = "button" } = props;

  const classes = {
    blue: "text-white bg-blue-500 hover:bg-blue-300 focus:ring-4 focus:outline-none font-medium rounded-sm text-md px-4 py-2 text-center",
    inverse:
      "text-white bg-blue-500 hover:bg-blue-300 border-2 border-white focus:ring-4 focus:outline-none font-medium rounded-sm text-md px-4 py-2 text-center",
  };

  return (
    <button type={type} className={classes[variant]} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
