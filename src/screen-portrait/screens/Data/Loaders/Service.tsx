// import GLOBALModule from '../../../../datalayer/global';
var GLOBALModule = require('../../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import UTILS from '../../../../datalayer/utils';
import LANG from '../../../../languages/languages';
import Decode from 'unescape';

class ServiceLoader {
    static checkServiceExists = async service_id => {
        const usingArrayFrom = JSON.parse(GLOBAL.Services);
        var weHaveHit = false;
        var x = Object.keys(usingArrayFrom);
        var mappedArr = x.map(function (i) {
            if (i == service_id) {
                GLOBAL.Package = usingArrayFrom[i]
                    .toString()
                    .replace('http://', '')
                    .toString()
                    .replace('https://', '');
                weHaveHit = true;
                return usingArrayFrom[i];
            }
        });
        if (weHaveHit == true) {
            //UTILS.storeJson('ServiceID', GLOBAL.ServiceID);
            //GLOBAL.Selected_Service = service_id;
            return {success: true};
        } else {
            return {
                success: false,
                error: LANG.getTranslation('wrong_service_id'),
            };
        }
    };
    static getSettingsService = async () => {
        //DAL.getLoginSettings(GLOBAL.Package)
        //.then((data) => {
        try {
            console.log(
                'get setting service: ',
                GLOBAL.HTTPvsHTTPS +
                    'authorize.akamaized.net/mappings/' +
                    GLOBAL.Package +
                    '/settings/settings.json?time=' +
                    moment().unix(),
            );
            let response = await fetch(
                GLOBAL.HTTPvsHTTPS +
                    'authorize.akamaized.net/mappings/' +
                    GLOBAL.Package +
                    '/settings/settings.json?time=' +
                    moment().unix(),
            );
            let data = await response.json();
            data = JSON.parse(data);
            console.log('get setting service response: ', data);
            GLOBAL.Settings_Login = data;
            GLOBAL.CMS = data.cms;
            GLOBAL.CRM = data.crm;
            GLOBAL.IMS = data.client;
            if (data.beacon_url) {
                GLOBAL.Beacon_URL = data.beacon_url;
            }
            GLOBAL.Disclaimer = data.account.disclaimer;
            GLOBAL.Show_Disclaimer = data.account.is_show_disclaimer;
            GLOBAL.ImageUrlCMS =
                GLOBAL.HTTPvsHTTPS +
                'cloudtv.akamaized.net/' +
                data.client +
                '/images/' +
                data.cms +
                '/';
            GLOBAL.ImageUrlCRM =
                GLOBAL.HTTPvsHTTPS +
                'cloudtv.akamaized.net/' +
                data.client +
                '/images/' +
                data.crm +
                '/';
            GLOBAL.GuiBaseUrl =
                GLOBAL.HTTPvsHTTPS +
                'cloudtv.akamaized.net/' +
                data.client +
                '/userinterfaces/';
            //**social login start*/
            if (
                data.social &&
                !GLOBAL.Device_IsSmartTV &&
                !GLOBAL.Device_IsAppleTV
            ) {
                GLOBAL.UseSocialLogin = data.social.social_enabled;
                GLOBAL.SocialGoogle = data.social.google_enabled;
                GLOBAL.SocialFacebook = data.social.facebook_enabled;
                GLOBAL.SocialPhone = data.social.phone_enabled;
                GLOBAL.SocialEmail = data.social.email_enabled;
            }
            //in-app purchase//
            if (data.in_app_purchase_enabled) {
                GLOBAL.InAppPurchase = data.in_app_purchase_enabled;
            }
            //*apps links //
            if (data.apps) {
                GLOBAL.Android_Download_Enabled = data.apps.show_android;
                GLOBAL.Android_Download_Link = data.apps.android_url;
                GLOBAL.IOS_Download_Enabled = data.apps.show_ios;
                GLOBAL.IOS_Download_Link = data.apps.ios_url;
            }
            GLOBAL.Logo =
                GLOBAL.HTTPvsHTTPS +
                data.contact.logo
                    .toString()
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace('//', '');
            GLOBAL.Background =
                GLOBAL.HTTPvsHTTPS +
                data.contact.background
                    .toString()
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace('//', '');
            GLOBAL.Support = Decode(data.contact.text);
            GLOBAL.Button_Color =
                GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet
                    ? 'transparent'
                    : data.contact.selection_color;
            GLOBAL.Show_Error = '';

            return {success: true};
        } catch (error) {
            return {success: false, error: 'Cloud Server Error' + error};
        }
    };
}
const serviceLoader = new ServiceLoader();
export default ServiceLoader;
