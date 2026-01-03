import { type ReactNode } from "react";

const Card = ({ children }: { children: ReactNode}) => {
    return (
        <div className="bg-white rounded-x1 shadow-sm p-6">
            {children}
        </div>
    );
};

export default Card;