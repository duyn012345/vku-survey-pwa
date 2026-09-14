import {
  getPendingSurveys,
  updateSurvey
} from "./db";


const GOOGLE_SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_SCRIPT_URL;


// ========================================
// BLOB → BASE64
// ========================================

export function blobToBase64(blob) {

  return new Promise(
    (resolve, reject) => {

      if (!blob) {

        resolve("");

        return;
      }


      const reader =
        new FileReader();


      reader.onloadend = () => {

        resolve(
          reader.result
        );

      };


      reader.onerror = () => {

        reject(
          reader.error
        );

      };


      reader.readAsDataURL(
        blob
      );

    }
  );
}


// ========================================
// GỬI SURVEY
// ========================================

export async function sendSurvey(
  survey
) {

  let photoBase64 = "";


  // Nếu có ảnh trong IndexedDB
  if (survey.photo) {

    photoBase64 =
      await blobToBase64(
        survey.photo
      );

  }


  const payload = {

    sessionId:
      survey.sessionId,

    interviewer:
      survey.interviewer,

    createdAt:
      survey.createdAt,

    latitude:
      survey.latitude,

    longitude:
      survey.longitude,

    accuracy:
      survey.accuracy,

    studentName:
      survey.studentName,

    studentId:
      survey.studentId,

    faculty:
      survey.faculty,

    year:
      survey.year,

    q1:
      survey.q1,

    q2:
      survey.q2,

    q3:
      survey.q3,

    q4:
      survey.q4,

    q5:
      survey.q5,

    q6:
      survey.q6,

    q7:
      survey.q7,

    q8:
      survey.q8,

    // Ảnh Base64
    photo:
      photoBase64
  };


  const response =
    await fetch(
      GOOGLE_SCRIPT_URL,
      {

        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify(
            payload
          )

      }
    );


  if (!response.ok) {

    throw new Error(
      `Upload failed: ${response.status}`
    );

  }


  const result =
    await response.json();


  if (!result.success) {

    throw new Error(
      result.message ||
      "Google Sheet error"
    );

  }


  return result;
}


// ========================================
// ĐỒNG BỘ OFFLINE
// ========================================

export async function syncPendingSurveys() {

  if (!navigator.onLine) {

    return {

      success: false,

      message:
        "Device is offline"

    };

  }


  const pending =
    await getPendingSurveys();


  let successCount = 0;

  let failedCount = 0;


  for (
    const survey of pending
  ) {

    try {

      // -------------------------
      // Đang sync
      // -------------------------

      await updateSurvey(
        survey.sessionId,
        {
          syncStatus:
            "syncing"
        }
      );


      // -------------------------
      // Upload
      // -------------------------

      const result =
        await sendSurvey(
          survey
        );


      // -------------------------
      // Thành công
      // -------------------------

      await updateSurvey(
        survey.sessionId,
        {

          syncStatus:
            "synced",

          syncedAt:
            new Date().toISOString(),

          photoUrl:
            result.photoUrl ||
            null,

          syncError:
            null

        }
      );


      successCount++;


    } catch (error) {

      console.error(
        "Sync failed:",
        survey.sessionId,
        error
      );


      await updateSurvey(
        survey.sessionId,
        {

          syncStatus:
            "error",

          syncError:
            error.message

        }
      );


      failedCount++;

    }

  }


  return {

    success: true,

    successCount,

    failedCount

  };

}