const SHEET_NAME = "SurveyVKU";

// ID folder Google Drive
const DRIVE_FOLDER_ID = "19jYIUNIUyi80DFgKZnuzNECx7vYRpE4t";


function doGet() {

  return ContentService
    .createTextOutput(
      JSON.stringify({
        success: true,
        message: "VKU Field Survey API is running"
      })
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}


function doPost(e) {

  try {

    const data =
      JSON.parse(e.postData.contents);

    const sheet =
      SpreadsheetApp
        .getActiveSpreadsheet()
        .getSheetByName(SHEET_NAME);


    // =========================
    // 1. KIỂM TRA SESSION
    // =========================

    const values =
      sheet.getDataRange().getValues();


    for (
      let i = 1;
      i < values.length;
      i++
    ) {

      if (
        String(values[i][0]) ===
        String(data.sessionId)
      ) {

        return ContentService
          .createTextOutput(
            JSON.stringify({
              success: true,
              message: "Session already exists",
              duplicate: true
            })
          )
          .setMimeType(
            ContentService.MimeType.JSON
          );
      }
    }


    // =========================
    // 2. UPLOAD ẢNH
    // =========================

    let photoUrl = "";


    if (data.photo) {

      photoUrl =
        uploadPhotoToDrive(
          data.photo,
          data.sessionId
        );

    }


    // =========================
    // 3. LƯU DATA VÀO SHEET
    // =========================

    sheet.appendRow([

      data.sessionId || "",

      data.interviewer || "",

      data.createdAt || "",

      data.latitude ?? "",

      data.longitude ?? "",
      
      data.accuracy ?? "",

      data.studentName || "",

      data.studentId || "",

      data.faculty || "",

      data.year || "",

      data.q1 || "",

      data.q2 || "",

      data.q3 || "",

      data.q4 || "",

      data.q5 || "",

      data.q6 || "",

      data.q7 || "",

      data.q8 || "",

      photoUrl,

      new Date()

    ]);


    // =========================
    // 4. TRẢ KẾT QUẢ
    // =========================

    return ContentService
      .createTextOutput(
        JSON.stringify({

          success: true,

          message:
            "Survey and photo saved successfully",

          photoUrl: photoUrl

        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );


  } catch (error) {

    return ContentService
      .createTextOutput(
        JSON.stringify({

          success: false,

          message:
            error.toString()

        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );
  }
}


// ========================================
// UPLOAD ẢNH VÀO GOOGLE DRIVE
// ========================================

function uploadPhotoToDrive(
  base64Data,
  sessionId
) {

  try {

    // Ví dụ:
    // data:image/jpeg;base64,/9j/4AAQ...

    const parts =
      base64Data.split(",");


    if (parts.length < 2) {

      throw new Error(
        "Invalid image data"
      );

    }


    const meta =
      parts[0];

    const base64 =
      parts[1];


    // Lấy MIME type
    const mimeMatch =
      meta.match(
        /data:(.*?);base64/
      );


    const mimeType =
      mimeMatch
        ? mimeMatch[1]
        : "image/jpeg";


    // Decode Base64
    const bytes =
      Utilities.base64Decode(
        base64
      );


    // Tạo Blob
    const blob =
      Utilities.newBlob(
        bytes,
        mimeType,
        `${sessionId}.jpg`
      );


    // Lấy folder
    const folder =
      DriveApp.getFolderById(
        DRIVE_FOLDER_ID
      );


    // Tạo file
    const file =
      folder.createFile(
        blob
      );


    // Cho phép xem bằng link
    file.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );


    // URL
    return file.getUrl();


  } catch (error) {

    throw new Error(
      "Photo upload failed: " +
      error.toString()
    );

  }
}

function testDrive() {
  const folder = DriveApp.getFolderById("19jYIUNIUyi80DFgKZnuzNECx7vYRpE4t");

  const file = folder.createFile(
    "test.txt",
    "Test VKU Field Survey"
  );

  Logger.log(file.getUrl());
}