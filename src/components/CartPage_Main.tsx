import {
  EyeOutlined,
  MinusCircleFilled,
  PlusCircleFilled,
  PlusCircleOutlined,
  PlusCircleTwoTone,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Input,
  message,
  Modal,
  Radio,
  Spin,
} from "antd";
import axios from "axios";
import {useContext, useEffect, useMemo, useState} from "react";
import { useNavigate } from "react-router-dom";
import dotenv from "dotenv";
import { VscTrash } from "react-icons/vsc";
import { CartPage_ConfirmedOrder } from "./CartPage_ConfirmedOrder";
import { CartPage_UnconfirmedOrder } from "./CartPage_UnconfirmedOrder";
import { CartPage_Context } from "../context/CartPage_Context";
import QRCode from "react-qr-code";

dotenv.config();

interface SubItemCategory extends Category {
  items: Item[];
}

interface Order {
  id: number;
  total_price: number;
  sub_total: number;
  status: string;
  table_id: number;
  gst: number;
  service_charges: number;
  gst_percentage: number;
  service_charges_percentage: number;
  take_away: boolean;
}

interface Item {
  id: number;
  item_name: string;
  unit_price: number;
  picture: string;
  category_id: number;
  parent_id: number;
  description: string;
  category: Category;
  quantity: number;
  sub_quantity: number;
}

interface Category {
  id: number;
  category_name: string;
  type: string;
  subtype: string;
  allow_more_quantity: boolean;
}

export interface Cart {
  id: number;
  quantity: number;
  sub_quantity: number;
  item_id: number;
  order_id: number;
  main_item_id: number;
  orders: Order;
  item: Item;
}

interface Props {
  orderId: number;
  tableId: number;
  menuId?: number;
  tableName: string;
  totalItemInCart: number;
  setTotalItemInCart: (totalItemInCart: number) => void;
  setOrderId: (orderId: number) => void;
  takeAway:number,
  setTakeAway: (takeAway: number) => void,
}

message.config({
  duration: 1,
  maxCount: 1,
});

