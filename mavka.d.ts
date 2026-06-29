export interface MavkaVersion {
  pkg: string;
  mavka: string;
}

declare global {
  class Mavka {
    static fetchAvailableVersions(): Promise<MavkaVersion[]>;
  }

  interface Window {
    MAVKA_WEB_URL: string;
    Mavka: typeof Mavka;
  }
}
