import React, { useState } from "react";
import { StyleSheet, View, Text, Button, TouchableOpacity } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { WebView } from "react-native-webview";

type ContentData = {
  type: "video" | "image" | "3d";
  url: string;
};

export default function App() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<ContentData | null>(null);

  if (!permission) {
    // Permissions are loading
    return <View />;
  }

  if (!permission.granted) {
    // Permissions are not granted
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  function handleBarcodeScanned({ data }: { data: string }) {
    try {
      const parsedData = JSON.parse(data) as ContentData;
      setScannedData(parsedData);
    } catch (e) {
      alert("Invalid QR Code data");
    }
  }

  const renderContent = () => {
    if (!scannedData) return null;

    const { type, url } = scannedData;

    const generateHtml = () => {
      switch (type) {
        case "video":
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
                <script src="https://cdn.rawgit.com/jeromeetienne/ar.js/2.0.1/aframe/build/aframe-ar.min.js"></script>
              </head>
              <body style="margin: 0; overflow: hidden;">
                <a-scene embedded arjs>
                  <a-marker preset="hiro">
                    <a-video src="${url}" width="4" height="2" position="0 0 0"></a-video>
                  </a-marker>
                  <a-entity camera></a-entity>
                </a-scene>
              </body>
            </html>
          `;
        case "image":
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
                <script src="https://cdn.rawgit.com/jeromeetienne/ar.js/2.0.1/aframe/build/aframe-ar.min.js"></script>
              </head>
              <body style="margin: 0; overflow: hidden;">
                <a-scene embedded arjs>
                  <a-marker preset="hiro">
                    <a-image src="${url}" position="0 0 0" width="2" height="2"></a-image>
                  </a-marker>
                  <a-entity camera></a-entity>
                </a-scene>
              </body>
            </html>
          `;
        case "3d":
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
                <script src="https://cdn.rawgit.com/jeromeetienne/ar.js/2.0.1/aframe/build/aframe-ar.min.js"></script>
              </head>
              <body style="margin: 0; overflow: hidden;">
                <a-scene embedded arjs>
                  <a-marker preset="hiro">
                    <a-entity gltf-model="${url}" position="0 0 0" scale="0.5 0.5 0.5"></a-entity>
                  </a-marker>
                  <a-entity camera></a-entity>
                </a-scene>
              </body>
            </html>
          `;
        default:
          return `<h1>Unsupported type</h1>`;
      }
    };

    return (
      <WebView
        originWhitelist={["*"]}
        source={{ html: generateHtml() }}
        style={{ flex: 1 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {!scannedData ? (
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.contentContainer}>
          {renderContent()}
          <Button title="Scan Again" onPress={() => setScannedData(null)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: "#000",
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
});
