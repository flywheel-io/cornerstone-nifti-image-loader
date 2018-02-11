/* eslint import/extensions:0 */
import ndarray from 'ndarray';

function linearTransformation (value, slope, intercept) {
  return (value - intercept) / slope;
}

export default function convertFloatDataToInteger (imageDataView, metaData) {
  const intRange = Math.pow(2, 16); // 65536
  const floatMin = metaData.minPixelValue;
  const floatMax = metaData.maxPixelValue;
  const floatRange = floatMax - floatMin;
  const slope = floatRange === 0 ? 1 : (floatRange / intRange);
  const intercept = floatMin;

  // creates a Uint16Array ndarray to hold the converted pixel data
  const convertedImageDataView = ndarray(
    new Uint16Array(imageDataView.data.length),
    imageDataView.shape,
    imageDataView.stride,
    imageDataView.offset
  );

  // converts from float to int, scaling each with a linear linearTransformation
  for (let i = 0; i < imageDataView.shape[0]; i++) {
    for (let j = 0; j < imageDataView.shape[1]; j++) {
      for (let k = 0; k < imageDataView.shape[2]; k++) {
        let value = imageDataView.get(i, j, k);

        value = linearTransformation(value, slope, intercept);
        convertedImageDataView.set(i, j, k, Math.floor(value));
      }
    }
  }

  return {
    convertedImageDataView,
    floatImageDataView: imageDataView,
    OriginalTypedArrayConstructor: metaData.dataType.TypedArrayConstructor,
    metaData: {
      slope,
      intercept,
      minPixelValue: Math.floor(linearTransformation(metaData.minPixelValue, slope, intercept)),
      maxPixelValue: Math.floor(linearTransformation(metaData.maxPixelValue, slope, intercept)),
      dataType: {
        TypedArrayConstructor: Uint16Array,
        isDataInFloat: true,
        isDataInColors: metaData.dataType.isDataInColors
      }
    }
  };
}
