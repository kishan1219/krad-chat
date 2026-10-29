// You can customize the template with the help of this file
import appLogoImage from '@src/assets/images/logo/krad-logo-icon.svg'
import appLogoLogo from '@src/assets/images/logo/krad-technology-clean-dark.svg'
import appLogoLight from '@src/assets/images/logo/krad-technology-clean-light.svg'

// Template config options
const themeConfig = {
    app: {
        appName: 'KRAD Technology',
        appLogoImage,
        appLogoLogo,
        appLogoLight
    },
    layout: {
        isRTL: false,
        skin: 'dark', // light, dark, bordered, semi-dark
        type: 'vertical', // vertical, horizontal
        contentWidth: 'boxed', // full, boxed
        menu: {
            isHidden: false,
            isCollapsed: false
        },
        navbar: {
            type: 'floating',
            backgroundColor: 'white'
        },
        footer: {
            type: 'static'
        },
        customizer: false,
        scrollTop: true,
        toastPosition: 'top-right'
    }
}

export default themeConfig
