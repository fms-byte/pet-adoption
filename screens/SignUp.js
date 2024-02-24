import React, { useState, useLayoutEffect, useEffect } from "react";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  StatusBar,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import TopImage from "../components/TopImage";
import { TextInput } from "react-native";
import { Button } from "@rneui/base";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignUp = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState("");

  useEffect(() => {
    (async () => {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  const uploadImage = async () => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const childPath = `profile/images/${Math.random().toString(36)}`;

      await setDoc(doc(db, "images", childPath), { image: blob });
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name,
        email,
        imageUrl: childPath,
      });

      console.log("Image uploaded to Firestore");
    } catch (error) {
      console.error(error);
    }
  };

  const signUp = () => {
    if (email === "" || password === "" || name === "") {
      Alert.alert(
        "Invalid Details",
        "Please enter all the credentials",
        [{ text: "OK" }],
        { cancelable: false }
      );
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredentials) => {
          const user = userCredentials.user;
          setDoc(doc(db, "users", user.uid), {
            email,
            password,
            name,
            imageUrl: imageUri,
          });
        })
        .catch((error) => {
          console.error("Error creating user:", error);
        });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <TopImage imgPath={require("../assets/SignIn.png")} />

        <Animatable.View animation="fadeInUpBig" style={{ marginTop: -50 }}>
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={(text) => setName(text.trim())}
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text.trim())}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text) => setPassword(text.trim())}
            style={styles.input}
          />
          <TouchableOpacity
            style={{ marginLeft: 20, alignSelf: "center" }}
            onPress={() => {
              if (hasGalleryPermission === null) {
                alert("Allow Permission of Accessing Gallery");
              } else {
                pickImage();
              }
            }}
          >
            <Text
              style={{
                color: "#f9a1bc",
                fontSize: 17,
              }}
            >
              Select Profile Image
            </Text>
          </TouchableOpacity>
          <Button
            title="Sign Up"
            buttonStyle={{ backgroundColor: "#f9a1bc" }}
            containerStyle={{ width: 250, alignSelf: "center", marginTop: 30 }}
            onPress={signUp}
          />
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  title: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 25,
  },
  input: {
    padding: 20,
    height: 70,
    fontSize: 20,
  },
});
