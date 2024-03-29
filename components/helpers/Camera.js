import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Image, Modal } from "react-native";
import { Camera, requestCameraPermissionsAsync, CameraType,camera } from "expo-camera";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export default function CameraTest({ setImage, setCameraModal, cameraModal }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [type, setType] = useState(CameraType.back);
  useEffect(() => {
    (async () => {
      const cameraStatus = await requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === false) {
    return <Text>{/*No access to camera*/}</Text>;
  }

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(options={base64:true, quality: 0, scale: 0.1});
      const result = await manipulateAsync("data:image/png;base64,"+data.base64,[{resize:{height:500, width:500}}],{base64:true, compress: 1, format: SaveFormat.PNG});
      setImage("data:image/png;base64,"+result.base64);
      setCameraModal(false);
    }
  };

  return (
    <View style={{alignContent: 'center', justifyContent: 'center'}}>
      <Modal visible={cameraModal} animationType="slide">
        <View>
          <View style={styles.cameraContainer}>
            <Camera
              ref={(ref) => setCamera(ref)}
              style={styles.fixedRatio}
              type={type}
              ratio={"1:1"}
            />
          </View>
          <View>
          <Button title="Close Camera" onPress={() => setCameraModal(false)} />
          <Button
            title="Flip Image"
            onPress={() => {
              setType(
                type === CameraType.back ? CameraType.front : CameraType.back
              );
            }}
          ></Button>
          <Button title="Take Picture" onPress={() => {takePicture()}} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  cameraContainer: {
    flexDirection: "row",
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1,
  },
});
