class Loading {
    fetchServices = async () => {
        // UTILS.retrieveJson('AutoLogin').then((data) => {
        // if (data) { GLOBAL.AutoLogin = data; }
        try {
            GLOBAL.show_log && console.log(
                'fetchServices: ',
                GLOBAL.HTTPvsHTTPS +
                    'authorize.akamaized.net/mappings/' +
                    GLOBAL.Package +
                    '/settings/services.json?time=' +
                    moment().unix(),
            );
            let response = await fetch(
                GLOBAL.HTTPvsHTTPS +
                    'authorize.akamaized.net/mappings/' +
                    GLOBAL.Package +
                    '/settings/services.json?time=' +
                    moment().unix(),
            );
            let json = await response.json();
            GLOBAL.Services = json;
            GLOBAL.HasService = true;
            return {success: true, data: json};
        } catch (error) {
            GLOBAL.HasService = false;
            return {success: false};
        }
    };
    fetchServicesData = async () => {
        try {
            GLOBAL.show_log && console.log(
                'fetchServiceData: ',
                GLOBAL.HTTPvsHTTPS +
                    'authorize.akamaized.net/mappings/' +
                    GLOBAL.Package +
                    '/settings/services.json?time=' +
                    moment().unix(),
            );
            let response = await fetch(
                GLOBAL.HTTPvsHTTPS +
                    'authorize.akamaized.net/mappings/' +
                    GLOBAL.Package +
                    '/settings/services.json?time=' +
                    moment().unix(),
            );
            let json = await response.json();
            GLOBAL.Services_Login = json;
            GLOBAL.HasService = true;
            return {success: true, data: json};
        } catch (error) {
            GLOBAL.HasService = false;
            return {success: false};
        }
    };
    fetchSettings = async () => {
        try {
            GLOBAL.show_log && console.log(
                'fetchSettings: ',
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
            let json = await response.json();
            var data = JSON.parse(json);
            GLOBAL.Settings_Services_Login = data;
            GLOBAL.Settings_Login = data;
            GLOBAL.CMS = data.cms;
            GLOBAL.CRM = data.crm;
            GLOBAL.IMS = data.client;
            if (data.beacon_url) {
                GLOBAL.Beacon_URL = data.beacon_url;
            }
            if (GLOBAL.Device_Type == '_TelergyHD_Android') {
                GLOBAL.Device_Model = data.client.toUpperCase();
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
            GLOBAL.IMS_Prefix_Staging = data.web_api_location
                .toString()
                .replace('api', 'cloudtv');
            GLOBAL.Button_Color = data.contact.selection_color;
            GLOBAL.Logo =
                GLOBAL.HTTPvsHTTPS +
                data.contact.logo
                    .toString()
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace('//', '');
            GLOBAL.Support = data.contact.text;
            if (data.social) {
                GLOBAL.UseSocialLogin = data.social.social_enabled;
                GLOBAL.SocialGoogle = data.social.google_enabled;
                GLOBAL.SocialFacebook = data.social.facebook_enabled;
                GLOBAL.SocialPhone = data.social.phone_enabled;
                GLOBAL.SocialEmail = data.social.email_enabled;
            }
            if (data.in_app_purchase_enabled) {
                GLOBAL.InAppPurchase = data.in_app_purchase_enabled;
            }
            if (data.apps && !GLOBAL.Device_IsSmartTV) {
                GLOBAL.Android_Download_Enabled = data.apps.show_android;
                GLOBAL.Android_Download_Link = data.apps.android_url;
                GLOBAL.IOS_Download_Enabled = data.apps.show_ios;
                GLOBAL.IOS_Download_Link = data.apps.ios_url;
            }
            GLOBAL.Background =
                GLOBAL.HTTPvsHTTPS +
                data.contact.background
                    .toString()
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace('//', '');

            return {success: true};
        } catch (error) {
            return {success: false};
        }
    };
}
const loading = new Loading();
export default loading;
