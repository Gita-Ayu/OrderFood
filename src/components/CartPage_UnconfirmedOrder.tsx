import { useContext, useState } from "react";
import { Context } from "../context/Context";
import { useNavigate } from "react-router-dom";
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
import { VscTrash } from "react-icons/vsc";
import axios from "axios";
import { OrderList_UpdateQuantityModal } from "./CartPage_UpdateQuantityModal";

interface Cart {
  id: number;
  quantity: number;
  sub_quantity: number;
  item_id: number;
  order_id: number;
  main_item_id: number;
  orders: Order;
  item: Item;
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

interface Props {
  orderId:number,
  setOrderId:any,
  loading:boolean,
  setLoading: any,
  carts: Cart[],
  takeAway:number,
  subTotal:number,
  totalPrice:number,
  gst:number,
  gst_percentage:number,
  service_charges:number,
  service_charges_percentage:number,
  handleAllItem:any,
  handleCancelAllOrder:any,
  confirmOrderSuccessful:boolean,
  setVisibleConfirmedOrder:any,
  setConfirmOrderSuccessful:any,
  setTotalItemInCart:any,
  fetchItems:any,
  totalItemInCart:number,
  visibleUpdateQuantityModal:boolean,
  setVisibleUpdateQuantityModal:any,
  quantity:number,
  setQuantity:any,
  setConfirmedOrderId: any,
  userName: string,
  setUserName: any
}

export const CartPage_UnconfirmedOrder = ({
  orderId,
  setOrderId,
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
  visibleUpdateQuantityModal,
  setVisibleUpdateQuantityModal,
  quantity,
  setQuantity,
  setConfirmedOrderId,
  userName,
  setUserName
}: Props) => {

  const [newCartId, setNewCartId] = useState<number>(0);
  const [updatingItem, setUpdatingItem] = useState("");
  const [updatingItemPrice, setUpdatingItemPrice] = useState(0);
  const [updatingItemId, setUpdatingItemId] = useState(0);
  const [mainCart_ItemId, setMainCart_ItemId] = useState<number>(0);
  const [originalQuantity, setOriginalQuantity] = useState(0);

  const handleConfirmOrder = async (orderId: number) => {
    try {
      const res = await axios.post(
          // process.env.REACT_APP_API_BASE_URL + "order/updateStatus/" + orderId, { name: userName.trim() }
        process.env.REACT_APP_API_BASE_URL + "order/updateStatus/" + orderId, { name: "blank" }
      );
      setConfirmOrderSuccessful(true);
      setVisibleConfirmedOrder(true);
      setTotalItemInCart(0);
    } catch (e) {
      setConfirmOrderSuccessful(false);
    }
    //reset order id
    setConfirmedOrderId(orderId);
    setOrderId(0);
    window.localStorage.removeItem('orderIdsData');
  };

  const showEditQuantityForm = (
    id: number,
    itemId: number,
    itemName: string,
    quantity: number,
    unit_price: number
  ) => {
    setNewCartId(id);
    setUpdatingItemId(itemId);
    setMainCart_ItemId(itemId);

    setUpdatingItemPrice(unit_price);
    setUpdatingItem(itemName);

    setQuantity(quantity);
    setOriginalQuantity(quantity)
    setVisibleUpdateQuantityModal(true);
  };

    return(<>

    <div className="mx-10 py-2 mt-3 mb-4 md:w-1/2 w-full px-1">
            <Spin spinning={loading}>

              {carts.length > 0 ? (
                <>
                 <h2 className="text-lg mt-2 mb-3 text-center">
                  Your Order ({takeAway == 0 ? "Dine In" : "Take Away"})
                </h2>
                  {carts.map((p, pos) =>
                    p.main_item_id === 0 ? (
                      <div key={pos}>

                        <div className="flex flex-row w-full mb-3">
                              <div className="md:w-1/12 w-3/12">
                                <Button
                                  danger
                                  size="large"
                                  className="ml-2 mr-2 bg rounded-lg text-2xl"
                                  style={{ backgroundColor: '#DC2626', color: 'white', borderRadius: '5px'}}
                                  onClick={(e) => handleAllItem(p.id)}
                                >
                                  <VscTrash />
                                </Button>
                              </div>

                              <div className="md:w-11/12 w-10/12">
                                <button
                                  style={{ width: "100%" }}
                                  onClick={(e) =>
                                    showEditQuantityForm(
                                      p.id, // this is cart id
                                      p.item.id,
                                      p.item.item_name,
                                      p.quantity,
                                      p.item.unit_price
                                    )
                                  }
                                >
                                <div className="flex justify-between text-gray-500 pt-2">
                                  <div className="text-left font-bold">
                                      {p.item.item_name} ({p.quantity})
                                  </div>
                                  {Number(p.item.unit_price) != 0 ? (
                                    <div className="text-right pr-4">
                                      ${Number(p.item.unit_price).toFixed(2)}
                                    </div>
                                  ) : (
                                  ""
                                  )}
                                </div>

                                <div className="pr-4 my-1 text-sm text-blue-600 w-full ">
                                  {carts.map((q, pos) =>
                                    q.main_item_id === p.id ? (
                                      <div
                                        key={pos}
                                        className="pt-1 w-full flex-1"
                                      >
                                        <div className="flex justify-between">
                                          <div>
                                            {q.item.category_id ==
                                            Number(
                                              process.env
                                                .REACT_APP_ADD_ON_CATEGORY_ID
                                            ) ? (
                                              <div className="text-xs flex-wrap text-left break-normal">
                                                * {q.item.item_name} (
                                                {q.sub_quantity})
                                              </div>
                                            ) : (
                                              <div className="flex-wrap text-left text-gray-500">
                                                {" "}
                                                {q.item.item_name}
                                              </div>
                                            )}
                                          </div>
                                          <div className="mr-2 text-gray-700 font-bold">
                                            {Number(q.item.unit_price) !=
                                            0 ? (
                                              <div className="text-right">
                                                {q.item.category_id ==
                                                Number(
                                                  process.env
                                                    .REACT_APP_ADD_ON_CATEGORY_ID
                                                ) ? (
                                                  <div className="">
                                                    $
                                                    {Number(
                                                      q.item.unit_price *
                                                        q.sub_quantity
                                                    ).toFixed(2)}
                                                  </div>
                                                ) : (
                                                  <div className="">
                                                    $
                                                    {Number(
                                                      q.item.unit_price
                                                    ).toFixed(2)}
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="">Free</div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      ""
                                    )
                                  )}
                                </div>


                                </button>
                            </div>
                      </div>
                      </div>
                    ) : (
                      ""
                    )
                  )}

                  <div className="text-right">
                    <hr className="my-5 border-gray-300" />
                    <div className="md:pr-4 pr-4">
                      <div>SubTotal : ${Number(subTotal).toFixed(2)}</div>
                      {service_charges != 0 ? (
                        <div>
                          S/C ({service_charges_percentage}
                          %): ${Number(service_charges).toFixed(2)}
                        </div>
                      ) : (
                        ""
                      )}{" "}
                      GST ({gst_percentage}%) : ${Number(gst).toFixed(2)}
                      {totalPrice != 0 ? (
                        <div className="font-bold">
                          Total Price: ${Number(totalPrice).toFixed(2)}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
{/*

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ maxWidth: "320px", width: "100%" }}>
                      <input type="text" onChange={(e) => setUserName(e.target.value)} value={userName} className="border-gray-300 border-2 h-14 mt-4 text-center rounded" style={{ width: "100%",outline:"#ff0000" }} placeholder={"Enter your name"}/>
                    </div>
                  </div>
*/}

                  <div className="text-center mt-4 mb-4">
                    <Button
                      type="primary"
                      className="ml-4 mr-4 mt-4 w-80"
                      style={{ height: "50px", backgroundColor:"#DC2626", border:"none", borderRadius:"5px" }}
                      onClick={handleCancelAllOrder}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      className="ml-4 mr-4 mt-4 w-80"
                      style={{ height: "50px", border:"none", borderRadius:"5px" }}
                      onClick={(e) => handleConfirmOrder(orderId)}
                      // disabled={!((userName || '').trim())}
                    >
                      Confirm
                    </Button>
                  </div>
                </>
              ) : (
                <div>
                  <div className="mb-4 text-center">
                    Nothing here, please place an order. <br />
                  </div>
                </div>
              )}
            </Spin>
          </div>

           <OrderList_UpdateQuantityModal
              loading={loading}
              setLoading ={setLoading}
              visibleUpdateQuantityModal={visibleUpdateQuantityModal}
              setVisibleUpdateQuantityModal={setVisibleUpdateQuantityModal}
              handleAllItem = {handleAllItem}
              fetchItems ={fetchItems}
              orderId={orderId}
              newCartId={newCartId}
              mainCart_ItemId={mainCart_ItemId}
              setNewCartId={setNewCartId}
              updatingItemPrice={updatingItemPrice}
              updatingItem = {updatingItem}
              updatingItemId={updatingItemId}
              setTotalItemInCart={setTotalItemInCart}
              totalItemInCart={totalItemInCart}
              quantity={quantity}
              setQuantity ={setQuantity}
              originalQuantity={originalQuantity}
          />


    </>)

}


