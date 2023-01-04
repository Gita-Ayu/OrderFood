import {useContext, useMemo} from "react";
import QRCode from 'react-qr-code';

import { CartPage_Main } from "../components/CartPage_Main";
import { Context } from "../context/Context";

export const CartPage = () => {
  const {
    orderId,
    tableId,
    tableName,
    totalItemInCart,
    setTotalItemInCart,
    setOrderId,
    takeAway,
    setTakeAway,
    menuId
  } = useContext(Context);

  return (
    <div>
      <CartPage_Main
        orderId={orderId}
        tableId={tableId}
        tableName={tableName}
        totalItemInCart={totalItemInCart}
        setTotalItemInCart={setTotalItemInCart}
        setOrderId={setOrderId}
        takeAway={takeAway}
        setTakeAway={setTakeAway}
        menuId={menuId}
      />
    </div>
  );
};
