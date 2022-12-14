import React, { useState, useEffect } from "react";
import { Dimensions } from "react-native";
// import GLOBALModule from "../../datalayer/global";
var GLOBALModule = require('../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import { AuthStack } from "./AuthStack";
import { LoaderStack } from "./LoaderStack";
import { ProfileStack } from "./ProfileStack";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageBackground, Platform, View } from "react-native";
import { useNavigation } from "@react-navigation/core";
import Expire from "../screens/Actions/expire";
import Offline from "../screens/Actions/offline";
import Update from "../screens/Actions/update";
import Epg from "../screens/Actions/epg";
import Action from "../screens/Actions/action";
import { LinearGradient } from "expo-linear-gradient";
import { Message } from "../components/";
import SIZES from "../constants/sizes";
import { MenuStack } from "./MenuStack";

export default () => {
  console.log("GLOBAL ====> ", GLOBAL);
  const [authenticated, setAuthenticated] = useState(GLOBAL.Authenticated);
  const [profiled, setProfiled] = useState(false);
  const [loaded, setLoaded] = useState(GLOBAL.Loaded);

  var sizes = SIZES.getSizing();
  const navigation = useNavigation();

  const isLandscape = () => {
    const dim = Dimensions.get("screen");
    return dim.width >= dim.height;
  };

  useEffect(() => {
    console.log("GLOBAL ====> ", GLOBAL);

    setAuthenticated(GLOBAL.Authenticated);
    setLoaded(GLOBAL.Loaded);
    setProfiled(GLOBAL.Profiled);
  });

  return (
    //   {
    //     Platform.OS != 'ios' && !GLOBAL.Device_IsTablet &&
    //       <View style={{
    //         width: "100%",
    //         height: 40, // For all devices, even X, XS Max
    //         position: 'absolute',
    //         top: 0,
    //         left: 0,
    //         backgroundColor: '#000'
    //       }} />
    //   }
    //         {
    //   Platform.OS != 'ios' && !GLOBAL.Device_IsTablet &&
    //   <View style={{
    //     width: "100%",
    //     height: 20, // For all devices, even X, XS Max
    //     position: 'absolute',
    //     bottom: 0,
    //     left: 0,
    //     backgroundColor: '#000'
    //   }} />
    // }
    // {
    //   Platform.OS != 'ios' && !GLOBAL.Device_IsTablet &&
    //   <View style={{ flex: 1, paddingTop: isLandscape() ? 0 : 40, paddingBottom: isLandscape() ? 0 : 20 }}>
    //     <Offline />
    //     {!authenticated ? (
    //       <View style={{ flex: 1 }}>
    //         <View style={{ position: 'absolute', zIndex: 9999, top: 5, left: 0, right: 0, flex: 1, width: sizes.width, marginVertical: 0, alignSelf: 'center' }}>
    //           <Message> </Message>
    //         </View>
    //         <AuthStack />
    //       </View>
    //     ) : !loaded ? (
    //       <LoaderStack />
    //     ) : !profiled ? (
    //       <View style={{ flex: 1 }}>
    //         <View style={{ position: 'absolute', zIndex: 9999, top: 5, left: 0, right: 0, flex: 1, width: sizes.width, marginVertical: 0, alignSelf: 'center' }}>
    //           <Message> </Message>
    //         </View>
    //         <ProfileStack />
    //       </View>
    //     ) : (
    //       <View style={{ flex: 1 }}>
    //         <Epg />
    //         <Update />
    //         <Expire />
    //         <MenuStack />
    //         <Action />
    //       </View>
    //     )}
    //   </View>
    // }
    // {
    //   Platform.OS == 'ios' &&
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#444", "#111"]}
        style={{ flex: 1, minHeight: sizes.height }}
        start={{ x: 0.5, y: 0 }}
      >
        <ImageBackground
          source={{ uri: GLOBAL.Background }}
          style={{ flex: 1, width: null, height: null }}
          imageStyle={{ resizeMode: "cover" }}
        >
          <Offline />
          {!authenticated ? (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  position: "absolute",
                  zIndex: 9999,
                  top: 5,
                  left: 0,
                  right: 0,
                  flex: 1,
                  width: sizes.width,
                  marginVertical: 0,
                  alignSelf: "center",
                }}
              >
                <Message> </Message>
              </View>
              <AuthStack />
            </View>
          ) : !loaded ? (
            <LoaderStack />
          ) : !profiled ? (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  position: "absolute",
                  zIndex: 9999,
                  top: 5,
                  left: 0,
                  right: 0,
                  flex: 1,
                  width: sizes.width,
                  marginVertical: 0,
                  alignSelf: "center",
                }}
              >
                <Message> </Message>
              </View>
              <ProfileStack />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Epg />
              <Update />
              <Expire />
              <MenuStack />
              <Action />
            </View>
          )}
        </ImageBackground>
      </LinearGradient>
    </SafeAreaView>
    // }
  );
};
