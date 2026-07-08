export interface MavkaVersion {
  pkg: string;
  mavka: string;
}

declare global {
  class Mavka {
    constructor(pkgVersion: string, options?: Record<string, unknown>);

    static getSupportError(): string;
    static fetchAvailableVersions(): Promise<MavkaVersion[]>;
  }

  interface Window {
    MAVKA_WEB_URL: string;
    Mavka: typeof Mavka;
  }
}
