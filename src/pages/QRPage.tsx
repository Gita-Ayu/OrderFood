import React from "react";

export default function QRPage() {
  return (
    <div className="flex md:flex-row flex-col items-center justify-center h-screen">
      <div className="md:mr-5 font-bold text-lg mb-3">
        Scan QR Code (On Table) to Start Order
      </div>
      <div>
        <img
          src={
            process.env.REACT_APP_IMAGES_BASE_URL + "/qrcodesample200x200.png"
          }
          alt=""
          className="border-solid border-2 shadow-xl rounded-lg"
        />
      </div>
    </div>
  );
}
