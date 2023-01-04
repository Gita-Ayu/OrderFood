import { useContext } from "react";
import { useParams } from "react-router-dom";
import { ViewOrderList_Confirmed } from "../components/ViewOrderList_Confirmed";
import { Context } from "../context/Context";

export const ViewOrderPage = () => {
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
      <ViewOrderList_Confirmed
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
