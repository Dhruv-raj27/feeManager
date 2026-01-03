import { type SelectHTMLAttributes } from "react";

const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => {
    return (
        <select
            {...props}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    );
};

export default Select;