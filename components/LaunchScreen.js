import React from 'react';
import { Text, View, Image } from 'react-native';
import { Button, Input } from './common';
import ModalWithButton from './ModalWithButton';

export default class LaunchScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  componentWillMount() {
  }

  buttonPressed() {
    const { navigate } = this.props.navigation;
    navigate('ScanSurroundings');
  }

  render() {
    return (
      <View style={styles.viewStyle}>
      <Text style={styles.bigTextStyle}>
        CultureCV
      </Text>
        <Text style={styles.textStyle}>
          Trade your story around the world.
        </Text>
        <Image
          style={styles.logoStyle}
          source={require('./globea.jpg')}
        />
        <Button
          title="Enter"
          onPress={this.buttonPressed.bind(this)}
          main
          />
      </View>
    );
  }
}

const styles = {
  logoStyle: {
    height: 100,
    width: 200,
    marginBottom: 40
  },
  viewStyle: {
    flex: 1,
    display: 'flex',
    backgroundColor: 'white',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40
  },
  bigTextStyle: {
    margin: 30,
    fontSize: 25,
    textAlign: 'center',
    lineHeight: 30,
    color: 'rgba(31, 130, 83, 1)',
  },
  textStyle: {
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 20,
    marginTop: 20,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
    color: 'rgba(130, 200, 204, 1)',
  },
};
