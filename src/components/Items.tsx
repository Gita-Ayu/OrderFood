import axios, { AxiosResponse } from "axios";
import {useContext, useEffect, useRef, useState} from "react";
import _ from "lodash";
import dotenv from "dotenv";
import {Modal, Button, Checkbox, Radio, Spin, Input, Alert, message} from "antd";
import { MinusCircleFilled, PlusCircleFilled, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import timelimit from '../configs/time-limit.json';
import {Cart} from "./CartPage_Main";
dotenv.config();

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
  subItems?: Item[];
}

interface SubItemCategory extends Category {
  items: Item[];
}

interface Category {
  id: number;
  category_name: string;
  type: string;
  subtype: string;
  allow_more_quantity: boolean;
}

interface Props {
  selectedCategory: number;
  totalItemInCart: number;
  setTotalItemInCart: (totalItemInCart: number) => void;
  setOrderId: (orderId: number) => void;
  orderId: number;
  tableId: number;
  takeAway: number;
  setTakeAway: (orderId: number) => void;
  isTimeup: boolean;
  unconfirmedItems: Cart[],
  isCategoryLoading: boolean,
  setIsCategoryLoading: (state: boolean) => void;
}

const handleCheckIsItemsPreviousItemsSame = (items: Item[], previousItems: Item[]): boolean => {
  if (items.length !== previousItems.length) return false;
  let isSame = true;
  items.forEach((item) => {
    const previousItem = previousItems.find((i) => i.id === item.id);
    if (!previousItem?.id) isSame = false;
  });

  return isSame;
}

