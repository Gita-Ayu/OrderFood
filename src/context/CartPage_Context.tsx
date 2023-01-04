import { useContext, createContext } from "react";

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

interface ContextProps {
  orderId:number,
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
  quantity:number,
  setQuantity:any

}

export const CartPage_Context = createContext<ContextProps>({
  orderId:0,
  loading:false,
  setLoading:null,
  carts: [],
  takeAway:0,
  subTotal:0,
  totalPrice:0,
  gst:0,
  gst_percentage:0,
  service_charges:0,
  service_charges_percentage:0,
  handleAllItem:null,
  handleCancelAllOrder:null,
  confirmOrderSuccessful:false,
  setVisibleConfirmedOrder:null,
  setConfirmOrderSuccessful:null,
  setTotalItemInCart:null,
  fetchItems:null,
  totalItemInCart:0,
  quantity:0,
  setQuantity:null

});
