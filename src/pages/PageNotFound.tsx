import React from "react";
import { useNavigate } from "react-router-dom";

export const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex md:flex-row flex-col justify-center mt-5 ">
      <div className="font-bold text-lg text-center mt-5">
        Page Not Found !
        <div className="underline mt-5">
          <div onClick={() => navigate("/jianghu/")} className="underline ">
            Click Here to Valid Page
          </div>
        </div>
      </div>
    </div>
  );
};
