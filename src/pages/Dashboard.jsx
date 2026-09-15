import { useEffect, useState } from "react";

import NetworkStatus from "../components/NetworkStatus";

import { getAllSurveys } from "../services/db";

export default function Dashboard({
  onNewSurvey,
  onViewSurveys,
  dataVersion
}) {
  const [surveys, setSurveys] = useState([]);

  // ========================================
  // TẢI DỮ LIỆU TỪ INDEXEDDB
  // ========================================

  async function loadData() {
    try {
      const data = await getAllSurveys();

      setSurveys(data);
    } catch (error) {
      console.error(
        "Load survey data error:",
        error
      );
    }
  }

  // ========================================
  // TẢI LẠI DỮ LIỆU
  // ========================================
  //
  // dataVersion thay đổi khi App.jsx
  // đồng bộ dữ liệu thành công.
  //
  // Vì vậy Dashboard sẽ tự cập nhật.
  //

  useEffect(() => {
    loadData();
  }, [dataVersion]);

  // ========================================
  // THỐNG KÊ
  // ========================================

  const synced =
    surveys.filter(
      (survey) =>
        survey.syncStatus === "synced"
    ).length;

  const pending =
    surveys.filter(
      (survey) =>
        survey.syncStatus === "pending" ||
        survey.syncStatus === "error"
    ).length;

  // ========================================
  // GIAO DIỆN
  // ========================================

  return (
    <div className="page">

      {/* HEADER */}

      <header className="header">

        <div className="header-title">

          <span className="badge">
            VKU Portal
          </span>

          <h1>
            VKU Field Survey
          </h1>

          <p>
            Khảo sát nhu cầu việc làm
          </p>

        </div>

        <NetworkStatus />

      </header>


      {/* DASHBOARD BUTTONS */}

      <div className="dashboard-buttons">

        <button
          className="primary-button"
          onClick={onNewSurvey}
        >
          <span className="btn-icon">
            ✨
          </span>

          Tạo phiên khảo sát
        </button>


        <button
          className="secondary-button"
          onClick={onViewSurveys}
        >
          <span className="btn-icon">
            📋
          </span>

          Danh sách khảo sát
        </button>

      </div>


      {/* THẺ THÔNG TIN */}

      <div className="quick-info-card">

        <div className="info-badge">
          💡 Mẹo thao tác
        </div>

        <h3>
          Ghi nhận dữ liệu khảo sát
        </h3>

        <p>
          Hệ thống hỗ trợ lưu trữ Offline.
          Bạn có thể thu thập dữ liệu ngay cả
          khi không có mạng và đồng bộ sau!
        </p>

      </div>


      {/* STATISTICS */}

      <div className="stats">

        {/* TỔNG */}

        <div className="stat-card total">

          <div className="stat-icon">
            📊
          </div>

          <strong>
            {surveys.length}
          </strong>

          <span>
            Tổng phiên
          </span>

        </div>


        {/* ĐÃ ĐỒNG BỘ */}

        <div className="stat-card synced">

          <div className="stat-icon">
            ✅
          </div>

          <strong>
            {synced}
          </strong>

          <span>
            Đã đồng bộ
          </span>

        </div>


        {/* CHỜ ĐỒNG BỘ */}

        <div className="stat-card pending">

          <div className="stat-icon">
            ⏳
          </div>

          <strong>
            {pending}
          </strong>

          <span>
            Chờ đồng bộ
          </span>

        </div>

      </div>

    </div>
  );
}