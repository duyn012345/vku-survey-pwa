const DB_NAME = "VKUSurveyDB";
const DB_VERSION = 1;
const STORE_NAME = "surveys";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "sessionId"
        });

        store.createIndex(
          "syncStatus",
          "syncStatus",
          { unique: false }
        );

        store.createIndex(
          "createdAt",
          "createdAt",
          { unique: false }
        );
      }
    };
  });
}


// Thêm survey
export async function addSurvey(survey) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(
      STORE_NAME
    );

    const request = store.add(survey);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}


// Lấy tất cả survey
export async function getAllSurveys() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(
      STORE_NAME
    );

    const request = store.getAll();

    request.onsuccess = () => {
      const surveys = request.result;

      surveys.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

      resolve(surveys);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}


// Lấy survey đang chờ đồng bộ
export async function getPendingSurveys() {
  const surveys = await getAllSurveys();

  return surveys.filter(
    survey =>
      survey.syncStatus === "pending" ||
      survey.syncStatus === "error"
  );
}


// Cập nhật survey
export async function updateSurvey(
  sessionId,
  updates
) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(STORE_NAME);

    const request =
      store.get(sessionId);

    request.onsuccess = () => {

      const survey = request.result;

      if (!survey) {
        reject(
          new Error("Survey not found")
        );
        return;
      }

      const updatedSurvey = {
        ...survey,
        ...updates
      };

      store.put(updatedSurvey);

      resolve(updatedSurvey);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}


// Xóa survey
export async function deleteSurvey(sessionId) {
  const db = await openDB();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        STORE_NAME,
        "readwrite"
      );

    const store =
      transaction.objectStore(STORE_NAME);

    const request =
      store.delete(sessionId);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}