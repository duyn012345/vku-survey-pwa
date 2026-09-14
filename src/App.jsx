import { useEffect, useState } from "react";

import Dashboard
  from "./pages/Dashboard";

import NewSurvey
  from "./pages/NewSurvey";

import SurveyList
  from "./pages/SurveyList";

import {
  syncPendingSurveys
} from "./services/sync";

import "./index.css";


export default function App() {

  const [page, setPage] =
    useState("dashboard");


async function autoSync() {

  if (!navigator.onLine) {
    return;
  }


  try {

    const result =
      await syncPendingSurveys();


    if (
      result.successCount > 0
    ) {

      console.log(
        `✓ Đã đồng bộ ${result.successCount} phiên`
      );


      // Thông báo trình duyệt
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {

        new Notification(
          "VKU Field Survey",
          {
            body:
              `Đã đồng bộ ${result.successCount} phiên khảo sát lên Google Sheets.`
          }
        );

      }

    }


  } catch (error) {

    console.error(
      "Auto sync error:",
      error
    );

  }

}

  useEffect(() => {

    if (
      "Notification" in window &&
      Notification.permission === "default"
    ) {

      Notification.requestPermission();

    }

  }, []);


  useEffect(() => {

    // Khi mở app
    autoSync();


    // Khi Offline → Online
    const handleOnline =
      async () => {

        console.log(
          "Internet connected"
        );

        await autoSync();

      };


    window.addEventListener(
      "online",
      handleOnline
    );


    // Tự kiểm tra mỗi 30 giây
    const interval =
      setInterval(
        autoSync,
        30000
      );


    return () => {

      window.removeEventListener(
        "online",
        handleOnline
      );

      clearInterval(interval);

    };

  }, []);


  if (page === "new") {

    return (
      <NewSurvey
        onBack={() =>
          setPage("dashboard")
        }
      />
    );

  }


  if (page === "list") {

    return (
      <SurveyList
        onBack={() =>
          setPage("dashboard")
        }
      />
    );

  }


  return (

    <Dashboard

      onNewSurvey={() =>
        setPage("new")
      }

      onViewSurveys={() =>
        setPage("list")
      }

    />

  );
}