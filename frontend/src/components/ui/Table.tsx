import { type ReactNode } from "react";

const Table = ({ children }: { children: ReactNode }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                {children}
            </table>
        </div>
    );
};

export default Table;