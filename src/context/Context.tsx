import { useContext, createContext } from "react";
import {Cart} from "../components/CartPage_Main";

interface ContextProps {
  tableId: number;
  setTableId: (tableId: number) => void;
  tableName: string;
  setTableName?: (tableName: string) => void;
  orderId: number;
  setOrderId: (orderId: number) => void;
  totalItemInCart: number;
  setTotalItemInCart: (totalItemInCart: number) => void;
  takeAway: number;
  setTakeAway: (takeAway: number) => void;
  menuId: number;
  setMenuId: (menuId: number) => void;
  isTimeup: boolean;
  setIsTimeup: (dataState: boolean) => void;
  timeupDate: string;
  setTimeupDate: (data: string) => void;
  shouldShowTimeupModal: boolean;
  setShouldShowTimeupModal: (data: boolean) => void;
  unconfirmedItems: Cart[],
  setUnconfirmedItems: (data: Cart[]) => void;
  isCategoryLoading: boolean;
  setIsCategoryLoading: (state: boolean) => void;
}

export const Context = createContext<ContextProps>({
  tableId: 0,
  setTableId: (tableId) => {},
  tableName: "",
  orderId: 0,
  setOrderId: (orderId) => {},
  totalItemInCart: 0,
  setTotalItemInCart: (totalItemInCart) => {},
  takeAway: 0,
  setTakeAway: (takeAway) => {},
  menuId: 0,
  setMenuId: (menuId) => {},
  isTimeup: false,
  setIsTimeup: (istimeup) => {},
  timeupDate: '',
  setTimeupDate: (data) => {},
  shouldShowTimeupModal: false,
  setShouldShowTimeupModal: () => {},
  unconfirmedItems: [],
  setUnconfirmedItems: () => {},
  isCategoryLoading: false,
  setIsCategoryLoading: (state: boolean) => {}
});
