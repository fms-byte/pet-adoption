import React, { useState, useLayoutEffect, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView } from "react-native";
import TopImage from "../components/TopImage";
import { TextInput } from "react-native";
import { Button } from '@rneui/base';
import { ScrollView } from "react-native-gesture-handler";
import * as Animatable from "react-native-animatable";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Login",
      headerTitleStyle: {
        color: "black",
        fontWeight: "bold",
      },
    });
  });

  const signIn = () => {
    signInWithEmailAndPassword(auth,email,password).then((userCredential) => {
       console.log("user credential", userCredential);
       const user = userCredential.user;
       console.log("user details", user);
    })
}

  useEffect(() => {
    try {
      const unsubscribe = auth.onAuthStateChanged((authUser) => {
        if (authUser) {
          navigation.replace("Main");
        }
      });

      return unsubscribe;
    } catch (e) {
      console.log(e);
    }
  }, []);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView>
        <TopImage imgPath={require("../assets/SignIn.png")} />
        <Animatable.View animation="fadeInUpBig" style={{ marginTop: -20 }}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
          />
          <Button
            title="Sign In"
            buttonStyle={{ backgroundColor: "#f9a1bc" }}
            containerStyle={{ width: 250, alignSelf: "center", marginTop: 30 }}
            onPress={signIn}
          />
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;

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
