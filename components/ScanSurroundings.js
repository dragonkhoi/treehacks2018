import React from 'react';
import { Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Camera, Permissions, FileSystem, Constants } from 'expo';
import PushDown from './common/PushDown';
import { Button, Input } from './common';
import ModalWithButton from './ModalWithButton';

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
    threeEnglish: [],
    lang: "es-es",
    modal1: false,
    modal2: false,
    myTag: "",
    myDesc: "",
    tagAddCounter: 0
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  componentWillUnmount() {
    clearInterval(this.takePicInterval);
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
    this.takePicInterval = setInterval(this.takePicture.bind(this), 2000);
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
          const toTranslate = xmlHttp.response.description.tags[1];
          // let translatedText = this.getTranslate(toTranslate, lang);
          let threeTags = this.getTagsArray(xmlHttp.response.description.tags);
          this.getTranslate(0, xmlHttp.response.description.captions[0].text, this.state.lang, this);
          this.getTranslate(1, threeTags[0], this.state.lang, this);
          this.getTranslate(2, threeTags[1], this.state.lang, this);
          this.getTranslate(3, threeTags[2], this.state.lang, this);

          // this.setState({
          //   threeEnglish: threeTags
          // });
          // //TODO: THIS IS AN OBJECT BC IT'S ASYNCHRONOUS...
          // let translatedText = this.getTranslate(toTranslate, this.state.lang);
          // console.log(`TRANSLATED IS ${translatedText}`)
          // this.setState({
          //   description: `${xmlHttp.response.description.captions[0].text} (${this.getTranslate(xmlHttp.response.description.captions[0].text, this.state.lang)})`,
          //   tag1: `${threeTags[0]} (${this.getTranslate(threeTags[0], this.state.lang)})`,
          //   tag2: `${threeTags[1]} (${this.getTranslate(threeTags[1], this.state.lang)})`,
          //   tag3: `${threeTags[2]} (${this.getTranslate(threeTags[2], this.state.lang)})`,
          //  });
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

  getTranslate = async function(index, text, lang, ctx) {
   const path2 = 'https://api.microsofttranslator.com/V2/Http.svc/Translate?to=' + lang + '&text=' + text;
   console.log(path2);
   var xhr = new XMLHttpRequest();
   xhr.onreadystatechange = function() {
               if (xhr.readyState == 4 && xhr.status == 200){
                 var resp = xhr.response;
                 var translated = resp.substring(68, (resp.length - 9));
                 var setTo = `${text} (${translated})`;
                 if(index == 0){
                   ctx.setState({
                     description: setTo
                   })
                 }
                 if(index == 1){
                   ctx.setState({
                     tag1: setTo
                    });
                 }
                 if(index == 2){
                   ctx.setState({
                     tag2: setTo
                    });
                 }
                 if(index == 3){
                   ctx.setState({
                     tag3: setTo
                    });
                 }
                   return translated;
               } else {
               //    alert(xhr.status);
               }
           }
         xhr.open( "GET", path2, true);
         xhr.setRequestHeader("Ocp-Apim-Subscription-Key","ba9158a351f94a46bbdd9df094428ecb");
         xhr.send(null);
       };

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

  getTagsArray(tagArr) {
    for (var i = 0; i < 3; i+=1) {
      if (tagArr[i] === "indoor" || tagArr[i] === "indoors") {
        tagArr[i] = tagArr[3];
      }
    }
    console.log(`TAGARR: ${tagArr.slice(0,3)}`)
    return tagArr.slice(0, 3);
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

  photoBurst(tag, description) {
    const photoData = new FormData();
    this.setState({
      tagAddCounter: this.state.tagAddCounter + 1
    });
    if(this.state.tagAddCounter > 30){
      clearInterval(this.tagAddInterval);
      this.setState({
        tagAddCounter: 0
      });
    }
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
          // Vibration.vibrate();
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
          //tag = "test234234";
          //description = "test description, it is super good, SOOOOO great, amazing, wauw, so good, wow, excellent description!";
          this.createTag(photoData, tag, description);
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
    var sampleTag = "hellloooo";
    var sampleDescription = "BWAHAHAHA";
    this.tagAddInterval = setInterval(this.photoBurst.bind(this,sampleTag,sampleDescription),  100);

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
          // Vibration.vibrate();
          this.sendPhotoCompVis(fileLoc);
        });
      });
    }
  };

  submitTags() {
    this.setState({
      modal1: false,
      modal2: true,
    });
  }

  startCollectingPhotos() {
    this.setState({
      modal2: false,
    });
    console.log(`The description I entered was ${this.state.myDesc}`);
    console.log(`The tag I entered was ${this.state.myTag}`);

    //TODO: Start interval and stuff for collecting photos
    this.createTaggedPhoto();
  }

  changeLang() {
    const langs = ["es-es", "fr-fr", "de-de"];
    for (var i = 0; i < langs.length; i+=1) {
      if (langs[i] === this.state.lang) {
        this.setState({
          lang: langs[(i + 1) % langs.length]
        });
      }
    }

  }

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
            {this.state.modal1 &&
              <ModalWithButton
              onButtonPress={this.submitTags.bind(this)}
              buttonTitle="Submit"
            >
              <Input
                label="What is meaningful about this photo?"
                onChangeText={myDesc => this.setState({ myDesc })}
              >
              </Input>
              <Input
                label="What's the best tag for this image'?"
                onChangeText={myTag => this.setState({ myTag })}
              >
              </Input>
            </ModalWithButton>
          }
          {this.state.modal2 &&
            <ModalWithButton
            onButtonPress={this.startCollectingPhotos.bind(this)}
            buttonTitle="OK"
          >
          <Text style={styles.modalTextStyle}>After you click "OK", the phone will capture images of your surroundings. Move the phone slowly.</Text>
          </ModalWithButton>
          }
              <View style={styles.cameraView}>
                <View style={styles.descTagView}>
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
                </View>
              <View style={styles.buttonContainerView}>
                  <Button
                    title="Contribute"
                    onPress={() => { this.setState({ modal1: true }); }}
                  />
                  <Button
                    title={this.state.lang}
                    onPress={this.changeLang.bind(this)}
                  />
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
    justifyContent: 'space-between',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
  descTagView: {
    height: 120
  },
  descView: {
    backgroundColor: 'white',
    height: 60,
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
    height: 40,
    width: 80,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainerView: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
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
  },
  modalTextStyle: {
  margin: 15,
  fontSize: 16,
  textAlign: 'center',
  lineHeight: 30,
  color: 'black',
},

};
