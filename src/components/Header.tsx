import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../context/Context";
import { Modal, Button } from "antd";

import dotnev from "dotenv";
dotnev.config();

// interface Props {
//   cookies: string;
//   setCookie: (cookies: string) => void;
//   removeCookie: (cookies: string) => void;
// }

export const Header = () => {
    //export const Header = ({ cookies, setCookie, removeCookie }: Props) => {
    const navigate = useNavigate();
    const { tableName, orderId } = useContext(Context);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
        navigate("/jianghu/");
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        navigate("/jianghu/");
    };

    return (
        <>
            <div className="bg-red-600 text-white justify-between mb-6 z-40 px-2">
                {tableName != null ? (
                    <div className="font-maShanZheng text-2xl text-center pt-1 pb-2" style={{textAlign:"center"}}>
                        {process.env.REACT_APP_SHOP_NAME}
                        <div className="text-xs mt-1" style={{fontFamily:"inter"}}>Table: #{tableName!=""?tableName:"-"} &nbsp; Order: #{orderId === 0 ? "-" : orderId}</div>
                    </div>
                ) : (
                    <div className="font-maShanZheng text-xl text-md p-1 w-full text-center">
                        {process.env.REACT_APP_SHOP_NAME}
                    </div>
                )}
            </div>

            <Modal
                title="Ops ..."
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>The table number does not exist.</p>
            </Modal>
        </>
    );
};
