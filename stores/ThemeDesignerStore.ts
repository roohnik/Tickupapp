// Animated Customization
// Handles dynamic theme generation and user-defined styles.

import { makeAutoObservable } from "mobx";

type ThemePreset = {
  name: string;
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  animationStyle: "fade" | "slide" | "bounce";
};

export class ThemeDesignerStore {
  activeTheme: ThemePreset = {
    name: "default",
    primaryColor: "#2563EB",
    backgroundColor: "#ffffff",
    fontFamily: "Vazirmatn, sans-serif",
    animationStyle: "fade",
  };

  customThemes: ThemePreset[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setActiveTheme = (theme: ThemePreset) => {
    this.activeTheme = theme;
  };

  addCustomTheme = (theme: ThemePreset) => {
    this.customThemes.push(theme);
  };

  getThemeByName = (name: string) =>
    this.customThemes.find((t) => t.name === name) || null;
}

//You can later connect this to a UI designer with live preview and animation toggles.
