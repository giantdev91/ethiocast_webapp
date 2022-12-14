import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ImageBackground } from "react-native";
import ServiceLoader from "./Loaders/Service";
import AuthenticationLoader from "./Loaders/Authenticate";
import ContentLoader from "./Loaders/Content";
import { sendPageReport } from "../../../reporting/reporting";

export default ({ navigation }): React.ReactElement => {
  const [reportStartTime, setReportStartTime] = useState(moment().unix());
  const [loadingState, setLoadingState] = useState("start");
  useEffect(() => {
    return () => sendPageReport("App Loader", reportStartTime, moment().unix());
  }, []);
  useEffect(() => {
    var test = "";
    if (GLOBAL.Device_IsWebTV) {
      test = window.location.search;
    }
    GLOBAL.Selected_Profile == "";
    try {
      if (GLOBAL.Loaded == false) {
        (async () => {
          if (GLOBAL.HasService == true && GLOBAL.Selected_Service != 0) {
            //get service and authenticate
            let res = await checkWithServicesFlow();
            if (res.success != false) {
              //authenticate
              let res2 = await checkNoServicesFlow();

              if (res2.success != false && res2.error == undefined) {
                if (test == "?connect") {
                  navigation && navigation.navigate("Check");
                } else {
                  console.log("content loader called!!!!");
                  let res3 = await ContentLoader.getContent();
                  if (res3.success) {
                    GLOBAL.Loaded = true;
                    navigation && navigation.navigate("Loader");
                  } else {
                    GLOBAL.Loaded = false;
                    GLOBAL.Authenticated = false;
                    navigation && navigation.navigate("Loader");
                    //go back to login page
                  }
                }
              } else {
                //go back to login page
                GLOBAL.Loaded = false;
                GLOBAL.Authenticated = false;
                navigation && navigation.navigate("Loader");
              }
            } else {
              //go back to service page
              GLOBAL.Authenticated = false;
              GLOBAL.Loaded = false;
              GLOBAL.Selected_Service = 0;
              navigation && navigation.navigate("Loader");
            }
          } else {
            if (GLOBAL.HasService == true && GLOBAL.Selected_Service == 0) {
              //go back to service page
              GLOBAL.Authenticated = false;
              GLOBAL.Loaded = false;
              GLOBAL.Selected_Service = 0;
              navigation && navigation.navigate("Loader");
            } else {
              //authenticate
              let res = await checkNoServicesFlow();
              if (res.success && !res.error) {
                if (test == "?connect") {
                  navigation && navigation.navigate("Check");
                } else {
                  console.log("content loader ====> ");
                  let res2 = await ContentLoader.getContent();
                  if (res2.success) {
                    GLOBAL.Loaded = true;
                    navigation && navigation.navigate("Loader");
                  } else {
                    GLOBAL.Authenticated == false;
                    GLOBAL.Loaded = false;
                    navigation && navigation.navigate("Loader");
                    //go back to login page
                  }
                }
              } else {
                GLOBAL.Authenticated = false;
                GLOBAL.Loaded = false;
                navigation && navigation.navigate("Loader");
                //go back to login page
              }
            }
          }
        })();
      }
    } catch (error) {
      GLOBAL.Authenticated = false;
      GLOBAL.Loaded = false;
      navigation && navigation.navigate("Loader");
    }
  });
  const checkWithServicesFlow = async () => {
    let res = await ServiceLoader.checkServiceExists(GLOBAL.Selected_Service);
    if (res.success) {
      let res2 = await ServiceLoader.getSettingsService();
      if (res2.success) {
        return res2;
      } else {
        return res2;
      }
    } else {
      return res;
    }
  };
  const checkNoServicesFlow = async () => {
    let res = await AuthenticationLoader.getUserIp();
    if (res.success) {
      return res;
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size={"large"} color={"white"} />
    </View>
  );
};
