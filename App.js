import React from 'react';
import { Text, View, TouchableOpacity, Vibration } from 'react-native';
import { Camera, Permissions, FileSystem, Constants } from 'expo';

const COMPVIS_KEY = "c3c21721bcac419ab22cab24d58518bb";
const COMPVIS_PARAMS = {
  "visualFeatures": "Description",
  "details": "{string}",
  "language": "en",
};
const COMPVIS_URL = `https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=${COMPVIS_PARAMS.visualFeatures}&language=${COMPVIS_PARAMS.language}`;

export default class App extends React.Component {
  state = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    depth: 0,
    ratio: '16:9',
    ratios: [],
    photoId: 1,
    whiteBalance: 'auto',
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
  }

  getRatios = async () => {
    const ratios = await this.camera.getSupportedRatios();
    return ratios;
  }

  setRatio(ratio) {
    this.setState({
      ratio,
    });
  }
  sendPhotoCompVis(file) {
    return fetch(COMPVIS_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": COMPVIS_KEY,
      },
      body: file,
    }).then((response) => response.json()).then((responseJson) => {
      console.log(response.Json.Description);
    }).catch((error) => {
      console.log(error);
    });
  }

  takePicture = async function() {
    var fileLoc = `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`;
    if(this.camera) {
      this.camera.takePictureAsync().then(data => {
        FileSystem.moveAsync({
          from: data.uri,
          to: fileLoc,
        }).then(() => {
          this.setState({
            photoId: this.state.photoId + 1,
          });
          Vibration.vibrate();
          //this.sendPhotoCompVis(`${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`);
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.responseType="json";
          xmlHttp.onreadystatechange = (e) => {
            //console.log("changed: " + xmlHttp.readyState);
            if(xmlHttp.readyState == 4){
              //console.log("ready: " + xmlHttp.status);

              if(xmlHttp.status === 200){
                console.log(xmlHttp.response.description.captions[0].text);
              }
              // debug errors
              else {
                console.log(xmlHttp.responseText);
              }
            }
          }
          xmlHttp.open( "POST", COMPVIS_URL, true);
          xmlHttp.setRequestHeader("Content-Type","multipart/form-data");
          xmlHttp.setRequestHeader("Ocp-Apim-Subscription-Key",COMPVIS_KEY);
          // var jsonBody = {
          //   "url": `./photos/Photo_${this.state.photoId - 1}.jpg`
          // }
          const data = new FormData();
          data.append('photo', {
            uri: fileLoc,
            type: 'image/jpeg',
            name: 'photo'
          });
          xmlHttp.send(data);
        });
      });
    }
  };

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera
            ref={ref => {
              this.camera = ref;
            }}
            style={{ flex: 1 }}
            type={this.state.type}
            flashMode={this.state.flash}
            autoFocus={this.state.autoFocus}
            zoom={this.state.zoom}
            whiteBalance={this.state.whiteBalance}
            ratio={this.state.ratio}
            focusDepth={this.state.depth}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={this.takePicture.bind(this)}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}TRANSLATE{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}
