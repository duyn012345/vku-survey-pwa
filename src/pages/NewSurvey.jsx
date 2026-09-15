import { useState } from "react";
import { addSurvey } from "../services/db";
import { getCurrentLocation } from "../services/location";
import { sendSurvey } from "../services/sync";
import { compressImage } from "../services/image";

function generateSessionId() {
  const date = new Date();
  const timestamp = date
    .toISOString()
    .replace(/\D/g, "")
    .slice(0, 14);

  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `VKU-${timestamp}-${random}`;
}

export default function NewSurvey({ onBack }) {
  const [interviewer, setInterviewer] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("");

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState([]);
  const [q4, setQ4] = useState([]);
  const [q5, setQ5] = useState("");
  const [q6, setQ6] = useState([]);
  const [q7, setQ7] = useState([]);
  const [q8, setQ8] = useState("");

  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLocation() {
    setLoadingLocation(true);
    setMessage("📍 Đang lấy vị trí...");

    try {
      const position = await getCurrentLocation();
      setLocation(position);
      setMessage("✓ Đã lấy vị trí");
    } catch (error) {
      setMessage("❌ Không thể lấy vị trí. Hãy cấp quyền GPS.");
    } finally {
      setLoadingLocation(false);
    }
  }

  function handleMultiSelect(value, current, setter) {
    if (current.includes(value)) {
      setter(current.filter(item => item !== value));
    } else {
      setter([...current, value]);
    }
  }

  async function handlePhoto(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setMessage("📷 Đang xử lý ảnh...");

      const compressed = await compressImage(file, 1280, 1280, 0.7);

      console.log("Original:", Math.round(file.size / 1024), "KB");
      console.log("Compressed:", Math.round(compressed.size / 1024), "KB");

      setPhoto(compressed);
      setMessage("✓ Đã chụp và lưu ảnh");
    } catch (error) {
      console.error(error);
      setMessage("❌ Không thể xử lý ảnh");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!interviewer.trim()) {
      setMessage("⚠️ Vui lòng nhập tên người phỏng vấn");
      return;
    }

    if (!studentName.trim()) {
      setMessage("⚠️ Vui lòng nhập tên sinh viên");
      return;
    }

    // if (!location) {
    //   setMessage("⚠️ Vui lòng lấy vị trí GPS");
    //   return;
    // }

    setSaving(true);
    setMessage("💾 Đang lưu khảo sát...");

    const survey = {
      sessionId: generateSessionId(),
      interviewer,
      createdAt: new Date().toISOString(),
   
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      accuracy: location?.accuracy ?? null,

      studentName,
      studentId,
      faculty,
      year,
      q1,
      q2,
      q3: q3.join(", "),
      q4: q4.join(", "),
      q5,
      q6: q6.join(", "),
      q7: q7.join(", "),
      q8,
      photo,
      syncStatus: "pending"
    };

    try {
      await addSurvey(survey);

      if (navigator.onLine) {
        try {
          await sendSurvey(survey);

          const { updateSurvey } = await import("../services/db");

          await updateSurvey(survey.sessionId, {
            syncStatus: "synced",
            syncedAt: new Date().toISOString()
          });

          setMessage("✓ Đã lưu và đồng bộ lên Google Sheets");
        } catch (error) {
          setMessage("✓ Đã lưu Offline. Chờ đồng bộ khi có mạng.");
        }
      } else {
        setMessage("✓ Đã lưu Offline. Sẽ tự động đồng bộ khi có mạng.");
      }

      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("❌ Không thể lưu khảo sát");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page page-form">
      <div className="page-title">
        <button className="back-button" onClick={onBack}>
          ‹
        </button>
        <div>
          <h1>Tạo phiên khảo sát</h1>
          <p>VKU Student Survey</p>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <form className="survey-form" onSubmit={handleSubmit}>
        {/* Người phỏng vấn */}
        <section className="form-section">
          <h2>1. Thông tin khảo sát viên</h2>
          <div className="input-group">
            <label>Họ và tên người phỏng vấn *</label>
            <div className="input-with-icon">
                <span className="input-icon">🪪</span>
                <input
                  type="text"
                  value={interviewer}
                  onChange={e => setInterviewer(e.target.value)}
                  placeholder="Nhập tên người thực hiện"
                />
              </div>
          </div>
        </section>

        {/* Location */}
        <section className="form-section">
          <h2>2. Xác thực thời gian & vị trí</h2>
          <p className="time-display">
            🕒 Thời gian ghi nhận: {new Date().toLocaleString("vi-VN")}
          </p>

          <button
            type="button"
            className="location-button"
            onClick={handleLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? "📍 Đang định vị..." : "📍 Lấy tọa độ GPS hiện tại"}
          </button>

          {location && (
            <div className="location-box">
              <p>🌐 <strong>Latitude:</strong> {location.latitude}</p>
              <p>🌐 <strong>Longitude:</strong> {location.longitude}</p>
              <p>🎯 <strong>Sai số:</strong> {Math.round(location.accuracy)} m</p>
            </div>
          )}
        </section>

        {/* Sinh viên */}
        <section className="form-section">
          <h2>3. Thông tin đối tượng khảo sát</h2>

          <div className="input-group">
            <label>Họ và tên sinh viên *</label>
             <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                   type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Nhập đầy đủ họ và tên sinh viên"
                />
             </div>
          </div>

          <div className="input-group">
            <label>Mã SV</label>
            <input
             type="text"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder=" xxx"
            />
          </div>

          <div className="input-group">
            <label>Khoa / Ngành đang theo học</label>
            <select
              value={faculty}
              onChange={e => setFaculty(e.target.value)}
            >
              <option value="">-- Chọn --</option>
              <option>Công nghệ thông tin</option>
              <option>Kinh tế số</option>
              <option>Du lịch</option>
              <option>Điện tử</option>
              <option>Khác</option>
            </select>
          </div>

          <div className="input-group">
            <label>Năm học hiện tại</label>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
            >
              <option value="">-- Chọn năm học --</option>
              <option>Năm 1</option>
              <option>Năm 2</option>
              <option>Năm 3</option>
              <option>Năm 4</option>
            </select>
          </div>
        </section>

        {/* Questions */}
        <section className="form-section">
          <h2>4. Khảo sát nhu cầu việc làm</h2>

          <div className="question-group">
            <label className="question-title">
              1. Bạn đã có kinh nghiệm làm thêm/thực tập trước đây chưa?
            </label>
            <div className="radio-group">
              {["Có", "Chưa"].map(option => (
                <label key={option} className="radio-item">
                  <input
                    type="radio"
                    name="q1"
                    value={option}
                    checked={q1 === option}
                    onChange={e => setQ1(e.target.value)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-title">
              2. Bạn đang có dự định tìm việc làm không?
            </label>
            <div className="radio-group">
              {["Có", "Không", "Chưa xác định"].map(option => (
                <label key={option} className="radio-item">
                  <input
                    type="radio"
                    name="q2"
                    value={option}
                    checked={q2 === option}
                    onChange={e => setQ2(e.target.value)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-title">
              3. Bạn mong muốn hình thức làm việc nào?
            </label>
            <div className="checkbox-group">
              {[
                "Part-time",
                "Full-time",
                "Internship",
                "Remote"
              ].map(option => (
                <label className="checkbox-row" key={option}>
                  <input
                    type="checkbox"
                    checked={q3.includes(option)}
                    onChange={() =>
                      handleMultiSelect(option, q3, setQ3)
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-title">
              4. Vị trí công việc bạn muốn hướng đến?
            </label>
            <div className="checkbox-group">
              {[
                "Software Developer",
                "Tester",
                "AI",
                "Marketing",
                "Khác"
              ].map(option => (
                <label className="checkbox-row" key={option}>
                  <input
                    type="checkbox"
                    checked={q4.includes(option)}
                    onChange={() =>
                      handleMultiSelect(option, q4, setQ4)
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="question-title">
              5. Kỳ vọng về mức thu nhập hàng tháng?
            </label>
            <select
              value={q5}
              onChange={e => setQ5(e.target.value)}
            >
              <option value="">-- Chọn --</option>
              <option>Dưới 5 triệu</option>
              <option>5 - 10 triệu</option>
              <option>10 - 20 triệu</option>
      
              <option>Trên 20 triệu</option>
            </select>
          </div>

          <div className="question-group">
            <label className="question-title">
              6. Khó khăn lớn nhất mà bạn gặp phải khi tìm việc?
            </label>
            <div className="checkbox-group">
              {[
                "Thiếu kinh nghiệm/kỹ năng",
                "Không biết tìm việc ở đâu",
                "Thiếu ngoại ngữ",
                "Khác"
              ].map(option => (
                <label className="checkbox-row" key={option}>
                  <input
                    type="checkbox"
                    checked={q6.includes(option)}
                    onChange={() =>
                      handleMultiSelect(option, q6, setQ6)
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-title">
              7. Nhà trường cần hỗ trợ gì thêm cho bạn?
            </label>
            <div className="checkbox-group">
              {[
                // "Viết CV",
                "Phỏng vấn thử",
                "Tìm Internship",
                "Định hướng nghề nghiệp",
                "Kỹ năng chuyên môn",
                // "Tiếng Anh"
              ].map(option => (
                <label className="checkbox-row" key={option}>
                  <input
                    type="checkbox"
                    checked={q7.includes(option)}
                    onChange={() =>
                      handleMultiSelect(option, q7, setQ7)
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="question-title">
              8. Bạn có chia sẻ hoặc đề xuất nào không?
            </label>
            <textarea
              value={q8}
              onChange={e => setQ8(e.target.value)}
              rows="4"
              placeholder="Nhập ..."
            />
          </div>
        </section>

        {/* Camera */}
        <section className="form-section">
          <h2>5. Minh chứng hiện trường</h2>
          <div className="file-input-wrapper">
            <label className="file-upload-btn">
              📷 Chụp / Tải ảnh đối tượng phỏng vấn
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhoto}
              />
            </label>
          </div>

          {photo && (
            <div className="photo-preview">
              <img
                src={URL.createObjectURL(photo)}
                alt="Survey field evidence"
              />
            </div>
          )}
        </section>

        <button
          type="submit"
          className="submit-button"
          disabled={saving}
        >
          {saving ? "💾 Đang lưu dữ liệu..." : "✓ Xác nhận & Lưu phiên khảo sát"}
        </button>
      </form>
    </div>
  );
}