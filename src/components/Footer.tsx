import { useContext } from "react";
import { Context } from "../context/Context";
import { useNavigate } from "react-router-dom";

export function Footer() {
    const navigate = useNavigate();
    const { orderId, totalItemInCart } = useContext(Context);

    return (
        <div className="text-center bg-red-600 text-white">
            <div className="font-bold ml-2 p-2 justify-center">
                CooBiz Solutions - v1.06.2
            </div>
        </div>
    );
}
