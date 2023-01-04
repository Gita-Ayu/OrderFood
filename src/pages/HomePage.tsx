import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";

import timelimit from '../configs/time-limit.json';
import categoryMessages from '../configs/category-messages.json';
import restaurantTimer from '../configs/restaurant-timer.json';

import { Categories } from "../components/Categories";
import { Items } from "../components/Items";
import { Context } from "../context/Context";

import { Alert, Badge, message, Modal } from "antd";
import { FileDoneOutlined, ShoppingCartOutlined } from "@ant-design/icons";

import { Layout } from 'antd';
import {Cart} from "../components/CartPage_Main";

const { Sider, Content } = Layout;

export const HomePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const location = useLocation();
  const restaurantId = location.pathname.split('/')?.[1];
  const currentTimer = restaurantTimer.find((r) => r.restaurantId === restaurantId);

  const {
    tableId,
    setTableId,
    setTableName,
    orderId,
    setOrderId,
    totalItemInCart,
    setTotalItemInCart,
    takeAway,
    setTakeAway,
    setMenuId,
    isTimeup,
    setIsTimeup,
    timeupDate,
    setTimeupDate,
    shouldShowTimeupModal,
    setShouldShowTimeupModal,
    unconfirmedItems,
    setUnconfirmedItems,
    isCategoryLoading,
    setIsCategoryLoading
  } = useContext(Context);

  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [isTableValid, setIsTableValid] = useState<Boolean>(false);

  const isTimeupRef = useRef(isTimeup);
  const timeupDateRef = useRef(timeupDate);
  const shouldShowTimeupModalRef = useRef(shouldShowTimeupModal);
  const itemListEl = useRef<HTMLDivElement>(null);

  const handleCheckTimeLimitAvailability = () => {
    const lastTimeLimit = window.localStorage.getItem('customer_time_limit');
    if (!lastTimeLimit) return;

    const selectedTimeLimit = currentTimer?.orderTimeLimit || currentTimer?.timeLimit || 0;
    if (!selectedTimeLimit) return;

    // Check if the time limit is expired

    const lastTimeLimitSetup = new Date(JSON.parse(lastTimeLimit))
    const currentDate = new Date();

    // If still apply the last time limit
    if (lastTimeLimitSetup.getTime() > currentDate.getTime()) {
      setIsTimeup(false);
      isTimeupRef.current = false;
      return;
    }

    if (!isTimeupRef.current) {
      message.warning({
        content: timelimit.messageTimeup,
        duration: 10
      })
    }

    setIsTimeup(true);
    isTimeupRef.current = true;

    if (!currentTimer?.timeLimit) return;

    const gap = selectedTimeLimit - currentTimer?.timeLimit || 0;

    const fromPreviousOrderMinutes = (lastTimeLimitSetup.getTime() - currentDate.getTime()) / 1000 / 60;
    if (fromPreviousOrderMinutes - gap > 0 ) return;

    setShouldShowTimeupModal(true);
    shouldShowTimeupModalRef.current = true;

    return;
  };

  const handleSetupTimelimit = () => {
    if (shouldShowTimeupModalRef.current) {
      setShouldShowTimeupModal(true);
    }

    if (isTimeupRef.current) {
      message.warning({
        content: timelimit.messageTimeupPassed,
        duration: 10
      });
      return;
    }

    if (timeupDateRef.current) return;

    const selectedTimeLimit = currentTimer?.orderTimeLimit || currentTimer?.timeLimit;
    if (!selectedTimeLimit) return;

    const timeLimitFactor = selectedTimeLimit * 60 * 1000;
    const customerTimeLimit = JSON.stringify(new Date(Date.now() + timeLimitFactor));
    window.localStorage.setItem('customer_time_limit', customerTimeLimit);
    setTimeupDate(customerTimeLimit);
    setIsTimeup(false);
    isTimeupRef.current = false;

    message.success({ content: `You have ${selectedTimeLimit} minutes to order from the menu! We will lock the menu if the time passed.`, duration: 10});
  };

  const fetchUnconfirmedOrders = async () => {
    const thisCart = await axios.get<Cart[]>(
        process.env.REACT_APP_API_BASE_URL + "cart/getUnconfirmedList/" + orderId
    );

    if (thisCart?.data?.length !== totalItemInCart) {
      setTotalItemInCart(thisCart?.data?.length);
    }

    setUnconfirmedItems(thisCart?.data || []);
  }

  const fetchTable = async () => {
    const res = await axios.get(
      process.env.REACT_APP_API_BASE_URL + "table/get/" + Number(id)
    );

    if (res.data) {
      setIsTableValid(true);
      setTableId?.(Number(id));
      setTableName?.(res.data.name);
      setTakeAway?.(res.data.take_away);

      if (res.data?.id) {
        const selectedTimeLimit = currentTimer?.orderTimeLimit || currentTimer?.timeLimit || 0;
        if (!selectedTimeLimit) return;

        const timeLimitFactor = selectedTimeLimit * 60 * 1000;
        const orderTimeStart = new Date(res.data?.updated_at || Date.now());

        const customerTimeLimit = new Date(orderTimeStart.getTime() + timeLimitFactor);
        const fromPreviousOrderMinutes = (customerTimeLimit.getTime() - (new Date()).getTime()) / 1000 / 60;

        // IF THE ORDER TIME UP, BUT EXPIRED, REMOVE ORDER ID DATA
        // if (fromPreviousOrderMinutes <= 0) {
        //   const isOrderTimeLimitExpired = Math.abs(fromPreviousOrderMinutes) >= timelimit.orderTimeLimitExpiredIn;
        //   if (isOrderTimeLimitExpired) {
        //     window.localStorage.removeItem('orderIdsData');
        //     setOrderId(0);
        //     return;
        //   }
        // }

        window.localStorage.setItem('customer_time_limit', JSON.stringify(customerTimeLimit));
        setTimeupDate(JSON.stringify(customerTimeLimit));
        if (fromPreviousOrderMinutes <= 0) {
          message.warning({
            content: timelimit.messageTimeupPassed,
            duration: 10
          });
          setIsTimeup(true);
          isTimeupRef.current = true;

          if (!currentTimer?.timeLimit) {
            window.localStorage.removeItem('orderIdsData');
            setOrderId(0);
            return;
          }

          const gap = selectedTimeLimit - currentTimer.timeLimit;
          if (fromPreviousOrderMinutes - gap > 0 ) return;

          setShouldShowTimeupModal(true);
          shouldShowTimeupModalRef.current = true;

          window.localStorage.removeItem('orderIdsData');
          setOrderId(0);
          return;
        }

        const roundedTimeLeftMinutes = fromPreviousOrderMinutes.toFixed(1);
        if (parseInt(roundedTimeLeftMinutes) === selectedTimeLimit) {
          message.success({
            content: `You have ${selectedTimeLimit} minutes to order from the menu! We will lock the menu if the time passed.`,
            duration: 10
          });
        } else {
          message.success({
            content: `You have ${roundedTimeLeftMinutes} minutes left to order from our menu.`,
            duration: 10
          });
        }
        setIsTimeup(false);
        isTimeupRef.current = false;
      }
    } else {
      setIsTableValid(false);
    }
  };

  const fetchOrders = async (orderId: number) => {
    const request = await axios.get(
      process.env.REACT_APP_API_BASE_URL + 'order/get/' + orderId
    );
  }

  const handleSetupOrderId = (tableId: string | number) => {
    if (!tableId) return;

    const localOrders = window.localStorage.getItem('orderIdsData');
    try {
      const orders = JSON.parse(localOrders || '');
      if (orders?.[tableId]) {
        setOrderId(orders[tableId]);
        fetchOrders(orders[tableId]);
      }
    } catch (err) { }
  }

  useEffect(() => {
    handleSetupTimelimit();
    fetchTable();
    handleSetupOrderId(id || '');
  }, [id]);

  useEffect(() => {
    if (itemListEl?.current) {
      itemListEl.current.scrollTo({ top: 0, behavior: "auto"})
    }

    const itemsContainer = document.getElementById("itemsContainer")
    if (itemsContainer) {
      itemsContainer.scrollTo({ top: 0, behavior: "auto" })
    }

    const appContainer = document.getElementById("appContainer")
    if (appContainer) {
      appContainer.scrollTo({ top: 0, behavior: "auto" })
    }

  }, [selectedCategory])

  useEffect(() => {
    message.config({
      duration: 1,
      maxCount: 2
    })
    const timelimitInterval = setInterval(() => {
      handleCheckTimeLimitAvailability();
    }, 1000);

    return () => {
      clearInterval(timelimitInterval);
    }
  }, []);

  useEffect(() => {
    const categoryMessage: any = categoryMessages.find((cm: any) => cm.categoryId === selectedCategory && cm.message);
    if (categoryMessage?.message) message.info({content: categoryMessage.message, duration: 5});
  }, [selectedCategory])

  useEffect(() => {
    if (orderId) {
      fetchUnconfirmedOrders();
    }
  }, [orderId, totalItemInCart])

  if (!isTableValid) return <div></div>;

  return (
   <>
      <div className="fixed flex justify-between bg-white w-full pl-5 pr-8 pt-3 pb-1 -my-6 shadow-lg z-20 position-absolute">
            <div className="float-left">
              <div className="text-center text-sm items-center mb-2 pb-1 pt-1 pl-3 pr-3 md:mr-0 -mr-4 font-bold border-2 border-red-600 rounded-md w-40 ">
                {takeAway ? "Take Away" : "Dine In"}
              </div>
            </div>

            <div className="float-right mt-2 flex">
              <div>
              {totalItemInCart === 0 ? (
                <Badge count={0} showZero>
                  <ShoppingCartOutlined
                    style={{ fontSize: "24px", color: "#000000" }}
                  />
                </Badge>
              ) : (
                <div onClick={() => navigate("/jianghu/viewCart")} className="">
                  <Badge count={totalItemInCart}>
                    <ShoppingCartOutlined
                      style={{ fontSize: "24px", color: "#000000" }}
                    />
                  </Badge>
                </div>
              )}
              </div>
              <div>
              <div onClick={() => navigate("/jianghu/viewOrder")} className="">
                <FileDoneOutlined style={{ fontSize: "20px", color: "#000000"}} className="ml-5 shadow-lg"/>
              </div>
              </div>
            </div>
        </div>

        <Modal
          centered
          width={290}
          title="Time up!"
          visible={shouldShowTimeupModal}
          closable={false}
          footer={false}
        >
          <div style={{ margin: '16px' }}>
            <Alert message={timelimit.messageTimeupPassed} type="error" />
          </div>
        </Modal>

       <Layout className="z-1 mt-8">
             <Categories
                 setSelectedCategory={setSelectedCategory}
                 setMenuId={setMenuId}
                 selectedCategory={selectedCategory}
                 totalItemInCart={totalItemInCart}
                 orderId={orderId}
                 tableId={tableId}
                 takeAway={takeAway}
                 isCategoryLoading={isCategoryLoading}
             />
             <div ref={itemListEl} className="mt-5 md:w-auto" style={{minHeight:"calc(100vh - 178px)"}}>
             <Items
                 selectedCategory={selectedCategory}
                 tableId={tableId}
                 totalItemInCart={totalItemInCart}
                 setTotalItemInCart={setTotalItemInCart}
                 setOrderId={setOrderId}
                 orderId={orderId}
                 setTakeAway={setTakeAway}
                 takeAway={takeAway}
                 isTimeup={isTimeup}
                 unconfirmedItems={unconfirmedItems}
                 isCategoryLoading={isCategoryLoading}
                 setIsCategoryLoading={setIsCategoryLoading}
             />
             </div>
    </Layout>
   </>

  );
};
