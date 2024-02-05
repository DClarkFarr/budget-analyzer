export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  role: "user" | "admin";
}
