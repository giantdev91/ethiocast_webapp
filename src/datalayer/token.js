import Akamai from 'akamai-auth-token';
//import moment from "moment";
import DeviceInfo from 'react-native-device-info';
import CryptoJS from '../utils/CryptoJS';
import sha1 from '../utils/sha1';
import base64 from '../utils/base64';
import {compressToBase64} from 'lz-string';

// var GLOBAL = require('./global');
var GLOBALModule = require('./global');
var GLOBAL = GLOBALModule.default;

class TOKEN {
    getAkamaiToken(url) {
        var splitUrl = url.split('?');
        var urlToken = splitUrl[0].split('/');
        urlToken.pop();
        urlToken.shift();
        urlToken.shift();
        urlToken.shift();
        urlToken = urlToken.join('/');

        var config = {
            data: GLOBAL.Device_IpAddress + '-' + GLOBAL.Device_FormFactor,
            algorithm: 'SHA256',
            acl: '/' + urlToken + '/*',
            key: GLOBAL.AKAMAI_KEY,
            window: 30000,
            encoding: false,
            time: GLOBAL.Device_Time,
        };
        var akamai = new Akamai(config);
        var token = akamai.generateToken();
        url += url.indexOf('?') > -1 ? '&hdnts=' + token : '?hdnts=' + token;
        return url;
    }

