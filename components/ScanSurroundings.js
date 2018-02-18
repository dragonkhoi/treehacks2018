import React from 'react';
import { Text, View, TouchableOpacity, Vibration } from 'react-native';
import { Camera, Permissions, FileSystem, Constants } from 'expo';
import PushDown from './common/PushDown';

const COMPVIS_KEY = "c3c21721bcac419ab22cab24d58518bb";
const COMPVIS_PARAMS = {
  "visualFeatures": "Description, Tags",
  "language": "en",
};
const COMPVIS_URL = `https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=${COMPVIS_PARAMS.visualFeatures}&language=${COMPVIS_PARAMS.language}`;

export default class ScanSurroundings extends React.Component {
  static navigationOptions = {
    header: null,
  };
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
    description: 'Searching for description...',
    tag1: "...",
    tag2: "...",
    tag3: "...",
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
  sendPhotoCompVis(fileLoc) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.responseType="json";
    xmlHttp.onreadystatechange = (e) => {
      //console.log("changed: " + xmlHttp.readyState);
      if(xmlHttp.readyState == 4){
        //console.log("ready: " + xmlHttp.status);

        if(xmlHttp.status === 200){
          console.log(xmlHttp.response.description.captions[0].text);
          console.log(xmlHttp.response.description.tags[3]);
          console.log(xmlHttp.response.description.tags);
          this.setState({ 
            description: xmlHttp.response.description.captions[0].text,
            tag1: xmlHttp.response.description.tags[0],
            tag2: xmlHttp.response.description.tags[1],
            tag3: xmlHttp.response.description.tags[2],
           });
        }
        // debug errors
        else {
          console.log(xmlHttp.responseJson);
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
  }

  sendPhotoCustVis(formData){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.responseType="json";
    xmlHttp.onreadystatechange = (e) => {
      console.log(xmlHttp.readyState);
      if(xmlHttp.readyState == 4){
        if(xmlHttp.status === 200){
          console.log(xmlHttp.response);
        }
        else {
          console.log(xmlHttp.responseJson);
        }
      }
    }
    xmlHttp.open( "POST", CUSTVIS_URL, true);
    xmlHttp.setRequestHeader("Content-Type","multipart/form-data");
    xmlHttp.setRequestHeader("Training-key",CUSTVIS_KEY);
    xmlHttp.send(formData);
  }
  createTaggedPhoto(){
    // UI prompt for user to move phone around object
    // take periodic photos, add to form data
    // UI prompt for tag
    // UI Prompt for description/info
    // send form data
    const photoData = new FormData();
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
          photoData.append('photo', {
            uri: fileLoc,
            type: 'image/jpeg',
            name: 'photo'
          });
          this.sendPhotoCustVis(photoData);
        });
      });
    }
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
          this.sendPhotoCompVis(fileLoc);
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
              <View style={styles.cameraView}>
                <View style={styles.descView}>
                  <Text style={styles.textStyle}>{this.state.description}</Text>
                </View>
                <View style={styles.tagContainerView}>
                  <View style={styles.tagView}>
                    <Text style={styles.textStyleSmall}>{this.state.tag1}</Text>
                  </View>
                  <View style={styles.tagView}>
                    <Text style={styles.textStyleSmall}>{this.state.tag2}</Text>
                  </View>
                  <View style={styles.tagView}>
                    <Text style={styles.textStyleSmall}>{this.state.tag3}</Text>
                  </View>
                </View>
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
            </View>
          </Camera>
      );
    }
  }
}

const styles = {
  cameraView: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
  descView: {
    backgroundColor: 'white',
    height: 50,
    margin: 20,
    marginTop: 30,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagContainerView: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
    marginLeft: 20,
    marginRight: 20,
  },
  tagView: {
    backgroundColor: 'white',
    height: 30,
    width: 80,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: 'rgba(31, 130, 83, 1)',
    fontSize: 15,
    textAlign: 'center',
  },
  textStyleSmall: {
    color: 'rgba(31, 130, 83, 1)',
    fontSize: 13,
    textAlign: 'center',
  }
};
