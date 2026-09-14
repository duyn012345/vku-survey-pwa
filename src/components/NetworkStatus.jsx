import { useEffect, useState } from "react";

export default function NetworkStatus() {

  const [online, setOnline] =
    useState(navigator.onLine);


  useEffect(() => {

    const handleOnline = () => {

      setOnline(true);


      if (
        "Notification" in window &&
        Notification.permission ===
          "granted"
      ) {

        new Notification(
          "VKU Field Survey",
          {
            body:
              "🟢 Đã có Internet. Đang đồng bộ dữ liệu..."
          }
        );

      }

    };


    const handleOffline = () => {

      setOnline(false);


      if (
        "Notification" in window &&
        Notification.permission ===
          "granted"
      ) {

        new Notification(
          "VKU Field Survey",
          {
            body:
              "🔴 Offline. Dữ liệu sẽ được lưu trên thiết bị."
          }
        );

      }

    };


    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );


    return () => {

      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );

    };

  }, []);


  return (

    <div
      className={
        online
          ? "network online"
          : "network offline"
      }
    >

      {online
        ? "🟢 Online"
        : "🔴 Offline"}

      {!online && (
        <small>
          Dữ liệu sẽ được lưu trên thiết bị
        </small>
      )}

    </div>

  );
}