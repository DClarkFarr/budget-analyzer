export type AccountFormState = {
  name: string;
  color: string;
};

export type Account = {
  id: number;
  userId: number;
  name: string;
  color: string;
  createdAt: Date;
};
