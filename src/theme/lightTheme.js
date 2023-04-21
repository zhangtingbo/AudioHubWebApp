import { createTheme,responsiveFontSizes } from '@material-ui/core/styles';

export const theme = {
    "palette": {
        "common": {
          "black": "#000",
          "white": "rgba(255, 255, 255, 1)",
          "highLight": "rgba(255,255,100,1)",
          "disabled": "rgba(102, 102, 102, 1)",
          "odd": "rgb(18,44,63)",
          "even": "rgb(4,33,56)",
          "transparent":"rgba(255, 255, 255, 0)",
          "alert":"rgba(236,88,58,1)",
          "special": {
            "red": "rgb(192,0,0)",
            "blue":"rgb(184,220,223)" ,
            "dblue":"rgb(0,46,61)",
            "RedBlue":"rgb(197,90,17)",
            "BlueRed":"rgb(248,203,173)",
            "Contacted Episode":"rgb(23,182,175)",
            "Mortar Episode":"rgb(84,130,53)",
            "GrayTrans":"rgba(128,128,128, 0.3)",
            "Ruler1":"#EEF8FA",
            "Ruler2":"#5AECEC",
            "Ruler3":"#fc5a48",
            "Ruler4":"#fc5a48",
            "magenta":"#FF00FF",
            "lightGray":'rgba(160,160,160, 1)',
          }
        },
        "background": {
          "paper": "rgba(255, 255, 255, 1)",
          "default": "rgba(255, 255, 255, 0)"
        },
        "primary": {
          "light": "rgba(180, 197, 204, 1)",
          "main": "rgba(4,33,56, 1)",
          "main-trans":  "rgba(4,33,56, 0.5)",
          "dark": "rgba(4, 60, 84, 1)",
          "contrastText": "rgba(137, 208, 211, 1)",
          "border": "rgba(19,87,103)",
          "lightBg":"rgba(18,44,63,1)",
          "lightBg2":"rgba(97,110,119,1)",
          "icon":"rgba(137, 208, 211, 1)",
          "header":"rgba(0,0,0,1)",
        },
        "secondary": {
          "light": "rgba(185, 207, 211, 1)",
          "main": "rgba(21, 94, 109, 1)",
          "dark": "rgba(12, 66, 80, 1)",
          "contrastText": "rgba(255, 255, 255, 1)"
        },
        "error": {
          "light": "#e57373",
          "main": "#f44336",
          "dark": "#d32f2f",
          "contrastText": "#fff"
        },
        "tabButton": {
          "light": "rgba(180, 197, 204, 1)",
          "main": "rgba(4, 60, 84, 1)",
          "dark": "rgba(2, 39, 58, 1)",
          "contrastText": "rgba(137, 208, 211, 1)",
          "active":  "rgba(24, 80, 104, 1)"
        },
        "text": {
          "primary": "rgba(255, 255, 255, 1)",
          "secondary": "rgba(137, 208, 211, 1)",
          "disabled": "rgba(196, 196, 196, 1)",
          "hint": "rgba(255, 255, 255, 1)"
        }
      },
      "typography": {
        "fontSize": 16,
        "tableItemFontSize": 14
      }
};

let lightTheme = createTheme(theme);

lightTheme = responsiveFontSizes(lightTheme);
export default lightTheme;