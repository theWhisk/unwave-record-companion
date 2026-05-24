export type Theme =
  | "light"
  | "dark"
  | "cupcake"
  | "bumblebee"
  | "emerald"
  | "corporate"
  | "synthwave"
  | "retro"
  | "cyberpunk"
  | "valentine"
  | "halloween"
  | "garden"
  | "forest"
  | "aqua"
  | "lofi"
  | "pastel"
  | "fantasy"
  | "wireframe"
  | "black"
  | "luxury"
  | "dracula"
  | "nord";

/** Shared across all tools on the Unwave Network site. */
export interface SiteConfig {
  name: string;
  domainName: string;
  colors: {
    theme: Theme;
    main: string;
  };
}

/** Per-tool config. Add one AppConfig per tool hosted on the site. */
export interface AppConfig {
  /** Composes with site.name to form page titles: "<app.name> | <site.name>". */
  name: string;
  description: string;
}

export interface ConfigProps {
  site: SiteConfig;
  app: AppConfig;
}
