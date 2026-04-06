import Conf from "conf";

interface FihrisConfig {
  token?: string;
  apiUrl: string;
  username?: string;
}

const config = new Conf<FihrisConfig>({
  projectName: "fihris",
  defaults: {
    apiUrl: "https://openfihris-api.vercel.app",
  },
});

export function getToken(): string | undefined {
  return config.get("token");
}

export function setToken(token: string): void {
  config.set("token", token);
}

export function clearToken(): void {
  config.delete("token");
}

export function getApiUrl(): string {
  return config.get("apiUrl");
}

export function setApiUrl(url: string): void {
  config.set("apiUrl", url);
}

export function getUsername(): string | undefined {
  return config.get("username");
}

export function setUsername(username: string): void {
  config.set("username", username);
}

export function clearAll(): void {
  config.clear();
}

export { config };
