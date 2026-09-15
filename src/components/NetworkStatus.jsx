import { useEffect, useState } from "react";
import { syncPendingSurveys } from "../services/sync";

export default function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  async function syncData() {
    if (!navigator.onLine) {
      return;
    }

    try {
      setSyncing(true);

      console.log("🌐 Online → bắt đầu đồng bộ...");

      const result = await syncPendingSurveys();

      console.log("📦 Kết quả đồng bộ:", result);
    } catch (error) {
      console.error("❌ Sync error:", error);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);

      console.log("🟢 Đã có Internet");

      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("VKU Field Survey", {
          body: "🟢 Đã có Internet. Đang đồng bộ dữ liệu..."
        });
      }

      await syncData();
    };

    const handleOffline = () => {
      setOnline(false);

      console.log("🔴 Mất Internet");

      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("VKU Field Survey", {
          body: "🔴 Offline. Dữ liệu sẽ được lưu trên thiết bị."
        });
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Nếu mở app khi đang Online
    if (navigator.onLine) {
      syncData();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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
      {syncing
        ? "🔄 Đang đồng bộ..."
        : online
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