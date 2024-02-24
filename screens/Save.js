import React, { useState, useLayoutEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { StyleSheet, Text, View, Image, TextInput } from "react-native";
import { Button } from '@rneui/base';
import {setDoc, doc, getDoc, FieldValue} from "firebase/firestore";
import { auth, db } from "../firebase";
import DropDownPicker from "react-native-dropdown-picker";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { ProgressBar } from "react-native-paper";

const petTypes = [
  {
    label: "Dog",
    value: "dog",
  },
  {
    label: "Cat",
    value: "cat",
  },
  {
    label: "Rabbit",
    value: "rabbit",
  },
  {
    label: "Birds",
    value: "birds",
  },
];

const Save = (props) => {
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [petType, setPetType] = useState("dog");
  const [healthDoc, setHealthDoc] = useState(null);
  const [progress, setProgress] = useState(0);
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerTitle: "Post Image",
    });
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setHealthDoc(result.uri);
    }
  };

  const savePostData = (downloadURL, docUrl) => {
    if (docUrl === null) {
      docUrl =
        "https://st3.depositphotos.com/16262510/33733/v/1600/depositphotos_337332964-stock-illustration-photo-not-available-vector-icon.jpg";
    }
    db.collection("profilePosts")
      .doc(auth.currentUser.uid)
      .collection("userPosts")
      .add({
        imageURL: downloadURL,
        address,
        number,
        petType,
        healthDoc: docUrl,
        creation: FieldValue.serverTimestamp(),
      })
      .then(() => {
        setProgress(0.6);
      });
    db.collection("posts")
      .add({
        imageURL: downloadURL,
        address,
        petType,
        healthDoc: docUrl,
        number,
        creation: FieldValue.serverTimestamp(),
        userId: auth.currentUser.uid,
      })
      .then(() => {
        setTimeout(() => {
          setProgress(1);
        }, 1000);
        props.navigation.popToTop();
      });
  };

  const uploadImage = async () => {
    const uri = props.route.params.image;
    const response = await fetch(uri);
    const blob = await response.blob();
    const childPath = `post/${auth.currentUser.uid}/${Math.random().toString(
      36
    )}`;

    // Save the image URL directly to Firestore
    db.collection("images").doc(childPath).set({ image: blob })
      .then(() => {
        setProgress(0.3);
        savePostData(childPath, healthDoc);
      })
      .catch((error) => {
        console.log(error);
      });
  };


  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView>
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: props.route.params.image }}
            style={{ flex: 1, aspectRatio: 1 }}
          />
        </View>
        <View
          style={{
            padding: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              Select Pet Type
            </Text>
            <DropDownPicker
              items={petTypes}
              defaultValue={petType}
              containerStyle={{ height: 50, flex: 1, marginLeft: 20 }}
              style={{ backgroundColor: "#fafafa" }}
              globalTextStyle={{ fontSize: 17 }}
              itemStyle={{
                justifyContent: "flex-start",
              }}
              dropDownStyle={{ backgroundColor: "#fafafa" }}
              onChangeItem={(item) => setPetType(item.value)}
            />
          </View>
          <TextInput
            placeholder="Address"
            value={address}
            onChangeText={(text) => setAddress(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Whatsapp Number"
            value={number}
            onChangeText={(text) => setNumber(text)}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => {
              pickImage();
            }}
          >
            <Text
              style={{
                color: "#f9a1bc",
                fontSize: 17,
                alignSelf: "center",
              }}
            >
              Upload Health Document (Optional)
            </Text>
          </TouchableOpacity>
          <ProgressBar
            progress={progress}
            color="skyblue"
            style={{ marginTop: 20 }}
          />
        </View>
        <Button
          buttonStyle={{
            backgroundColor: "#f9a1bc",
          }}
          containerStyle={{
            width: 150,
            alignSelf: "center",
          }}
          title="Post"
          onPress={() => uploadImage()}
        />
      </ScrollView>
    </View>
  );
};

export default Save;

const styles = StyleSheet.create({
  input: {
    height: 50,
    fontSize: 17,
    marginVertical: 10,
  },
});