    getAkamaiTokenLegacy(url) {
        var url_ = url.split('?')[0].split('#')[0];
        var comp = [];
        var RandomNumber = Math.floor(Math.random() * 1000) + 1;
        comp.push('random=' + RandomNumber);
        comp.push('path=' + url_);
        comp.push('checksum=' + encodeURIComponent(DeviceInfo.getUserAgent()));
        comp.push('ip=' + GLOBAL.Device_IpAddress);
        comp.push('date=' + new Date().getTime());
        comp.push('userid=' + GLOBAL.UserID);
        var token = encodeURIComponent(
            'JP' +
                CryptoJS.AES.encrypt(
                    comp.join('~'),
                    CryptoJS.enc.Hex.parse(GLOBAL.AKAMAI_LEGACY_KEY),
                    {
                        iv: CryptoJS.enc.Hex.parse('fedcba9876543210'),
                        mode: CryptoJS.mode.ECB,
                        padding: CryptoJS.pad.Pkcs7,
                    },
                ).toString(),
        );
        url += url.indexOf('?') > -1 ? '&token=' + token : '?token=' + token;

        return url;
    }
    async getDrmWidevineFairplayBuyDRM(url, channel) {
        var url_ = url.split('?')[0].split('#')[0];
        var comp = [];
        var RandomNumber = Math.floor(Math.random() * 1000) + 1;
        comp.push('random=' + RandomNumber);
        comp.push('path=' + url_);
        comp.push('checksum=' + encodeURIComponent(DeviceInfo.getUserAgent()));
        comp.push('ip=' + GLOBAL.Device_IpAddress);
        comp.push('date=' + new Date().getTime());
        comp.push('userid=' + GLOBAL.UserID);
        var token = encodeURIComponent(
            'JP' +
                CryptoJS.AES.encrypt(
                    comp.join('~'),
                    CryptoJS.enc.Hex.parse(GLOBAL.AKAMAI_LEGACY_KEY),
                    {
                        iv: CryptoJS.enc.Hex.parse('fedcba9876543210'),
                        mode: CryptoJS.mode.ECB,
                        padding: CryptoJS.pad.Pkcs7,
                    },
                ).toString(),
        );
        // if (channel.drm.drm_rewrite_rule != '' || channel.drm.drm_rewrite_rule != null) {
        //     if (GLOBAL.Device_Manufacturer == "Apple") {
        //         url = url.toString().replace('index.mpd', channel.drm.drm_rewrite_rule)
        //     }
        // }
        var drmKeyUrl =
            GLOBAL.BaseCdnUrl +
            '' +
            GLOBAL.IMS +
            '/licenses/' +
            GLOBAL.CMS +
            '/' +
            channel.channel_id +
            '.txt?' +
            token;
        url = url.toString().replace(GLOBAL.HTTPvsHTTPS, 'https://');
        return this.getTokenFromServer(drmKeyUrl).then(data => {
            return {
                supplier: 'buydrm',
                url: url,
                drmKey: data.trim(),
                licenseServer:
                    GLOBAL.Device_Manufacturer == 'Apple'
                        ? GLOBAL.DRM_LicenseServerApple
                        : GLOBAL.DRM_LicenseServer,
                certificateUrl:
                    GLOBAL.Device_Manufacturer == 'Apple'
                        ? GLOBAL.DRM_CertificateUrl
                        : '',
            };
        });
    }
    async getDrmWidevineFairplayIrdeto(url, channel) {
        var channelUrl = '';
        if (GLOBAL.Device_IsSmartTV) {
            channelUrl = channel.tizen_webos;
        } else if (
            GLOBAL.Device_Manufacturer == 'Apple' ||
            GLOBAL.Device_IsPwaIOS
        ) {
            channelUrl = channel.ios_tvos;
        } else {
            channelUrl = channel.url_high;
        }
        // if (channel.drm.drm_rewrite_rule != '' || channel.drm.drm_rewrite_rule != null) {
        //     if (GLOBAL.Device_Manufacturer == "Apple") {
        //         channelUrl = channelUrl.toString().replace('index.mpd', channel.drm.drm_rewrite_rule)
        //     }
        // }
        var drmServerUrl = '';
        if (GLOBAL.Device_Manufacturer != 'Apple') {
            drmServerUrl =
                url +
                '/licenseServer/widevine/v1/' +
                GLOBAL.DRM_AccountID +
                '/license?contentId=channel1';
        } else {
            drmServerUrl =
                url +
                'licenseServer/streaming/v1/' +
                GLOBAL.DRM_AccountID +
                '/getckc';
        }
        return {
            supplier: 'irdeto',
            url: channelUrl,
            drmServerUrl: drmServerUrl,
            certificateUrl:
                url +
                '/licenseServer/streaming/v1/' +
                GLOBAL.DRM_AccountID +
                '/getcertificate?applicationId=' +
                GLOBAL.Device_UniqueID,
            licenseServer:
                GLOBAL.Device_Manufacturer == 'Apple'
                    ? GLOBAL.DRM_LicenseServerApple
                    : GLOBAL.DRM_LicenseServer,
        };
    }
    getTokenFromIrdetoServer(path) {
        var myHeaders = new Headers();
        myHeaders.set('Content-Type', 'application/octet-stream');
        GLOBAL.show_log && console.log('get token from irde to server: ', path);
        try {
            return fetch(path, {
                method: 'POST',
                headers: myHeaders,
            })
                .then(res => {
                    let result = res.blob();
                    return result;
                })
                .catch(error => {});
        } catch (err) {}
    }
    getTokenFromServer(path) {
        GLOBAL.show_log && console.log('get token from server: ', path);
        return fetch(path)
            .then(res => {
                let result = res.text();
                return result;
            })
            .catch(error => {});
    }
    randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i)
            result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    getFlussonicToken(url) {
        var salt = this.randomString(
            16,
            '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        );
        var splitUrl = url.split('?');
        var streamName = splitUrl[0].split('/');
        streamName.pop();
        streamName.shift();
        streamName.shift();
        streamName.shift();
        streamName = streamName.join('/');
        var comp = [];

        comp.push(streamName);
        comp.push(GLOBAL.Device_IpAddress);
        comp.push(moment().utc().unix() - 180);
        comp.push(moment().utc().unix() + 9600);
        comp.push(GLOBAL.FLUSSONIC_KEY);
        comp.push(salt);

        var hash = comp.join('');
        var token =
            sha1(hash) +
            '-' +
            salt +
            '-' +
            (moment().utc().unix() + 9600) +
            '-' +
            (moment().utc().unix() - 180);
        url += url.indexOf('?') > -1 ? '&token=' + token : '?token=' + token;
        return url;
    }

    getStreamType = url => {
        var type = 'm3u8';
        if (url == undefined || url == '') {
            return type;
        } else {
            var url_ = url.split('?');
            var extension = url_[0].split('.').pop();
            if (extension == 'mp4') {
                type = 'mp4';
            }
            if (extension == 'mp3') {
                type = 'mp3';
            }
            if (extension == 'mpd') {
                type = 'mpd';
            }
            if (extension == 'm3u8') {
                type = 'm3u8';
            }
            return type;
        }
    };
    getStreamTypeCasting = url => {
        var type = 'application/x-mpegURL';
        if (url == undefined || url == '') {
            return type;
        } else {
            var url_ = url.split('?');
            var extension = url_[0].split('.').pop();
            if (extension == 'mp4') {
                type = 'video/mp4';
            }
            if (extension == 'mpd') {
                type = 'DASH';
            }
            if (extension == 'm3u8') {
                type = 'application/x-mpegURL';
            }
            return type;
        }
    };

    getDrmSetup = (
        drmSupplierType,
        drmLicenseServerUrl,
        drmCertificateUrl,
        drmKey,
    ) => {
        if (drmSupplierType == '') {
            return {};
        }
        if (drmSupplierType == 'buydrm') {
            if (GLOBAL.Device_Manufacturer == 'Apple') {
                return {
                    type: DRMType.FAIRPLAY,
                    licenseServer: drmLicenseServerUrl,
                    certificateUrl: drmCertificateUrl,
                    headers: {
                        customData: drmKey,
                    },
                };
            } else {
                return {
                    type: DRMType.WIDEVINE,
                    licenseServer: drmLicenseServerUrl,
                    base64Certificate: true,
                    certificateUrl: drmCertificateUrl,
                    headers: {
                        customData: drmKey,
                    },
                    supplier: drmSupplierType,
                };
            }
        }
        if (drmSupplierType == 'irdeto') {
            return {
                type:
                    GLOBAL.Device_System == 'Apple'
                        ? DRMType.FAIRPLAY
                        : DRMType.WIDEVINE,
                licenseServer: drmLicenseServerUrl,
                certificateUrl: drmCertificateUrl,
                supplier: drmSupplierType,
            };
        }
    };
}
const token = new TOKEN();
export default token;