export const Items = ({
  selectedCategory,
  totalItemInCart,
  setTotalItemInCart,
  setOrderId,
  orderId,
  tableId,
  isTimeup,
  unconfirmedItems,
  isCategoryLoading,
  setIsCategoryLoading
}: Props) => {
  const [items, setItems] = useState<Item[]>([]);
  const [itemModal, setItemModal] = useState<Item>();
  const [subItemModal, setSubItemModal] = useState<SubItemCategory[]>([]);

  const [itemModalId, setItemModalId] = useState(0);

  const [chosenItem, setChosenItem] = useState<Record<number, any>>({});
  const [chosenAddOnItem, setChosenAddOnItem] = useState<
    Record<number, number>
  >({});
  const [selectedItemIdModal, setSelectedItemIdModal] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const previousItems = useRef<Item[]>([]);

  const debouncedSubitems = useRef(
      _.debounce(async (items: Item[]) => {
        const itemsCpy = [...items];

        const isSame = handleCheckIsItemsPreviousItemsSame(itemsCpy, previousItems.current);
        if (isSame) return;

        setIsCategoryLoading(true);
        if (itemsCpy.length > 0) {
          for (let index = 0; index < itemsCpy.length; index++) {
            let { data: subItems } = await axios.get<Item[]>(
                process.env.REACT_APP_API_BASE_URL + "item/getSubItem/" + itemsCpy[index].id
            );

            itemsCpy[index].subItems = subItems || []
          }
        }
        setIsCategoryLoading(false);

        previousItems.current = itemsCpy;
        setItems(itemsCpy);
      }, 1000)
  ).current;

  useEffect(() => {
    const selectedItemIdModal: number[] = [];

    Object.values(chosenItem).map((values) => {
      selectedItemIdModal.push(...values);
    });

    setSelectedItemIdModal(selectedItemIdModal);
    setSubItemModal(subItemModal);
  }, [chosenItem, chosenAddOnItem]);

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const descreaseQuantity = () => {
    quantity < 1 || quantity == 1 ? setQuantity(1) : setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const isCheckboxSelectionEnabled = (c: SubItemCategory, i: number, item: Item) => {
    // @ts-ignore
    if (!c.allow_more_quantity && c.allow_more_quantity !== 0) return true;

    const currentChosenItem = chosenItem?.[i] || [];
    if (currentChosenItem.find((cItem: number) => cItem === item.id)) return true;

    return currentChosenItem.length < c.allow_more_quantity;
  }

  useEffect(() => {
    const fetchItems = async () => {
      setIsCategoryLoading(true);
      const res = await axios.get(
        process.env.REACT_APP_API_BASE_URL + "item/list"
      );

      if (selectedCategory) {
        setItems(res.data.filter((obj: Item) => obj.category_id == selectedCategory));
      } else {
        setItems(res.data);
      }
      setIsCategoryLoading(false);
    };

    fetchItems();
  }, [selectedCategory]);

  useEffect(() => {
    if (items.length > 0) {
      debouncedSubitems(items);
    }
  }, [items]);

  useEffect(() => {
    return () => {
      debouncedSubitems.cancel();
    }
  }, [debouncedSubitems])

  const showModal = async (item: Item, e: any) => {
    if (e.target?.className?.includes('modal-limiter')) return;

    let { data: subItems } = await axios.get<Item[]>(
      process.env.REACT_APP_API_BASE_URL + "item/getSubItem/" + item.id
    );

    console.log(subItems);
    console.log(item);


    subItems = subItems.map((item) => ({ ...item, quantity: 0 }));

    const subItemCategoryMap = new Map<number, SubItemCategory>();

    subItems.forEach((item) => {
      let category = subItemCategoryMap.get(item.category_id) || {
        ...item.category,
        items: [],
      };

      category.items.push(item);
      subItemCategoryMap.set(item.category_id, category);
    });

    const subItemCategories: SubItemCategory[] = [];
    subItemCategoryMap.forEach((c) => subItemCategories.push(c));

    const filteredSubItemCategories = subItemCategories.map((data) => {
      // data.items = data.items.filter((item: any) => !!parseFloat(item.unit_price));
      return data;
    })

    setSubItemModal(filteredSubItemCategories);

    filteredSubItemCategories.forEach((c, index) => {
      if (c.subtype === 'multiple' && c.type === 'choice') {
        console.log(c);
      }
    })

    setChosenItem({});
    setChosenAddOnItem({});

    setQuantity(1);
    setVisible(true);
    setItemModal(item);
    setItemModalId(item.id);
  };

  const updateTotalPrice = async (orderId: number) => {
    const newCartId = await axios.post(
      process.env.REACT_APP_API_BASE_URL + "order/updateTotalPrice/" + orderId
    );
  };

  const handleOrder = async () => {
    if (itemModalId) {
      let orderIdNow = 0;

      setLoading(true);

      //Proceed Order
      if (orderId) {
        orderIdNow = orderId;
      } else {
        let newOrder = {
          total_price: 0,
          status: "new",
          table_id: tableId,
        };

        const resOrder = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "order/store",
          newOrder
        );

        orderIdNow = resOrder.data;
        setOrderId(orderIdNow);

        const orders = {[tableId]: orderIdNow};
        window.localStorage.setItem('orderIdsData', JSON.stringify(orders));
      }

      //Proceed Cart
      let mainItemId = 0;

      let newCart = {
        quantity: quantity,
        sub_quantity: 0,
        item_id: itemModalId,
        order_id: orderIdNow,
        main_item_id: 0,
      };

      try {
        const newCartId = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "cart/store",
          newCart
        );
        mainItemId = newCartId.data;


        let newCartList:any[] = [];

        if (selectedItemIdModal.length > 0) {
          for (var i of selectedItemIdModal) {
            let newCart = {
              quantity: quantity,
              sub_quantity: 0,
              item_id: i,
              order_id: orderIdNow,
              main_item_id: mainItemId,
            };

            newCartList.push(newCart);
          }

          const newCartId = await axios.post(
            process.env.REACT_APP_API_BASE_URL + "cart/storeMany",
            newCartList
          );
        }

        //Proceed Add On Item
        let newCartListForAddOn:any[] = [];
        if (Object.keys(chosenAddOnItem).length > 0) {
          for (const [key, value] of Object.entries(chosenAddOnItem)) {
            let newCart = {
              quantity: quantity,
              sub_quantity: value,
              item_id: key,
              order_id: orderIdNow,
              main_item_id: mainItemId,
            };
            newCartListForAddOn.push(newCart);

          }

          const newCartId = await axios.post(
            process.env.REACT_APP_API_BASE_URL + "cart/storeMany",
            newCartListForAddOn
          );
        }
        //end

        let newTotalItemInCart = totalItemInCart + quantity;

        setTotalItemInCart(newTotalItemInCart);
        selectedItemIdModal.pop();
        updateTotalPrice(orderIdNow);
        handleClose();
        setLoading(false);

      } catch (e) {
        setLoading(false);
        console.log("Items.HandleOrder.Error")
        console.log(e);
      }
    }
  };

  const decreaseSubQuantity = (id: number) => {
    setChosenAddOnItem({
      ...chosenAddOnItem,
      [id]: (chosenAddOnItem[id] || 1) - 1,
    });
  };

  const increaseSubQuantity = (id: number) => {
    setChosenAddOnItem({
      ...chosenAddOnItem,
      [id]: (chosenAddOnItem[id] || 0) + 1,
    });
  };

  const setDefaultValueRadio = (index: number, id: number) => {
    setChosenItem({});
    setChosenItem({ ...chosenItem, [index]: [id] });
    return id;
  };

  const filterUnconfirmedItem = (item: Item): number => {
    const unconfirmedItemList = unconfirmedItems.filter((uc) => uc.item_id === item.id);
    if (!unconfirmedItemList?.length) return 0;

    let count = 0;
    unconfirmedItemList.forEach((ui) => {
      count += ui.quantity
    });

    return count;
  }

  const removeOneItemFromCart = async (cartData: Cart) => {
    let cart = {
      id: cartData.id,
      quantity: cartData.quantity - 1,
      order_id: orderId,
    };

    try {
      await axios.put(process.env.REACT_APP_API_BASE_URL + "cart/updateQuantity", cart);
      setTotalItemInCart(totalItemInCart - 1);
    } catch (e) {
      console.log(e);
    }
  }

  const removeItemFromCart = async (cartData: Cart) => {
    try {
      const res = await axios.delete(process.env.REACT_APP_API_BASE_URL + "cart/deleteAllBymainCart/" + cartData.id);
    } catch (e) {
      message.error("Sorry, it cannot be deleted");
    }
  }

  const removeItem = async (item: Item) => {
    const uiCount = filterUnconfirmedItem(item);
    if (uiCount > 0) {
      const unconfirmedItemList = unconfirmedItems.filter((uc) => uc.item_id === item.id);
      if (unconfirmedItemList[0].quantity > 1) {
        await removeOneItemFromCart(unconfirmedItemList[0]);
        return;
      }

      setTotalItemInCart(totalItemInCart - 1);
      await removeItemFromCart(unconfirmedItemList[0]);
      return;
    }
  }

  const addOneItemToCart = async (cartData: Cart) => {
    let cart = {
      id: cartData.id,
      quantity: cartData.quantity + 1,
      order_id: orderId,
    };

    try {
      await axios.put(process.env.REACT_APP_API_BASE_URL + "cart/updateQuantity", cart);
      setTotalItemInCart(totalItemInCart + 1);
    } catch (e) {
      console.log(e);
    }
  }

  const addItem = async (item: Item) => {
    const uiCount = filterUnconfirmedItem(item);
    if (uiCount > 0) {
      const unconfirmedItemList = unconfirmedItems.filter((uc) => uc.item_id === item.id);
      await addOneItemToCart(unconfirmedItemList[0]);
      return;
    }

    let currentOrderId = orderId;
    if (!currentOrderId) {
      let newOrder = {
        total_price: 0,
        status: "new",
        table_id: tableId,
      };

      const resOrder = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "order/store",
          newOrder
      );

      currentOrderId = resOrder.data;
      setOrderId(currentOrderId);

      const orders = {[tableId]: currentOrderId};
      window.localStorage.setItem('orderIdsData', JSON.stringify(orders));
    }

    const newCart = {
      quantity: 1,
      sub_quantity: 0,
      item_id: item.id,
      order_id: currentOrderId,
      main_item_id: 0,
    };

    try {
      const newCartId = await axios.post(process.env.REACT_APP_API_BASE_URL + "cart/store", newCart);
      setTotalItemInCart(totalItemInCart + 1);
    } catch (e) {
    }
  }

  return (
    <div>
      <div className="mb-3 mt-16 grid grid-cols-2">
        {items.map((p, pos) => (
          <div key={pos}  style={{marginBottom: "20px",float: "left", padding: "5px"}}>
            <div onClick={(e) => showModal(p, e)} className="flex md:flex-row flex-row w-full rounded-md border-red-600 border-5 shadow-md bg-white">
              <div className="w-full md:pb-2 md:pl-2" style={{ position: 'relative' }}>
                <div className="space-y-2 w-full">
                  <div className="capitalize px-1" style={{minHeight:"auto"}}>
                    <div className="font-bold text-lg text-black mb-0">{p.id}</div>
                    <div className="font-bold text-lg text-black mb-0">{}</div>
                    <div className="font-bold text-black" style={{fontSize: "10px"}}>{p.item_name}</div>
                    {p.description ? (
                        <div className="font-bold text-gray-600" style={{fontSize: "10px", height:"30px", overflowY:"auto"}}>
                          <span className="">{p.description}</span>
                        </div>
                    ) : (
                        <div className="text-gray-700 pl-1" style={{fontSize: "10px", height:"30px"}}>
                          &nbsp;
                        </div>
                    )}
                    <div className="font-bold text-red-600">{"$"+p.unit_price}</div>
                  </div>
               </div>
              </div>
              <div className="justify-center md:p-0 pb-2 items-center">
                <img
                    src={
                      p.picture
                          ? process.env.REACT_APP_IMAGES_BASE_URL + p.picture
                          : process.env.REACT_APP_IMAGES_BASE_URL + "/250x150.png"
                    }
                    alt=""
                    className="rounded-md rounded-bl-3xl object-fill w-full"
                    style={{height:"80px", width:"200px", objectFit:"cover", position:"relative", bottom:"10px"}}
                />
                { p.subItems?.length === 0 ? (
                    <div className="item--quick-button--container ml-0 pb-1">
                      {filterUnconfirmedItem(p) ? (
                          <div style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                            <Button
                                shape="circle"
                                size="small"
                                className="modal-limiter bg-red-600 border-red-600"
                                icon={<MinusOutlined className="prevent--click" />}
                                style={{ marginRight: '10px' }}
                                onClick={() => removeItem(p)}
                            ></Button>
                            <p style={{ marginBottom: '0' }}>{filterUnconfirmedItem(p)}</p>
                          </div>
                      ) : null}
                      <Button
                          shape="circle"
                          type="primary"
                          size="small"
                          className="modal-limiter"
                          style={{ backgroundColor: '#DC2626', border: 'none' }}
                          onClick={() => addItem(p)}
                          icon={<PlusOutlined className="prevent--click" />}
                      ></Button>
                    </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal
        centered
        width={290}
        title="Order"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleClose}>
            Cancel
          </Button>,
          <Button disabled={isTimeup} key="submit" type="primary" onClick={handleOrder}>
            Add to Cart
          </Button>,
        ]}
      >
        { isTimeup && (
          <div style={{ marginBottom: '16px' }}>
            <Alert message={timelimit.messageTimeup} type="error" />
          </div>
        )}

        <Spin spinning={loading}>
          <div className="">
            <div className="mx-auto flex justify-center rounded-lg">
              <img
                src={
                  itemModal?.picture
                    ? process.env.REACT_APP_IMAGES_BASE_URL + itemModal?.picture
                    : process.env.REACT_APP_IMAGES_BASE_URL + "/250x150.png"
                }
                alt=""
                className="rounded-md"
                style={{height:"200px", width:"100%", objectFit:"cover"}}
              />
            </div>

            <div className=" md:mt-0 mt-4">
              <div className="mt-2 uppercase tracking-wide text-lg text-red-600 font-semibold ">
                {itemModal?.item_name}
              </div>
              <div className="mt-2 text-gray-500 font-bold text-sm">
                {itemModal?.id}
              </div>
              <div className="mt-2 pb-2 text-sm">{itemModal?.description}</div>

              {itemModal?.unit_price == 0 ? (
                ""
              ) : (
                <div className="text-md">${itemModal?.unit_price}</div>
              )}
              <div>
                <div>
                  {subItemModal.map((c, i) => (
                    <div key={i} className="">
                      <div className="bg-red-300 text-md  font-bold pl-2 p-1 my-2 rounded-lg">
                        {c.category_name}
                      </div>

                      {c.allow_more_quantity === true ? (
                        c.items.map((i, pos) => (

                        <div className="w-full flex flex-col space-y-2" key={pos}>
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
                                              value={chosenAddOnItem[i.id] || 0}
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
                      ) : c.subtype === "single" && c.items?.length ? (
                        <Radio.Group
                          className="w-full"
                          onChange={(e) =>
                            setChosenItem({
                              ...chosenItem,
                              [i]: [e.target.value],
                            })
                          }
                          value={
                            chosenItem[i]?.[0] == null
                              ? setDefaultValueRadio(i, c.items[0].id)
                              : chosenItem[i]?.[0]
                          }
                          name={`choice_single_${c.id}`}
                        >
                          <div className="flex flex-col w-full">

                            {c.items.map((i, pos) => (
                               <Radio key={pos} className="w-full" value={i.id}>
                               <div className="flex flex-wrap justify-between w-full">
                                 <div className="capitalize w-36">
                                   {i.item_name}
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
                        <Checkbox.Group
                          className="w-full"
                          onChange={(values) =>
                            setChosenItem({ ...chosenItem, [i]: values })
                          }
                          value={chosenItem[i] || []}
                          name={`choice_multiple_${c.id}`}
                        >
                          <div className="flex flex-col space-y-2">
                            {c.items.map((item, pos) => (
                              <div key={pos} className="w-full inline-block ">
                                <Checkbox key={item.id} value={item.id} disabled={!isCheckboxSelectionEnabled(c, i, item)}>
                                  <div className="flex flex-wrap justify-between ">
                                    <div className="capitalize w-36">
                                      {item.item_name}
                                    </div>
                                    <div className="w-18 text-right  md:ml-2 ">
                                      {item.unit_price ? "$" + item.unit_price : ""}
                                    </div>
                                  </div>
                                </Checkbox>
                              </div>
                            ))}
                          </div>
                        </Checkbox.Group>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-2">
                  <div className="flex items-center w-auto">
                    <button
                      type="button"
                      onClick={descreaseQuantity}
                      className="bg-blue-500 text-md text-white font-bold py-1 px-3 m-2 rounded"
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
                      className="bg-blue-500 text-md text-white font-bold py-1 px-3 m-2 rounded"
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
    </div>
  );
};
