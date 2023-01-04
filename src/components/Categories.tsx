import axios from "axios";
import { useEffect, useRef, useState } from "react";
import dotenv from "dotenv";
import { useParams, useNavigate } from "react-router-dom";

import availableMenu from "../configs/available-menu.json";
import categoryLimiter from "../configs/category-limitter.json"
import {Spin} from "antd";

dotenv.config();

interface Category {
  id: number;
  category_name: string;
  type: string;
  subtype: string;
  created_at: Date;
  updated_at: Date;
}

interface Props {
  setSelectedCategory: (categoryId: number) => void;
  setMenuId: (menuId: number) => void;
  selectedCategory: number;
  totalItemInCart: number;
  orderId: number;
  tableId: number;
  takeAway: number;
  isCategoryLoading: boolean;
}

export const Categories = ({
  selectedCategory,
  setSelectedCategory,
  setMenuId,
  isCategoryLoading
}: Props) => {
  const params = useParams();
  const navigate = useNavigate();

  const selectedCategoryIds = useRef([10, 11]);
  const allowedCategoryId = useRef<number[]>([]);
  const defaultCategories = useRef<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCheckShouldUpdateData = () => {
    // Check time to update the categories
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const currentDay = currentDate.getDay();

    const {
      shouldEnableCategoryLimitDays,
      shouldEnableCategoryLimitStartHour,
      shouldEnableCategoryLimitStartMinutes,
      shouldEnableCategoryLimitEndHour,
      shouldEnableCategoryLimitEndMinutes
    } = categoryLimiter;

    // Check data data availability
    if (!shouldEnableCategoryLimitDays?.length) return false;
    if (!shouldEnableCategoryLimitStartHour && shouldEnableCategoryLimitStartHour !== 0) return false;
    if (!shouldEnableCategoryLimitEndHour && shouldEnableCategoryLimitEndHour !== 0) return false;
    if (!shouldEnableCategoryLimitStartMinutes && shouldEnableCategoryLimitStartMinutes !== 0) return false;
    if (!shouldEnableCategoryLimitEndMinutes && shouldEnableCategoryLimitEndMinutes !== 0) return false;

    if (!shouldEnableCategoryLimitDays.includes(currentDay)) return false;

    // If the start hour < end hour
    if (shouldEnableCategoryLimitStartHour < shouldEnableCategoryLimitEndHour) {
      // If start hour == current hour, consider the current minutes
      if (shouldEnableCategoryLimitStartHour === currentHour) {
        return currentMinutes >= shouldEnableCategoryLimitStartMinutes;
      }

      // If end hour == current hour, consider the current minutes
      if (shouldEnableCategoryLimitEndHour === currentHour) {
        return currentMinutes <= shouldEnableCategoryLimitEndMinutes;
      }

      // else
      return shouldEnableCategoryLimitStartHour <= currentHour && currentHour <= shouldEnableCategoryLimitEndHour;
    }

    // If the start hour > end hour
    if (shouldEnableCategoryLimitStartHour > shouldEnableCategoryLimitEndHour) {
      // If start hour == current hour, consider the current minutes
      if (shouldEnableCategoryLimitStartHour === currentHour) {
        return currentMinutes >= shouldEnableCategoryLimitStartMinutes;
      }

      // If end hour == current hour, consider the current minutes
      if (shouldEnableCategoryLimitEndHour === currentHour) {
        return currentMinutes <= shouldEnableCategoryLimitEndMinutes;
      }

      // else
      return  currentHour >= shouldEnableCategoryLimitStartHour || currentHour <= shouldEnableCategoryLimitEndHour;
    }

    //  Else, start hour == end hour
    if (currentHour === shouldEnableCategoryLimitStartHour && currentHour === shouldEnableCategoryLimitEndHour) {
      return currentMinutes >= shouldEnableCategoryLimitStartMinutes && currentMinutes <= shouldEnableCategoryLimitEndMinutes
    }

    return false;
  };

  const handleCheckCategories = () => {
    if (!defaultCategories.current?.length) return defaultCategories.current;

    // Check categories based on menuId
    if (params.menuId && allowedCategoryId.current.length) {
      const allowedCategories = defaultCategories.current.filter((category) => {
        return allowedCategoryId.current.includes(category.id);
      });

      return allowedCategories;
    }

    // Check categories based on time (if no menuId provided)
    const shouldUpdateData = handleCheckShouldUpdateData();
    if (!shouldUpdateData) return defaultCategories.current;

    const filteredCategories = defaultCategories.current.filter((category) => selectedCategoryIds.current.includes(category.id));
    return filteredCategories;
  }

  const handleNavigateToTable = (tableId: string | number) => {
    // Navigate to table data
    // Case:
    // * Incorrect menu id provided
    navigate(`/jianghu/table/${tableId}`);
  }

  const handleCheckMenuAvailability = () => {
    if (!params.menuId) return;

    const paramsMenuId: any = params.menuId;
    const menuId = isNaN(paramsMenuId) ? 0 : parseInt(params.menuId);
    if (!menuId) {
      handleNavigateToTable(params.id || '');
      return;
    }

    const selectedMenu = availableMenu.filter((menu) => menu.menuId === menuId);
    if (!selectedMenu.length) {
      handleNavigateToTable(params.id || '');
      return;
    }

    setMenuId(menuId);
    allowedCategoryId.current = selectedMenu[0].categoryIds;
  };

  const handleSetupSelectedCategoryIds = () => {
    if (params.menuId) {
      selectedCategoryIds.current = [];
      return;
    }

    const selectedIds = process.env.REACT_APP_SELECTED_HOUR_CATEGORY_IDS;
    if (!selectedIds) {
      selectedCategoryIds.current = [];
      return;
    }

    try {
      const parsedLimitedIds = selectedIds.split(',');
      if (!Array.isArray(parsedLimitedIds)) return;

      const selectedIdsNumber = parsedLimitedIds.map((data) => parseInt(data));
      selectedCategoryIds.current = selectedIdsNumber;
    } catch (error) {}
  }

  useEffect(() => {
    const fetchCateogries = async () => {
      setIsLoading(true);
      const res = await axios.get(
        process.env.REACT_APP_API_BASE_URL + "category/main"
      );

      const removedCategoryIds = categoryLimiter.shouldBeRemovedCategoryIds || [];
      let filteredCategories = [...res.data];

      if (removedCategoryIds?.length) filteredCategories = (res.data || []).filter((category: Category) => !removedCategoryIds.includes(category.id))

      setCategories(filteredCategories);
      defaultCategories.current = filteredCategories;
      setIsLoading(false);
    };

    setMenuId(0);
    handleSetupSelectedCategoryIds();
    handleCheckMenuAvailability();
    fetchCateogries();
  }, []);

  useEffect(() => {
    const currentInterval = setInterval(() => {
      const currentCategories = handleCheckCategories();

      setCategories(currentCategories);
    }, 1000)

    return () => {
      clearInterval(currentInterval);
    }
  }, []);

  useEffect(() => {
    const currentCategory = categories.find((category) => category.id === selectedCategory);
    if (!currentCategory?.id) {
      const firstCategory = categories?.[0];
      if (firstCategory?.id) setSelectedCategory(firstCategory.id);
    }
  }, [categories, selectedCategory])

  return (
    <>
        <div className="font-bold font-black z-10" style={{padding: "20px 8px 20px 8px", overflowX: "scroll", whiteSpace:"nowrap", position:"fixed", width:"100%", backgroundColor:"#F0F2F5CC", backdropFilter:"blur(5px)", borderBottom:"1px solid #00000011"}}>
          {categories.map((p) => (
              <span key={p.id} onClick={() => setSelectedCategory(p.id)} className={`rounded ${p.id === selectedCategory ? "bg-red-600 text-white p-2" : "text-gray-600 p-2"}`}>
                  {p.category_name}
              </span>
          ))}
        </div>
    </>
  );
};
