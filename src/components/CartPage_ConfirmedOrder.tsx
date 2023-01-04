import { useContext } from "react";
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
  takeAway:number,
  tableName:string,
  carts:Cart[],
  subTotal:number,
  service_charges:number,
  service_charges_percentage:number,
  gst_percentage:number,
  gst:number,
  totalPrice:number,
}

export const CartPage_ConfirmedOrder = ({
  takeAway,
  tableName,
  carts,
  subTotal,
  service_charges,
  service_charges_percentage,
  gst_percentage,
  gst,
  totalPrice,
}: Props) => {

    return(<>

    <div className="mx-5 py-2 mt-2 mb-4 md:w-1/2 w-full px-5 border-gray-200 border-2 rounded-lg">
            <div className="font-bold text-lg  mb-1 text-center">
              Your Order ({takeAway == 0 ? "Dine In" : "Take Away"})
            </div>
            <div className="text-center font-bold mb-2">
              Table No.: {tableName}
            </div>
            {carts.length > 0 ? (
              <div className="">
                {carts.map((p, pos) =>
                  p.main_item_id === 0 ? (
                    <div key={pos}>
                      <hr className="my-1" />
                      <div className="w-full">
                        <div className="flex flex-row justify-between">
                          <div className="font-bold">
                            {p.item.item_name} ({p.quantity})
                          </div>
                          {Number(p.item.unit_price) != 0 ? (
                            <div className=" ">
                              ${Number(p.item.unit_price).toFixed(2)}
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>

                      <div className="my-1">
                        {carts.map((q, pos) =>
                          q.main_item_id === p.id ? (
                            <div key={pos} className="">
                              <div className="flex flex-row justify-between">
                                <div className="w-full mr-2">
                                  {q.item.category_id ==
                                  Number(
                                    process.env.REACT_APP_ADD_ON_CATEGORY_ID
                                  ) ? (
                                    <div className="text-xs">
                                      * {q.item.item_name} ({q.sub_quantity})
                                    </div>
                                  ) : (
                                    <> {q.item.item_name}</>
                                  )}
                                </div>
                                {Number(q.item.unit_price) != 0 ? (
                                  <div className="">
                                    {q.item.category_id ==
                                    Number(
                                      process.env.REACT_APP_ADD_ON_CATEGORY_ID
                                    ) ? (
                                      <>
                                        $
                                        {Number(
                                          q.item.unit_price * q.sub_quantity
                                        ).toFixed(2)}
                                      </>
                                    ) : (
                                      <>
                                        ${Number(q.item.unit_price).toFixed(2)}
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <div className="">Free</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            ""
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    ""
                  )
                )}
                <div className="text-right">
                  <hr className="my-1" />
                  <div className="">
                    <div>SubTotal : ${Number(subTotal).toFixed(2)}</div>
                    {service_charges != 0 ? (
                      <div>
                        S/C ({service_charges_percentage}%) : $
                        {Number(service_charges).toFixed(2)}
                      </div>
                    ) : (
                      ""
                    )}{" "}
                    GST ({gst_percentage}%) : ${Number(gst).toFixed(2)}
                    {totalPrice != 0 ? (
                      <div className="font-bold mb-2">
                        Total Price: ${Number(totalPrice).toFixed(2)}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>

    </>)

}
