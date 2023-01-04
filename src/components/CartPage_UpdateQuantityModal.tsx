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
import { OrderList_UpdateItemModal } from "./CartPage_UpdateItemModal";

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
  loading:boolean,
  setLoading:any,
  visibleUpdateQuantityModal:boolean,
  setVisibleUpdateQuantityModal:any,
  handleAllItem:(newCartId:number)=>any,
  fetchItems:any,
  orderId:number,
  newCartId:number,
  mainCart_ItemId:number,
  setNewCartId:any,
  updatingItemPrice: number,
  updatingItem: string,
  updatingItemId:number,
  setTotalItemInCart:any,
  totalItemInCart:number,
  quantity: number,
  setQuantity:any,
  originalQuantity:number
}

  export const OrderList_UpdateQuantityModal =({
    loading,
    setLoading,
    visibleUpdateQuantityModal,
    setVisibleUpdateQuantityModal,
    handleAllItem,
    fetchItems,
    orderId,
    newCartId,
    mainCart_ItemId,
    setNewCartId,
    updatingItemPrice,
    updatingItem,
    updatingItemId,
    setTotalItemInCart,
    totalItemInCart,
    quantity,
    setQuantity,
    originalQuantity
  }: Props) =>{
  interface SubItemCategory extends Category {
    items: Item[];
  }
  const [visibleCustomizeItemModal, setVisibleCustomizeItemModal] = useState(false);
  const [itemModal, setItemModal] = useState<Item>();
  const [subItemModal, setSubItemModal] = useState<SubItemCategory[]>([]);
  const [chosenItem, setChosenItem] = useState<Record<number, any>>({});

  
  const showModal = async (item: Item) => {
    setItemModal(item);

    let res2 = await axios.get<Cart[]>(
      process.env.REACT_APP_API_BASE_URL +
        "cart/getSelectedItemInCart/" +
        newCartId
    );

    let chosenItem: Record<number, any> = {};

    let i = 0;

    res2.data.forEach((a: Cart) => {
      i == 0 ? setQuantity(a.quantity) : 1;
    
     
      chosenItem = {
        ...chosenItem,
        [a.item.id]: a.sub_quantity,
      };

      i += 1;

      setChosenItem(chosenItem);
    });

    //get sub item to show in form
    let { data: subItems } = await axios.get<Item[]>(
      process.env.REACT_APP_API_BASE_URL + "item/getSubItem/" + item.id
    );

    subItems = subItems.map((item) => ({ ...item, quantity: 0 }));

    const subItemCateogryMap = new Map<number, SubItemCategory>();

    subItems.forEach((item) => {
      let category = subItemCateogryMap.get(item.category_id) || {
        ...item.category,
        items: [],
      };

      category.items.push(item);
      subItemCateogryMap.set(item.category_id, category);
    });

    const subItemCateogries: SubItemCategory[] = [];
    subItemCateogryMap.forEach((c) => subItemCateogries.push(c));

    setSubItemModal(subItemCateogries);
  };

  //For Update Quantity Modal
  const handleOkUpdateQuantityModal = () => {
    closeQuantityModal();
  };

  const handleCancelUpdateQuantityModal = () => {
    closeQuantityModal();
  };

  const handleCloseUpdateQuantityModal = () => {
    closeQuantityModal();
  };

  const closeQuantityModal = () => {
    setVisibleUpdateQuantityModal(false);
  };

  const showCustomizeItemForm = async () => {
    setVisibleUpdateQuantityModal(false);
    setVisibleCustomizeItemModal(true);

    setLoading(true);

    const res = await axios.get(
      process.env.REACT_APP_API_BASE_URL + "item/get/" + updatingItemId
    );

    showModal(res.data);
    setLoading(false); 
  };

  const buttonUpdateQuantity = async () => {
  setLoading(true);
  // setQuantityHasChanges(true);

  setQuantity(quantity);

  let newTotalItemInCart:number = 0;

  newTotalItemInCart = (totalItemInCart - originalQuantity) + quantity;
  setTotalItemInCart(newTotalItemInCart);


  let cart = {
    id: newCartId,
    quantity: quantity,
    order_id: orderId,
  };

  try {
    await axios.put(
      process.env.REACT_APP_API_BASE_URL + "cart/updateQuantity",
      cart
    );

    fetchItems();
    setVisibleUpdateQuantityModal(false);
    setLoading(false);

  } catch (e) {
    console.log(e);
  }
 
};

const descreaseQuantity = () => {
  quantity < 1 || quantity == 1 ? setQuantity(1) : setQuantity(quantity - 1);
};

const increaseQuantity = () => {
  setQuantity(quantity + 1);
};

    return(<>
      <Modal
        centered
        width={300}
        title="Update Quantity"
        visible={visibleUpdateQuantityModal}
        onOk={handleOkUpdateQuantityModal}
        onCancel={handleCancelUpdateQuantityModal}
        footer={[
          <Button key="back" onClick={handleCloseUpdateQuantityModal}>
            Cancel
          </Button>,

          <Button
            key="remove"
            type="primary"
            danger
            onClick={(e) => handleAllItem(newCartId)}
          >
            Remove
          </Button>,
          <Button key="update" type="primary" onClick={buttonUpdateQuantity}>
            Update
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <div className="flex flex-col text-center justify-center ">
            <h2 className="text-lg mt-2 mb-3 ">{updatingItem}</h2>

            {updatingItemPrice == 0 ? (
              <>
                {" "}
                <small>
                  <Button type="link" onClick={showCustomizeItemForm}>
                    Customize
                  </Button>
                </small>
              </>
            ) : (
              ""
            )}

            <div className="flex justify-center ">
              <button
                type="button"
                onClick={descreaseQuantity}
                className="bg-blue-500  text-md text-white font-bold py-1 px-3 m-2 rounded"
              >
                -
              </button>

              <input
                type="number"
                min="1"
                className="text-center   m-2 w-32 h-8 justify-center items-center place-content-center border-2 font-semibold text-lg hover:text-black focus:text-black text-gray-700 outline-none rounded"
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
        </Spin>
      </Modal>

      <OrderList_UpdateItemModal 
          visibleCustomizeItemModal={visibleCustomizeItemModal}
          setVisibleCustomizeItemModal={setVisibleCustomizeItemModal}
          chosenItem={chosenItem}
          setChosenItem={setChosenItem}
          quantity={quantity}
          mainCart_ItemId={mainCart_ItemId}
          setNewCartId={setNewCartId}
          itemModal={itemModal} 
          subItemModal={subItemModal}
          descreaseQuantity={descreaseQuantity}
          increaseQuantity={increaseQuantity}
          setLoading={setLoading}
          orderId={orderId}
          loading={loading}
          newCartId={newCartId}
          fetchItems={fetchItems}
          totalItemInCart={totalItemInCart}
          setTotalItemInCart={setTotalItemInCart}
          originalQuantity={originalQuantity}
        />
    
    </>)

}