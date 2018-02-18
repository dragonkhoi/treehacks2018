import React from 'react';
import { Text, View } from 'react-native';
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
  viewStyle: {
    flex: 1,
    display: 'flex',
    backgroundColor: 'rgba(249, 249, 249, 1)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigTextStyle: {
    margin: 30,
    fontSize: 25,
    textAlign: 'center',
    lineHeight: 30,
    color: 'rgba(31, 130, 83, 1)',
  },
  textStyle: {
    margin: 30,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
    color: 'rgba(130, 200, 204, 1)',
  },
};
