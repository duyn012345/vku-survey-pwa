import { useEffect, useState } from "react";
import { getAllSurveys } from "../services/db";

export default function SurveyList({ onBack }) {
  const [surveys, setSurveys] = useState([]);

  async function loadSurveys() {
    const data = await getAllSurveys();
    setSurveys(data);
  }

  useEffect(() => {
    loadSurveys();
  }, []);

  function getStatus(survey) {
    if (survey.syncStatus === "synced") {
      return <span className="status synced">🟢 Đã đồng bộ</span>;
    }

    if (survey.syncStatus === "syncing") {
      return <span className="status syncing">🔄 Đang đồng bộ</span>;
    }

    if (survey.syncStatus === "error") {
      return <span className="status error">🔴 Lỗi đồng bộ</span>;
    }

    return <span className="status pending">🟡 Chờ đồng bộ</span>;
  }

  return (
    <div className="page">
      <div className="page-title">
        <button className="back-button" onClick={onBack}>
          ‹
        </button>
        <div>
          <h1>Danh sách khảo sát</h1>
          <p>{surveys.length} phiên ghi nhận</p>
        </div>
      </div>

      {surveys.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <p>Chưa có phiên khảo sát nào.</p>
        </div>
      ) : (
        <div className="survey-list">
          {surveys.map((survey) => (
            <div className="survey-card" key={survey.sessionId}>
              <div className="survey-card-header">
                <strong>#{survey.sessionId}</strong>
                {getStatus(survey)}
              </div>

              <div className="survey-card-body">
                <p>
                  <span className="info-icon">👤</span>{" "}
                  <strong>{survey.studentName}</strong>
                </p>
                <p>
                  <span className="info-icon">🎓</span> {survey.faculty}
                </p>
                <p>
                  <span className="info-icon">📅</span>{" "}
                  {new Date(survey.createdAt).toLocaleString("vi-VN")}
                </p>
                <p>
                  <span className="info-icon">📍</span>{" "}
                  {survey.latitude?.toFixed(6)}, {survey.longitude?.toFixed(6)}
                </p>
              </div>

              {survey.syncError && (
                <small className="error-text">⚠️ {survey.syncError}</small>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}