import React from 'react';
import { TextInput, View, Text } from 'react-native';

const Input = ({label, value, onChangeText, placeholder, secureTextEntry, keyboardType, editable}) => {
  const {inputStyle, labelStyle, containerStyle } = styles;
  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        editable={!(editable === false)}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        style={inputStyle}
        keyboardType={(keyboardType || 'default')}
      />
    </View>
  );
};

const styles = {
  inputStyle: {
    backgroundColor: 'rgba(201, 226, 225, 1)',
    paddingRight: 8,
    paddingLeft: 8,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 18,
    lineHeight: 23,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    textAlign: 'center',
    marginRight: 20,
    marginLeft: 20,
    borderRadius: 3,
  },
  labelStyle: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 18,
    marginRight: 20,
    marginLeft: 20,
    textAlign: 'center',
    color: 'black',
  },
  containerStyle: {
    flex: 1,
    height:40,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  }
};
export {Input};
