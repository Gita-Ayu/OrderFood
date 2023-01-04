import { HomePage } from "./pages/HomePage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import QRPage from "./pages/QRPage";
import { Context } from "./context/Context";
import {useEffect, useState} from "react";
import { PageNotFound } from "./pages/PageNotFound";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartPage } from "./pages/CartPage";
import { useCookies } from "react-cookie";
import { ViewOrderPage } from "./pages/ViewOrderPage";
import {Cart} from "./components/CartPage_Main";
import SplashScreen from "./configs/splash-screen.json";

function App() {
  const [tableId, setTableId] = useState<number>(0);

  const [tableName, setTableName] = useState<string>("");
  const [orderId, setOrderId] = useState<number>(0);
  const [totalItemInCart, setTotalItemInCart] = useState<number>(0);
  const [unconfirmedItems, setUnconfirmedItems] = useState<Cart[]>([])
  const [takeAway, setTakeAway] = useState<number>(0);
  const [menuId, setMenuId] = useState<number>(0);
  const [isTimeup, setIsTimeup] = useState<boolean>(false);
  const [timeupDate, setTimeupDate] = useState<string>('');
  const [shouldShowTimeupModal, setShouldShowTimeupModal] = useState<boolean>(false);
  const [splashScreenImage, setSplashScreenImage] = useState<string | undefined>();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState<boolean>(false);

  const handleCheckSplashScreenImage = () => {
    const shopId = process.env.REACT_APP_SHOP_ID;
    if (!shopId) {
        setIsChecked(true);
        return;
    }

    const selectedSplashScreen = SplashScreen.find((s) => s.id === shopId);
    const imagePublicUrl = process.env.PUBLIC_URL;
    if (selectedSplashScreen?.image) setSplashScreenImage(imagePublicUrl + selectedSplashScreen.image);

    setIsChecked(true);
  }

  const handleRemoveSplashScreen = async () => {
      if (!splashScreenImage) return;

      const shopId = process.env.REACT_APP_SHOP_ID;
      if (!shopId) return;

      const selectedSplashScreen = SplashScreen.find((s) => s.id === shopId);
      if (!selectedSplashScreen?.id) return;

      await new Promise(r => setTimeout(r, selectedSplashScreen.duration || 3000));
      setSplashScreenImage(undefined);
  }

  useEffect(() => {
    handleCheckSplashScreenImage();
  }, []);

  useEffect(() => {
    handleRemoveSplashScreen();
  }, [splashScreenImage])

  return (
    <Context.Provider
      value={{
        tableId,
        setTableId,
        tableName,
        setTableName,
        orderId,
        setOrderId,
        totalItemInCart,
        setTotalItemInCart,
        takeAway,
        setTakeAway,
        menuId,
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
      }}
    >
      <div className="flex flex-col h-screen position-relative">
        <Router>
          <Header />

          <div id="appContainer" className="mb-auto overflow-y-auto">
            <Routes>
              <Route path="/jianghu/" element={<QRPage />} />
              <Route path="/jianghu/table/:id" element={<HomePage />} />
              <Route path="/jianghu/table/:id/:menuId" element={<HomePage />} />
              <Route path="/jianghu/viewCart" element={<CartPage />} />
              <Route path="/jianghu/viewOrder" element={<ViewOrderPage />}/>
              <Route element={<PageNotFound />} />
            </Routes>
          </div>
          <Footer />
        </Router>

        { splashScreenImage || !isChecked ? (
          <div className="bg-white splash-screen--container">
            {splashScreenImage ? <img className="splash-screen--image" src={splashScreenImage} alt="splash-screen" /> : null}
          </div>
        ) : null }

      </div>
    </Context.Provider>
  );
}

export default App;
