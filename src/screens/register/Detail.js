import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Text,
  TextInput,
  ImageBackground,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import normalize from 'react-native-normalize';
import { RFPercentage } from 'react-native-responsive-fontsize';

import EntypoIcon from 'react-native-vector-icons/Entypo';
EntypoIcon.loadFont();
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

import { Colors, Images, Constants } from '@constants';
import { signup, createUser, setData, checkInternet } from '../../service/firebase';

export default function Detail({ navigation }) {
  const [spinner, setSpinner] = useState(false);
  const [name, setName] = useState();
  const [phone, setPhone] = useState(Constants.user.phone);
  const [age, setAge] = useState();
  const [gender, setGender] = useState();
  const [height, setHeight] = useState();
  const [weight, setWeight] = useState();
  const [photo, setPhoto] = useState();

  const [photoLocalPath, setPhotoLocalPath] = useState();
  const [photoDownloadUrl, setPhotoDownloadUrl] = useState();

  const [ages, setAges] = useState([]);
  const [heights, setHeights] = useState([]);
  const [weights, setWeights] = useState([]);

  const [ageDropShow, setAgeDropShow] = useState(false);
  const [heightDropShow, setHeightDropShow] = useState(false);
  const [weightDropShow, setWeightDropShow] = useState(false);

  useEffect(() => {
    var tAges = [];
    for (var age = 0; age < 100; age++) {
      tAges.push({ label: age + 'yrs', value: age })
    }
    setAges(tAges);

    var tHeights = [];
    for (var feet = 1; feet <= 6; feet++) {
      for (var inch = 0; inch < 12; inch++) {
        tHeights.push({ label: `${feet}'${inch}"`, value: `${feet}'${inch}"` })
      }
    }
    setHeights(tHeights);

    var tWeights = [];
    for (var w = 20; w <= 100; w++) {
      tWeights.push({ label: w + 'kg', value: w })
    }
    setWeights(tWeights);
  }, [])

  onPhotoLoad = () => {
    var options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    console.log(ImagePicker)
    // ImagePicker.showImagePicker(options, response => {
    //   if (response.didCancel) {
    //   } else if (response.error) {
    //   } else if (response.customButton) {
    //   } else {
    //     setPhotoLocalPath(response.uri);
    //     setPhoto(response.uri)
    //   }
    // });
  };

  uploadPhoto = () => {
    return new Promise(async (resolve, reject) => {
      var platformPhotoLocalPath = Platform.OS === "android" ? photoLocalPath : photoLocalPath.replace("file://", "")
      let newPath = '';
      await ImageResizer.createResizedImage(platformPhotoLocalPath, 90, 90, 'PNG', 50, 0, null)
        .then(response => {
          newPath = response.uri;
        })
        .catch(err => {
          console.log('image resizer error', err);
        });

      await uploadMedia('photos', Constants.user?.id, newPath)
        .then((downloadURL) => {
          if (!downloadURL) return;
          // console.log('downloadURL', downloadURL)
          setPhotoDownloadUrl(downloadURL);
          resolve();
        })
        .catch((err) => {
          console.log('upload photo error', err);
          reject(err);
        })
    })
  }

  async function onNext() {
    if (!name) {
      Alert.alert('Please enter name');
      return;
    }

    if (photoLocalPath) {
      await uploadPhoto()
        .then(() => {
          Constants.user.photo = photoDownloadUrl;
          navigation.navigate('Address');
        })
        .catch((err) => {
          console.log('upload photo error', err);
          setSpinner(false);
        })
    }
    else {
      Alert.alert('Photo path empty.');
      return;
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Image style={styles.imgBack} source={Images.authBack} />
      <Spinner
        visible={spinner}
        textContent={''}
      />
      <View style={styles.header}>
        <View style={styles.sideContainer}>
          {/* <TouchableOpacity onPress={() => {}}>
            <EntypoIcon name="user" style={styles.headerIcon}></EntypoIcon>
          </TouchableOpacity> */}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleTxt}>Your Details</Text>
        </View>
        <View style={styles.sideContainer}>
          <TouchableOpacity onPress={() => { }}>
            <Text style={styles.sideTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter your full name  *'}
          placeholderTextColor={Colors.grey}
          value={name}
          onChangeText={(text) => setName(text)}
        >
        </TextInput>

        <TextInput
          style={styles.inputBox}
          placeholderTextColor={Colors.grey}
          value={phone}
          editable={false}
        >
        </TextInput>

        <View style={{ width: '80%', marginTop: normalize(20, 'height') }}>
          <DropDownPicker
            items={ages}
            defaultValue={age}
            placeholder='Please enter age'
            placeholderStyle={{
              fontSize: RFPercentage(2.4),
              color: Colors.grey
            }}
            labelStyle={{
              fontSize: RFPercentage(2.4),
              color: Colors.grey,
              textAlign: 'center'
            }}
            containerStyle={{ width: '100%', height: normalize(45, 'height') }}
            style={{ backgroundColor: 'transparent' }}
            dropDownStyle={{ backgroundColor: 'transparent' }}
            onChangeItem={(item) => setAge(item.value)}
            showArrow={false}
            zIndex={300}
            dropDownMaxHeight={normalize(120, 'height')}
            onOpen={() => setAgeDropShow(true)}
            onClose={() => setAgeDropShow(false)}
          />
        </View>

        <View style={[styles.genderRow, ageDropShow ? { marginTop: normalize(120, 'height') } : null]}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: 'transparent', borderRadius: normalize(10), borderWidth: normalize(3) }, gender === 'Male' ? { borderColor: Colors.red } : {}]} onPress={() => setGender('Male')}>
            <Text style={styles.btnTxt}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: 'transparent', borderRadius: normalize(10), borderWidth: normalize(3) }, gender === 'Female' ? { borderColor: Colors.red } : {}]} onPress={() => setGender('Female')}>
            <Text style={styles.btnTxt}>Female</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hwRow}>
          <View style={{ width: '45%' }}>
            <DropDownPicker
              items={heights}
              defaultValue={height}
              placeholder='Please enter height'
              placeholderStyle={{
                fontSize: RFPercentage(2.4),
                color: Colors.grey
              }}
              labelStyle={{
                fontSize: RFPercentage(2.4),
                color: Colors.grey,
                textAlign: 'center'
              }}
              containerStyle={{ width: '100%', height: normalize(45, 'height') }}
              style={{ backgroundColor: 'transparent' }}
              dropDownStyle={{ backgroundColor: 'transparent' }}
              onChangeItem={(item) => setHeight(item.value)}
              showArrow={false}
              dropDownMaxHeight={normalize(120, 'height')}
              onOpen={() => setHeightDropShow(true)}
              onClose={() => setHeightDropShow(false)}
            />
          </View>
          <View style={{ width: '45%' }}>
            <DropDownPicker
              items={weights}
              defaultValue={weight}
              placeholder='Please enter weight'
              placeholderStyle={{
                fontSize: RFPercentage(2.4),
                color: Colors.grey
              }}
              labelStyle={{
                fontSize: RFPercentage(2.4),
                color: Colors.grey,
                textAlign: 'center'
              }}
              containerStyle={{ width: '100%', height: normalize(45, 'height') }}
              style={{ backgroundColor: 'transparent' }}
              dropDownStyle={{ backgroundColor: 'transparent' }}
              onChangeItem={(item) => setWeight(item.value)}
              showArrow={false}
              dropDownMaxHeight={normalize(120, 'height')}
              onOpen={() => setWeightDropShow(true)}
              onClose={() => setWeightDropShow(false)}
            />
          </View>
        </View>

        <View style={[styles.photoNextRow, (heightDropShow || weightDropShow) ? { marginTop: normalize(140, 'height') } : null]}>
          <View style={styles.photoPart}>
            <View style={styles.photoImgBox}>
              <TouchableOpacity style={styles.photoBtn} onPress={() => onPhotoLoad()}>
                {
                  photo &&
                  <Image style={styles.photoImg} source={{ uri: photo }} resizeMode='stretch' />
                }
                {
                  !photo &&
                  <>
                    <EntypoIcon name="plus" style={styles.photoTxt}></EntypoIcon>
                    <Text style={styles.photoTxt}>photo</Text>
                  </>
                }
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.btnPart}>
            <TouchableOpacity style={[styles.btn, { width: '50%' }]} onPress={() => onNext()}>
              <Text style={styles.btnTxt}>Next {'>>'}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  },
  header: {
    width: '100%',
    height: normalize(70, 'height'),
    flexDirection: 'row',
    backgroundColor: Colors.blackColor
  },
  sideContainer: {
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerIcon: {
    fontSize: RFPercentage(3.5),
    color: Colors.whiteColor,
  },
  titleContainer: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleTxt: {
    fontSize: RFPercentage(3),
    fontWeight: '600',
    color: Colors.black,
  },
  sideTxt: {
    fontSize: RFPercentage(2.5),
    fontWeight: '600',
    color: Colors.black,
  },

  body: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center'
  },

  phoneTipTxt: {
    width: '80%',
    fontSize: RFPercentage(3.5),
    color: Colors.black,
    textAlign: 'center'
  },
  inputBox: {
    width: '80%',
    height: normalize(45, 'height'),
    fontSize: RFPercentage(2.5),
    borderColor: Colors.grey,
    borderWidth: normalize(3),
    marginTop: normalize(20, 'height'),
    paddingLeft: normalize(10),
  },

  genderRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },

  hwRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(20, 'height')
  },

  photoNextRow: {
    width: '80%',
    height: normalize(90, 'height'),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: normalize(20, 'height'),
    marginBottom: normalize(20, 'height'),
  },
  photoPart: {
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  photoImgBox: {
    width: normalize(90),
    height: normalize(90),
    borderRadius: normalize(45),
    borderWidth: normalize(3)
  },
  photoImg: {
    width: '100%',
    height: '100%'
  },
  photoBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoTxt: {
    fontSize: RFPercentage(2.5),
    color: Colors.blackColor,
  },

  btnPart: {
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  btn: {
    width: '40%',
    height: normalize(45, 'height'),
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(20, 'height')
  },
  btnTxt: {
    fontSize: RFPercentage(2.2),
    color: Colors.black
  },
});