export const CartPage_Main = ({
  orderId,
  tableId,
  menuId,
  tableName,
  totalItemInCart,
  setTotalItemInCart,
  setOrderId,
  takeAway,
  setTakeAway,
}: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [confirmedOrderId, setConfirmedOrderId] = useState(0);

  const [chosenItem, setChosenItem] = useState<Record<number, any>>({});
  const [confirmOrderSuccessful, setConfirmOrderSuccessful] = useState<boolean>(false);
  const [mainCart_ItemId, setMainCart_ItemId] = useState<number>(0);
  const [visibleConfirmedOrder, setVisibleConfirmedOrder] = useState(false);

  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [gst, setGST] = useState<number>(0);
  const [service_charges, setServiceCharges] = useState<number>(0);
  const [gst_percentage, setGSTPercentage] = useState<number>(0);
  const [service_charges_percentage, setServiceChargesPercentage] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [visibleUpdateQuantityModal, setVisibleUpdateQuantityModal] = useState(false);
  const [newCartId, setNewCartId] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [userName, setUserName] = useState('');

  const handleAllItem = async (cartId: number) => {
    try {
      const res = await axios.delete(
        process.env.REACT_APP_API_BASE_URL +
          "cart/deleteAllBymainCart/" +
          cartId
      );

      setTotalItemInCart(totalItemInCart - res.data);

      fetchItems();
      message.success("Successfully Deleted");

      setVisibleUpdateQuantityModal(false);
    } catch (e) {
      message.error("Sorry, it cannot be deleted");
    }
  };

const handleCancelAllOrder = async () => {
  try {
    const res = await axios.delete(
        process.env.REACT_APP_API_BASE_URL + "cart/deleteByOrder/" + orderId
    );

    setOrderId(0);
    setTotalItemInCart(0);
    window.localStorage.removeItem('orderIdsData');
    setCarts([]);
  } catch (e) {

  }
};

const handleNavigateToTable = () => {
  const tableMenu = [tableId];
  if (menuId) tableMenu.push(menuId);

  navigate('/jianghu/table/' + tableMenu.join('/'));
}

//Initial Page Load
useEffect(() => {
  fetchItems();
}, []);

  const fetchItems = async () => {
    setLoading(true);

    const thisCart = await axios.get<Cart[]>(
      process.env.REACT_APP_API_BASE_URL + "cart/getUnconfirmedList/" + orderId
    );
    if (thisCart.data.length == 0) {
      setTotalItemInCart(0);
    }

    setCarts(thisCart.data);

    const latestOrderData = await axios.get<Order>(
      process.env.REACT_APP_API_BASE_URL + "order/get/" + orderId
    );

    if (Object.keys(chosenItem).length == 0 && thisCart.data.length == 0) {
      setSubTotal(0);
      setTotalPrice(0);
      setGST(0);
      setServiceCharges(0);
    } else {
      setSubTotal(latestOrderData.data.sub_total);
      setTotalPrice(latestOrderData.data.total_price);
      setGST(latestOrderData.data.gst);
      setServiceCharges(latestOrderData.data.service_charges);
    }

    //to initiate page
    if (thisCart.data.length !== 0) {

      setGSTPercentage(thisCart.data[0].orders.gst_percentage);
      setServiceChargesPercentage(thisCart.data[0].orders.service_charges_percentage);
      thisCart.data[0].orders.take_away == true ? setTakeAway(1):  setTakeAway(0)

    }

    setLoading(false);

  };


  const qrCodeString = useMemo(() => {
    return `#${confirmedOrderId || ''}`
  }, [confirmedOrderId]);

  const printOrderId = useMemo(() => {
    if (!confirmedOrderId) return '';
    const orderIdString = `${confirmedOrderId}`;
    const orderIdCut = orderIdString.substring(orderIdString.length - 3);

    return `#${orderIdCut}`;
  }, [confirmedOrderId])

  return (
    <div className="">
      <CartPage_Context.Provider
       value={{
        orderId,
        loading,
        setLoading,
        carts,
        takeAway,
        subTotal,
        totalPrice,
        gst,
        gst_percentage,
        service_charges,
        service_charges_percentage,
        handleAllItem,
        handleCancelAllOrder,
        confirmOrderSuccessful,
        setVisibleConfirmedOrder,
        setConfirmOrderSuccessful,
        setTotalItemInCart,
        fetchItems,
        totalItemInCart,
        quantity,
        setQuantity

      }}>

      {confirmOrderSuccessful == true && visibleConfirmedOrder == true? (
        <Alert
          message="Success"
          description="Your order is confirmed."
          type="success"
          showIcon
        />
      ) : (
        ""
      )}

      {confirmOrderSuccessful == false && visibleConfirmedOrder == true? (
        <Alert
          message="Error"
          description="Your order cannot be confirmed. Please contact administrator."
          type="error"
          showIcon
        />
      ) : (
        ""
      )}

      <div className="text-center mb-2">
        {confirmOrderSuccessful == true && visibleConfirmedOrder == true? (

            <Button
                icon={<PlusCircleTwoTone />}
                type="primary"
                className="mt-4"
                onClick={() => handleNavigateToTable()}
            >
              Place New Order
            </Button>
        ) : (

            <Button
                icon={<PlusCircleTwoTone />}
                type="primary"
                className="mt-4"
                onClick={() => handleNavigateToTable()}
            >
              Add More Items
            </Button>
        )}


      </div>

      <div className="flex justify-center ">
        {visibleConfirmedOrder == true ? (
         <>
          <CartPage_ConfirmedOrder
            takeAway={takeAway}
            tableName={tableName}
            carts={carts}
            subTotal={subTotal}
            service_charges={service_charges}
            service_charges_percentage={service_charges_percentage}
            gst_percentage={gst_percentage}
            gst={gst}
            totalPrice={totalPrice}
          />
         </>
        ) : (
          <><CartPage_UnconfirmedOrder
          orderId={orderId}
          setOrderId={setOrderId}
          setConfirmedOrderId={setConfirmedOrderId}
          loading={loading}
          setLoading={setLoading}
          carts={carts}
          takeAway={takeAway}
          subTotal={subTotal}
          totalPrice={totalPrice}
          gst={gst}
          gst_percentage={gst_percentage}
          service_charges={service_charges}
          service_charges_percentage={service_charges_percentage}
          handleAllItem={handleAllItem}
          handleCancelAllOrder={handleCancelAllOrder}
          confirmOrderSuccessful={confirmOrderSuccessful}
          setVisibleConfirmedOrder={setVisibleConfirmedOrder}
          setConfirmOrderSuccessful={setConfirmOrderSuccessful}
          setTotalItemInCart={setTotalItemInCart}
          fetchItems={fetchItems}
          totalItemInCart={totalItemInCart}
          visibleUpdateQuantityModal={visibleUpdateQuantityModal}
          setVisibleUpdateQuantityModal={setVisibleUpdateQuantityModal}
          quantity={quantity}
          setQuantity={setQuantity}
          userName={userName}
          setUserName={setUserName}
          />
          </>
         )}
      </div>
{/*
      {(visibleConfirmedOrder && confirmedOrderId) && (
        <div style={{ marginTop: '6px'}}>
          <p className="text-lg"
             style={{textAlign: 'center', fontWeight: 'bold'}}>Please don't close this window
          </p>
          <div style={{ height: "auto", margin: "0 auto", maxWidth: "75%" }}>
            <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%", border: "5px solid black", padding: "14px" }}
                value={qrCodeString}
                viewBox={`0 0 256 256`}
            />
          </div>
          <p className={"text-lg text-center text-3xl font-black mt-4 mb-1"} >{printOrderId}</p>
          <p className="text-center mt-1"><span style={{ fontWeight: 400 }}>TABLE:</span> {tableId} / NAME: {userName}</p>
        </div>
      )}
*/}
      </CartPage_Context.Provider>
    </div>
  );
};
