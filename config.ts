import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  appName: "Crate Mole",
  appDescription: "Find vinyl prices and info for any record.",
  domainName: "unwave.net",
  colors: {
    theme: "lofi",
    main: themes["light"]["primary"],
  },
} as ConfigProps;

export default config;
