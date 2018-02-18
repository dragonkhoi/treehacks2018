import React from 'react';
import { Text, View, TouchableOpacity, Vibration } from 'react-native';
import { Camera, Permissions, FileSystem, Constants } from 'expo';
import PushDown from './common/PushDown';

const COMPVIS_KEY = "c3c21721bcac419ab22cab24d58518bb";
const COMPVIS_PARAMS = {
  "visualFeatures": "Description, Tags",
  "language": "en",
};
const CUSTVIS_ID = "c1e36469-83dc-433c-8044-fa7ef7f31117";
const CUSTVIS_KEY = "8b0f96ec859f40d68efc87fde36f8a11";
const COMPVIS_URL = `https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=${COMPVIS_PARAMS.visualFeatures}&language=${COMPVIS_PARAMS.language}`;
const CUSTVIS_URL = `https://southcentralus.api.cognitive.microsoft.com/customvision/v1.2/Training/projects/c1e36469-83dc-433c-8044-fa7ef7f31117/images?tagIds%5B%5D=`// + //encodeURIComponent(JSON.stringify(["e8a935f3-e61f-4f31-b8d2-25388809c2f2"]));
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
      if(xmlHttp.readyState == 4){
        if(xmlHttp.status === 200){
          console.log(xmlHttp.response.description.captions[0].text);
          console.log(xmlHttp.response.description.tags[3]);
          console.log(xmlHttp.response.description.tags);

          //Declaration of language for translation; currently set to French
          const lang = 'fr-fr';
          const toTranslate = xmlHttp.response.description.tags[1];
          console.log(this.getTranslate(toTranslate, lang));

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
    const data = new FormData();
    data.append('photo', {
      uri: fileLoc,
      type: 'image/jpeg',
      name: 'photo'
    });
    xmlHttp.send(data);
  }

  // sendPhotoTags(tagData) {
  //   console.log(tagData);
  //   var POSTTAG_URL = "https://southcentralus.api.cognitive.microsoft.com/customvision/v1.2/Training/projects/c1e36469-83dc-433c-8044-fa7ef7f31117/images/tags";
  //   var xmlHttp = new XMLHttpRequest();
  //   xmlHttp.responseType="json";
  //   xmlHttp.onreadystatechange = (e) => {
  //     console.log(xmlHttp.readyState);
  //     if(xmlHttp.readyState == 4){
  //       if(xmlHttp.status === 200){
  //         console.log(xmlHttp.response);
  //       }
  //       else {
  //         console.log(xmlHttp.response);
  //       }
  //     }
  //   }
  //   xmlHttp.open( "POST", POSTTAG_URL, true);
  //   xmlHttp.setRequestHeader("Content-Type","application/json");
  //   xmlHttp.setRequestHeader("Training-key",CUSTVIS_KEY);
  //   xmlHttp.send(tagData);
  // }
  // tagUntaggedPhotos(tagName){
  //   var UNTAGGED_URL = `https://southcentralus.api.cognitive.microsoft.com/customvision/v1.2/Training/projects/${CUSTVIS_ID}/images/untagged`;
  //   var xmlHttp = new XMLHttpRequest();
  //   xmlHttp.responseType="json";
  //   xmlHttp.onreadystatechange = (e) => {
  //     console.log(xmlHttp.readyState);
  //     if(xmlHttp.readyState == 4){
  //       if(xmlHttp.status === 200){
  //         console.log(xmlHttp.response);
  //         var photoIds = [];
  //         for(var i = 0; i < xmlHttp.response.length; i++){
  //           console.log(xmlHttp.response[i].Id);
  //           photoIds.push(xmlHttp.response[i].Id);
  //         }
  //
  //         //for(var i = 0; i < photoIds.length; i++){
  //           var taggedPhotos = {
  //             "Tags": [
  //               {
  //                 "ImageId": photoIds[0],
  //                 "TagId": tagName
  //               }
  //             ]
  //           }
  //           this.sendPhotoTags(taggedPhotos);
  //         }
  //       //}
  //       else {
  //         console.log(xmlHttp.response);
  //       }
  //     }
  //   }
  //   xmlHttp.open( "GET", UNTAGGED_URL, true);
  //   xmlHttp.setRequestHeader("Training-key",CUSTVIS_KEY);
  //   xmlHttp.send();
  // }
  getTags(){
    var TAGS_URL = `https://southcentralus.api.cognitive.microsoft.com/customvision/v1.2/Training/projects/${CUSTVIS_ID}/tags`;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.responseType="json";
    xmlHttp.onreadystatechange = (e) => {
      console.log(xmlHttp.readyState);
      if(xmlHttp.readyState == 4){
        if(xmlHttp.status === 200){
          console.log(xmlHttp.response);
          var photoIds = [];
          for(var i = 0; i < xmlHttp.response.Tags.length; i++){
            console.log(xmlHttp.response.Tags[i].Id);
            photoIds.push(xmlHttp.response.Tags[i].Id);
          }
        }
        else {
          console.log(xmlHttp.response);
        }
      }
    }
    xmlHttp.open( "GET", TAGS_URL, true);
    xmlHttp.setRequestHeader("Training-key",CUSTVIS_KEY);
    xmlHttp.send();
  }
  sendPhotoCustVis(formData, tagId){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.responseType="json";
    xmlHttp.onreadystatechange = (e) => {
      console.log(xmlHttp.readyState);
      if(xmlHttp.readyState == 4){
        if(xmlHttp.status === 200){
          console.log(xmlHttp.response);
          //this.tagUntaggedPhotos("e8a935f3-e61f-4f31-b8d2-25388809c2f2");
        }
        else {
          console.log(xmlHttp.responseJson);
        }
      }
    }
    var url = CUSTVIS_URL + tagId;
    xmlHttp.open( "POST", url, true);
    xmlHttp.setRequestHeader("Content-Type","multipart/form-data");
    xmlHttp.setRequestHeader("Training-key",CUSTVIS_KEY);
    xmlHttp.send(formData);
  }
  createTag(photoData, tag, description) {
    var CREATE_TAG_URL = `https://southcentralus.api.cognitive.microsoft.com/customvision/v1.2/Training/projects/${CUSTVIS_ID}/tags?name=${tag}&description=${description}`;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.responseType="json";
    xmlHttp.onreadystatechange = (e) => {
      console.log(xmlHttp.readyState);
      if(xmlHttp.readyState == 4){
        if(xmlHttp.status === 200){
          console.log(xmlHttp.response);
          this.sendPhotoCustVis(photoData, xmlHttp.response.Id);
        }
        else {
          console.log(xmlHttp.responseJson);
        }
      }
    }
    xmlHttp.open( "POST", CREATE_TAG_URL, true);
    xmlHttp.setRequestHeader("Training-key",CUSTVIS_KEY);
    xmlHttp.send();
  }

  photoBurst(ctx) {
    const photoData = new FormData();
    var fileLoc = `${FileSystem.documentDirectory}photos/Photo_${ctx.state.photoId}.jpg`;
    if(ctx.camera) {
      ctx.camera.takePictureAsync().then(data => {
        FileSystem.moveAsync({
          from: data.uri,
          to: fileLoc,
        }).then(() => {
          ctx.setState({
            photoId: ctx.state.photoId + 1,
          });

          photoData.append('photo', {
            uri: fileLoc,
            type: 'image/jpeg',
            name: 'photo',
            TagsIds: [
              "puppy"
            ],
            Tags: [
              "puppy"
            ]
          });
          var tag, description;
          tag = "test234234";
          description = "test description, it is super good, SOOOOO great, amazing, wauw, so good, wow, excellent description!";
          ctx.createTag(photoData, tag, description);
        });
      });
    }
  }

  createTaggedPhoto(){
    // UI prompt for user to move phone around object
    // take periodic photos, add to form data
    // UI prompt for tag
    // UI Prompt for description/info
    // send form data
    var counter = 0;
    var photoBurst = setInterval(function(this){
      counter++;
      
      const photoData = new FormData();
      var fileLoc = `${FileSystem.documentDirectory}photos/Photo_${ctx.state.photoId}.jpg`;
      if(ctx.camera) {
        ctx.camera.takePictureAsync().then(data => {
          FileSystem.moveAsync({
            from: data.uri,
            to: fileLoc,
          }).then(() => {
            ctx.setState({
              photoId: ctx.state.photoId + 1,
            });

            photoData.append('photo', {
              uri: fileLoc,
              type: 'image/jpeg',
              name: 'photo',
              TagsIds: [
                "puppy"
              ],
              Tags: [
                "puppy"
              ]
            });
            var tag, description;
            tag = "test234234";
            description = "test description, it is super good, SOOOOO great, amazing, wauw, so good, wow, excellent description!";
            ctx.createTag(photoData, tag, description);
          });
        });
      }
    }, 100);

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
                <TouchableOpacity
                  style={{
                    flex: 0.1,
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={this.createTaggedPhoto.bind(this)}>
                  <Text
                    style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                    {' '}tag{' '}
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
