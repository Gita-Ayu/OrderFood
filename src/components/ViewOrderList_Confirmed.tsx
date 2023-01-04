import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CartPage_Main } from "./CartPage_Main";
import { Context } from "../context/Context";
import { CartPage_Context } from "../context/CartPage_Context";
import { CartPage_ConfirmedOrder } from "./CartPage_ConfirmedOrder";
import axios from "axios";
import { Button, Collapse, Pagination, Spin } from "antd";
import { PlusCircleTwoTone } from "@ant-design/icons";

interface Props {
  orderId: number;
  tableId: number;
  tableName: string;
  totalItemInCart: number;
  setTotalItemInCart: (totalItemInCart: number) => void;
  setOrderId: (totalItemInCart: number) => void;
  takeAway:number,
  setTakeAway: (takeAway: number) => void,
  menuId?: number,
}

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



export const ViewOrderList_Confirmed = ({
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
const [carts, setCarts] = useState<Cart[]>([]);
const [totalPrice, setTotalPrice] = useState<number>(0);
const [subTotal, setSubTotal] = useState<number>(0);
const [gst, setGST] = useState<number>(0);
const [service_charges, setServiceCharges] = useState<number>(0);
const [gst_percentage, setGSTPercentage] = useState<number>(0);
const [service_charges_percentage, setServiceChargesPercentage] = useState<number>(0);
const [loading, setLoading] = useState<boolean>(false);
//const [orderList, setOrderList] = useState<Record<number, Cart>>({});
const [orderList, setOrderList] = useState<Record<number, Order>>({});

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

    const thisTable = await axios.get<Cart[]>(
      process.env.REACT_APP_API_BASE_URL + "cart/getConfirmedList/" + tableId
    );

    let c: Cart[] = [];
    let order_list: Record<number, Order> = {};
    let i:number = 0;


    if (thisTable.data.length !== 0) {
    {thisTable.data.forEach((a:any)=>{
      if(a!=null){
        a.forEach((b:Cart)=>{
          if(b!=null){
            c.push(b);

            order_list = ({
              ...order_list,
              [b.order_id]: b.orders
            });

          }
        })
      }
    })}

      setOrderList(order_list);
      setCarts(c);
    }
    setLoading(false);
  };

  const { Panel } = Collapse;

  return(
    <div className="flex justify-center text-center">
      <Spin spinning={loading}>
          <Button
            icon={<PlusCircleTwoTone />}
            type="primary"
            onClick={() => handleNavigateToTable()}
          >
            Add More Item
          </Button>
          
          <div className="px-5 py-2 mt-3 w-full text-gray-700">
          <h2 className="text-lg mb-3 text-center">
                 Your Order ({takeAway == 0? "Dine In": "Take Away"})
          </h2>


          {Object.entries(orderList).length==0?
          (<div className="mb-4">Nothing here, please place an order.</div>):(

          <>
        
            <div className="mb-10">
       
              {Object.entries(orderList).reverse().map((key, pos) =>
                <div key={pos}> 
                    {carts.length > 0 ? (
                    <>
                      <Collapse defaultActiveKey={[`${key[1].id}`]} >
                        <Panel header={`Order #${key[1].id}`} key={key[1].id} style={{width:290}}>
                          <div className="flex flex-col justify-between ">
                            <div className="text-left flex-wrap">
                            
                            {carts.map((p, pos) => p.order_id == key[1].id && p.main_item_id === 0 ? 
                            <div key={pos}>
                            <div className="flex flex-col justify-between pb-2">
                              <div className="text-left w-3/4 font-bold ">
                                {p.item.item_name} ({p.quantity})
                              </div>
                            <div>
                              {p.item.unit_price!=0? (<div className="text-right">${Number(p.item.unit_price).toFixed(2)}</div>):(
                              <div className="">
                                {carts.map((q, pos) => q.main_item_id == p.id  ? (
                                  <div key={pos}>
                                  <div className="flex justify-between">
                                  <div className="text-left pr-1">
                                    {q.item.item_name} {q.sub_quantity!=0?(<>({q.sub_quantity})</>):""}
                                  </div>
                                  <div className="text-right">
                                    {q.sub_quantity!=0?(<>$ {Number(q.item.unit_price * q.sub_quantity).toFixed(2)}</>):(
                                      <>{q.item.unit_price!=0?(<div>${Number(q.item.unit_price).toFixed(2)}</div>):"Free"}</>
                                    )}

                                    </div>
                                  </div>
                                </div>
                                ):"")}
                              </div>
                              )}
                            </div>
                            </div>
                            </div>
                            :("")
                            )}


                            </div>
                          </div>
                          <hr className="my-1" />
                          <div className="text-right">
                            <div>SubTotal : ${Number(key[1].sub_total).toFixed(2)}</div>
                                {key[1].service_charges != 0 ? (
                                  <div>
                                    S/C ({key[1].service_charges_percentage}
                                    %): ${Number(key[1].service_charges).toFixed(2)}
                                  </div>
                                ) : (
                                  ""
                                )}{" "}
                                GST ({key[1].gst_percentage}%) : ${Number(key[1].gst).toFixed(2)}
                                {key[1].total_price != 0 ? (
                                  <div className="font-bold">
                                    Total Price: ${Number(key[1].total_price).toFixed(2)}
                                  </div>
                                ) : (
                                  ""
                                )}
                          </div>     
                        </Panel>
                      </Collapse>    
                    </>
                    ):""}
                </div>
              )}
            </div>
          </>
          )}
        </div>
      </Spin>
    </div>
  )
}