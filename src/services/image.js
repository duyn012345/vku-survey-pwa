export function compressImage(
  file,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.7
) {

  return new Promise(
    (resolve, reject) => {

      const image =
        new Image();


      const reader =
        new FileReader();


      reader.onload = event => {

        image.src =
          event.target.result;

      };


      reader.onerror = () => {

        reject(
          new Error(
            "Cannot read image"
          )
        );

      };


      image.onload = () => {

        let width =
          image.width;

        let height =
          image.height;


        // Resize
        if (
          width > maxWidth ||
          height > maxHeight
        ) {

          const ratio =
            Math.min(
              maxWidth / width,
              maxHeight / height
            );


          width =
            Math.round(
              width * ratio
            );


          height =
            Math.round(
              height * ratio
            );

        }


        const canvas =
          document.createElement(
            "canvas"
          );


        canvas.width =
          width;

        canvas.height =
          height;


        const context =
          canvas.getContext(
            "2d"
          );


        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );


        canvas.toBlob(
          blob => {

            if (!blob) {

              reject(
                new Error(
                  "Image compression failed"
                )
              );

              return;
            }


            resolve(blob);

          },

          "image/jpeg",

          quality

        );

      };


      reader.readAsDataURL(
        file
      );

    }
  );
}