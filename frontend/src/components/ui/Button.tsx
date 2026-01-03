import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
}

const Button = ({variant = "primary", ...props}: ButtonProps) => {
    const base = 
        "px-4 py-2 rounded-lg font-medium transition disabled:opacity-50";

    const styles = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
        <button className={`${base} ${styles[variant]}`} {...props} />
    );
};

export default Button;