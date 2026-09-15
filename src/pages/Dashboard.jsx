import { useEffect, useState } from "react";
import NetworkStatus from "../components/NetworkStatus";
import { getAllSurveys } from "../services/db";
import { syncPendingSurveys } from "../services/sync";

export default function Dashboard({ onNewSurvey, onViewSurveys }) {
  const [surveys, setSurveys] = useState([]);
  // const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    const data = await getAllSurveys();
    setSurveys(data);
  }

  // async function handleSync() {
  //   if (!navigator.onLine) {
  //     setMessage("🔴 Hiện tại đang Offline");
  //     return;
  //   }

  //   setSyncing(true);
  //   setMessage("🔄 Đang đồng bộ...");

  //   try {
  //     const result = await syncPendingSurveys();
  //     await loadData();
  //     setMessage(`✓ Đồng bộ thành công: ${result.successCount} phiên`);
  //   } catch (error) {
  //     setMessage("❌ Đồng bộ thất bại");
  //   } finally {
  //     setSyncing(false);
  //   }
  // }

  useEffect(() => {
    loadData();
  }, []);

  const synced = surveys.filter((x) => x.syncStatus === "synced").length;
  const pending = surveys.filter(
    (x) => x.syncStatus === "pending" || x.syncStatus === "error"
  ).length;

  return (
    <div className="page">
      {/* HEADER */}
      <header className="header">
        <div className="header-title">
          <span className="badge">VKU Portal</span>
          <h1>VKU Field Survey</h1>
          <p>Khảo sát nhu cầu việc làm </p>
        </div>
        <NetworkStatus />
      </header>

      {/* DASHBOARD BUTTONS */}
      <div className="dashboard-buttons">
        <button className="primary-button" onClick={onNewSurvey}>
          <span className="btn-icon">✨</span> Tạo phiên khảo sát
        </button>

        <button className="secondary-button" onClick={onViewSurveys}>
          <span className="btn-icon">📋</span> Danh sách khảo sát
        </button>

        {/* <button
          className="sync-button"
          onClick={handleSync}
          disabled={syncing}
        >
          <span className="btn-icon">{syncing ? "🔄" : "🚀"}</span>
          {syncing ? "Đang đồng bộ..." : "Đồng bộ dữ liệu ngay"}
        </button> */}
      </div>

      {/* THÔNG BÁO TẠM THỜI */}
      {message && <div className="message">{message}</div>}

      {/* THẺ ĐIỂM NHẤN TRUNG TÂM (LẤP KHOẢNG TRỐNG) */}
      <div className="quick-info-card">
        <div className="info-badge">💡 Mẹo thao tác</div>
        <h3>Ghi nhận dữ liệu khảo sát</h3>
        <p>
          Hệ thống hỗ trợ lưu trữ Offline. Bạn có thể thu thập dữ liệu ngay cả khi không có mạng và đồng bộ sau!
        </p>
      </div>

      {/* STATISTICS */}
      <div className="stats">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <strong>{surveys.length}</strong>
          <span>Tổng phiên</span>
        </div>

        <div className="stat-card synced">
          <div className="stat-icon">✅</div>
          <strong>{synced}</strong>
          <span>Đã đồng bộ</span>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <strong>{pending}</strong>
          <span>Chờ đồng bộ</span>
        </div>
      </div>
    </div>
  );
}