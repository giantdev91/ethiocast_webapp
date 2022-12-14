import TOKEN from '../../datalayer/token';
class UTILS {
    getDrmSetup = (drmSupplierType, allStreamValues) => {
        if (drmSupplierType == '') {
            return {};
        }
        if (drmSupplierType == 'buydrm') {
            if (GLOBAL.Device_Manufacturer == 'Apple') {
                return {
                    type:
                        GLOBAL.Device_System == 'Apple'
                            ? DRMType.FAIRPLAY
                            : DRMType.WIDEVINE,
                    licenseServer: allStreamValues.drmLicenseServerUrl,
                    certificateUrl: allStreamValues.drmCertificateUrl,
                    headers: {
                        customData: allStreamValues.drmKey,
                    },
                    supplier: 'buydrm',
                };
            } else {
                return {
                    type:
                        GLOBAL.Device_System == 'Apple'
                            ? DRMType.FAIRPLAY
                            : DRMType.WIDEVINE,
                    licenseServer: allStreamValues.drmLicenseServerUrl,
                    base64Certificate: true,
                    certificateUrl: allStreamValues.drmCertificateUrl,
                    headers: {
                        customData: allStreamValues.drmKey,
                    },
                    supplier: 'irdeto',
                };
            }
        }
        if (drmSupplierType == 'irdeto') {
            return {
                type:
                    GLOBAL.Device_System == 'Apple'
                        ? DRMType.FAIRPLAY
                        : DRMType.WIDEVINE,
                licenseServer: allStreamValues.drmLicenseServerUrl,
                certificateUrl: allStreamValues.drmCertificateUrl,
                supplier: 'irdeto',
            };
        }
    };
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
    rewriteRecordingUrl = url => {
        if (GLOBAL.Device_IsSmartTV) {
            if (url.indexOf('.m3u8') > -1) {
                var returnUrl = url.replace('.m3u8', '.mpd');
                return returnUrl;
            } else {
                return url;
            }
        } else {
            return url;
        }
    };
    setPlayerTokenType = async (url, type) => {
        var urlOut = url;
        var path =
            GLOBAL.HTTPvsHTTPS +
            'cloudtv.akamaized.net/ip.php?_=' +
            moment().unix();
        GLOBAL.show_log && console.log('set player token type: ', path);
        return fetch(path)
            .then(response_ => response_.json())
            .then(res => {
                GLOBAL.show_log && console.log('set player token type response: ', res);
                GLOBAL.Device_IpAddress = res.ip;
                GLOBAL.Device_Time = res.time;

                if (type == 'Legacy') {
                    urlOut = TOKEN.getAkamaiTokenLegacy(url);
                }
                if (type == 'Akamai') {
                    urlOut = TOKEN.getAkamaiToken(url);
                }
                if (type == 'Flussonic') {
                    urlOut = TOKEN.getFlussonicToken(url);
                }
                GLOBAL.show_log && console.log('return url ====> ', urlOut);
                return urlOut;
            })
            .catch(error => {
                return urlOut;
            });
    };
    getDrmWidevineFairplayBuyDRMKey = async (tokenUrl, channel) => {
        return TOKEN.getDrmWidevineFairplayBuyDRM(tokenUrl, channel);
    };
    getDrmWidevineFairplayIrdetoKey = async (tokenUrl, channel) => {
        return TOKEN.getDrmWidevineFairplayIrdeto(tokenUrl, channel);
    };
}
const utils = new UTILS();
export default utils;
