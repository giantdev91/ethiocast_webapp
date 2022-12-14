import React, {Component} from 'react';
import {View} from 'react-native';

export default class EXPIRE extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        if (GLOBAL.Connected_Internet == true) {
            UTILS.refreshUserData();
        }
    }
    // toAlphaNumeric(input){
    //     input = input.toString().replace(/\s/g, "");
    //     return input.toString().replace(/[^A-Za-z0-9]/g, '');
    // }
    // getAccessToken() {
    //     GLOBAL.Show_Error = '';
    //     var path = "/" + GLOBAL.IMS + "/customers/" + this.toAlphaNumeric(GLOBAL.UserID).split("").join("/") + "/" + this.toAlphaNumeric(GLOBAL.Pass) + ".json";
    //     DAL.getUserHash(path)
    //         .then((data) => {
    //             DAL.getUserToken(data.CID).then((token) => {
    //                 GLOBAL.USER_TOKEN = token.CID;
    //                 this.getUser(token.CID);
    //             })
    //             .catch((error) => {

    //             });
    //         })
    //         .catch((error) => {

    //         });
    // }
    // onClose(data) {
    //     if(GLOBAL.UseSocialLogin == true) {
    //         Actions.Register();
    //     }else{
    //         Actions.Authentication();
    //     }
    // }
    // getUser(token) {
    //     var path = "/" + GLOBAL.IMS + "/customers/" + this.toAlphaNumeric(GLOBAL.UserID).split("").join("/") + "/" + this.toAlphaNumeric(GLOBAL.Pass) + ".json";
    //     DAL.getDataToken(path, token)
    //         .then((data) => {
    //             DAL.getData(data.CID).then((user) => {
    //                 user = JSON.parse(user);
    //                 var expiring = moment(new Date(user.account.datetime_expired)).format('X');
    //                 var current = moment().format('X');
    //                 var expireTime = expiring - current;
    //                 GLOBAL.User = user;
    //                 if(user.account.account_status == "Disabled"){
    //                     GLOBAL.AutoLogin = false;
    //                     GLOBAL.Show_Error = "Your account is disabled";
    //                     this.logout();
    //                 } else if(user.account.account_status == "Expired" || expireTime < 3600){
    //                     GLOBAL.AutoLogin = false;
    //                     GLOBAL.Show_Error = "Your account is expired";
    //                     this.logout();
    //                 } else {
    //                     const date = moment().format('DD_MM_YYYY');
    //                     GLOBAL.Login_Check_Date = date;
    //                     GLOBAL.Staging = user.account.staging,
    //                     GLOBAL.ProductID = user.products.productid;
    //                     GLOBAL.ResellerID = user.account.resellerid;
    //                     GLOBAL.Recordings = user.recordings;
    //                     GLOBAL.Storage_Total = user.storage.total;
    //                     GLOBAL.Storage_Used = user.storage.used;
    //                     GLOBAL.PPV = user.payperview;
    //                     GLOBAL.Wallet_Credits = user.customer.walletbalance;

    //                     var messages = user.messages;
    //                     if(messages != undefined){
    //                         messages.forEach(message_ => {
    //                             var messagesNew = GLOBAL.Messages.find(m => m.id == message_.id && m.tz == message_.time);
    //                             if(messagesNew == undefined){
    //                                 var new_message = {
    //                                     id: message_.id,
    //                                     tz: Number(message_.time),
    //                                     read: false,
    //                                     deleted: false,
    //                                     message: message_.message,
    //                                     title: message_.message,
    //                                     image: ''
    //                                 }
    //                                 GLOBAL.Messages.splice(0,0,new_message);
    //                             }
    //                         })
    //                     }
    //                     var qty = GLOBAL.Messages.filter(m => m.read == false);
    //                     GLOBAL.Messages_QTY = qty.length;
    //                     UTILS.storeJson("Messages", GLOBAL.Messages);
    //                 }
    //             })
    //             .catch((error) => {

    //             });
    //         })
    //         .catch((error) => {

    //         });

    // }
    // logout(){
    //     GLOBAL.Focus = "Logout";
    //     GLOBAL.Logo = GLOBAL.HTTPvsHTTPS + GLOBAL.Settings_Login.contact.logo.toString().replace('http://', '').replace('https://', '').replace('//', '');
    //     GLOBAL.Background = GLOBAL.HTTPvsHTTPS + GLOBAL.Settings_Login.contact.background.toString().replace('http://', '').replace('https://', '').replace('//', '');
    //     GLOBAL.Support = GLOBAL.Settings_Login.contact.text
    //     GLOBAL.AutoLogin = false;
    //     if(GLOBAL.Device_Manufacturer == "LG WebOS"){
    //         GLOBAL.UserID = '';
    //         GLOBAL.Pass = '';
    //         GLOBAL.ServiceID = '';
    //     }
    //     GLOBAL.App_Theme = 'Default';
    //     UTILS.storeJson('AutoLogin', false);

    //     if(GLOBAL.HasService == true){
    //         Actions.Services();
    //     }else{
    //         if(GLOBAL.UseSocialLogin == true) {
    //             Actions.Register();
    //         }else{
    //             Actions.Authentication();
    //         }
    //     }
    // }
    render() {
        return (
            // <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
            //     <DropdownAlert ref={ref => this.dropdown = ref} onClose={data => this.onClose(data)} />
            // </View>
            <View></View>
        );
    }
}
