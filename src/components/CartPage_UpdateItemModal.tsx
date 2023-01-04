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
import axios from "axios";
import { MinusCircleFilled, PlusCircleFilled } from "@ant-design/icons";

interface SubItemCategory extends Category {
  items: Item[];
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
  visibleCustomizeItemModal:boolean,
  setVisibleCustomizeItemModal:any,
  chosenItem:Record<number, any>,
  setChosenItem:any,
  quantity:number,
  mainCart_ItemId:number,
  setNewCartId:any,
  itemModal?:Item,
  subItemModal:SubItemCategory[],
  descreaseQuantity:any,
  increaseQuantity:any,
  setLoading:any,
  orderId:number,
  loading:boolean,
  newCartId:number,
  fetchItems:any,
  totalItemInCart:number,
  setTotalItemInCart:any,
  originalQuantity:number
}

  export const OrderList_UpdateItemModal =({
    visibleCustomizeItemModal,
    setVisibleCustomizeItemModal,
    chosenItem,
    setChosenItem,
    quantity,
    mainCart_ItemId,
    setNewCartId,
    itemModal,
    subItemModal,
    descreaseQuantity,
    increaseQuantity,
    setLoading,
    orderId,
    loading,
    newCartId,
    fetchItems,
    totalItemInCart,
    setTotalItemInCart,
    originalQuantity,
  }: Props) =>{

  interface SubItemCategory extends Category {
    items: Item[];
  }

  const [visibleUpdateQuantityModal, setVisibleUpdateQuantityModal] =
  useState(false);

   //For Customize Item Modal
   const handleOkCustomizeItemModal = () => {
    closeCustomizeItemModal();
  };

  const handleCancelCustomizeItemModal = () => {
    closeCustomizeItemModal();
  };

  const handleCloseCustomizeItemModal = () => {
    closeCustomizeItemModal();
  };

  const closeCustomizeItemModal = () => {
    setVisibleCustomizeItemModal(false);
  };

  const decreaseSubQuantity = (id: number) => {
    let ci = { ...chosenItem, [id]: (chosenItem[id] || 1) - 1 };
    setChosenItem(ci);
  };

  const increaseSubQuantity = (id: number) => {
    let ci = { ...chosenItem, [id]: (chosenItem[id] || 0) + 1 };
    setChosenItem(ci);
  };

  const onchangeCheckBox = (e: any) => {
    setChosenItem((chosenItem: any) => {
      const newList = { ...chosenItem };

      if (e.target.checked == false) {
        if (Object.keys(newList).includes(String(e.target.value)) == true) {
          delete newList[e.target.value];
        }
      } else {
        newList[e.target.value] = 0;
      }

      return newList;
    });
  };
  
  const updateItem = async () => {
    setLoading(true);
    let nci = 0;
    let newCart: any;
    let newCartList: any[] = [];

    for (const i of Object.keys(chosenItem)) {
      // store parent item
      if (Number(i) == mainCart_ItemId) {
        let newCart = {
          quantity: quantity,
          sub_quantity: chosenItem[Number(i)],
          item_id: i,
          order_id: orderId,
          main_item_id: 0,
        };
        const newCartData = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "cart/store",
          newCart
        );

        nci = newCartData.data;
      } else {
        if (Number(i) != mainCart_ItemId) {
          newCart = {
            quantity: quantity,
            sub_quantity: chosenItem[Number(i)],
            item_id: i,
            order_id: orderId,
            main_item_id: nci,
          };
       
          newCartList.push(newCart);
        }
      }
    }

    if (newCartList.length > 0) {
        await axios.post(
          process.env.REACT_APP_API_BASE_URL + "cart/storeMany",
          newCartList
        );
    }

    setVisibleUpdateQuantityModal(false);
    setVisibleCustomizeItemModal(false);
    setLoading(false);
    //setItemHasDeleted(true);

    await axios.delete(
      process.env.REACT_APP_API_BASE_URL +
        "cart/deleteAllByMainCart/" +
        newCartId
    );

    let newTotalItemInCart:number = 0;

    newTotalItemInCart = (totalItemInCart - originalQuantity) + quantity;
    setTotalItemInCart(newTotalItemInCart);

    
    setNewCartId(nci); // store cart id
    fetchItems();

  };

    return(<>
     <Modal
        centered
        width={290}
        title="Customize Item"
        visible={visibleCustomizeItemModal}
        onOk={handleOkCustomizeItemModal}
        onCancel={handleCancelCustomizeItemModal}
        footer={[
          <Button key="back" onClick={handleCloseCustomizeItemModal}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={(e) => updateItem()}>
            Update
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <div>
            <div className=" h-1/2 mx-auto flex justify-center rounded-lg ">
              <img
                src={
                  itemModal?.picture
                    ? process.env.REACT_APP_IMAGES_BASE_URL + itemModal?.picture
                    : process.env.REACT_APP_IMAGES_BASE_URL + "/250x150.png"
                }
                alt=""
                className="rounded-md"
              />
            </div>

            <div className=" md:mt-0 mt-4 ">
              <div className="mt-2 uppercase tracking-wide text-lg text-red-600 font-semibold  flex-wrap">
                {itemModal?.item_name}
              </div>
              <div className="mt-2 text-gray-500 font-bold text-sm">
                {itemModal?.category.category_name}
              </div>
              <div className="mt-2 pb-2 text-md">{itemModal?.description}</div>

              {itemModal?.unit_price == 0 ? (
                ""
              ) : (
                <div className="text-md">${itemModal?.unit_price} </div>
              )}
              <div>
                <div>
                  {subItemModal.map((c, i) => (
                    <div key={i}>
                      <div className="bg-red-600 text-white text-md  font-bold pl-2 p-1 my-2 rounded-lg">
                        {c.category_name}
                      </div>

                      {c.allow_more_quantity === true ? (
                        c.items.map((i, pos) => (
                          <div
                            className="w-full flex flex-col space-y-2 "
                            key={pos}
                          >
                            <div className="flex flex-wrap justify-between flex-col">
                              <div className="capitalize w-full">
                                <div className="flex flex-row">
                                  <div className="w-8/12 ">{i.item_name}</div>
                                  <div className="text-center w-3/12 ">
                                    {i.unit_price ? "$" + i.unit_price : ""}
                                  </div>
                                </div>
                              </div>

                              <div className="w-full text-right">
                                <div className="mb-2">
                                  <span className="ml-2 ">
                                    <Button
                                      type="link"
                                      shape="circle"
                                      size="small"
                                      onClick={() => decreaseSubQuantity(i.id)}
                                      icon={<MinusCircleFilled />}
                                    ></Button>

                                    <Input
                                      readOnly
                                      value={chosenItem[i.id] || 0}
                                      style={{
                                        width: 50,
                                        height: 20,
                                        textAlign: "center",
                                      }}
                                      maxLength={3}
                                    />
                                    <Button
                                      type="link"
                                      shape="circle"
                                      size="small"
                                      onClick={() => increaseSubQuantity(i.id)}
                                      icon={<PlusCircleFilled />}
                                    ></Button>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : c.subtype === "single" ? (
                        <Radio.Group
                          className="w-full"
                          onChange={(e) => {
                            setChosenItem((chosenItem:any) => {
                              const oldItemId = Number(
                                Object.keys(chosenItem).find((a) =>
                                  c.items.map((i) => i.id).includes(Number(a))
                                )
                              );

                              const tempChosenItem = { ...chosenItem };
                              delete tempChosenItem[oldItemId];
                              tempChosenItem[e.target.value] = 0;

                              return tempChosenItem;
                            });
                          }}
                          value={Number(
                            Object.keys(chosenItem).find((a) =>
                              c.items.map((i) => i.id).includes(Number(a))
                            )
                          )}
                        >
                          <div className="w-full flex flex-col space-y-2">
                            {c.items.map((i, pos) => (
                              <Radio key={pos} className="w-full" value={i.id}>
                                <div className="flex flex-wrap justify-between w-full">
                                  <div className="capitalize w-36">
                                    {i.item_name}
                                    {i.id}
                                  </div>
                                  <div className="w-18 text-right  md:ml-2 ">
                                    {i.unit_price ? "$" + i.unit_price : ""}
                                  </div>
                                </div>
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      ) : (
                        <div className="flex flex-col space-y-2 ">
                          {c.items.map((i, pos) => (
                            <div key={pos} className="w-full inline-block ">
                              <Checkbox
                                key={i.id}
                                value={i.id}
                                onChange={onchangeCheckBox}
                                checked={
                                  Object.keys(chosenItem).includes(
                                    String(i.id)
                                  ) == false
                                    ? false
                                    : true
                                }
                                defaultChecked={true}
                              >
                                <div className="flex flex-wrap justify-between ">
                                  <div className="capitalize w-36">
                                    {i.item_name}
                                  </div>
                                  <div className="w-18 text-right  md:ml-2 ">
                                    {i.unit_price ? "$" + i.unit_price : ""}
                                  </div>
                                </div>
                              </Checkbox>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mb-2 mt-2">
                  <div className="flex items-center w-auto">
                    <button
                      type="button"
                      onClick={descreaseQuantity}
                      className="bg-red-600  text-md text-white font-bold py-1 px-3 m-2 rounded"
                    >
                      -
                    </button>

                    <input
                      type="number"
                      min="1"
                      className="text-center w-full border-2 font-semibold text-lg hover:text-black focus:text-black text-gray-700 outline-none rounded"
                      name="quantity"
                      readOnly
                      value={quantity || 1}
                    ></input>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="bg-red-600 text-md text-white font-bold py-1 px-3 m-2 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </Modal>
    
    </>)

}